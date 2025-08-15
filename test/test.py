import subprocess
from pathlib import Path
from typing import Callable, Optional

BASE_DIR = Path(__file__).resolve().parent
FFMPEG_BIN = BASE_DIR / "ffmpeg" / "ffmpeg.exe"     # или просто "ffmpeg" если в PATH
FFPROBE_BIN = BASE_DIR / "ffmpeg" / "ffprobe.exe"   # или просто "ffprobe" если в PATH

def _probe_duration_seconds(input_path: Path) -> Optional[float]:
    """Возвращает длительность файла в секундах через ffprobe."""
    try:
        res = subprocess.run(
            [str(FFPROBE_BIN), "-v", "error",
             "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1",
             str(input_path)],
            check=True, capture_output=True, text=True
        )
        return float(res.stdout.strip())
    except Exception:
        return None

def convert_audio_to_aac_copy_video_with_progress(
    input_path: str,
    output_path: Optional[str] = None,
    on_progress: Optional[Callable[[int], None]] = None
) -> str:
    """
    Меняет только аудио на AAC (192k), видео оставляет как есть (copy).
    Отдаёт прогресс 0..100 через on_progress.
    Возвращает путь к результирующему файлу или '' при ошибке.
    """
    inp = Path(input_path).resolve()
    if not inp.exists():
        print(f"❌ Файл не найден: {inp}")
        return ''

    out = Path(output_path).resolve() if output_path else inp.with_suffix(".mp4")
    out.parent.mkdir(parents=True, exist_ok=True)

    total = _probe_duration_seconds(inp)  # может быть None, тогда покажем «сырое» время

    cmd = [
        str(FFMPEG_BIN),
        "-y",
        "-i", str(inp),
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart",
        "-nostats",
        "-loglevel", "error",
        "-progress", "pipe:1",  # строки вида out_time_ms=...
        str(out)
    ]

    try:
        proc = subprocess.Popen(
            cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True
        )

        last_pct = 0
        if on_progress:
            on_progress(0)

        while True:
            line = proc.stdout.readline()
            if not line:
                break

            line = line.strip()
            # пример: out_time_ms=123456789
            if line.startswith("out_time_ms="):
                try:
                    out_ms = int(line.split("=", 1)[1])
                    if total and total > 0:
                        pct = int(min(99, (out_ms / (total * 1_000_000)) * 100))
                    else:
                        # если длительность неизвестна — просто не дойдём до 100 здесь
                        pct = last_pct
                    if pct != last_pct:
                        last_pct = pct
                        if on_progress:
                            on_progress(pct)
                        else:
                            print(f"\r⏳ Прогресс: {pct:3d}%", end="", flush=True)
                except ValueError:
                    pass

        proc.wait()

        if proc.returncode == 0:
            if on_progress:
                on_progress(100)
            else:
                print("\r✅ Прогресс: 100%")
            print(f"✅ Готово: {out}")
            return str(out)
        else:
            print(f"\n❌ FFmpeg завершился с кодом {proc.returncode}")
            return ''
    except Exception as e:
        print(f"❌ Ошибка запуска FFmpeg: {e}")
        return ''

# Пример использования:
if __name__ == "__main__":
    def printer(p): print(f"\r⏳ {p}%", end="")
    convert_audio_to_aac_copy_video_with_progress("Up.mkv", on_progress=printer)
