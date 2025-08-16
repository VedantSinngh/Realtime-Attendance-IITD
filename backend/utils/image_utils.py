# utils/image_utils.py
import cv2
import numpy as np

def draw_box(frame, text, box=None):
    """
    Draw a bounding box and text on the frame
    
    Args:
        frame: OpenCV frame (numpy array)
        text: Text to display
        box: Optional bounding box (x, y, w, h). If None, uses default position
    """
    try:
        height, width = frame.shape[:2]
        
        # If no box provided, use default position at top of frame
        if box is None:
            x, y, w, h = 50, 50, 200, 30
        else:
            # Ensure box has exactly 4 values
            if len(box) != 4:
                print(f"⚠️ Invalid box format: {box}, using default position")
                x, y, w, h = 50, 50, 200, 30
            else:
                x, y, w, h = box
        
        # Draw rectangle background for text
        cv2.rectangle(frame, (x-5, y-25), (x + len(text)*10, y+5), (0, 255, 0), -1)
        
        # Draw text
        cv2.putText(frame, text, (x, y), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
        
        # Draw bounding box around detected area (optional)
        if box is not None:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            
    except Exception as e:
        print(f"⚠️ Error in draw_box: {e}")
        # Fallback: just draw text at top-left
        cv2.putText(frame, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

def draw_text_only(frame, text, position=(50, 50)):
    """
    Simple function to draw text on frame without bounding box
    
    Args:
        frame: OpenCV frame
        text: Text to display
        position: (x, y) position for text
    """
    try:
        x, y = position
        # Draw background rectangle
        text_size = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)[0]
        cv2.rectangle(frame, (x-5, y-25), (x + text_size[0] + 5, y+5), (0, 255, 0), -1)
        
        # Draw text
        cv2.putText(frame, text, (x, y), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
        
    except Exception as e:
        print(f"⚠️ Error drawing text: {e}")
        cv2.putText(frame, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)