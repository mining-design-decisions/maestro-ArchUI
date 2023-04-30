import requests
import json

with open('../raw/apache_issues.json') as f:
    raw = json.load(f)

projects = {} # key -> {'name': ..., 'url': ...}
for project in raw:
    x = requests.get(project['self'])
    if 'url' in x.json():
        projects[project['key']] = {
            'name': project['name'],
            'url': x.json()['url']
        }
    else:
        print(f"WARNING: {project['self']} does not have URL parameter")

with open('../data/apache_urls.json', 'w') as f:
    json.dump(projects, f)
