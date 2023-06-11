import json
import os
import requests

files = [f for f in os.listdir('domains/')]

db_url = "https://issues-db.nl:8000"

with open('data/models.json') as f:
    models = json.load(f)['models']

for fn in files:
    with open('domains/' + fn) as f:
        raw = json.load(f)

    # manual labels
    all_ids = []
    key_to_id = {}
    for issue in raw:
        ecosys = issue.split('.')[0]
        ecosys_id = raw[issue]['link'].split('/')[-1]
        this_id = f"{ecosys}-{ecosys_id}"
        all_ids.append(this_id)
        key_to_id[issue] = this_id

    issues_to_skip = []
    # get manual labels
    manual = requests.get(f"{db_url}/manual-labels", json={"issue_ids": all_ids}, verify=False).json()
    
    if "detail" in manual:
        opening = manual['detail'].find('[')
        closing = manual['detail'].find(']')
        cut = manual['detail'][opening+1:closing].split(', ')
        issues_to_skip = [x[1:-1] for x in cut]
        has_manual_label_ids = all_ids.copy()
        for issue in issues_to_skip:
            has_manual_label_ids.remove(issue)
        manual = requests.get(f"{db_url}/manual-labels", json={"issue_ids": has_manual_label_ids}, verify=False).json()

    manual = manual['manual_labels']

    for issue in raw:
        this_id = key_to_id[issue]
        label = manual[this_id] if this_id in manual else None
        raw[issue]['manual'] = label
        raw[issue]['models'] = {}

    # automatic labels
    # untested
    for model in models:
        model_id = models[model]['model_id']
        version_id = models[model]['version_id']

        model_labels = requests.get(f"{db_url}/models/{model_id}/versions/{version_id}/predictions", json={"issue_ids": all_ids}, verify=False).json()['predictions']
        
        for issue in raw:
            this_id = key_to_id[issue]
            label = model_labels[this_id] if this_id in model_labels else None
            raw[issue]['models'][model] = label

    with open(f"manual/{fn}", 'w') as f:
        json.dump(raw, f, indent=4)