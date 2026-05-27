import os
import shutil

brain_dir = r"C:\Users\claud\.gemini\antigravity-ide\brain\e3547459-bee6-4cbd-b9d7-281562e889cd"
dest_image = r"c:\Users\claud\OneDrive\Documentos\NeuroAds\LP\public\images\editorial\alem-do-algoritmo\optimization-timer.png"

# Find all media__ files
media_files = [f for f in os.listdir(brain_dir) if f.startswith("media__")]

if not media_files:
    print("No media files found in brain directory.")
    exit(1)

# Sort by filename (since the suffix is timestamp)
media_files.sort()
latest_media = media_files[-1]
latest_path = os.path.join(brain_dir, latest_media)

print(f"Latest media file found: {latest_media} ({os.path.getsize(latest_path)} bytes)")

try:
    from PIL import Image
    img = Image.open(latest_path)
    print(f"Image format: {img.format}, size: {img.size}")
    
    # Save it directly as PNG to the destination
    os.makedirs(os.path.dirname(dest_image), exist_ok=True)
    img.save(dest_image, "PNG")
    print(f"Successfully processed and copied to {dest_image}")
except Exception as e:
    print(f"Error processing with PIL: {e}")
    # Fallback to direct copy
    os.makedirs(os.path.dirname(dest_image), exist_ok=True)
    shutil.copyfile(latest_path, dest_image)
    print(f"Copied raw file as fallback to {dest_image}")
