import cv2
import sys
import os
import torch
from detection.detect_faces import detect_face
from embedding.embedding_module import get_face_embedding
from utils.similarity import is_similar
from supabase_utils.supabase_client import upload_image, get_embeddings, store_embedding, debug_database_connection
from supabase_utils.attendance_logger import mark_attendance, get_attendance_summary, get_all_registered_faces, clear_today_attendance  # Updated imports
from utils.image_utils import draw_box
import numpy as np
from PIL import Image
from torchvision import transforms

def test_database_setup():
    """Test database connection and setup"""
    print("🔍 Testing database setup...")
    
    if debug_database_connection():
        print("✅ Database is ready for use")
        return True
    else:
        print("❌ Database setup needs attention")
        return False

def register_user():
    """Register a new user with face embedding"""
    name = input("Enter name of new user: ").strip()
    img_path = input("Enter the path of user's photo: ").strip()

    # Validate image path
    if not os.path.exists(img_path):
        print(f"❌ Error: File does not exist at path: {img_path}")
        return

    try:
        # Load image with OpenCV
        img = cv2.imread(img_path)
        if img is None:
            print("❌ Error: Could not load image. Check if the file is a valid image format (JPG, PNG).")
            return

        print(f"✅ Image loaded successfully: {img.shape}")

        if img.shape[0] == 0 or img.shape[1] == 0:
            print("❌ Error: Invalid image dimensions.")
            return

    except Exception as e:
        print(f"❌ Error reading image: {e}")
        return

    try:
        # Convert BGR to RGB and then to PIL
        img_pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        print(f"✅ Converted to PIL: {img_pil.size}")

        # Detect face
        print("🔍 Calling detect_face()...")
        face_tensor = detect_face(img_pil)

        print(f"detect_face() returned: {type(face_tensor)}")

        if face_tensor is None:
            print("❌ No face detected in the image.")
            return

        print(f"✅ Face detected as PyTorch tensor: {face_tensor.shape}")
        
        # Ensure tensor is detached and on CPU
        if face_tensor.requires_grad:
            face_tensor = face_tensor.detach()
        face_tensor = face_tensor.cpu()

    except Exception as e:
        print(f"❌ Error during face detection: {e}")
        import traceback
        traceback.print_exc()
        return

    try:
        # Generate face embedding
        print("🤖 Generating face embedding...")
        embedding = get_face_embedding(face_tensor)

        if embedding is None:
            print("❌ Error: Could not generate face embedding.")
            return

        if isinstance(embedding, np.ndarray) and embedding.size > 0:
            print(f"✅ Embedding generated: shape={embedding.shape}")
        else:
            print(f"❌ Error: Invalid embedding: {type(embedding)}")
            return

        # Upload image and store embedding
        print("📤 Uploading image and storing embedding...")
        
        # Convert face tensor to NumPy for image upload
        face_np = face_tensor.permute(1, 2, 0).cpu().numpy()
        face_np = (face_np * 255).astype(np.uint8)
        
        # Upload image to storage
        try:
            image_url = upload_image(face_np)
            print(f"✅ Image uploaded successfully")
        except Exception as e:
            print(f"⚠️ Warning: Image upload failed: {e}")
            image_url = None
        
        # Store embedding in faces table (your existing function should work)
        store_embedding(name, embedding, image_url)
        print(f"🎉 User '{name}' registered successfully in faces table!")

    except Exception as e:
        print(f"❌ Error during embedding generation or storage: {e}")
        import traceback
        traceback.print_exc()
        return

