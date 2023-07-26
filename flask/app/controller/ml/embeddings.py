import json

from app.data.ml import embeddings as data
from app.data.ml import ontologies as o_data

def get_embeddings_types():
    embeddings = data.get_embeddings()
    types = []
    for e in embeddings:
        gen = e['config']['generator']
        if gen not in types:
            types.append(gen)
    return embeddings, types

def get_form_args():
    args = data.get_args_wordembed()
    if args is None:
        return None, None
    ontologies = [x['file_id'] for x in o_data.get_ontologies()]
    for gen in args:
        for arg in args[gen]:
            if arg['name'] == 'ontology-id':
                arg['options'] = ontologies
    return args, json.dumps(data.default_q)

def create_config(reqform):
    name = reqform.get('name')
    type = reqform.get('type')

    training_q = reqform.get('training_q', default=json.dumps(data.default_q))
    try:
        training_q_json = json.loads(training_q)
    except:
        training_q_json = data.default_q

    params = {}
    
    this_config = data.get_args_wordembed()[type]
    for setting in this_config:
        if setting['name'] in reqform and reqform.get(setting['name']):
            match(setting['type']):
                case 'bool':
                    params[setting['name']] = True
                case 'int':
                    params[setting['name']] = int(reqform.get(setting['name']))
                case _:
                    params[setting['name']] = reqform.get(setting['name'])
        elif setting['type'] == 'bool':
            params[setting['name']] = False
        else:
            # not a bool. not present in the form.
            match(setting['type']):
                case 'int':
                    # grab the min.
                    params[setting['name']] = setting['minimum']
                case _:
                    print(f"WARNING: Unhandled Embedding Param {setting['name']} of type {setting['type']}")

    config = {
        "generator": type,
        "training-data-query": training_q_json,
        "params": { f"{type}.0": params}
    }

    return data.save_embedding(name, config)

