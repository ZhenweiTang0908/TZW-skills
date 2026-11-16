#!/usr/bin/env bash
# 用法：scripts/tts.sh "德语文本" 输出.mp3 [语速，如 -10%]
set -euo pipefail
uvx edge-tts --voice de-DE-KatjaNeural --rate "${3:-+0%}" --text "$1" --write-media "$2"
