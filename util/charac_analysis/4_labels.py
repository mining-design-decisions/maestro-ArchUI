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

    # manual labels
    all_ids = []
    id_to_key = {}
    key_to_id = {}
    for issue in raw:
        ecosys = issue.split('.')[0]
        ecosys_id = raw[issue]['link'].split('/')[-1]
        this_id = f"{ecosys}-{ecosys_id}"
        all_ids.append(this_id)
        id_to_key[this_id] = issue
        key_to_id[issue] = this_id

    issues_to_skip = []
    # get manual labels
    manual = requests.get(f"{db_url}/manual-labels", json={"issue_ids": all_ids}, verify=False).json()
    
    if "detail" in manual:
        opening = manual['detail'].find('[')
        closing = manual['detail'].find(']')
        cut = manual['detail'][opening+1:closing].split(', ')
        issues_to_skip = [x[1:-1] for x in cut]
        for issue in issues_to_skip:
            all_ids.remove(issue)
        manual = requests.get(f"{db_url}/manual-labels", json={"issue_ids": all_ids}, verify=False).json()

    manual = manual['manual_labels']

    for issue in raw:
        this_id = key_to_id[issue]
        label = manual[this_id] if this_id in manual else None
        raw[issue]['manual'] = label

    with open(f"manual/{fn}", 'w') as f:
        json.dump(raw, f, indent=4)