import cv2
import numpy as np

class UIUtils:
    @staticmethod
    def draw_status_bar(frame, text, color=(0, 255, 0), progress=None, sub_text=None):
        """Draws a clean top bar with status text and optional progress bar."""
        h, w, _ = frame.shape
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, 0), (w, 70), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.6, frame, 0.4, 0, frame)

        # Status Text
        cv2.putText(frame, text, (20, 30), cv2.FONT_HERSHEY_DUPLEX, 0.7, color, 2)
        if sub_text:
            cv2.putText(frame, sub_text, (20, 55), cv2.FONT_HERSHEY_DUPLEX, 0.5, (200, 200, 200), 1)

        # Progress bar
        if progress is not None:
            bar_w, bar_h = int(w * 0.3), 10
            bar_x, bar_y = w - bar_w - 20, 25
            cv2.rectangle(frame, (bar_x, bar_y), (bar_x + bar_w, bar_y + bar_h), (50, 50, 50), -1)
            fill_w = int(bar_w * np.clip(progress, 0, 1))
            cv2.rectangle(frame, (bar_x, bar_y), (bar_x + fill_w, bar_y + bar_h), color, -1)

    @staticmethod
    def draw_challenge_box(frame, challenge_text, timer_val, step_info=None):
        """Draws the main challenge instruction box in the center."""
        h, w, _ = frame.shape
        center_x = w // 2
        
        box_w, box_h = 420, 90
        cv2.rectangle(frame, (center_x - box_w//2, h - 110), (center_x + box_w//2, h - 20), (0, 0, 0), -1)
        
        if step_info:
            cv2.putText(frame, step_info, (center_x - box_w//2 + 20, h - 85), 
                        cv2.FONT_HERSHEY_DUPLEX, 0.5, (0, 255, 255), 1)

        # Instruction
        cv2.putText(frame, challenge_text, (center_x - box_w//2 + 20, h - 55), 
                    cv2.FONT_HERSHEY_DUPLEX, 0.6, (255, 255, 255), 1)

        # Timer
        color = (0, 255, 255) if timer_val > 5 else (0, 0, 255)
        cv2.putText(frame, f"{timer_val:.1f}s", (center_x + box_w//2 - 90, h - 55), 
                    cv2.FONT_HERSHEY_DUPLEX, 0.7, color, 2)

    @staticmethod
    def draw_result_overlay(frame, success=True, reason=None):
        """Draws a full screen overlay for final result."""
        h, w, _ = frame.shape
        overlay = frame.copy()
        color = (0, 200, 0) if success else (0, 0, 200)
        text = "VERIFIED" if success else "FAILED"
        
        cv2.rectangle(overlay, (0, 0), (w, h), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)

        text_size = cv2.getTextSize(text, cv2.FONT_HERSHEY_DUPLEX, 2, 3)[0]
        cv2.putText(frame, text, (w//2 - text_size[0]//2, h//2), cv2.FONT_HERSHEY_DUPLEX, 2, color, 3)
        
        if reason:
            sub_size = cv2.getTextSize(reason, cv2.FONT_HERSHEY_DUPLEX, 0.7, 1)[0]
            cv2.putText(frame, reason, (w//2 - sub_size[0]//2, h//2 + 50), cv2.FONT_HERSHEY_DUPLEX, 0.7, (255, 255, 255), 1)

        cv2.putText(frame, "Press 'R' to Restart or 'Q' to Quit", (w//2 - 160, h - 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)

    @staticmethod
    def draw_debug_hud(frame, telemetry, config):
        """Draws a lean telemetry HUD in the top right for tuning and debugging."""
        h, w, _ = frame.shape
        margin = 10
        panel_w, panel_h = 240, 100
        x, y = w - panel_w - margin, margin
        
        # Overlay
        sub = frame[y:y+panel_h, x:x+panel_w]
        white_rect = np.zeros(sub.shape, dtype=np.uint8)
        cv2.addWeighted(sub, 0.5, white_rect, 0.5, 1, sub)
        frame[y:y+panel_h, x:x+panel_w] = sub
        
        # Header
        cv2.putText(frame, "DEBUG TELEMETRY ('D' Hide)", (x+10, y+20), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
        
        metrics = [
            ("Flicker", telemetry.get("flicker", 0), config["flicker_limit"], False),
            ("Glare", telemetry.get("glare", 0), config["glare_limit"], False),
            ("Motion Var", telemetry.get("motion", 0), config["motion_min"], True), # True for 'higher is better'
            ("Screen Frames", telemetry.get("screen", 0), config["screen_frames_limit"], False)
        ]
        
        for i, (label, val, limit, higher_better) in enumerate(metrics):
            if higher_better:
                is_dangerous = val < limit
            else:
                is_dangerous = val > limit
                
            color = (0, 0, 255) if is_dangerous else (0, 255, 0)
            txt = f"{label}: {val:.4f} (Limit: {limit})"
            cv2.putText(frame, txt, (x+10, y+45 + (i*15)), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1)
