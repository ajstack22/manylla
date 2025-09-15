#!/bin/bash

# Play a completion sound on macOS
# Uses the built-in afplay command to play system sounds

# You can use any of these system sounds or provide your own audio file path
# Common system sounds:
# - /System/Library/Sounds/Glass.aiff (default)
# - /System/Library/Sounds/Ping.aiff
# - /System/Library/Sounds/Hero.aiff
# - /System/Library/Sounds/Blow.aiff
# - /System/Library/Sounds/Bottle.aiff
# - /System/Library/Sounds/Frog.aiff
# - /System/Library/Sounds/Funk.aiff
# - /System/Library/Sounds/Morse.aiff
# - /System/Library/Sounds/Pop.aiff
# - /System/Library/Sounds/Purr.aiff
# - /System/Library/Sounds/Sosumi.aiff
# - /System/Library/Sounds/Submarine.aiff
# - /System/Library/Sounds/Tink.aiff

SOUND_FILE="${1:-/System/Library/Sounds/Glass.aiff}"

if [ -f "$SOUND_FILE" ]; then
    afplay "$SOUND_FILE"
else
    echo "Sound file not found: $SOUND_FILE"
    # Fallback to system beep
    printf '\a'
fi