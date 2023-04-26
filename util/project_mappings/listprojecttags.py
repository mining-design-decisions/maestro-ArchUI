import json

with open('raw/dbtags.json') as f:
    raw = json.load(f)

projects = []
for tag in raw['tags']:
    if tag['type'] == 'project':
        projects.append(tag['name'])

with open('data/projects.json', 'w') as f:
    json.dump(projects, f)