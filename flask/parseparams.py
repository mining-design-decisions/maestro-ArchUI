import json

with open('params.json', 'r') as f:
    params = json.load(f)

inmode_to_params = {}
for inmode in params:
    inmode_to_params[inmode] = []
    for param in params[inmode]:
        inmode_to_params[inmode].append("param_"+param['name'].replace('-', '_'))

with open('parsedparams.json', 'w') as f:
    json.dump(inmode_to_params, f)