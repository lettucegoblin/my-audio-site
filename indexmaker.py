import os
import json
from webvtt import WebVTT

audio_dir = 'assets/audio/'
output_file = 'assets/audio/index.json'
data = []

for filename in os.listdir(audio_dir):
    if filename.endswith('_labeled.vtt'):
        audio_filename = filename.replace('.vtt_labeled.vtt', '.wav')
        vtt_path = os.path.join(audio_dir, filename)
        for caption in WebVTT().read(vtt_path):
            data.append({
                "id": f"{audio_filename}_{caption.start_in_seconds}",
                "audio": f"/assets/audio/{audio_filename}",
                "text": caption.text,
                "speaker": caption.text.split(':')[0] if ':' in caption.text else 'Unknown'
            })

with open(output_file, 'w') as f:
    json.dump(data, f, indent=4)
