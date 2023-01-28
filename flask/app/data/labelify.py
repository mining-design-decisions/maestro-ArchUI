import json

with open('training.json', 'r') as f:
    issues = json.load(f)

labels = []
label_attr = ['key','is-design']+[f"is-cat{i+1}" for i in range(3)]

for issue in issues:
    obj = {}
    for attr in label_attr:
        obj[attr] = issue[attr]
    labels.append(obj)

with open('training_labels.json', 'w') as f:
    json.dump(labels, f)