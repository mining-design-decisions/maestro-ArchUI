import json

def getdata(path):
    with open(path) as f:
        data = json.load(f)
    return data

all_tags = getdata('../data/projects.json')
scraped = getdata('../data/redhat_projects.json')
key_to_url = getdata('../data/redhat_url_to_key.json')

scraped_dic = {}
for proj in scraped:
    if proj['id'] is not None:
        scraped_dic[proj['id']] = proj # these are like ten projects at this point.

result = []
for tag in all_tags:
    if not tag.startswith('RedHat-'):
        continue
    key = tag[len('RedHat-'):]

    # need: id, optional name, optional project_tag, language, domain and ecosystem

    # try find ID in scraped first
    if key in scraped_dic:
        # bingo!
        obj = scraped_dic[key]
        obj['ecosystem'] = 'RedHat'
        obj['project_tag'] = tag
        if not obj['website'] and key in key_to_url:
            obj['website'] = key_to_url[key]
            print('Recovered a website from key') # want to track if this actually happens
        result.append(obj)
    elif key in key_to_url:
        obj = {
            'id': key,
            'name': None,
            "repo": None,
            "website": key_to_url[key],
            "domain": None,
            "language": None,
            "ecosystem": "RedHat",
            "project_tag": tag
        }
        result.append(obj)
    else:
        result.append({
            "id": key,
            'name': None,
            "repo": None,
            "website": None,
            "domain": None,
            "language": None,
            "ecosystem": "RedHat",
            "project_tag": tag
        })

with open('../data/redhat.json', 'w') as f:
    json.dump(result, f)
