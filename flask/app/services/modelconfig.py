from app.services import dbapi

def get_by_prefix(formdata, prefix):
    return [x for x in formdata if x.startswith(prefix)]

def get_params_by_prefix(formdata, prefix, is_prepro):
    params = {}
    for p in get_by_prefix(formdata, prefix):
        if formdata.get(p) and len(formdata.get(p).strip()) > 0:
            params[f"{p[len(prefix):].replace('_', '-')}"] = formdata.get(p)
    if is_prepro and f"{prefix}embedding_id" in formdata:
        e = dbapi.get_embedding(formdata.get(f"{prefix}embedding_id"))
        dicname = list(e['config']['params'].keys())[0]
        for param in e['config']['params'][dicname]:
            if param not in ['min-count', 'min-doc-count']: # these aren't in the param lists for feature generators
                params[f"{p[len(prefix):].replace('_', '-')}"] = formdata.get(p)
    return params

def raw_to_config(formdata):
    config = {}

    # tab: general
    config['output_mode'] = formdata.get('gen_output_mode', None)
    model_mode = formdata.get('gen_model_mode', 'Single')

    if model_mode == 'Single':
        # single mode tabs:
        # pre-processing
        config['input_mode'] = [formdata.get('single_inmode')]
        config['params'] = {
            f"{config['input_mode'][0]}.0": get_params_by_prefix(formdata, "single_p_", True)
        }

        # classifier
        config['classifier'] = [formdata.get('single_classifier')]
        config['hyper_params'] = {
            f"{config['classifier'][0]}.0": get_params_by_prefix(formdata, 'single_hp_', False)
        }
        if config['classifier'][0] == 'LinearConv1Model':
            config['analyze_keywords'] = formdata.get('single_analyze_keywords', False) == "on"

    else:
        test_sep = formdata.get('gen_test_separately', False)
        if test_sep:
            config['test_separately'] = test_sep

        strat = formdata.get('gen_combination_strategy', None)
        config['ensemble_strategy'] = "none" # default?
        config['combination_strategy'] = "concat" # default?
        if strat.lower() in ["stacking", "voting"]:
            config['ensemble_strategy'] = strat.lower()
        elif strat:
            config['combination_strategy'] = strat.lower()

        if strat.lower() == 'voting':
            config['voting_mode'] = formdata.get('gen_voting_mode')

        # ensemble mode tabs:
        # ensemble classifiers
        class_count = {}
        inmode_count = {}
        hparams = []
        params = []

        config['hyper_params'] = {}
        config['params'] = {}
        config['classifier'] = []
        config['input_mode'] = []

        amt = int(formdata.get('ens_classifier_count'))
        for i in range(amt):
            # classifier
            this_class = formdata.get(f"ens_{i}_classifier")
            config['classifier'].append(this_class)

            # inmode
            this_inmode = formdata.get(f"ens_{i}_inmode")
            config['input_mode'].append(this_inmode)
            
            # hparams
            if this_class not in class_count:
                class_count[this_class] = 0

            config['hyper_params'][f"{this_class}.{class_count[this_class]}"] = get_params_by_prefix(formdata, f"ens_{i}_hp_", False)

            class_count[this_class] += 1

            # params
            if this_inmode not in inmode_count:
                inmode_count[this_inmode] = 0

            config['params'][f"{this_inmode}.{inmode_count[this_inmode]}"] = get_params_by_prefix(formdata, "ens_{i}_p_", True)

            inmode_count[this_inmode] += 1

        # if applicable, the stacker
        if config['ensemble_strategy'] == "stacking":
            config['stacking_meta_classifier'] = formdata.get('stacker_classifier', None)
            config['use_concat'] = formdata.get('stacker_use_concat', False) == 'on'
            config['no_matrix'] = formdata.get('stacker_no_matrix', False) == 'on'
            config['stacking_meta_classifier_hyper_parameters'] = get_params_by_prefix(formdata, 'stacker_hp_', False)

    # training
    config['ontology_classes'] = "./dl_manager/feature_generators/util/ontologies.json"
    config['apply_ontology_classes'] = formdata.get('train_apply_ontology_classes', False)
    config['epochs'] = formdata.get('train_epochs', 1000)
    if formdata.get('train_split_size', None):
        config['split_size'] = formdata.get('train_split_size')
    if formdata.get('train_max_train', None):
        config['max_train'] = formdata.get('train_max_train', -1)
    config['architectural_only'] = formdata.get('train_architectural_only', False)
    cb = formdata.get('train_class_balancer', "None")
    config['class_balancer'] = cb if len(cb) > 0 else "None"
    if formdata.get('train_batch_size', 32):
        config['batch_size'] = formdata.get('train_batch_size', 32)
    config['boosting_rounds'] = 0 # not used
    
    # early stopping
    config['use_early_stopping'] = formdata.get('train_use_early_stopping', False)
    if formdata.get('train_early_stopping_patience', 5):
        config['early_stopping_patience'] = formdata.get('train_early_stopping_patience', 5)
    amt_attrib = formdata.get('train_early_stopping_num_attribs', 0)
    if not amt_attrib:
        amt_attrib = 0
    amt_attrib = int(amt_attrib)
    if amt_attrib > 0:
        config['early_stopping_min_delta'] = []
        config['early_stopping_attribute'] = []
    for i in range(0, amt_attrib):
        config['early_stopping_min_delta'].append(formdata.get(f"train_early_stopping_min_{i+1}_size"))
        config['early_stopping_attribute'].append(formdata.get(f"train_early_stopping_{i+1}_size"))

    # other assorted parameters
    config['store_model'] = True

    return config

