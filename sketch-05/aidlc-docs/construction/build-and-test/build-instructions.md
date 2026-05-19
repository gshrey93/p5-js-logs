# Build Instructions

## Prerequisites
- **Runtime**: Python 3.8+
- **Package Manager**: pip
- **Dependencies**: pygame 2.6.1, pytest 8.3.4
- **System Requirements**: Any OS with display (Windows/macOS/Linux), audio output for sound effects

## Build Steps

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Verify Assets
Ensure the following files exist in `assets/`:
- `ghosty.png` — Ghost sprite image
- `jump.wav` — Jump sound effect
- `game_over.wav` — Game over sound effect

### 3. Run the Game
```bash
python run.py
```

### 4. Verify Build Success
- **Expected Output**: Pygame window opens (480x640), title screen displays "Flappy Kiro" with "Press Space to Start"
- **Build Artifacts**: No compilation needed (interpreted language)
- **Common Warnings**: Pygame may print "Hello from the pygame community" — this is normal

## Troubleshooting

### ImportError: No module named 'pygame'
- **Cause**: pygame not installed
- **Solution**: `pip install pygame==2.6.1`

### FileNotFoundError: assets/ghosty.png
- **Cause**: Running from wrong directory
- **Solution**: Run from project root: `python run.py`

### No audio output
- **Cause**: System audio not configured or pygame mixer init failed
- **Solution**: Check system audio settings. Game will still run without audio.
