from app.services import dbapi

def get_field_configs():
    with open('app/data/field_configs.json', 'r') as f:
        import json
        data = json.load(f)
        
    ontologies = [x['file_id'] for x in dbapi.get_ontologies()]
    data['train_ontology_classes']['options'] = ontologies
    return data