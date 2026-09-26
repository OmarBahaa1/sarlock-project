import asf_search as asf

# West-central Ohio flood area (Auglaize/Logan/Shelby counties)
aoi = "POLYGON((-84.8 40.0, -83.6 40.0, -83.6 40.9, -84.8 40.9, -84.8 40.0))"

results = asf.geo_search(
    platform=[asf.PLATFORM.NISAR],
    intersectsWith=aoi,
    start="2026-07-01",
    end="2026-09-05",
    processingLevel=["GCOV", "GSLC"]
)

print(f"Found {len(results)} NISAR results\n")

for r in sorted(results, key=lambda x: x.properties['startTime']):
    p = r.properties
    print(f"Date: {p['startTime']} | Product: {p['processingLevel']} | "
          f"Platform: {p['platform']} | FileID: {p['fileID']}")