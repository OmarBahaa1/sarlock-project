import asf_search as asf

# Akmola Region, Kazakhstan — wildfire area (approximate)
aoi = "POLYGON((69.0 50.5, 71.5 50.5, 71.5 52.0, 69.0 52.0, 69.0 50.5))"

results = asf.geo_search(
    platform=[asf.PLATFORM.NISAR],
    intersectsWith=aoi,
    start="2026-06-20",
    end="2026-08-15",
    processingLevel=["GCOV", "GSLC"]
)

print(f"Found {len(results)} NISAR results\n")

for r in sorted(results, key=lambda x: x.properties['startTime']):
    p = r.properties
    print(f"Date: {p['startTime']} | Product: {p['processingLevel']} | "
          f"Platform: {p['platform']} | FileID: {p['fileID']}")