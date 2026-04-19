import cv2
import base64
import urllib.request
import json
import time
import sys

def test_liveness():
    print("Capturing frame from webcam...")
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        sys.exit(1)
        
    print("Warming up camera for 2 seconds (make sure your face is clearly visible)...")
    time.sleep(2)
    for _ in range(5):
        cap.read() # clear buffer
        
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        print("Error: Could not capture frame.")
        sys.exit(1)
        
    _, buffer = cv2.imencode('.jpg', frame)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    
    print("Frame captured!")
    choice = input("Do you want to test the full Node.js Backend route? (y/N): ").strip().lower()
    
    if choice == 'y':
        token = input("Enter your NodeJS JWT Token (from login): ").strip()
        url = "http://localhost:3000/api/auth/verify-face"
        print(f"Sending to Node Backend ({url})...")
        payload = json.dumps({"image_base64": img_base64}).encode('utf-8')
        req = urllib.request.Request(url, data=payload, headers={
            'Content-Type': 'application/json',
            'Cookie': f'token={token}'  # if using cookies
        })
        # also pass as bearer header just in case
        req.add_header('Authorization', f'Bearer {token}')
        
        try:
            with urllib.request.urlopen(req) as response:
                print("\nNode API Status:", response.status)
                print("Node Response:\n", json.loads(response.read().decode('utf-8')))
        except urllib.error.HTTPError as e:
            print("\nNode API Error Status:", e.code)
            print("Error Details:", e.read().decode('utf-8'))
        except Exception as e:
            print("Error connecting to Node:", e)
    else:
        print("Sending to Python Liveness Service directly (Port 8000)...")
        url = "http://localhost:8000/api/verify-liveness"
        payload = json.dumps({"image_base64": img_base64}).encode('utf-8')
        req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
        
        try:
            with urllib.request.urlopen(req) as response:
                print("\nPython API Status:", response.status)
                print("Python Response:\n", json.loads(response.read().decode('utf-8')))
        except urllib.error.HTTPError as e:
            print("\nPython API Error Status:", e.code)
            print("Error Details:", e.read().decode('utf-8'))
        except Exception as e:
            print("Error connecting to Python: Is it running?", e)

if __name__ == "__main__":
    test_liveness()
