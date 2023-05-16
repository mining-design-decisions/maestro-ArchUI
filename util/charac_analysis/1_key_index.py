from pymongo import MongoClient
client = MongoClient('mongodb://192.168.178.248:27017')
jira_repos_db = client['JiraRepos']

colls = [
    "Apache",
    "Hyperledger",
    "IntelDAOS",
    "JFrog",
    "Jira",
    "JiraEcosystem",
    "MariaDB",
    "Mindville",
    "Mojang",
    "MongoDB",
    "Qt",
    "RedHat",
    "Sakai",
    "SecondLife",
    "Sonatype",
    "Spring"
]
print("adding id index for " + ", ".join(colls))
for coll in colls:
        indices = jira_repos_db[coll].index_information()
        print(f"Creating key index for {coll}...")
        jira_repos_db[coll].create_index("key")