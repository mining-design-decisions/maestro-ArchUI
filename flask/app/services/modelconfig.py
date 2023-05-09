from app.services import dbapi

def retrieve_info(formdata, name, type, default):
    value = formdata.get(name, default)
    match(type):
        case 'str':
            pass
        case 'int':
            value = int(value)
        case 'bool':
            value = value in ['on', 'checked']
        case 'float':
            value = float(value)
        case _:
            print(f"Unhandled type: {type}")
    return value

def get_by_prefix(formdata, prefix):
    return [x for x in formdata if x.startswith(prefix)]

def get_params_by_prefix(formdata, prefix, is_prepro):
    name_to_type = {
        "class-limit": "int",
        "max-len": "int",
        'disable-lowercase': "bool",
        'disable-stopwords': "bool",
        "number-of-hidden-layers": "int",
        "number-of-convolutions": "int",
        "learning-rate": "float",
        "use-trainable-embedding": "bool"
    }
    for i in range(1, 12):
        name_to_type[f"hidden-layer-{i}-size"] = 'int'
        name_to_type[f"kernel-{i}-size"] = 'int'
    params = {}
    for p in get_by_prefix(formdata, prefix):
        if formdata.get(p) and len(formdata.get(p).strip()) > 0:
            argName = p[len(prefix):].replace('_', '-')
            thisType = "str"
            if argName in name_to_type:
                thisType = name_to_type[argName]
            params[argName] = retrieve_info(formdata, p, thisType, None)

    if is_prepro and f"{prefix}embedding_id" in formdata:
        e = dbapi.get_embedding(formdata.get(f"{prefix}embedding_id"))
        dicname = list(e['config']['params'].keys())[0]
        for param in e['config']['params'][dicname]:
            if param not in ['min-count', 'min-doc-count']: # these aren't in the param lists for feature generators
                params[param] = e['config']['params'][dicname][param]
    return params

