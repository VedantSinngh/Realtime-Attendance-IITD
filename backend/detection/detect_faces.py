# face_detection.py

from facenet_pytorch import MTCNN
import torch

device = torch.device("cpu")
mtcnn = MTCNN(keep_all=False, post_process=True, device=device)

def detect_face(image_pil):
    """
    Accepts a PIL image, returns a cropped and aligned face tensor (3x160x160)
    or None if no face is found.
    """
    try:
        face, prob = mtcnn(image_pil, return_prob=True)  # <-- explicit tuple output
    except Exception as e:
        print(f"⚠️ Face detection error: {e}")
        return None

    if face is None:
        print("❌ No face detected")
        return None

    if face.shape != (3, 160, 160):
        print(f"❌ Invalid face tensor shape: {face.shape}")
        return None

    if prob is not None and prob < 0.90:
        print(f"⚠️ Low confidence face detection: {prob:.2f}")
        return None

    return face

