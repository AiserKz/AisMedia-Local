import subprocess
import shlex
from pathlib import Path

def get_duration(input_file: Path) -> float:
    """
    Получаем длительность видео в секундах через ffprobe.sa213
    """
    cmd = f'ffprobe -v error -show_entries format=duration -of csv=p=0 "{input_file}"'
    result = subprocess.run(
        shlex.split(cmd),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    return float(result.stdout.strip())

def convert_audio_only(input_file: Path, output_file: Path):
    """
    Конвертирует только аудио в MP3, видео не трогает, с прогрессом.sa
    """
    total_duration = get_duration(input_file)

    cmd = f'ffmpeg -i "{input_file}" -vcodec copy -acodec mp3 -b:a 192k -progress pipe:1 -y "{output_file}"'
    process = subprocess.Popen(
        shlex.split(cmd),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )

    for line in process.stdout:
        if line.startswith("out_time_ms"):
            # Вытащить миллисекунды
            out_time_ms = int(line.strip().split("=")[1])
            progress = (out_time_ms / (total_duration * 1_000_000)) * 100
            print(f"Прогресс: {progress:.2f}%")

    process.wait()
    if process.returncode == 0:
        print("✅ Конвертация завершена!")
    else:
        print("❌ Ошибка при конвертации.")

if __name__ == "__main__":
    input_path = Path("test1.mkv")      # Входное видео
    output_path = Path("test2.mp4") # Выходное видео
    convert_audio_only(input_path, output_path)
