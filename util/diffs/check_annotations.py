import psycopg2
import json

db_settings = [
    "dbname=archedetector",
    "user=postgres",
    "password=notrootpassword",
    "host=localhost"
]

conn = psycopg2.connect(' '.join(db_settings))
cur = conn.cursor()

# debug
print('PostgreSQL db version: ')
cur.execute('SELECT version();')
print(cur.fetchall())

# get tags
# - existence
cur.execute("SELECT id FROM public.tag WHERE name IN ('Ontocrisis','Anticrises','Existence');")
existence_tag_ids = [x[0] for x in cur.fetchall()]

# - property
cur.execute("SELECT id FROM public.tag WHERE name IN ('Diacrises','Property');")
property_tag_ids = [x[0] for x in cur.fetchall()]

# - executive
cur.execute("SELECT id FROM public.tag WHERE name IN ('Pericrises','Executive');")
executive_tag_ids = [x[0] for x in cur.fetchall()]

tag_ids = {
    "Existence": existence_tag_ids,
    "Property": property_tag_ids,
    "Executive": executive_tag_ids
}

# get issues from archedetector
cur.execute('SELECT issue_id,tag_id FROM public.issue_tag;')
issue_tag_raw = cur.fetchall()
cur.execute('SELECT id,key FROM public.issue;')
issue_raw = cur.fetchall()
issues_temp = {}
# first: create dictionary
for issue in issue_raw:
    postgres_id = str(issue[0])
    issues_temp[postgres_id] = {
        "key": issue[1],
        "tags": []
    }
# then: add the tags
for issue in issue_tag_raw:
    postgres_id = str(issue[0])
    tag_id = issue[1]
    for tag in tag_ids:
        if tag_id in tag_ids[tag]:
            issues_temp[postgres_id]["tags"].append(tag)

# reformat
issues_db = {}
for issue_id in issues_temp:
    issue = issues_temp[issue_id]
    issues_db[issue['key']] = issue['tags']

# now to extract the same information from the classifications used
file_path = "issuedata/EBSE_issues_formatting-markers.json"
issues_ml = {}
with open(file_path, 'r') as f:
    issues_raw = json.load(f)
    for issue in issues_raw:
        key = issue['key']
        tags = []
        for cat in ['is-cat1','is-cat2','is-cat3']:
            if issue[cat]['value'] == "True":
                tags.append(issue[cat]['name'])
        issues_ml[key] = tags

"""
# dump for test
with open('test_db.json', 'w') as f:
    json.dump(issues_db, f)
with open('test_ml.json', 'w') as f:
    json.dump(issues_ml, f)
"""

print("Finding differences from DB...")
# find differences
issues_handled = []
issue_differences = [] # format: every element is {"key": str, "db": [db tags] or None, "ml": [ml tags] or None}
significant_differences = []
for issue in issues_db:
    # early out
    if issue in issues_handled:
        continue
    issues_handled.append(issue)

    # check present
    if issue not in issues_ml:
        diff = {
            "key": issue,
            "db": issues_db[issue],
            "ml": None
        }
        issue_differences.append(diff)
        if len(issues_db[issue]) > 0:
            significant_differences.append(diff)
        continue

    issues_db[issue].sort()
    issues_ml[issue].sort()

    if issues_db[issue] != issues_ml[issue]:
        diff = {
            "key": issue,
            "db": issues_db[issue],
            "ml": issues_ml[issue]
        }
        issue_differences.append(diff)
        significant_differences.append(diff)

print("Finding differences from ML...")
for issue in issues_ml:
    # early out
    if issue in issues_handled:
        continue
    issues_handled.append(issue)

    # check present
    if issue not in issues_db:
        diff = {
            "key": issue,
            "db": None,
            "ml": issues_ml[issue]
        }
        issue_differences.append(diff)
        if len(issues_ml[issue]) > 0:
            significant_differences.append(diff)
        continue

    issues_db[issue].sort()
    issues_ml[issue].sort()
    if issues_db[issue] != issues_ml[issue]:
        diff = {
            "key": issue,
            "db": issues_db[issue],
            "ml": issues_ml[issue]
        }
        issue_differences.append(diff)
        significant_differences.append(diff)

with open('issue_differences.json', 'w') as f:
    json.dump(issue_differences, f)
with open('significant_differences.json', 'w') as f:
    json.dump(significant_differences, f)

print(f'Done. Differences found: {len(issue_differences)}, of which significant: {len(significant_differences)}.')

cur.close()