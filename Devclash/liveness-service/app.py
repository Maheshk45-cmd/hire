import cv2
import random
import time
import numpy as np
from detector import LivenessDetector
from ui_utils import UIUtils

# Adjustable Thresholds
CONFIG = {
    "flicker_limit": 5.0,        # Increased from 2.5
    "glare_limit": 0.15,         # Increased from 0.05
    "motion_min": 1e-9,          # Lowered from 1e-6
    "smile_threshold": 0.48,
    "blink_ear": 0.18,
    "closer_multiplier": 1.15,
    "screen_frames_limit": 10
}

class LivenessApp:
    def __init__(self):
        self.detector = LivenessDetector()
        self.cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        self.challenges_pool = [
            {"id": "blink_twice", "label": "Blink Twice"},
            {"id": "smile", "label": "Smile Widely"},
            {"id": "left", "label": "Turn Head Left"},
            {"id": "right", "label": "Turn Head Right"},
            {"id": "up", "label": "Look Up"},
            {"id": "closer", "label": "Move Closer to Camera"}
        ]
        self.show_debug = True # Toggle with 'D'
        self.reset_state()

    def reset_state(self):
        self.current_state = "CHALLENGE"
        self.start_time = time.time()
        self.challenge_sequence = random.sample(self.challenges_pool, 2)
        self.current_step = 0
        self.timeout = 15.0 # Increased for 2-step sequences
        self.blink_count = 0
        self.eye_closed = False
        self.base_face_w = None
        self.fail_reason = None
        self.screen_frames = 0

    def run(self):
        print("Advanced Anti-Replay Active. Q to Quit, R to Restart.")
        while True:
            ret, frame = self.cap.read()
            if not ret: break
            frame = cv2.flip(frame, 1)
            landmarks = self.detector.get_landmarks(frame)
            elapsed = time.time() - self.start_time
            remaining = max(0, self.timeout - elapsed)

            if landmarks:
                # 1. Multi-Signal Spoofing Detection
                flicker = self.detector.check_flicker(frame)
                glare = self.detector.check_glare(frame, landmarks)
                motion_var = self.detector.check_motion_naturalness(landmarks)
                is_screen = self.detector.detect_screen(frame, landmarks)

                spoof_reason = None
                if is_screen:
                    self.screen_frames += 1
                    if self.screen_frames >= CONFIG["screen_frames_limit"]:
                        spoof_reason = "RECTANGULAR DEVICE DETECTED"
                else:
                    self.screen_frames = 0

                if flicker > CONFIG["flicker_limit"]: spoof_reason = "EXCESSIVE FLICKER DETECTED"
                elif glare > CONFIG["glare_limit"]: spoof_reason = "GLARE / SCREEN REFLECTION"
                elif motion_var < CONFIG["motion_min"]: spoof_reason = "FLAT MOTION / STATIC SPOOF"

                if spoof_reason:
                    self.current_state = "FAIL"
                    self.fail_reason = spoof_reason

                # 2. Challenge Processing
                if self.current_state == "CHALLENGE":
                    challenge = self.challenge_sequence[self.current_step]
                    step_done = False
                    
                    if challenge["id"] == "blink_twice":
                        ear = self.detector.get_ear(landmarks)
                        if ear < CONFIG["blink_ear"] and not self.eye_closed:
                            self.eye_closed = True
                        if ear > 0.25 and self.eye_closed:
                            self.blink_count += 1
                            self.eye_closed = False
                        if self.blink_count >= 2:
                            step_done = True
                    
                    elif challenge["id"] == "smile":
                        if self.detector.get_smile_metrics(landmarks) > CONFIG["smile_threshold"]:
                            step_done = True
                            
                    elif challenge["id"] == "closer":
                        face_w = np.linalg.norm(np.array([landmarks[234].x - landmarks[454].x]))
                        if self.base_face_w is None: self.base_face_w = face_w
                        if face_w > self.base_face_w * CONFIG["closer_multiplier"]:
                            step_done = True

                    elif challenge["id"] in ["left", "right", "up"]:
                        yaw, pitch = self.detector.get_head_pose(landmarks)
                        if challenge["id"] == "left" and yaw < 0.75: step_done = True
                        elif challenge["id"] == "right" and yaw > 1.35: step_done = True
                        elif challenge["id"] == "up" and pitch < 0.8: step_done = True

                    if step_done:
                        if self.current_step == 0:
                            self.current_step = 1
                            self.blink_count = 0
                            self.base_face_w = None
                        else:
                            self.current_state = "SUCCESS"

            # UI Logic
            if self.current_state == "CHALLENGE":
                status = "LIVE FACE DETECTED" if landmarks else "NO FACE DETECTED"
                UIUtils.draw_status_bar(frame, status, (0, 255, 0) if landmarks else (0, 0, 255))
                if landmarks:
                    UIUtils.draw_challenge_box(frame, f"Step {self.current_step+1}: {challenge['label']}", 
                                             remaining, step_info=f"Time: {int(remaining)}s")
            elif self.current_state == "SUCCESS":
                UIUtils.draw_result_overlay(frame, True)
            elif self.current_state == "FAIL":
                UIUtils.draw_result_overlay(frame, False, reason=self.fail_reason)

            if remaining <= 0 and self.current_state == "CHALLENGE":
                self.current_state = "FAIL"
                self.fail_reason = "TIMEOUT"

            if self.show_debug and landmarks:
                telemetry = {
                    "flicker": flicker, 
                    "glare": glare, 
                    "motion": motion_var,
                    "screen": self.screen_frames
                }
                UIUtils.draw_debug_hud(frame, telemetry, CONFIG)

            cv2.imshow("Anti-Replay Liveness V4", frame)
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'): break
            elif key == ord('r'): self.reset_state()
            elif key == ord('d'): self.show_debug = not self.show_debug

        self.cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    LivenessApp().run()

