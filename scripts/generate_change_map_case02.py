"""Build a before/after color composite (change.png) from two NISAR browse images."""
import os

import numpy as np
from PIL import Image

CASE_DIR = os.path.join("data", "processed", "case-02-flood")
NODATA_THRESHOLD = 15  # pixels darker than this are treated as empty borders


def stretch(arr, mask, low=2, high=98):
    """Percentile contrast stretch computed on valid pixels only.

    Each browse image was stretched independently by the provider, so without this
    step the colors could reflect different contrast settings instead of real change.
    """
    lo, hi = np.percentile(arr[mask], [low, high])
    scaled = np.clip((arr.astype(np.float32) - lo) / max(hi - lo, 1e-6), 0, 1)
    return (scaled * 255).astype(np.uint8)


def generate_change_map():
    before_path = os.path.join(CASE_DIR, "before.png")
    after_path = os.path.join(CASE_DIR, "after.png")

    if not (os.path.exists(before_path) and os.path.exists(after_path)):
        print("ERROR: before.png / after.png not found. Run fetch_nisar.py first.")
        return

    img_before = Image.open(before_path).convert("L")
    img_after = Image.open(after_path).convert("L")

    if img_before.size != img_after.size:
        print(f"WARNING: size mismatch {img_before.size} vs {img_after.size}. "
              "Resizing assumes both images cover the same footprint.")
        img_after = img_after.resize(img_before.size, Image.Resampling.LANCZOS)

    arr_before = np.array(img_before)
    arr_after = np.array(img_after)

    # Keep only pixels that contain data in BOTH images
    valid_mask = (arr_before > NODATA_THRESHOLD) & (arr_after > NODATA_THRESHOLD)
    if not valid_mask.any():
        print("ERROR: no overlapping valid pixels between the two images.")
        return

    before_n = stretch(arr_before, valid_mask)
    after_n = stretch(arr_after, valid_mask)

    # Red = before, Cyan (green + blue) = after.
    # Red areas: brighter before. Cyan areas: brighter after. Gray/white: little change.
    rgb = np.zeros((*arr_before.shape, 3), dtype=np.uint8)
    rgb[..., 0] = np.where(valid_mask, before_n, 0)
    rgb[..., 1] = np.where(valid_mask, after_n, 0)
    rgb[..., 2] = np.where(valid_mask, after_n, 0)

    change_path = os.path.join(CASE_DIR, "change.png")
    Image.fromarray(rgb).save(change_path)
    print(f"Saved: {change_path}")


if __name__ == "__main__":
    generate_change_map()