# similarity.py
from scipy.spatial.distance import cosine
import numpy as np

def is_similar(embedding1, embedding2, threshold=0.6):
    """
    Compare two face embeddings using cosine distance.
    Returns:
        (bool, float) -> (is_match, distance)
    """
    try:
        # Debug: Print input types and shapes
        print(f"🔍 DEBUG - Input types: {type(embedding1)}, {type(embedding2)}")
        
        embedding1 = np.array(embedding1, dtype=np.float32).flatten()
        embedding2 = np.array(embedding2, dtype=np.float32).flatten()

        print(f"🔍 DEBUG - After conversion shapes: {embedding1.shape}, {embedding2.shape}")

        if embedding1.shape != embedding2.shape:
            print(f"⚠️ Shape mismatch: {embedding1.shape} vs {embedding2.shape}")
            return False, 1.0

        # Check for zero vectors
        if np.allclose(embedding1, 0) or np.allclose(embedding2, 0):
            print("⚠️ Zero vector detected")
            return False, 1.0

        distance = cosine(embedding1, embedding2)

        # Handle NaN cases (if vector is zero)
        if np.isnan(distance):
            print("⚠️ Cosine distance returned NaN — using distance=1.0")
            return False, 1.0

        is_match = distance < threshold
        result = (is_match, float(distance))
        
        print(f"🔍 DEBUG - Returning: {result} (type: {type(result)}, length: {len(result)})")
        return result

    except Exception as e:
        print(f"❌ Error in is_similar: {e}")
        import traceback
        traceback.print_exc()
        return False, 1.0