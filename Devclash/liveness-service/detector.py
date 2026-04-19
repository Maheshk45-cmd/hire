import cv2
import mediapipe as mp
import numpy as np
import time

class LivenessDetector:
    def __init__(self):
        try:
            self.mp_face_mesh = mp.solutions.face_mesh
        except AttributeError:
            import mediapipe.python.solutions.face_mesh as face_mesh_module
            self.mp_face_mesh = face_mesh_module
            
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.points_history = {i: [] for i in [1, 33, 263, 61, 291]}
        self.brightness_history = []
        self.history_size = 20
        
    def get_landmarks(self, frame):
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)
        return results.multi_face_landmarks[0].landmark if results.multi_face_landmarks else None

    def check_flicker(self, frame):
        """Detect rapid brightness fluctuations common in electronic screens."""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        avg_brightness = np.mean(gray)
        self.brightness_history.append(avg_brightness)
        if len(self.brightness_history) > self.history_size:
            self.brightness_history.pop(0)
        
        if len(self.brightness_history) >= 10:
            diffs = np.abs(np.diff(self.brightness_history))
            return np.mean(diffs) # High value indicates flicker
        return 0

    def check_glare(self, frame, landmarks):
        """Identify high-intensity rectangular highlights indicative of screen glass reflection."""
        h, w = frame.shape[:2]
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        v_channel = hsv[:, :, 2]
        
        # Threshold for bright hotspots
        _, mask = cv2.threshold(v_channel, 245, 255, cv2.THRESH_BINARY)
        
        # Focus glare check on face area
        fx = [int(l.x * w) for l in landmarks]
        fy = [int(l.y * h) for l in landmarks]
        roi = mask[min(fy):max(fy), min(fx):max(fx)]
        
        if roi.size > 0:
            glare_pixel_ratio = cv2.countNonZero(roi) / roi.size
            return glare_pixel_ratio
        return 0

    def check_motion_naturalness(self, landmarks):
        """Live heads have micro-jitter; replayed video often appears too smooth or mechanically stable."""
        velocities = []
        for idx in self.points_history.keys():
            pos = (landmarks[idx].x, landmarks[idx].y)
            self.points_history[idx].append(pos)
            if len(self.points_history[idx]) > self.history_size:
                self.points_history[idx].pop(0)
            
            if len(self.points_history[idx]) >= 2:
                p1 = self.points_history[idx][-2]
                p2 = self.points_history[idx][-1]
                v = np.linalg.norm(np.array(p1) - np.array(p2))
                velocities.append(v)
        
        if velocities:
            # Low standard deviation in velocities across points can indicate 'flat' video motion
            return np.var(velocities)
        return 0.1 # Default 'natural'

    def get_head_pose(self, landmarks):
        nose, left_eye, right_eye = landmarks[1], landmarks[33], landmarks[263]
        forehead, chin = landmarks[10], landmarks[152]
        d_ln = np.linalg.norm(np.array([nose.x-left_eye.x, nose.y-left_eye.y]))
        d_rn = np.linalg.norm(np.array([nose.x-right_eye.x, nose.y-right_eye.y]))
        yaw_ratio = d_ln / (d_rn + 1e-6)
        d_nf = np.linalg.norm(np.array([nose.x-forehead.x, nose.y-forehead.y]))
        d_nc = np.linalg.norm(np.array([nose.x-chin.x, nose.y-chin.y]))
        pitch_ratio = d_nf / (d_nc + 1e-6)
        return yaw_ratio, pitch_ratio

    def get_smile_metrics(self, landmarks):
        mouth_l, mouth_r = landmarks[61], landmarks[291]
        face_l, face_r = landmarks[234], landmarks[454]
        mouth_w = np.linalg.norm(np.array([mouth_l.x-mouth_r.x, mouth_l.y-mouth_r.y]))
        face_w = np.linalg.norm(np.array([face_l.x-face_r.x, face_l.y-face_r.y]))
        return mouth_w / (face_w + 1e-6)

    def get_ear(self, landmarks):
        l_eye = [landmarks[i] for i in [33, 160, 158, 133, 153, 144]]
        r_eye = [landmarks[i] for i in [362, 385, 387, 263, 373, 380]]
        def ear(eye):
            v1 = np.linalg.norm(np.array([eye[1].x-eye[5].x, eye[1].y-eye[5].y]))
            v2 = np.linalg.norm(np.array([eye[2].x-eye[4].x, eye[2].y-eye[4].y]))
            h = np.linalg.norm(np.array([eye[0].x-eye[3].x, eye[0].y-eye[3].y]))
            return (v1 + v2) / (2.0 * h + 1e-6)
        return (ear(l_eye) + ear(r_eye)) / 2.0

    def detect_screen(self, frame, landmarks):
        if landmarks is None: return False
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        edged = cv2.Canny(cv2.GaussianBlur(gray, (5, 5), 0), 50, 150)
        contours, _ = cv2.findContours(edged, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        h, w = frame.shape[:2]
        
        # Calculate face bounding box
        fx = [int(l.x * w) for l in landmarks]
        fy = [int(l.y * h) for l in landmarks]
        face_rect = (min(fx), min(fy), max(fx) - min(fx), max(fy) - min(fy)) # (x, y, w, h)
        
        for cnt in contours:
            peri = cv2.arcLength(cnt, True)
            approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)
            
            # 1. Geometry: Perfectly 4-sided (strict)
            if len(approx) == 4:
                rx, ry, rw, rh = cv2.boundingRect(approx)
                area_ratio = (rw * rh) / (h * w)
                
                # 2. Face Similarity Check: Skip if it's basically the face size/pos (false positive)
                # If rectangle is nearly same size and position as the face mesh bounding box
                if abs(rw - face_rect[2]) < 50 and abs(rh - face_rect[3]) < 50:
                    continue

                # 3. Parallelism Check: Opposite sides must be within 7 degrees
                def get_angle(p1, p2):
                    return np.degrees(np.arctan2(p2[1]-p1[1], p2[0]-p1[0]))
                
                # approx has 4 points: [[x,y]], ...
                pts = approx.reshape(4, 2)
                side1 = get_angle(pts[0], pts[1])
                side2 = get_angle(pts[3], pts[2])
                side3 = get_angle(pts[1], pts[2])
                side4 = get_angle(pts[0], pts[3])
                
                # Check absolute difference between opposite sides
                is_parallel = abs(side1 - side2) < 7.0 and abs(side3 - side4) < 7.0
                
                if area_ratio > 0.10 and is_parallel:
                    aspect_ratio = float(rw) / (rh + 1e-6)
                    if any(abs(aspect_ratio - r) < 0.15 for r in [0.56, 1.77, 1.33, 0.75]):
                        # 4. Proximity: Strict 60px buffer
                        buf = 60
                        if not (rx+rw < face_rect[0]-buf or rx > face_rect[0]+face_rect[2]+buf or 
                                ry+rh < face_rect[1]-buf or ry > face_rect[1]+face_rect[3]+buf):
                            return True
        return False



