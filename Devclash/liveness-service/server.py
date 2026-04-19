import cv2
import numpy as np
import base64
from fastapi import FastAPI, HTTPException
from detector import LivenessDetector
from pydantic import BaseModel
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = LivenessDetector()

# Just a simple check for liveness from a single frame for demo/hackathon
class LivenessRequest(BaseModel):
    image_base64: str

@app.post("/api/verify-liveness")
async def verify_liveness(req: LivenessRequest):
    try:
        # Decode base64 image (assuming it might have data:image/png;base64, prefix)
        base64_data = req.image_base64
        if "base64," in base64_data:
            base64_data = base64_data.split("base64,")[1]
            
        img_data = base64.b64decode(base64_data)
        nparr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image")

        landmarks = detector.get_landmarks(frame)
        if not landmarks:
            return {"status": "fail", "reason": "No face detected"}

        flicker = detector.check_flicker(frame)
        glare = detector.check_glare(frame, landmarks)
        motion_var = detector.check_motion_naturalness(landmarks)
        is_screen = detector.detect_screen(frame, landmarks)

        if is_screen:
            return {"status": "fail", "reason": "Rectangular device detected"}
        if flicker > 5.0:
            return {"status": "fail", "reason": "Excessive flicker detected"}
        if glare > 0.15:
            return {"status": "fail", "reason": "Glare / Screen reflection"}

        return {"status": "success", "message": "Live face verified"}
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
