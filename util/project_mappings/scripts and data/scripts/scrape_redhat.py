from bs4 import BeautifulSoup
import json
import re
import requests

with open('../raw/redhat.html') as f:
    soup = BeautifulSoup(f, 'html.parser')
with open('../data/redhat_url_to_key.json') as f:
    url_to_key = json.load(f)

regex = "^https?:\/\/github\.com\/(?P<user>.+)\/(?P<name>.+)$"
projects = []
with open('token.txt') as f:
    gh_token = f.read().strip()

for tr in soup.find_all('tr'):
    idx = 0
    name = None
    repo = None
    website = None
    category = None
    for td in tr.find_all('td'):
        match(idx):
            case 0:
                # title
                name = td.string
                repo = td.find_all('a')[0]['href']
            case 1:
                website = td.string
            case 2:
                pass
            case 3:
                category = td.string
        idx += 1

    this_id = None
    if website is not None:
        website_short = website[website.find('://')+3:]
        this_id = url_to_key[website_short] if website_short and website_short in url_to_key else None
    if this_id is None and repo is not None:
        repo_short = repo[repo.find('://')+3:]
        this_id = url_to_key[repo_short] if repo_short and repo_short in url_to_key else None

    language = None
    match = re.search(regex, repo)
    if match is not None:
        x = requests.get(f"https://api.github.com/repos/{match.group('user')}/{match.group('name')}/languages", headers={"Authorization": f"bearer {gh_token}"})
        dic = x.json()
        langs = list(dic.keys())
        if len(langs) > 0:
            language = langs[0]
            for i in range(1, len(langs)):
                lang = langs[i]
                if dic[lang] > dic[language]:
                    language = lang

    
    projects.append({
        "name": name,
        "id": this_id,
        "repo": repo,
        "website": website,
        "domain": category,
        "language": language # todo through repos
    })



with open('../data/redhat_projects.json', 'w') as f:
    json.dump(projects, f)