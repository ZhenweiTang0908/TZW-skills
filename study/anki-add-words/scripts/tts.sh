#!/usr/bin/env bash
# Usage: scripts/tts.sh "German text" output.mp3 [rate, e.g. -10%]
set -euo pipefail
uvx edge-tts --voice de-DE-KatjaNeural --rate "${3:-+0%}" --text "$1" --write-media "$2"
