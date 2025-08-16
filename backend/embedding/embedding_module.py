# embedding_module.py
from facenet_pytorch import InceptionResnetV1
import torch
import numpy as np

device = torch.device("cpu")
model = InceptionResnetV1(pretrained='vggface2').eval().to(device)

def get_face_embedding(face_img_tensor):
    if face_img_tensor is None or face_img_tensor.shape != (3, 160, 160):
        print(f"❌ Invalid face tensor shape: {None if face_img_tensor is None else face_img_tensor.shape}")
        return None

    face_img_tensor = face_img_tensor.unsqueeze(0).to(device)  # (1, 3, 160, 160)

    with torch.no_grad():
        embedding = model(face_img_tensor)

        return embedding.squeeze(0).cpu().detach().numpy().astype(np.float32)   # ✅ returns (512,) numpy array

