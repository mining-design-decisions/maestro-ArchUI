import json

with open('raw/apache.json', encoding="utf8") as f:
    raw = json.load(f)

with open('data/projects.json') as f:
    project_tags = json.load(f)

linkbase = 'issues.apache.org/jira/browse/'

projects = []
problems = 0
for key in raw:
    try:
        id = key.upper()
        name = raw[key]['name'] if 'name' in raw[key] else None
        language = raw[key]['programming-language'].split(', ') if 'programming-language' in raw[key] else None
        domain = raw[key]['category'].split(', ') if 'category' in raw[key] else None
        
        project_tag = f"Apache-{id}"
        if not project_tag in project_tags:
            links = raw[key]['bug-database'].split(', ')
            for link in links:
                if linkbase in link:
                    id = link.split('/')[-1].upper()
                    project_tag = f"Apache-{id}"
                    if project_tag in project_tags:
                        break
        if not project_tag in project_tags:
            problems += 1
            print(f"  WARNING: Project Tag for {key} not present in project tag list!")
            project_tag = None


        obj = {
            'id': key.upper(),
            'name': name,
            'project_tag': project_tag,
            'language': language,
            'domain': domain,
            'ecosystem': "Apache"
        }
        projects.append(obj)

    except:
        print(f"  WARNING: Project {key} is Unparsable!")
        problems += 1

with open('data/apache.json', 'w') as f:
    json.dump(projects, f)

print(f"\n\n{len(projects)} projects found with {problems} problems.")