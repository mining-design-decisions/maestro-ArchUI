import requests
import io
import PIL.Image as Image
import json

from app.data import login as login_data
from app.data import common

def get_all_stats():
    x = requests.get(f"{login_data.get_db()}/files", verify=False, json={"category": "ui_statistics_collection"})
    if not x.status_code == 200:
        print(x.json())
    return x.json()

def get_stat_collection(collection_id):
    x = requests.get(f"{login_data.get_db()}/files/{collection_id}/file", verify=False)
    if not x.status_code == 200:
        print(x.json())
        return None
    return x.json()

def get_stat_graphs(graph_list):
    results = []
    index = 0
    for graph_data in graph_list:
        x = requests.get(f"{login_data.get_db()}/files/{graph_data['file_id']}/file", verify=False)
        if not x.status_code == 200:
            print(x.json())
            continue
        png = Image.open(io.BytesIO(x.content))
        filename = f"app/static/figures/{index}.png"
        png.save(filename)
        results.append({
            "location": filename[len('app/static'):],
            "label": graph_data['label']
        })
        index += 1
    return results

def post_stat_graphs(graph_list):
    file_ids = []

    for path in graph_list:
        with open(path, 'rb') as f:
            img = f.read()
            byteData = bytearray(img)

        x = requests.post(f"{login_data.get_db()}/files", files={
            "file": ("pngFile", byteData),
            "description": (None, "temp"),
            "category": (None, "ui_statistics_graph")
        }, verify=False, headers=common._auth_header())
        if not x.status_code == 200:
            print(x.json())
            continue
        file_ids.append(x.json()['file_id'])

    return file_ids

def post_stat_obj(name, obj):
    x = requests.post(f"{login_data.get_db()}/files", files={
        "file": ("statsFile", json.dumps(obj).encode('utf8')),
        "description": (None, name),
        "category": (None, "ui_statistics_collection")
    }, headers=common._auth_header(), verify=False)
    if not x.status_code == 200:
        print(x.status_code)
        print(x.json())
        return None
    return x.json()['file_id']