def config_to_display(config):
    # two common tabs for single & ensemble
    general = {
        "output mode": config['output_mode'],
    }
    if 'combination_strategy' in config:
        general['combination strategy'] = config['combination_strategy']
    if 'ensemble_strategy' in config:
        general['ensemble strategy'] = config['ensemble_strategy']
    if 'voting_mode' in config:
        general['voting mode'] = config['voting_mode']

    train_fields = [
        "ontology_classes",
        "apply_ontology_classes",
        "epochs",
        "split_size",
        "max_train",
        "architectural_only",
        "class_balancer",
        "batch_size",
        "use_early_stopping",
        "early_stopping_patience",
        "early_stopping_min_delta",
        "early_stopping_attribute"
    ]

    training = {}
    for field in train_fields:
        if field in config:
            train_key = field.replace('_', ' ')
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
        if config['hyper_params']:
            classifier['hyper-params'] = config['hyper_params']
        if classifier['classifier'] == 'LinearConv1Model':
            general['analyze-keywords'] = config['analyze_keywords']
        
        input_mode = {
            'input-mode': config['input_mode'][0],
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
            this_inmode = config['input_mode'][i]
            
            if not this_classifier in class_count:
                class_count[this_classifier] = 0
            if not this_inmode in inmode_count:
                inmode_count[this_inmode] = 0
            
            this_obj = {
                'classifier': this_classifier,
                'input-mode': this_inmode,
                'params': config['params'][f"{this_inmode}.{inmode_count[this_inmode]}"],
                'hyper-params': config['hyper_params'][f"{this_classifier}.{class_count[this_classifier]}"]
            }

            class_count[this_classifier] += 1
            inmode_count[this_inmode] += 1
            result['ensemble classifiers'].append(this_obj)


        # stacker?
        if config['ensemble_strategy'] == "stacking":
            result['meta classifier'] = {
                "classifier": config['stacking_meta_classifier'],
                "use-concat": config['use_concat'],
                "no-matrix": config['no_matrix'],
                "hyper-params": {
                    f"{config['stacking_meta_classifier']}.0": config['stacking_meta_classifier_hyper_parameters']
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