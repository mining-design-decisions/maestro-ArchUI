import json

with open('../results/apache_big_only.json') as f:
    data = json.load(f)
with open('../given/ecosystems_and_projects.json') as f:
    proj = json.load(f)

ecosys = 'Apache'
threshold = 1000

toAdd = []
for p in proj[ecosys]:
    if proj[ecosys][p] >= threshold:
        toAdd.append(p)

result = []
for p in data:
    if p['key'] in toAdd:
        result.append(p)
        toAdd.remove(p['key'])

for p in toAdd:
    result.append({
        'key': p,
        "project": None,
        "language": None,
        "domain": None,
        "ecosystem": ecosys,
        "issue_count": proj[ecosys][p]
    })

with open('../results/apache_big_only_2.json', 'w') as f:
    json.dump(result, f)