def raw_to_config(formdata):
    config = {}

    # tab: general
    config['output-mode'] = formdata.get('gen_output_mode', None)
    model_mode = formdata.get('gen_model_mode', 'Single')

    if model_mode == 'Single':
        # single mode tabs:
        # pre-processing
        config['input-mode'] = [formdata.get('single_inmode')]
        config['params'] = {
            f"{config['input-mode'][0]}.0": get_params_by_prefix(formdata, "single_p_", True)
        }

        # classifier
        config['classifier'] = [formdata.get('single_classifier')]
        config['hyper-params'] = {
            f"{config['classifier'][0]}.0": get_params_by_prefix(formdata, 'single_hp_', False)
        }
        if config['classifier'][0] == 'LinearConv1Model':
            config['analyze-keywords'] = formdata.get('single_analyze_keywords', False) == "on"

    else:
        test_sep = formdata.get('gen_test_separately', False)
        if test_sep:
            config['test-separately'] = test_sep

        strat = formdata.get('gen_combination_strategy', None)
        # config['ensemble_strategy'] = "none" # default?
        # config['combination_strategy'] = "concat" # default?
        if strat.lower() in ["stacking", "voting"]:
            config['ensemble-strategy'] = strat.lower()
        elif strat:
            config['combination-strategy'] = strat.lower()

        if strat.lower() == 'voting':
            config['voting-mode'] = formdata.get('gen_voting_mode')

        # ensemble mode tabs:
        # ensemble classifiers
        class_count = {}
        inmode_count = {}

        config['hyper-params'] = {}
        config['params'] = {}
        config['classifier'] = []
        config['input-mode'] = []

        amt = int(formdata.get('ens_classifier_count'))
        for i in range(amt):
            # classifier
            this_class = formdata.get(f"ens_{i}_classifier")
            config['classifier'].append(this_class)

            # inmode
            this_inmode = formdata.get(f"ens_{i}_inmode")
            config['input-mode'].append(this_inmode)
            
            # hparams
            if this_class not in class_count:
                class_count[this_class] = 0

            config['hyper-params'][f"{this_class}.{class_count[this_class]}"] = get_params_by_prefix(formdata, f"ens_{i}_hp_", False)

            class_count[this_class] += 1

            # params
            if this_inmode not in inmode_count:
                inmode_count[this_inmode] = 0

            config['params'][f"{this_inmode}.{inmode_count[this_inmode]}"] = get_params_by_prefix(formdata, "ens_{i}_p_", True)

            inmode_count[this_inmode] += 1

        # if applicable, the stacker
        if config['ensemble-strategy'] == "stacking":
            config['stacking-meta-classifier'] = formdata.get('stacker_classifier', None)
            config['use-concat'] = formdata.get('stacker_use_concat', False) == 'on'
            config['no-matrix'] = formdata.get('stacker_no_matrix', False) == 'on'
            config['stacking-meta-classifier-hyper-parameters'] = get_params_by_prefix(formdata, 'stacker_hp_', False)

    # training
    config['apply-ontology-classes'] = retrieve_info(formdata, 'train_apply_ontology_classes', 'bool', False)
    if config['apply-ontology-classes']:
        config['ontology-classes'] = "./dl_manager/feature_generators/util/ontologies.json"
    config['epochs'] = retrieve_info(formdata, 'train_epochs', 'int', 1000)
    config['split-size'] = retrieve_info(formdata, 'train_split_size', 'float', 0.2)
    config['max-train'] = retrieve_info(formdata, 'train_max_train', 'int', -1)
    config['architectural-only'] = retrieve_info(formdata, 'train_architectural_only', 'bool', False)
    config['batch-size'] = retrieve_info(formdata, 'train_batch_size', 'int', 32)
    config['training-data-query'] = retrieve_info(formdata, 'train_training_data_query', 'str', "{\"$or\": [{\"tags\": {\"$eq\": \"Apache-TAJO\"}}, {\"tags\": {\"$eq\": \"Apache-HDFS\"}}, {\"tags\": {\"$eq\": \"Apache-HADOOP\"}}, {\"tags\": {\"$eq\": \"Apache-YARN\"}}, {\"tags\": {\"$eq\": \"Apache-MAPREDUCE\"}}, {\"tags\": {\"$eq\": \"Apache-HADOOP\"}}]}")
    
    # early stopping
    config['use-early-stopping'] = retrieve_info(formdata, 'train_use_early_stopping', 'bool', False)
    config['early-stopping-patience'] = retrieve_info(formdata, 'train_early_stopping_patience', 'int', 5)
    amt_attrib = formdata.get('train_early_stopping_num_attribs', 0)
    if not amt_attrib:
        amt_attrib = 0
    amt_attrib = int(amt_attrib)
    if amt_attrib > 0:
        config['early-stopping-min-delta'] = []
        config['early-stopping-attribute'] = []
    for i in range(0, amt_attrib):
        config['early-stopping-min-delta'].append(retrieve_info(formdata, f"train_early_stopping_min_{i+1}_size", 'float', 0))
        config['early-stopping-attribute'].append(formdata.get(f"train_early_stopping_{i+1}_size"))

    # other assorted parameters
    config['store-model'] = True
    config["test-with-training-data"] = True

    return config

