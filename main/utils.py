import subprocess
import shlex
from pathlib import Path
from django.conf import settings
from main.models import Movie, Episode
import os

# Пути до локального ffmpeg и ffprobe
FFMPEG_BIN = Path(settings.BASE_DIR) / "ffmpeg" / "ffmpeg.exe"
FFPROBE_BIN = Path(settings.BASE_DIR) / "ffmpeg" / "ffprobe.exe"

def get_duration(input_file: Path) -> float:
    """
    Получаем длительность видео в секундах через локальный ffprobe.
    """
    cmd = f'"{FFPROBE_BIN}" -v error -show_entries format=duration -of csv=p=0 "{input_file}"'
    result = subprocess.run(
        shlex.split(cmd),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    return float(result.stdout.strip())

def convert_audio_only(movie_id: int, types):
    """
    Конвертирует только аудио в MP3, оставляя видео без изменений.
    Обновляет прогресс в модели Movie.
    """
    if types == 1:
        movie = Movie.objects.get(id=movie_id)
    elif types == 2:
        movie = Episode.objects.get(id=movie_id)
    
    if movie.file_path.path is None:
        return
    
    input_file = Path(movie.file_path.path)
    output_file = Path(settings.MEDIA_ROOT) / "videos/processed" / (input_file.stem + "_fixed" + '.mp4')

    # Получаем длительность
    total_duration = get_duration(input_file)

    # Обновляем статус
    movie.processed_status = "processing"
    movie.processed_progress = 0
    movie.save()

    # Команда ffmpeg
    cmd = f'"{FFMPEG_BIN}" -i "{input_file}" -vcodec copy -acodec mp3 -b:a 192k -progress pipe:1 -y "{output_file}"'
    process = subprocess.Popen(
        shlex.split(cmd),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )

    for line in process.stdout:
        if line.startswith("out_time_ms"):
            out_time_ms = int(line.strip().split("=")[1]) 
            progress = (out_time_ms / (total_duration * 1_000_000)) * 100
            movie.processed_progress = min(int(progress), 100)
            movie.save(update_fields=["processed_progress"])

    process.wait()

    if process.returncode == 0:
        movie.processed_status = "processed"
        movie.file_path = str(output_file.relative_to(settings.MEDIA_ROOT))
        movie.processed_progress = 100
    else:
        movie.processed_status = "error"

    movie.save()

    return movie.processed_status


def delete_video():
    originals_dir = Path(settings.MEDIA_ROOT) / 'videos' / 'originals'

    # Получаем имена файлов из базы (только имя, без пути)
    movie_files = {os.path.basename(m.file_path.name) for m in Movie.objects.all() if m.file_path}
    episode_files = {os.path.basename(e.file_path.name) for e in Episode.objects.all() if e.file_path}

    all_files_in_db = movie_files | episode_files  # объединяем в одно множество

    # Получаем список всех файлов на диске
    all_files_on_disk = set(os.listdir(originals_dir))

    # Находим лишние (есть на диске, но нет в базе)
    extra_files = all_files_on_disk - all_files_in_db

    if extra_files:
        for file in extra_files:
            file_path = originals_dir / file
            try:
                os.remove(file_path)
                print(f"🗑 Удалён лишний файл: {file}")
            except Exception as e:
                print(f"❌ Ошибка при удалении {file}: {e}")
    else:
        print("✅ Лишних файлов нет")
            
