System Logic Overview
Your face recognition attendance system works in 4 main steps:

Registration Phase:

User provides name + photo
System detects face in photo using MTCNN
Extracts 512-dimensional face embedding using FaceNet
Stores name, embedding, and image in Supabase database


Real-time Recognition:

Camera captures live video frames
Detects faces in each frame
Compares face embeddings with stored embeddings
If similarity > threshold, marks attendance


Face Detection: MTCNN finds and crops faces to 160x160 pixels
Face Embedding: FaceNet converts face image to 512-dimensional vector for comparison