import json
import os
import requests

files = [f for f in os.listdir('comments/')]

db_url = "https://192.168.178.248:8000"

with open('data/models.json') as f:
    models = json.load(f)['models']

for fn in files:
    with open('comments/' + fn) as f:
        raw = json.load(f)
    all_ids = [raw[x]['mongo_id'] for x in raw]
    # get manual labels
    manual = requests.get(f"{db_url}/manual-labels", json={"issue_ids": all_ids})
    