from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import cv2
import numpy as np
from PIL import Image
import io
import base64
import torch
from detection.detect_faces import detect_face
from embedding.embedding_module import get_face_embedding
from utils.similarity import is_similar
from supabase_utils.supabase_client import get_embeddings, store_embedding
from supabase_utils.attendance_logger import mark_attendance, get_attendance_summary, get_all_registered_faces
from utils.image_utils import draw_box
import asyncio
from typing import Dict, List, Optional
import threading
import queue
import time
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Face Recognition Attendance API")

# Add CORS middleware with more specific settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your app's origin
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Add middleware to log all requests
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = time.time()
    
    # Log request details
    logger.info(f"📨 {request.method} {request.url}")
    logger.info(f"Headers: {dict(request.headers)}")
    
    response = await call_next(request)
    
    # Log response details
    process_time = time.time() - start_time
    logger.info(f"📤 Response: {response.status_code} (took {process_time:.2f}s)")
    
    return response

# Global variables for camera streaming
camera_active = False
camera_thread = None
frame_queue = queue.Queue(maxsize=1)
latest_detection = {"name": None, "timestamp": None, "status": "waiting"}

class CameraManager:
    def __init__(self):
        self.cap = None
        self.is_running = False
        self.known_embeddings = []
        
    def load_embeddings(self):
        """Load known embeddings from database"""
        try:
            self.known_embeddings = get_embeddings()
            logger.info(f"Loaded {len(self.known_embeddings)} embeddings")
            return True
        except Exception as e:
            logger.error(f"Error loading embeddings: {e}")
            return False
    
    def start_camera(self):
        """Start camera capture"""
        if self.cap is not None:
            self.cap.release()
            
        self.cap = cv2.VideoCapture(0)
        if not self.cap.isOpened():
            raise Exception("Could not open camera")
            
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        self.cap.set(cv2.CAP_PROP_FPS, 30)
        
        self.is_running = True
        return True
    
    def process_frame(self):
        """Process a single frame for face recognition"""
        global latest_detection
        
        if not self.cap or not self.cap.isOpened():
            return None
            
        ret, frame = self.cap.read()
        if not ret or frame is None:
            return None
            
        try:
            # Convert to PIL Image
            img_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            face_tensor = detect_face(img_pil)
            
            if face_tensor is not None:
                # Generate embedding
                embedding = get_face_embedding(face_tensor)
                
                if embedding is not None:
                    # Convert to numpy if tensor
                    if isinstance(embedding, torch.Tensor):
                        embedding = embedding.detach().cpu().numpy()
                    embedding = embedding.flatten()
                    
                    # Check against known embeddings
                    for item in self.known_embeddings:
                        item_embedding = item.get("embedding")
                        if item_embedding is None:
                            continue
                            
                        item_embedding = np.array(item_embedding, dtype=np.float32).flatten()
                        similar, dist = is_similar(embedding, item_embedding)
                        
                        if similar:
                            name = item.get("name", "Unknown")
                            confidence = 1.0 - dist
                            
                            # Mark attendance
                            attendance_marked = mark_attendance(
                                name=name,
                                camera_id="camera_0",
                                confidence=confidence
                            )
                            
                            latest_detection = {
                                "name": name,
                                "timestamp": time.time(),
                                "status": "marked" if attendance_marked else "already_present",
                                "confidence": confidence,
                                "distance": dist
                            }
                            
                            # Draw box on frame
                            if attendance_marked:
                                draw_box(frame, f"✅ {name} - Attendance Marked!")
                            else:
                                draw_box(frame, f"Present: {name}")
                            break
                    else:
                        latest_detection = {
                            "name": "Unknown",
                            "timestamp": time.time(),
                            "status": "unknown",
                            "confidence": 0.0,
                            "distance": 1.0
                        }
                        draw_box(frame, "Unknown Face")
                        
            # Convert frame to base64 for streaming
            _, buffer = cv2.imencode('.jpg', frame)
            frame_b64 = base64.b64encode(buffer).decode('utf-8')
            
            return {
                "frame": frame_b64,
                "detection": latest_detection
            }
            
        except Exception as e:
            logger.error(f"Error processing frame: {e}")
            return None
    
    def stop_camera(self):
        """Stop camera capture"""
        self.is_running = False
        if self.cap:
            self.cap.release()
            self.cap = None

# Global camera manager
camera_manager = CameraManager()

