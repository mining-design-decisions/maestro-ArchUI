import pandas as pd
import numpy as np

files = {
    "proj_domains/apache.xlsx": {
        "ecosystem": "ecosystem",
        "key": "key",
        "domain": "My domain",
        "sheet": "Sheet 1"
    }
}

results = {}

for filename in files:
    sheet = pd.read_excel(filename, files[filename]['sheet'])
    keycol = -1
    domaincol = -1
    ecosyscol = -1
    idx = 0
    for col in sheet.columns:
        if col==files[filename]['key']:
            keycol = idx
        if col==files[filename]['domain']:
            domaincol = idx
        if col==files[filename]['ecosystem']:
            ecosyscol = idx
            
        idx += 1

    if -1 in [keycol, ecosyscol, domaincol]:
        print("Error: not all required columns found for file " + filename)
        continue

    for row in sheet.values:
        key = row[keycol]
        domain = row[domaincol]
        ecosys = row[ecosyscol]

        if domain != domain: #nan
            print(f"Wasn't able to find domain for {key}")
            continue
        
        if not ecosys in results:
            results[ecosys] = {}
        results[ecosys][key] = domain

with open("data/project_domains.json", 'w') as f:
    import json
    json.dump(results, f, indent=4)