def config_to_display(config):
    # two common tabs for single & ensemble
    general = {
        "output mode": config['output-mode'],
    }
    if 'combination-strategy' in config:
        general['combination strategy'] = config['combination-strategy']
    if 'ensemble-strategy' in config:
        general['ensemble strategy'] = config['ensemble-strategy']
    if 'voting-mode' in config:
        general['voting mode'] = config['voting-mode']

    train_fields = [
        "ontology-classes",
        "apply-ontology-classes",
        "epochs",
        "split-size",
        "max-train",
        "architectural-only",
        "class-balancer",
        "batch-size",
        "use-early-stopping",
        "early-stopping-patience",
        "early-stopping-min-delta",
        "early-stopping-attribute",
        "training-data-query"
    ]

    training = {}
    for field in train_fields:
        if field in config:
            train_key = field.replace('-', ' ')
            training[train_key] = config[field]

    result = {
        "general": general,
        "training": training
    }
        
    if len(config['classifier']) == 1:
        # single
        classifier = {
            'classifier': config['classifier'][0],
            'hyper-params': {}
        }
        if config['hyper-params']:
            classifier['hyper-params'] = config['hyper-params']
        if classifier['classifier'] == 'LinearConv1Model':
            general['analyze-keywords'] = config['analyze-keywords']
        
        input_mode = {
            'input-mode': config['input-mode'][0],
            "params": {}
        }
        if config['params']:
            input_mode['params'] = config['params']

        result['classifier'] = classifier
        result['pre-processing'] = input_mode
        pass
    else:
        # ensemble
        class_count = {}
        inmode_count = {}
        result['ensemble classifiers'] = []

        for i in range(len(config['classifier'])):
            this_classifier = config['classifier'][i]
            this_inmode = config['input-mode'][i]
            
            if not this_classifier in class_count:
                class_count[this_classifier] = 0
            if not this_inmode in inmode_count:
                inmode_count[this_inmode] = 0
            
            this_obj = {
                'classifier': this_classifier,
                'input-mode': this_inmode,
                'params': config['params'][f"{this_inmode}.{inmode_count[this_inmode]}"],
                'hyper-params': config['hyper-params'][f"{this_classifier}.{class_count[this_classifier]}"]
            }

            class_count[this_classifier] += 1
            inmode_count[this_inmode] += 1
            result['ensemble classifiers'].append(this_obj)


        # stacker?
        if config['ensemble-strategy'] == "stacking":
            result['meta classifier'] = {
                "classifier": config['stacking-meta-classifier'],
                "use-concat": config['use-concat'],
                "no-matrix": config['no-matrix'],
                "hyper-params": {
                    f"{config['stacking-meta-classifier']}.0": config['stacking-meta-classifier-hyper-parameters']
                }
            }

    return result

def config_to_form(config):
    display = config_to_display(config)
    result = {}
    for tab in display:
        match(tab):
            case "general":
                for field in display[tab]:
                    result["gen_" + field.lower().replace(' ', '_')] = display[tab][field]

            case "training":
                for field in display[tab]:
                    result["train_" + field.lower().replace(' ', '_')] = display[tab][field]

            case "pre-processing":
                result['single_inmode'] = display[tab]['input-mode']
                for p in display[tab]['params']:
                    if display[tab]['params'][p]:
                        result[f"single_p_{p.replace('-', '_')}"] = display[tab]['params'][p]
                        
            case "classifier":
                result['single_classifier'] = display[tab]['classifier']
                for hp in display[tab]['hyper-params']:
                    if display[tab]['hyper-params'][hp]:
                        result[f"single_hp_{hp.replace('-','_')}"] = display[tab]['hyper-params'][hp]
                        
            case "ensemble classifiers":
                for i in range(len(display[tab])):
                    obj = display[tab][i]
                    result[f"ens_{i}_classifier"] = obj['classifier']
                    result[f"ens_{i}_inmode"] = obj['inmode']
                    for hp in obj['hyper-params']:
                        result[f"ens_{i}_hp_{hp}"] = obj["hyper-params"][hp]
                    for p in obj["params"]:
                        result[f"ens_{i}_p_{p}"] = obj["params"][p]
                        
            case "meta classifier":
                result['stacker_classifier'] = display[tab]['classifier']
                for hp in display[tab]['hyper-params']:
                    if display[tab]['hyper-params'][hp]:
                        result[f'stacker_hp_{hp}'] = display[tab]['hyper-params'][hp]
    print("\n\n\nmodel defaults:")
    print(result)

    return result