@app.post("/api/register-face")
async def register_face(
    name: str = Form(...),
    file: UploadFile = File(...)
):
    """Register a new face"""
    try:
        logger.info(f"Attempting to register face for: {name}")
        logger.info(f"File info: {file.filename}, {file.content_type}, {file.size}")
        
        # Validate inputs
        if not name or not name.strip():
            raise HTTPException(status_code=400, detail="Name is required")
            
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image
        try:
            image_data = await file.read()
            logger.info(f"Image data size: {len(image_data)} bytes")
        except Exception as e:
            logger.error(f"Error reading file: {e}")
            raise HTTPException(status_code=400, detail="Could not read image file")
        
        if len(image_data) == 0:
            raise HTTPException(status_code=400, detail="Image file is empty")
        
        # Convert to PIL Image
        try:
            img_pil = Image.open(io.BytesIO(image_data))
            logger.info(f"Image opened successfully: {img_pil.size}, {img_pil.mode}")
            
            if img_pil.mode != 'RGB':
                img_pil = img_pil.convert('RGB')
                logger.info("Converted image to RGB")
        except Exception as e:
            logger.error(f"Error opening image: {e}")
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Detect face
        try:
            face_tensor = detect_face(img_pil)
            logger.info(f"Face detection result: {face_tensor is not None}")
        except Exception as e:
            logger.error(f"Error detecting face: {e}")
            raise HTTPException(status_code=500, detail="Error during face detection")
            
        if face_tensor is None:
            raise HTTPException(status_code=400, detail="No face detected in image")
        
        # Generate embedding
        try:
            embedding = get_face_embedding(face_tensor)
            logger.info(f"Embedding generation result: {embedding is not None}")
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise HTTPException(status_code=500, detail="Error generating face embedding")
            
        if embedding is None:
            raise HTTPException(status_code=400, detail="Could not generate face embedding")
        
        # Convert to numpy if tensor
        if isinstance(embedding, torch.Tensor):
            embedding = embedding.detach().cpu().numpy()
        
        # Store in database
        try:
            store_embedding(name.strip(), embedding, None)
            logger.info(f"Successfully stored embedding for {name}")
        except Exception as e:
            logger.error(f"Error storing embedding: {e}")
            raise HTTPException(status_code=500, detail="Error storing face data in database")
        
        return {
            "success": True,
            "message": f"Face registered successfully for {name.strip()}",
            "name": name.strip()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error registering face: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/start-scanner")
async def start_scanner():
    """Start the attendance scanner"""
    global camera_active, camera_thread
    
    try:
        if camera_active:
            return {"success": False, "message": "Scanner is already running"}
        
        # Load embeddings
        if not camera_manager.load_embeddings():
            raise HTTPException(status_code=500, detail="Failed to load known faces from database")
        
        if len(camera_manager.known_embeddings) == 0:
            raise HTTPException(status_code=400, detail="No registered faces found. Register faces first.")
        
        # Start camera
        camera_manager.start_camera()
        camera_active = True
        
        return {
            "success": True,
            "message": "Scanner started successfully",
            "registered_faces": len(camera_manager.known_embeddings)
        }
        
    except Exception as e:
        logger.error(f"Error starting scanner: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/stop-scanner")
async def stop_scanner():
    """Stop the attendance scanner"""
    global camera_active
    
    try:
        if not camera_active:
            return {"success": False, "message": "Scanner is not running"}
        
        camera_manager.stop_camera()
        camera_active = False
        
        return {
            "success": True,
            "message": "Scanner stopped successfully"
        }
        
    except Exception as e:
        logger.error(f"Error stopping scanner: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/scanner-frame")
async def get_scanner_frame():
    """Get current frame from scanner"""
    try:
        if not camera_active:
            raise HTTPException(status_code=400, detail="Scanner is not running")
        
        frame_data = camera_manager.process_frame()
        if frame_data is None:
            raise HTTPException(status_code=500, detail="Failed to capture frame")
        
        return frame_data
        
    except Exception as e:
        logger.error(f"Error getting frame: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/scanner-status")
async def get_scanner_status():
    """Get scanner status and latest detection"""
    return {
        "active": camera_active,
        "latest_detection": latest_detection,
        "registered_faces": len(camera_manager.known_embeddings) if camera_manager.known_embeddings else 0
    }

@app.get("/api/attendance-summary")
async def get_attendance_summary_api():
    """Get today's attendance summary"""
    try:
        summary = get_attendance_summary()
        return {
            "success": True,
            "summary": summary
        }
    except Exception as e:
        logger.error(f"Error getting attendance summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/registered-faces")
async def get_registered_faces_api():
    """Get all registered faces"""
    try:
        faces = get_all_registered_faces()
        return {
            "success": True,
            "faces": faces
        }
    except Exception as e:
        logger.error(f"Error getting registered faces: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "scanner_active": camera_active,
        "timestamp": time.time()
    }

# Add a test endpoint to check if the server is receiving requests properly
@app.post("/api/test-upload")
async def test_upload(file: UploadFile = File(...)):
    """Test file upload endpoint"""
    try:
        data = await file.read()
        return {
            "filename": file.filename,
            "content_type": file.content_type,
            "size": len(data),
            "success": True
        }
    except Exception as e:
        logger.error(f"Test upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Face Recognition Attendance API Server...")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🌐 Server will be accessible at:")
    print("   - http://localhost:8000 (local)")
    print("   - http://127.0.0.1:8000 (local)")
    print("   - http://0.0.0.0:8000 (all interfaces)")
    print("   - http://192.168.53.151:8000 (your network IP)")
    print()
    print("🔧 Endpoints:")
    print("   - POST /api/register-face")
    print("   - POST /api/start-scanner")
    print("   - GET /api/scanner-frame")
    print("   - GET /api/attendance-summary")
    print()
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")