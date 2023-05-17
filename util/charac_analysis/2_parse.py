from pymongo import MongoClient
import json
from datetime import datetime

client = MongoClient('mongodb://192.168.178.248:27017')
datetime_format = "%Y-%m-%dT%H:%M:%S.%f%z" # https://docs.python.org/3/library/datetime.html#strftime-and-strptime-format-codes

def parse():
    with open('data/project_domains.json') as f:
        proj_domains = json.load(f)

    domains = {}
    for ecosys in proj_domains:
        for proj in proj_domains[ecosys]:
            dom = proj_domains[ecosys][proj]
            if not dom in domains:
                domains[dom] = []
            domains[dom].append(f"{ecosys}.{proj}")

    for dom in domains:
        result = {}
        for proj in domains[dom]:
            ecosys = proj.split('.')[0]
            key = proj.split('.')[1]
            coll = client['JiraRepos'][ecosys]
            hierarchy = {} # parent -> children
            in_hierarchy = [] # all issues that either are a parent or are mentioned as child
            for doc in client['JiraRepos'][ecosys].find({'key': {"$regex": f"{key}\-[0-9]+"}}):
                obj = {}
                # ...
                obj['id'] = f"{ecosys}.{doc['key']}"
                obj['type'] = doc['fields']['issuetype']['name']
                res = doc['fields']['resolution']
                if res:
                    res = res['name']
                obj['resolution'] = res
                obj['status'] = doc['fields']['status']['name']
                desc = doc['fields']['description']
                obj['description size'] = 0
                if desc:
                    obj['description size'] = len(doc['fields']['description'])
                # comment size done elsewhere
                # comment count done elsewhere
                # hierarchy done later, this is helper
                hier = doc['fields']['subtasks']
                if len(hier) > 0:
                    in_hierarchy.append(obj['id'])
                    children = [f"{ecosys}.{hier_el['key']}" for hier_el in hier]
                    in_hierarchy.extend(children)
                    hierarchy[obj['id']] = children

                created_dt = datetime.strptime(doc['fields']['created'], datetime_format)
                if doc['fields']['resolutiondate'] is not None:
                    resolved_dt = datetime.strptime(doc['fields']['resolutiondate'], datetime_format)
                else:
                    resolved_dt = datetime.strptime(doc['fields']['updated'], datetime_format)

                obj['duration'] = (resolved_dt - created_dt).days
                obj['link'] = doc['self']
                obj['mongo_id'] = str(doc['_id'])

                result[obj['id']] = obj

        # do hierarchy
        for id in result:
            if id in hierarchy:
                result[id]['hierarchy'] = 'Parent'
            elif id in in_hierarchy:
                result[id]['hierarchy'] = "Child"
            else:
                result[id]['hierarchy'] = "Independent"

        with open(f"domains/{dom}.json", 'w') as f:
            json.dump(result, f, indent=4)

parse()