import json

with open('ecosystems_and_projects.json') as f:
    data = json.load(f)

projects_under_1000 = 0
issues_under_1000 = 0
total_projects = 0
total_issues = 0

for ecosystem in data:
    for project in data[ecosystem]:
        amt = data[ecosystem][project]
        total_projects += 1
        total_issues += amt
        if amt < 1000:
            projects_under_1000 += 1
            issues_under_1000 += amt

print(f"{projects_under_1000} out of {total_projects} projects have <1000 issues ({projects_under_1000/total_projects*100}%). These small projects contain {issues_under_1000} out of {total_issues} issues ({issues_under_1000/total_issues*100}%).")