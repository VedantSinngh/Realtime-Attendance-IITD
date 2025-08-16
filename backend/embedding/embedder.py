import os
import requests
from io import BytesIO
from PIL import Image
import torch
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase client setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = os.getenv("BUCKET_NAME", "faces")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Import embedding and detection modules
from embedding_module import get_face_embedding
from detect_faces import detect_face

# Set device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Step 1: Fetch users
res = supabase.table("users").select("id, name, image_path").execute()
users = res.data

# Step 2: Process each user
for user in users:
    user_id = user.get("id")
    name = user.get("name")
    image_path = user.get("image_path")

    if not image_path:
        print(f"⚠️ Skipping {name} (no image path)")
        continue

    try:
        # Step 3: Get signed URL
        url_resp = supabase.storage.from_(BUCKET_NAME).create_signed_url(image_path, 60)
        signed_url = url_resp.get("signedURL") or url_resp.get("signed_url")  # Handle key variation

        if not signed_url:
            print(f"❌ Failed to get signed URL for {name}")
            continue

        # Step 4: Load image
        img_data = requests.get(signed_url, timeout=10).content
        img = Image.open(BytesIO(img_data)).convert("RGB")

        # Step 5: Detect face
        face_tensor = detect_face(img)
        if face_tensor is None:
            print(f"❌ No face detected for {name}")
            continue

        # Step 6: Get embedding
        face_tensor = face_tensor.to(device)
        embedding = get_face_embedding(face_tensor)
        if embedding is None:
            print(f"❌ Embedding failed for {name}")
            continue

        # Step 7: Store embedding
        embedding_list = embedding.cpu().numpy().astype(float).tolist()
        supabase.table("users").update({
            "embedding": embedding_list
        }).eq("id", user_id).execute()

        print(f"✅ Processed {name}")

    except Exception as e:
        print(f"❌ Error processing {name}: {e}")
