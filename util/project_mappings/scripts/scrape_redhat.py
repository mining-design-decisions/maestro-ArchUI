from bs4 import BeautifulSoup

with open('../raw/redhat.html') as f:
    soup = BeautifulSoup(f, 'html.parser')

projects = []

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
                name = td.find_all('a')[0].string
                repo = td.find_all('a')[0]['href']
            case 1:
                a = td.find_all('a')
                if len(a) > 0 and 'href' in a[0]:
                    website = a[0]['href']
            case 2:
                pass
            case 3:
                category = td.string
        idx += 1
    projects.append({
        "name": name,
        "repo": repo,
        "website": website,
        "category": category
    })

with open('../data/redhat_projects.json', 'w') as f:
    import json
    json.dump(projects, f)