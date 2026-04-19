# Human Liveness Verification Prototype

A standalone Python-based liveness detection system designed for hackathon demos. It uses randomized facial challenges to distinguish between a real human and a static spoof attempt (printout/screen).

## Features
- **Real-time Detection:** Uses MediaPipe Face Mesh for high-speed landmark tracking.
- **Randomized Challenges:**
  - Blink detection (EAR based)
  - Smile detection (mouth expansion ratio)
  - Head pose estimation (Yaw & Pitch for Left/Right/Up turns)
- **Anti-Spoofing:** Basic jitter detection to reject static images.
- **Clean UI:** HUD overlay with countdown timer and status indicators.

## Setup Instructions

1. **Prerequisites:**
   - Python 3.9 or higher.
   - A working webcam.

2. **Installation:**
   ```bash
   # Create a virtual environment
   python -m venv venv
   
   # Activate it (Windows)
   .\venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Running the Prototype:**
   ```bash
   python app.py
   ```

## Controls
- **Q**: Quit the application.
- **R**: Reset and start a new challenge (Retry).

## Threshold Adjustments
If the detection is too sensitive or too lenient for your lighting/camera, you can adjust these values in `app.py` and `detector.py`:
- `ear < 0.18`: Blink detection sensitivity.
- `smile_ratio > 0.48`: Smile detection sensitivity.
- `nose_rel_x` / `nose_rel_y`: Head turn thresholds.
- `variance > 1e-7`: Static face detection sensitivity.

## Project Structure
- `app.py`: Main application loop and state management.
- `detector.py`: Logical checks for landmarks and challenges.
- `ui_utils.py`: OpenCV drawing helpers for the overlay.
