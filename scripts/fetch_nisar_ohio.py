"""Download NISAR browse (quicklook) PNGs for case-02 (Ohio floods) from ASF and save granule metadata."""
import json
import os

import asf_search as asf
import requests

CASE_DIR = os.path.join("data", "processed", "case-02-flood")

GRANULES = {
    "before.png": "NISAR_L2_PR_GCOV_025_127_D_068_4005_DHDH_A_20260717T002543_20260717T002618_P05023_N_F_J_001",
    "after.png": "NISAR_L2_PR_GCOV_028_127_D_068_4005_DHDH_A_20260822T002541_20260822T002616_P05023_N_F_J_001",
}


def download_browse_image(granule_id, output_filename):
    print(f"Searching for granule: {granule_id}")
    results = asf.granule_search([granule_id])
    if not results:
        print("ERROR: granule not found.")
        return None

    product = results[0]
    props = product.properties
    browse_urls = props.get("browse") or []
    if not browse_urls:
        print("ERROR: this granule has no browse image.")
        return None

    img_url = browse_urls[0]
    print("Downloading browse image from ASF...")
    try:
        response = requests.get(img_url, stream=True, timeout=60)
        response.raise_for_status()
    except requests.RequestException as exc:
        print(f"ERROR: download failed: {exc}")
        return None

    filepath = os.path.join(CASE_DIR, output_filename)
    with open(filepath, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    print(f"Saved: {filepath}")

    return {
        "file": output_filename,
        "granule_id": granule_id,
        "start_time": props.get("startTime"),
        "stop_time": props.get("stopTime"),
        "flight_direction": props.get("flightDirection"),
        "browse_url": img_url,
        "footprint": product.geometry,
    }


def fetch_case_02():
    os.makedirs(CASE_DIR, exist_ok=True)
    print("Fetching NISAR browse images for the Ohio flood case...\n")

    metadata = []
    for filename, granule_id in GRANULES.items():
        info = download_browse_image(granule_id, filename)
        if info:
            metadata.append(info)
        print("-" * 40)

    with open(os.path.join(CASE_DIR, "granules_metadata.json"), "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    if len(metadata) == len(GRANULES):
        print(f"Done. Files are in: {CASE_DIR}")
    else:
        print("Finished with errors. Check the messages above.")


if __name__ == "__main__":
    fetch_case_02()