import json
import os
import requests
from multiprocessing.dummy import Pool as ThreadPool


def get_comment_data(input):
    output = input
    comment_size = None
    comment_count = None
    try:
        url = input['link'] + "/comment"
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
        print('Failed to parse comments for ' + input['id'])

    output['comment avg size'] = comment_size
    output['comment count'] = comment_count
    output

files = [f for f in os.listdir('domains/')]
for fn in files:
    print(fn)
    with open("domains/" + fn) as f:
        raw = json.load(f)
    
    pool = ThreadPool(8) # adjust as necessary
    intermed = pool.map(get_comment_data, list(raw.values()))
    result = {x['id']: x for x in intermed}

    with open("comments/" + fn, 'w') as f:
        json.dump(result, f, indent=4)