from PIL import Image
from facenet_pytorch import MTCNN, InceptionResnetV1
import torch

device = torch.device("cpu")

# Load face detector and embedding model
mtcnn = MTCNN(device='cpu')
model = InceptionResnetV1(pretrained='vggface2').eval().to(device)

# Load image
img = Image.open(r"/Users/adityapratapsingh/Documents/Face_Recognition_IITD/test_images/alice.jpg")  # replace with your test image

# Detect face
face = mtcnn(img)
if face is None:
    print("No face detected")
    exit()

# Get embedding
face = face.to(device).unsqueeze(0)
with torch.no_grad():
    emb = model(face)
print("Embedding shape:", emb.shape)
