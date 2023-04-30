import json

def load_data(path):
    with open(path) as f:
        return json.load(f)

links = load_data('../raw/IssueLinks.json')
link_dic = {}
for link in links:
    link_dic[link['_id']] = link['link']
projects = load_data('../given/ecosystems_and_projects.json')
threshold = 1000

to_ignore = ['RedHat', 'Apache']

results = []

for ecosys in projects:
    if ecosys in to_ignore:
        continue
    link = None
    if ecosys in link_dic:
        link = link_dic[ecosys]
    for p in projects[ecosys]:
        if projects[ecosys][p] < threshold:
            continue
        this_link = None
        if link is not None:
            this_link = f"{link}/browse/{p}/summary"
        results.append({
            'key': p,
            'project': None,
            'language': None,
            'domain': None,
            'ecosystem': ecosys,
            "issue_count": projects[ecosys][p],
            'link': this_link
        })

with open('../../results/other.json', 'w') as f:
    json.dump(results, f)