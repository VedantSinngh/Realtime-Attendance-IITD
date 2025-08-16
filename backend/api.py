# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
import numpy as np
import torch

# Local imports (ensure these modules exist)
from detection.detect_faces import detect_face
from embedding.embedding_module import get_face_embedding
from utils.similarity import is_similar
from supabase_utils.supabase_client import get_embeddings, store_embedding, upload_image
from supabase_utils.attendance_logger import mark_attendance, get_attendance_summary, get_all_registered_faces

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

@app.route('/api/register', methods=['POST'])
def register():
    try:
        name = request.form.get('name')
        file = request.files.get('image')

        if not name or not file:
            return jsonify({'error': 'Name or image missing'}), 400

        # Convert image bytes to PIL image
        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes))

        # Face detection
        face_tensor = detect_face(img)
        if face_tensor is None:
            return jsonify({'error': 'No face detected'}), 400

        # Get face embedding
        embedding = get_face_embedding(face_tensor)
        if embedding is None:
            return jsonify({'error': 'Could not generate embedding'}), 500

        # Convert embedding for storage
        embedding = embedding.detach().cpu().numpy().flatten()

        # Prepare image for upload
        face_np = face_tensor.permute(1, 2, 0).cpu().numpy()
        face_np = (face_np * 255).astype(np.uint8)
        image_url = upload_image(face_np)

        # Store face info
        store_embedding(name, embedding, image_url)

        return jsonify({'success': True, 'name': name}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/scan', methods=['POST'])
def scan():
    try:
        file = request.files.get('image')
        if not file:
            return jsonify({'error': 'No image provided'}), 400

        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes))

        face_tensor = detect_face(img)
        if face_tensor is None:
            return jsonify({'status': 'no_face'}), 200

        embedding = get_face_embedding(face_tensor)
        if embedding is None:
            return jsonify({'error': 'Could not generate embedding'}), 500

        embedding = embedding.detach().cpu().numpy().flatten()

        known_embeddings = get_embeddings()
        if not known_embeddings:
            return jsonify({'error': 'No registered faces'}), 400

        for person in known_embeddings:
            db_embedding = np.array(person['embedding'], dtype=np.float32).flatten()
            similar, dist = is_similar(embedding, db_embedding)
            if similar:
                mark_attendance(
                    name=person['name'],
                    camera_id="web_camera",
                    confidence=1.0 - dist
                )
                return jsonify({
                    'status': 'recognized',
                    'name': person['name'],
                    'confidence': float(1.0 - dist)
                }), 200

        return jsonify({'status': 'unknown_face'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    try:
        summary = get_attendance_summary()
        return jsonify(summary), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/faces', methods=['GET'])
def get_faces():
    try:
        faces = get_all_registered_faces()
        return jsonify(faces), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/ping', methods=['GET'])
def ping():
    return jsonify({"status": "API is running"}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
