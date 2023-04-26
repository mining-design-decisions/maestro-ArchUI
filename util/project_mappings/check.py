import json

tocheck = "Apache-"
issue_key_name = "issue_key"
# issue_key_name = "project_tag"

with open('data/projects.json') as f:
    projects = json.load(f)
with open('data/apache_jesse.json') as f:
# with open('data/apache.json') as f:
    keys_to_check = json.load(f)
with open('given/ecosystems_and_projects.json') as f:
    counts = json.load(f)

keys = []
for project in keys_to_check:
    if issue_key_name in project and project[issue_key_name]:
        keys.extend(project[issue_key_name])
        # keys.append(project[issue_key_name])

problems = 0
amt_keys = 0
missing_issues = 0
total_issues = 0
result = []

for project in projects:
    if project.startswith(tocheck):
        key = project[len(tocheck):]
        total_issues += counts[tocheck[:-1]][key]
        # key = project
        amt_keys += 1
        if key not in keys:
            print(f"{project} was not present (missing issues: {counts[tocheck[:-1]][key]}) (url: {})")
            problems += 1
            missing_issues += counts[tocheck[:-1]][key]

print(f"{problems} problems on {amt_keys} keys with {missing_issues} issues lost out of {total_issues}")