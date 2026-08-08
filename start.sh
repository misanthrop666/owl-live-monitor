#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
lsof -ti:8123 | xargs kill -9 2>/dev/null
python3 "$DIR/proxy.py" &
sleep 0.4
open -a "Google Chrome" "$DIR/index.html"
