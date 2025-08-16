import os
from dotenv import load_dotenv
from supabase import create_client
import uuid
from PIL import Image
import io
import numpy as np

# Load environment variables
load_dotenv()

# Get environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
BUCKET_NAME = "faces"

# Validate environment variables
if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL environment variable is required")
if not SUPABASE_SERVICE_KEY:
    raise ValueError("SUPABASE_SERVICE_KEY environment variable is required")

# Create Supabase client
try:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    print("✅ Supabase client created successfully")
except Exception as e:
    print(f"❌ Failed to create Supabase client: {e}")
    raise

def upload_image(face_image):
    """Upload face image to Supabase storage"""
    try:
        # Convert numpy array to PIL Image if needed
        if isinstance(face_image, np.ndarray):
            # Ensure the image is in the right format (0-255, uint8)
            if face_image.dtype != np.uint8:
                face_image = (face_image * 255).astype(np.uint8)
            image = Image.fromarray(face_image)
        else:
            image = face_image
            
        # Convert to bytes
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='JPEG', quality=85)
        img_byte_arr.seek(0)
        
        # Generate unique filename
        filename = f"{uuid.uuid4().hex}.jpg"
        
        # Upload to storage
        response = supabase.storage.from_(BUCKET_NAME).upload(
            filename,
            img_byte_arr.getvalue(),
            file_options={"content-type": "image/jpeg"}
        )
        
        if response:
            # Get public URL
            public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(filename)
            return public_url
        else:
            raise Exception("Upload response was empty")
            
    except Exception as e:
        print(f"❌ Image upload error: {e}")
        raise

def store_embedding(name, embedding, image_url=None):
    """Store face embedding in database"""
    try:
        # Convert PyTorch tensor to numpy if needed
        if not isinstance(embedding, np.ndarray):
            if hasattr(embedding, 'cpu'):  # PyTorch tensor
                embedding = embedding.detach().cpu().numpy()
            else:
                embedding = np.array(embedding)
        
        # Ensure it's float32 and flatten
        embedding = embedding.astype(np.float32).flatten()
        
        # Convert to Python list (JSON serializable)
        embedding_list = embedding.tolist()
        
        # Validate the conversion
        if not isinstance(embedding_list, list) or len(embedding_list) == 0:
            raise ValueError("Failed to convert embedding to valid list")
        
        print(f"✅ Embedding converted to list of {len(embedding_list)} floats")
        
        # First, let's check if the table exists and what columns it has
        try:
            # Try to get the table structure by selecting with limit 0
            test_response = supabase.table("faces").select("*").limit(0).execute()
            print("✅ Table 'faces' exists and is accessible")
        except Exception as table_error:
            print(f"❌ Table access error: {table_error}")
            # Try to create the table if it doesn't exist
            print("🔧 Attempting to create table...")
            create_table_if_not_exists()
        
        # Prepare minimal data for insertion first (test with just name)
        print("🔍 Testing with minimal data insertion...")
        test_data = {"name": name}
        
        try:
            test_response = supabase.table("faces").insert(test_data).execute()
            print("✅ Minimal data insertion successful")
            
            # If successful, delete the test record and insert full data
            if test_response.data:
                test_id = test_response.data[0].get('id')
                if test_id:
                    supabase.table("faces").delete().eq('id', test_id).execute()
                    print("🗑️ Deleted test record")
        
        except Exception as test_error:
            print(f"❌ Minimal data insertion failed: {test_error}")
            raise
        
        # Now try with full data
        insert_data = {
            "name": name,
            "embedding": embedding_list
        }
        
        # Add image_url if provided
        if image_url:
            insert_data["image_url"] = image_url
        
        print(f"🔍 Inserting full data: {list(insert_data.keys())}")
        
        # Insert into database
        response = supabase.table("faces").insert(insert_data).execute()
        
        if response.data:
            print(f"✅ Successfully stored embedding for '{name}'")
            return response.data[0]
        else:
            raise Exception("No data returned from database insert")
            
    except Exception as e:
        print(f"❌ Error storing embedding: {e}")
        print(f"❌ Error type: {type(e)}")
        
        # Additional debugging
        try:
            # Check if we can at least connect to the database
            tables_response = supabase.table("faces").select("count").execute()
            print("✅ Database connection is working")
        except Exception as conn_error:
            print(f"❌ Database connection error: {conn_error}")
        
        raise

def get_embeddings():
    """Retrieve all face embeddings from database"""
    try:
        response = supabase.table("faces").select("*").execute()
        
        if response.data:
            print(f"✅ Retrieved {len(response.data)} embeddings")
            return response.data
        else:
            print("ℹ️ No embeddings found in database")
            return []
            
    except Exception as e:
        print(f"❌ Database retrieval error: {e}")
        raise

def create_table_if_not_exists():
    """Create the faces table if it doesn't exist"""
    try:
        # This is a SQL command to create the table
        # Note: You'll need to run this in your Supabase SQL editor, not through the Python client
        sql_command = """
        CREATE TABLE IF NOT EXISTS faces (
            id BIGSERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            embedding JSONB,
            image_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable Row Level Security
        ALTER TABLE faces ENABLE ROW LEVEL SECURITY;
        
        -- Create a policy that allows all operations for service role
        CREATE POLICY "Service role can do everything" ON faces
        FOR ALL TO service_role
        USING (true)
        WITH CHECK (true);
        """
        
        print("🔧 Please run this SQL command in your Supabase SQL editor:")
        print(sql_command)
        print("🔧 Then try running the registration again.")
        
    except Exception as e:
        print(f"❌ Error in table creation guidance: {e}")

def debug_database_connection():
    """Debug database connection and table structure"""
    try:
        print("🔍 Testing Supabase connection...")
        
        # Test basic connection
        response = supabase.table("faces").select("count").execute()
        print(f"✅ Connection successful. Count response: {response}")
        
        # Test table structure
        structure_response = supabase.table("faces").select("*").limit(1).execute()
        print(f"✅ Table structure test successful")
        
        if structure_response.data:
            print(f"📋 Sample data columns: {list(structure_response.data[0].keys())}")
        else:
            print("📋 Table is empty, no sample data")
            
        return True
        
    except Exception as e:
        print(f"❌ Database debug failed: {e}")
        return False

def test_connection():
    """Test the Supabase connection"""
    try:
        # Test database connection
        response = supabase.table("faces").select("count", count="exact").execute()
        print(f"✅ Database connection successful. Records count: {response.count}")
        
        # Test storage connection
        buckets = supabase.storage.list_buckets()
        print(f"✅ Storage connection successful. Buckets: {[b.name for b in buckets]}")
        
        return True
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        return False

if __name__ == "__main__":
    # Test connection when running this file directly
    test_connection()