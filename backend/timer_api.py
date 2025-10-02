# backend/timer_api.py
from flask import Flask, jsonify
import time

app = Flask(__name__)

# Global state (in-memory only, replace with DB if needed)
start_time = None
is_running = False

def format_time(seconds: float) -> str:
    """Format seconds into HH:MM:SS"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = seconds % 60
    return f"{hours:02d}:{minutes:02d}:{secs:05.2f}"

@app.route("/clock-in", methods=["POST"])
def clock_in():
    global start_time, is_running
    if is_running:
        return jsonify({"status": "error", "message": "⚠️ Timer already running"}), 400
    start_time = time.time()
    is_running = True
    return jsonify({"status": "success", "message": "✓ Timer started"})

@app.route("/clock-out", methods=["POST"])
def clock_out():
    global start_time, is_running
    if not is_running:
        return jsonify({"status": "error", "message": "⚠️ No active timer"}), 400
    end_time = time.time()
    elapsed = end_time - start_time
    is_running = False
    start_time = None
    return jsonify({
        "status": "success",
        "message": "✓ Timer stopped",
        "elapsed_time": format_time(elapsed)
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
