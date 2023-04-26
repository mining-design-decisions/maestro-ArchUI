import json

# these are all projects we want to look for and find information about
with open('../data/projects.json') as f:
    projects = json.load(f)

# jesse's pre-parsed version of the apache projects list
with open('../data/apache_jesse.json') as f:
    jesse = json.load(f)

# the project URLs in case the data wasn't present in above
with open('../data/apache_urls.json') as f:
    urls = json.load(f)

result = []
url_results = []
failed_results = []

for project in projects:
    if not project.startswith('Apache-'):
        continue
    # we want to check if this project is present in Jesse's dataset
    key = project[len('Apache-'):]
    found = False
    for proj in jesse:
        if 'issue_key' in proj and proj['issue_key'] and key in proj['issue_key']:
            # bingo
            # we want to write down: key, name, programming lang, domain, and ecosystem
            language = proj['languages']
            if language and len(language) == 1:
                language = language[0]
            domain = proj['domain'].split(', ') if proj['domain'] else None

            result.append({
                'key': key,
                'project': proj['full_name'],
                'language': language,
                'domain': domain, # this will also be a list
                'ecosystem': "Apache"
            })
            found = True
            break
    if not found and key in urls:
        url_results.append({
            'key': key,
            'project': urls[key]['name'],
            'language': None,
            'domain': None,
            'ecosystem': "Apache",
            'url': urls[key]['url']
        })
        print(f"Search for {key} information about project {urls[key]['name']} at {urls[key]['url']}")
        found = True
    if not found:
        failed_results.append({
            'key': key,
            'project': None,
            "language": None,
            "domain": None,
            "ecosystem": "Apache",
            "url": f"https://issues.apache.org/jira/browse/{key}"
        })
        print(f"Could not find key {key} at all")

with open('../results/apache.json', 'w') as f:
    json.dump(result, f)
with open('../results/apache_url.json', 'w') as f:
    json.dump(url_results, f)
with open('../results/apache_fail.json', 'w') as f:
    json.dump(failed_results, f)