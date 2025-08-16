# supabase_utils/attendance_logger.py
from datetime import datetime, timedelta
import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase client setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_face_id_by_name(name):
    """Get face ID from faces table by name"""
    try:
        response = supabase.table("faces").select("id").eq("name", name).execute()
        print(f"🔍 Debug: get_face_id_by_name for '{name}': {response.data}")
        if response.data and len(response.data) > 0:
            return response.data[0]["id"]
        return None
    except Exception as e:
        print(f"❌ Error getting face ID for {name}: {e}")
        return None

def get_face_name_by_id(face_id):
    """Get face name from faces table by ID"""
    try:
        response = supabase.table("faces").select("name").eq("id", face_id).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]["name"]
        return "Unknown"
    except Exception as e:
        print(f"❌ Error getting face name for ID {face_id}: {e}")
        return "Unknown"

def check_recent_attendance(face_id, minutes=5):
    """Check if face has attendance marked in the last N minutes"""
    try:
        # Calculate time threshold
        time_threshold = datetime.now() - timedelta(minutes=minutes)
        
        response = supabase.table("attendance").select("*").eq("user_id", face_id).gte("timestamp", time_threshold.isoformat()).execute()
        
        return len(response.data) > 0
        
    except Exception as e:
        print(f"❌ Error checking recent attendance: {e}")
        return False

def mark_attendance(name, camera_id="camera_0", confidence=None):
    """
    Mark attendance for a face/person
    
    Args:
        name: Person name from faces table
        camera_id: Camera identifier (default: "camera_0")
        confidence: Recognition confidence score (optional)
    
    Returns:
        bool: True if attendance marked successfully, False otherwise
    """
    try:
        print(f"🔍 Attempting to mark attendance for: {name}")
        
        # Get face ID from faces table
        face_id = get_face_id_by_name(name)
        if face_id is None:
            print(f"❌ Person '{name}' not found in faces table")
            return False
        
        print(f"✅ Found face_id: {face_id} for {name}")
        
        # Check if attendance already marked recently (prevent duplicate entries)
        if check_recent_attendance(face_id, minutes=5):
            print(f"⚠️ Attendance already marked for {name} in the last 5 minutes")
            return False
        
        # Prepare attendance data (using user_id column to store face_id)
        attendance_data = {
            "user_id": face_id,  # This will reference the faces table ID
            "timestamp": datetime.now().isoformat(),
            "camera_id": camera_id
        }
        
        # Add confidence if provided
        if confidence is not None:
            try:
                attendance_data["confidence"] = float(confidence)
            except:
                pass  # Skip if confidence column doesn't exist
        
        print(f"🔍 Inserting attendance data: {attendance_data}")
        
        # Insert attendance record
        response = supabase.table("attendance").insert(attendance_data).execute()
        
        print(f"🔍 Supabase response: {response.data}")
        
        if response.data:
            print(f"✅ Attendance marked for {name} at {datetime.now().strftime('%H:%M:%S')}")
            return True
        else:
            print(f"❌ Failed to mark attendance for {name}")
            return False
            
    except Exception as e:
        print(f"❌ Error marking attendance for {name}: {e}")
        import traceback
        traceback.print_exc()
        return False

def get_today_attendance():
    """Get all attendance records for today"""
    try:
        today = datetime.now().date()
        
        # Get attendance records for today
        response = supabase.table("attendance").select("*").gte("timestamp", today.isoformat()).execute()
        
        # Add face names to each record
        attendance_with_names = []
        for record in response.data:
            face_id = record.get("user_id")  # user_id actually contains face_id
            face_name = get_face_name_by_id(face_id) if face_id else "Unknown"
            
            record_with_name = record.copy()
            record_with_name["face_name"] = face_name
            attendance_with_names.append(record_with_name)
        
        return attendance_with_names
        
    except Exception as e:
        print(f"❌ Error getting today's attendance: {e}")
        return []

def get_attendance_summary():
    """Get attendance summary for today"""
    try:
        attendance_records = get_today_attendance()
        
        summary = {
            "total_present": len(attendance_records),
            "records": []
        }
        
        for record in attendance_records:
            face_name = record.get("face_name", "Unknown")
            timestamp = record.get("timestamp", "")
            
            # Format timestamp for display
            if timestamp:
                try:
                    dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    formatted_time = dt.strftime('%H:%M:%S')
                except:
                    formatted_time = timestamp[:19] if len(timestamp) > 19 else timestamp
            else:
                formatted_time = "Unknown"
            
            summary["records"].append({
                "name": face_name,
                "time": formatted_time,
                "camera": record.get("camera_id", "Unknown"),
                "confidence": record.get("confidence")
            })
        
        return summary
        
    except Exception as e:
        print(f"❌ Error getting attendance summary: {e}")
        return {"total_present": 0, "records": []}

def get_all_registered_faces():
    """Get all registered faces for testing"""
    try:
        response = supabase.table("faces").select("id, name").execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"❌ Error getting registered faces: {e}")
        import traceback
        traceback.print_exc()
        return []

def clear_today_attendance():
    """Clear all attendance records for today (for testing)"""
    try:
        today = datetime.now().date()
        response = supabase.table("attendance").delete().gte("timestamp", today.isoformat()).execute()
        print(f"✅ Cleared attendance records for today")
        return True
    except Exception as e:
        print(f"❌ Error clearing attendance: {e}")
        return False