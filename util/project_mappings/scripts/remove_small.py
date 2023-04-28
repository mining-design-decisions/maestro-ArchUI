import json

target_ecosystem = "Apache"
threshold = 1000

with open('../given/ecosystems_and_projects.json') as f:
    projects = json.load(f)
with open(f"../data/{target_ecosystem.lower()}_manual.json") as f:
    data = json.load(f)

toAdd = []
for proj in projects[target_ecosystem]:
    if projects[target_ecosystem][proj] >= threshold:
        toAdd.append(proj)

result = []
for proj in data:
    if proj['key'] in toAdd:
        proj['issue_count'] = projects[target_ecosystem][proj['key']]
        result.append(proj)

with open(f"../results/{target_ecosystem.lower()}_big_only.json", 'w') as f:
    json.dump(result, f)