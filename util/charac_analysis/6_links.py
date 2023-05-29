import json
from pymongo import MongoClient

result = set()

client = MongoClient('mongodb://192.168.178.248:27017')

with open('manual/data.json') as f:
    raw = json.load(f)

for issue in raw:
    ecosys = issue.split('.')[0]
    key = issue.split('.')[1]
    docs = client['JiraRepos'][ecosys].find({'key': {'$eq': key}})
    for doc in docs:
        links = doc['fields']['issuelinks']
        for link in links:
            type = link['type']['name']
            if 'outwardIssue' in link:
                outward = f"{ecosys}.{link['outwardIssue']['key']}"
                inward = issue
            else:
                outward = issue
                inward = f"{ecosys}.{link['inwardIssue']['key']}"
            result.add(json.dumps({
                'type': type,
                'inward': inward,
                'outward': outward
            }))

result = [json.loads(x) for x in result]

with open("other/links.json", 'w') as f:
    json.dump(result, f)