def get_field_configs():
    with open('app/data/field_configs.json', 'r') as f:
        import json
        data = json.load(f)
    return data