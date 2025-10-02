import time

def format_time(seconds):
    """Format seconds into hours:minutes:seconds"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = seconds % 60
    return f"{hours:02d}:{minutes:02d}:{secs:05.2f}"

def main():
    start_time = None
    is_running = False
    
    print("=" * 40)
    print("        TIMER APPLICATION")
    print("=" * 40)
    
    while True:
        print("\nOptions:")
        print("1. Start Timer")
        print("2. Stop Timer")
        print("3. Exit")
        print("-" * 40)
        
        choice = input("Enter your choice (1-3): ").strip()
        
        if choice == '1':
            if is_running:
                print("\n⚠️  Timer is already running!")
            else:
                start_time = time.time()
                is_running = True
                print("\n✓ Timer started!")
        
        elif choice == '2':
            if not is_running:
                print("\n⚠️  No timer is running!")
            else:
                end_time = time.time()
                elapsed = end_time - start_time
                is_running = False
                print("\n✓ Timer stopped!")
                print(f"⏱️  Elapsed Time: {format_time(elapsed)}")
                start_time = None
        
        elif choice == '3':
            if is_running:
                print("\n⚠️  Timer is still running. Stopping it first...")
                end_time = time.time()
                elapsed = end_time - start_time
                print(f"⏱️  Final Elapsed Time: {format_time(elapsed)}")
            print("\nGoodbye! 👋")
            break
        
        else:
            print("\n❌ Invalid choice! Please enter 1, 2, or 3.")

if __name__ == "__main__":
    main()