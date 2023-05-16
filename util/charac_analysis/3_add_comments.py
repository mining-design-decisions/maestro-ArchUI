import json
import os
import requests

files = [f for f in os.listdir('domains/')]

for fn in files:
    print(fn)
    with open("domains/" + fn) as f:
        raw = json.load(f)
    for issue in raw:
        comment_size = None
        comment_count = None
        try:
            url = raw[issue]['link'] + "/comment"
            comments = requests.get(url).json()['comments']
            comment_count = len(comments)
            comment_size = 0
            for comment in comments:
                comment_size += len(comment['body'])
            if comment_count == 0:
                comment_size = 0
            else:
                comment_size /= comment_count
        except:
            print('Failed to parse comments for ' + raw[issue]['id'])

        raw[issue]['comment avg size'] = comment_size
        raw[issue]['comment count'] = comment_count

    with open("comments/" + fn, 'w') as f:
        json.dump(raw, f, indent=4)