def realtime_attendance():
    # Initialize camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Error: Could not open camera. Make sure camera is connected and not in use by another application.")
        return
    
    # Set camera properties
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)
    
    print("✅ Starting attendance scanner. Press 'q' to quit.")
    
    # Load known embeddings from faces table
    try:
        print("🔍 Loading known embeddings from database...")
        known_embeddings = get_embeddings()  # This should pull from faces table
        print(f"🔍 get_embeddings() returned: {type(known_embeddings)}")
        print(f"🔍 Number of embeddings: {len(known_embeddings) if known_embeddings else 0}")
        
        if not known_embeddings:
            print("⚠️ Warning: No registered faces found. Register faces first.")
            print("🔍 Let's check what faces are in the database...")
            
            # Debug: Let's also check what get_all_registered_faces returns
            debug_faces = get_all_registered_faces()
            print(f"🔍 get_all_registered_faces() returned: {debug_faces}")
            
            cap.release()
            return
            
        print(f"✅ Retrieved {len(known_embeddings)} face embeddings")
        
        # Debug: Print first embedding structure
        if len(known_embeddings) > 0:
            first_embedding = known_embeddings[0]
            print(f"🔍 First embedding structure: {first_embedding.keys() if hasattr(first_embedding, 'keys') else type(first_embedding)}")
            
    except Exception as e:
        print(f"❌ Error loading embeddings: {e}")
        import traceback
        traceback.print_exc()
        cap.release()
        return

    frame_count = 0
    while True:
        ret, frame = cap.read()
        if not ret or frame is None or frame.size == 0:
            print("⚠️ Failed to grab frame")
            continue

        frame_count += 1
        
        try:
            # Process every 5th frame for efficiency
            if frame_count % 5 == 0:
                img_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                face_tensor = detect_face(img_pil)

                if face_tensor is not None:
                    print("🔍 Face detected, generating embedding...")
                    embedding = get_face_embedding(face_tensor)
                    
                    if embedding is not None:
                        print(f"✅ Generated embedding: shape={embedding.shape if hasattr(embedding, 'shape') else 'no shape'}")
                        
                        # Convert embedding to numpy if it's a tensor
                        if isinstance(embedding, torch.Tensor):
                            embedding = embedding.detach().cpu().numpy()
                        
                        # Ensure embedding is flattened
                        embedding = embedding.flatten()
                        print(f"🔍 Flattened embedding shape: {embedding.shape}")
                        
                        matched = False
                        
                        for i, item in enumerate(known_embeddings):
                            try:
                                print(f"🔍 Checking against item {i}: {item.keys() if hasattr(item, 'keys') else type(item)}")
                                
                                item_embedding = item.get("embedding")
                                if item_embedding is None:
                                    print(f"⚠️ Item {i} has no embedding")
                                    continue

                                # Convert DB embedding to NumPy and flatten
                                item_embedding = np.array(item_embedding, dtype=np.float32).flatten()
                                print(f"🔍 DB embedding shape: {item_embedding.shape}")

                                # Similarity check
                                similar, dist = is_similar(embedding, item_embedding)
                                
                                if similar:
                                    matched = True
                                    name = item.get("name", "Unknown")
                                    print(f"🎯 MATCH FOUND: {name} (distance={dist:.4f})")
                                    
                                    # ✅ Mark attendance in database
                                    attendance_marked = mark_attendance(
                                        name=name, 
                                        camera_id="camera_0",
                                        confidence=1.0 - dist  # Convert distance to confidence
                                    )
                                    
                                    if attendance_marked:
                                        draw_box(frame, f"✅ {name} - Attendance Marked!")
                                        print(f"[✓] Attendance marked for {name} (distance={dist:.4f})")
                                    else:
                                        draw_box(frame, f"Present: {name} (Already marked)")
                                        print(f"[✓] {name} recognized but attendance already marked recently")
                                    
                                    break
                                else:
                                    print(f"[X] Not a match with {item.get('name')} (distance={dist:.4f})")
                                        
                            except Exception as e:
                                print(f"⚠️ Error comparing embeddings with item {i}: {e}")
                                continue

                        if not matched:
                            print("❌ No match found for detected face")
                            draw_box(frame, "Unknown Face")
                    else:
                        print("❌ Failed to generate embedding")
                else:
                    print("❌ No face detected in frame")
        
        except Exception as e:
            print(f"⚠️ Processing error: {e}")
            import traceback
            traceback.print_exc()
            continue

        # Display frame
        try:
            cv2.imshow("Attendance", frame)
        except Exception as e:
            print(f"❌ Error displaying frame: {e}")
            break
            
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Cleanup
    cap.release()
    cv2.destroyAllWindows()

def view_attendance_summary():
    """View today's attendance summary"""
    print("\n📊 Today's Attendance Summary")
    print("="*50)
    
    try:
        summary = get_attendance_summary()
        print(f"Total Present: {summary['total_present']}")
        print("-"*50)
        
        if summary['records']:
            for record in summary['records']:
                confidence_str = f" (conf: {record['confidence']:.2f})" if record['confidence'] else ""
                print(f"👤 {record['name']} - {record['time']} - {record['camera']}{confidence_str}")
        else:
            print("No attendance records for today.")
            
    except Exception as e:
        print(f"❌ Error retrieving attendance summary: {e}")

def view_registered_faces():
    """View all registered faces"""
    print("\n👥 Registered Faces")
    print("="*30)
    
    try:
        faces = get_all_registered_faces()
        if faces:
            for face in faces:
                print(f"ID: {face['id']} - Name: {face['name']}")
        else:
            print("No faces registered.")
    except Exception as e:
        print(f"❌ Error retrieving faces: {e}")

def clear_attendance():
    """Clear today's attendance (for testing)"""
    confirm = input("⚠️ Are you sure you want to clear today's attendance? (yes/no): ").strip().lower()
    if confirm == 'yes':
        if clear_today_attendance():
            print("✅ Today's attendance cleared!")
        else:
            print("❌ Failed to clear attendance")
    else:
        print("❌ Operation cancelled")

def main():
    print("=== Face Recognition Attendance System ===")
    
    # Test database first
    if not debug_database_connection():
        print("⚠️ Please fix database issues before proceeding")
        return
    
    while True:
        print("\n" + "="*50)
        print("1. Register New Face")
        print("2. Start Attendance Scanner") 
        print("3. View Today's Attendance")
        print("4. View Registered Faces")
        print("5. Clear Today's Attendance (Testing)")
        print("6. Exit")
        print("="*50)
        
        choice = input("Enter your choice: ").strip()
        
        if choice == '1':
            register_user()
        elif choice == '2':
            realtime_attendance()
        elif choice == '3':
            view_attendance_summary()
        elif choice == '4':
            view_registered_faces()
        elif choice == '5':
            clear_attendance()
        elif choice == '6':
            print("👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice! Please enter 1-6.")

if __name__ == "__main__":
    main()