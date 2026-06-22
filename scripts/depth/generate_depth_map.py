"""
Generate a single depth map from a video, for use as a continuous-depth
parallax background in the browser (Three.js displacement shader).

Pipeline:
  1. Open the video and grab a representative frame (default: the middle frame).
  2. Run Depth Anything V2 (Small) depth estimation on that frame.
  3. Normalize the depth to 0-255 and save it as a grayscale PNG, matched to
     the (optionally downscaled) frame resolution.

White = near (moves more in the parallax), black = far (moves less).

Usage:
  python scripts/depth/generate_depth_map.py \
      --video public/videos/Parallax_01.mp4 \
      --out-depth public/videos/Parallax_01_depth.png \
      --out-frame public/videos/Parallax_01_frame.jpg \
      --max-width 1280
"""

import argparse
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


def grab_frame(video_path: Path, position: float) -> Image.Image:
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise SystemExit(f"Could not open video: {video_path}")

    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
    target = int(total * position) if total > 0 else 0
    if total > 0:
        cap.set(cv2.CAP_PROP_POS_FRAMES, max(0, min(target, total - 1)))

    ok, frame = cap.read()
    cap.release()
    if not ok or frame is None:
        raise SystemExit("Could not read a frame from the video.")

    # OpenCV is BGR; convert to RGB for PIL / the model.
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    return Image.fromarray(frame_rgb)


def downscale(img: Image.Image, max_width: int) -> Image.Image:
    if max_width <= 0 or img.width <= max_width:
        return img
    ratio = max_width / img.width
    new_size = (max_width, round(img.height * ratio))
    return img.resize(new_size, Image.LANCZOS)


def estimate_depth(img: Image.Image, model_id: str) -> np.ndarray:
    # Imported lazily so the script can be inspected without torch installed.
    from transformers import pipeline

    print(f"Loading depth model: {model_id} (first run downloads weights)...")
    pipe = pipeline(task="depth-estimation", model=model_id)
    result = pipe(img)

    depth = result["depth"]
    depth = np.array(depth, dtype=np.float32)

    # Normalize to full 0-255 range so the shader gets maximum dynamic range.
    d_min, d_max = float(depth.min()), float(depth.max())
    if d_max - d_min < 1e-6:
        norm = np.zeros_like(depth)
    else:
        norm = (depth - d_min) / (d_max - d_min)
    return (norm * 255.0).astype(np.uint8)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--video", required=True, type=Path)
    parser.add_argument("--out-depth", required=True, type=Path)
    parser.add_argument("--out-frame", type=Path, default=None,
                        help="Optional: also save the source frame (JPG).")
    parser.add_argument("--position", type=float, default=0.5,
                        help="Frame position as a 0-1 fraction of the video.")
    parser.add_argument("--max-width", type=int, default=1280,
                        help="Downscale the frame to this width before inference.")
    parser.add_argument("--model", default="depth-anything/Depth-Anything-V2-Small-hf")
    parser.add_argument("--blur", type=int, default=3,
                        help="Gaussian blur kernel on the depth map (odd, 0=off) "
                             "to soften banding in the parallax displacement.")
    args = parser.parse_args()

    if not args.video.exists():
        raise SystemExit(f"Video not found: {args.video}")

    print(f"Grabbing frame at {args.position:.0%} of {args.video.name}...")
    frame = grab_frame(args.video, args.position)
    frame = downscale(frame, args.max_width)
    print(f"Frame size: {frame.width}x{frame.height}")

    depth = estimate_depth(frame, args.model)

    if args.blur and args.blur >= 3:
        k = args.blur if args.blur % 2 == 1 else args.blur + 1
        depth = cv2.GaussianBlur(depth, (k, k), 0)

    args.out_depth.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(depth, mode="L").save(args.out_depth)
    print(f"Saved depth map -> {args.out_depth}")

    if args.out_frame:
        args.out_frame.parent.mkdir(parents=True, exist_ok=True)
        frame.save(args.out_frame, quality=90)
        print(f"Saved source frame -> {args.out_frame}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
