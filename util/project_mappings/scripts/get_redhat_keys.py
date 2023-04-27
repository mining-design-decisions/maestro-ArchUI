import json
import requests

total = 0
problems = 0

with open('../raw/redhat.json') as f:
    raw_projects = json.load(f)
    website_to_key = {}
    key_to_website = {}
    for project in raw_projects:
        total += 1
        x = requests.get(project['self'])
        project_data = x.json()
        if 'url' in project_data and project_data['url']:
            if 'key' in project_data and project_data['key']:
                url = project_data['url']
                website_to_key[url[url.find('://')+3:]] = project_data['key']
                key_to_website[project_data['key']] = url
            else:
                problems += 1
                print(f"No key found for project {project['name']}")
        else:
            problems += 1
            print(f"No URL found for project {project['name']}")

with open('../data/redhat_url_to_key.json', 'w') as f:
    json.dump(website_to_key, f)
with open('../data/redhat_key_to_url.json', 'w') as f:
    json.dump(key_to_website, f)

print(f"\nParsed {total} projects with {problems} problems")