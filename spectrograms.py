import json
import os
import requests
import librosa
import librosa.display
import matplotlib.pyplot as plt
import numpy as np
from urllib.parse import urlparse

HEADERS = {
    "User-Agent": "GrammelAudioBot/1.0 (kmein@posteo.de)"
}

INPUT_JSON = "words.json"
AUDIO_DIR = "audio"
PLOT_DIR = "plots"

os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(PLOT_DIR, exist_ok=True)


def download_ogg(url, out_path):
    if os.path.exists(out_path):
        return

    r = requests.get(url, headers=HEADERS, timeout=30)
    r.raise_for_status()

    with open(out_path, "wb") as f:
        f.write(r.content)


def plot_waveform_and_spectrogram(y, sr, title, out_path):
    duration = len(y) / sr
    time_axis = np.linspace(0, duration, len(y))

    plt.figure(figsize=(10, 6))

    # Waveform
    plt.subplot(2, 1, 1)
    plt.plot(time_axis, y, color="black", linewidth=0.8)
    plt.ylabel("Amplitude")
    plt.title(title)
    plt.xlim(0, duration)

    # Spectrogram
    plt.subplot(2, 1, 2)
    S = librosa.stft(y, n_fft=1024, hop_length=256)
    S_db = librosa.amplitude_to_db(np.abs(S), ref=np.max)

    librosa.display.specshow(
        S_db,
        sr=sr,
        hop_length=256,
        x_axis="time",
        y_axis="hz",
        cmap="gray_r"
    )

    plt.ylabel("Frequency (Hz)")
    plt.xlabel("Time (s)")
    plt.ylim(0, 5000)

    plt.tight_layout()
    plt.savefig(out_path, dpi=300)
    plt.close()


def main():
    with open(INPUT_JSON, "r", encoding="utf-8") as f:
        items = json.load(f)

    for item in items:
        ipa = "".join(item["ipa"])
        url = item["ogg_url"]

        filename = os.path.basename(urlparse(url).path)
        audio_path = os.path.join(AUDIO_DIR, filename)
        plot_path = os.path.join(PLOT_DIR, filename.replace(".OGG", ".ogg").replace(".ogg", ".png"))

        if os.path.exists(plot_path):
            continue

        print(f"Processing {filename}  [{ipa}]")

        download_ogg(url, audio_path)

        y, sr = librosa.load(audio_path, sr=None)

        y, (start, end) = librosa.effects.trim(
            y,
            top_db=30
        )

        plot_waveform_and_spectrogram(
            y,
            sr,
            title="" if True else f"IPA: /{ipa}/",
            out_path=plot_path
        )


if __name__ == "__main__":
    main()
