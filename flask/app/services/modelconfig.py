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

def get_is_dic(featgen_type):
    return featgen_type in ['BOWFrequency', 'BOWNormalized', 'TfidfGenerator']

def get_params_by_prefix(formdata, prefix, is_prepro, embed_is_dic = False):
    name_to_type = {
        "class-limit": "int",
        "max-len": "int",
        'disable-lowercase': "bool",
        'disable-stopwords': "bool",
        "use-lemmatization": "bool",
        "use-stemming": "bool",
        "use-pos": "bool",
        "number-of-hidden-layers": "int",
        "number-of-convolutions": "int",
        "learning-rate-start": "float",
        "learning-rate-stop": "float",
        "learning-rate-steps": "int",
        "learning-rate-power": "float",
        "use-trainable-embedding": "bool",
        "fully-connected-layer-size": "int",
        "filters": "int",
        "layer-activity-l1": "float",
        "layer-activity-l2": "float",
        "layer-bias-l1": "float",
        "layer-bias-l2": "float",
        "layer-kernel-l1": "float",
        "layer-kernel-l2": "float",
        "layer-activation-alpha": "float",
        "fnn-layer-activation-alpha": "float",
        "number-of-rnn-layers": "int",
        "number-of-dense-layers": "int",
        "rnn-layer-activation-alpha": "float",
        "rnn-layer-recurrent-activation-alpha": "float",
        "rnn-layer-activity-l1": "float",
        "rnn-layer-activity-l2": "float",
        "rnn-layer-bias-l1": "float",
        "rnn-layer-bias-l2": "float",
        "rnn-layer-kernel-l1": "float",
        "rnn-layer-kernel-l2": "float",
        "rnn-layer-recurrent-l1": "float",
        "rnn-layer-recurrent-l2": "float",
        "number-of-frozen-layers": "int",

        "opt-beta-1": "float",
        "opt-beta-2": "float",
        "opt-epsilon": "float",
        "opt-momentum": "float",
        "opt-use-nesterov": "bool"
    }
    do_not_propagate = [
        "use-ontologies",
        "ontology-id",
        'min-count',
        'min-doc-count',
        "algorithm"
    ]
    for i in range(1, 12):
        name_to_type[f"hidden-layer-{i}-size"] = 'int'
        name_to_type[f"layer-{i}-dropout"] = 'float'
        name_to_type[f"kernel-{i}-size"] = 'int'
        name_to_type[f"rnn-layer-{i}-size"] = 'int'
        name_to_type[f"rnn-layer-{i}-dropout"] = 'float'
        name_to_type[f"rnn-layer-{i}-recurrent-dropout"] = 'float'
        name_to_type[f"dense-layer-{i}-size"] = 'int'
    params = {}
    for p in get_by_prefix(formdata, prefix):
        if formdata.get(p) and len(formdata.get(p).strip()) > 0:
            argName = p[len(prefix):].replace('_', '-')
            if argName in do_not_propagate:
                continue
            thisType = "str"
            if argName in name_to_type:
                thisType = name_to_type[argName]
            if argName == 'embedding-id' and embed_is_dic:
                argName = 'dictionary-id'
            params[argName] = retrieve_info(formdata, p, thisType, None)

    if not is_prepro:
        opt = params['optimizer']
        opt_params = {}
        all_fields = [x for x in params if x.startswith('opt-')]
        fields_per_optimizer = {
            "adam": ["beta-1", "beta-2", "epsilon"],
            "nadam": ["beta-1", "beta-2", "epsilon"],
            "sgd": ["momentum", "use-nesterov"]
        }
        # grab the relevant optimizer params
        for field in fields_per_optimizer[opt]:
            opt_params[field] = params["opt-"+field]
        
        params['optimizer-params'] = {
            opt+'.0': opt_params
        }
        # cleanup
        for field in all_fields:
            del params[field]
        """
        if 'optimizer-sgdvalue' in params:
            if params['optimizer'] == 'sgd':
                params['optimizer-params'] = {'sgd.0': {'momentum': float(params['optimizer-sgdvalue'])}}
            del params['optimizer-sgdvalue']
        elif params['optimizer'] == 'sgd':
            params['optimizer-params'] = {'sgd.0': {'momentum': 0}}
        """

    if is_prepro and f"{prefix}embedding_id" in formdata:
        e = dbapi.get_embedding(formdata.get(f"{prefix}embedding_id"))
        dicname = list(e['config']['params'].keys())[0]
        for param in e['config']['params'][dicname]:
            if param in do_not_propagate:
                continue
            params[param] = e['config']['params'][dicname][param]
    return params

def raw_to_config(formdata):
    config = {}

    # tab: general
    config['seed'] = retrieve_info(formdata, 'gen_seed', 'int', -1)
    config['output-mode'] = formdata.get('gen_output_mode', None)
    config['tuner-combination-model-hyper-params'] = None
    model_mode = formdata.get('gen_model_mode', 'Single')

    if model_mode == 'Single':
        # single mode tabs:
        # pre-processing
        config['input-mode'] = [formdata.get('single_inmode')]
        config['params'] = {
            f"{config['input-mode'][0]}.0": get_params_by_prefix(formdata, "single_p_", True, get_is_dic(config['input-mode'][0]))
        }

        # classifier
        config['classifier'] = [formdata.get('single_classifier')]
        config['hyper-params'] = {
            f"{config['classifier'][0]}.0": get_params_by_prefix(formdata, 'single_hp_', False)
        }
        if config['classifier'][0] == 'LinearConv1Model':
            config['analyze-keywords'] = formdata.get('single_analyze_keywords', False) == "on"

    else: # ensemble
        test_sep = formdata.get('gen_test_separately', False)
        if test_sep:
            config['test-separately'] = test_sep

        #strat = formdata.get('gen_combination_strategy', None)
        #if strat.lower() in ["stacking", "voting", 'combination']:
        #    config['ensemble-strategy'] = strat.lower()
        #elif strat:
        #    config['combination-strategy'] = strat.lower()

        #if strat.lower() == 'voting':
        #    config['voting-mode'] = formdata.get('gen_voting_mode')
        #if strat.lower() == 'combination':
        #    config['combination-model-hyper-params'] = {
        #        'FullyConnectedModel.0': get_params_by_prefix(formdata, 'combomodel_hp_', False)
        #    }

        strat = formdata.get('gen_ensemble_strategy', None)
        config['ensemble-strategy'] = strat
        match strat:
            case 'voting':
                config['voting-mode'] = formdata.get('gen_voting_mode')
                
            case 'combination':
                config['combination-strategy'] = formdata.get('gen_combination_strategy')
                config['combination-model-hyper-params'] = {
                    'CombinedModel.0': get_params_by_prefix(formdata, 'combomodel_hp_', False)
                }
                
            case 'stacking':
                config['stacking-meta-classifier'] = formdata.get('stacker_classifier', None)
                config['use-concat'] = formdata.get('stacker_use_concat', False) == 'on'
                config['no-matrix'] = formdata.get('stacker_no_matrix', False) == 'on'
                config['stacking-meta-classifier-hyper-parameters'] = get_params_by_prefix(formdata, 'stacker_hp_', False)


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

            config['params'][f"{this_inmode}.{inmode_count[this_inmode]}"] = get_params_by_prefix(formdata, f"ens_{i}_p_", True, get_is_dic(this_inmode))

            inmode_count[this_inmode] += 1

    # training
    config['apply-ontology-classes'] = retrieve_info(formdata, 'train_apply_ontology_classes', 'bool', False)
    config['ontology-classes'] = retrieve_info(formdata, 'train_ontology_classes', 'str', '')
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

def config_to_display(config, separate_attribs=False):
    # two common tabs for single & ensemble
    # general
    general = {
        "output mode": config['output-mode'],
        "seed": config['seed'] if 'seed' in config else -1
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
        "early-stopping-patience"
    ]

    # training
    training = {}
    for field in train_fields:
        if field in config:
            train_key = field.replace('-', ' ')
            training[train_key] = config[field]
    if separate_attribs:
        if 'early-stopping-attribute' in config:
            amt_early_stopping_attribs = len(config['early-stopping-attribute'])
            training['early_stopping_num_attribs'] = amt_early_stopping_attribs
            for i in range(0, amt_early_stopping_attribs):
                delta = config['early-stopping-min-delta'][i]
                attrib = config['early-stopping-attribute'][i]
                training[f"early_stopping_min_{i+1}_size"] = delta
                training[f"early_stopping_{i+1}_size"] = attrib
    else:
        if 'early-stopping-min-delta' in config:
            training['early_stopping_min_delta'] = config['early-stopping-min-delta']
            training['early_stopping_attribute'] = config['early-stopping-attribute']
    training['training_data_query'] = config['training-data-query']

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
            key = classifier['classifier'] + ".0"
            classifier['hyper-params'] = config['hyper-params'][key]
            
        if classifier['classifier'] == 'LinearConv1Model' and 'analyze-keywords' in config:
            general['analyze-keywords'] = config['analyze-keywords']
        
        input_mode = {
            'input-mode': config['input-mode'][0],
            "params": {}
        }
        if config['params']:
            key = input_mode['input-mode'] + ".0"
            input_mode['params'] = config['params'][key]

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
        if 'ensemble-strategy' in config and config['ensemble-strategy'] == "stacking":
            result['meta classifier'] = {
                "classifier": config['stacking-meta-classifier'],
                "use-concat": config['use-concat'],
                "no-matrix": config['no-matrix'],
                "hyper-params": {
                    f"{config['stacking-meta-classifier']}.0": config['stacking-meta-classifier-hyper-parameters']
                }
            }
        # combination model?
        if 'ensemble-strategy' in config and config['ensemble-strategy'] == 'combination':
            result['combination strategy'] = config['combination-strategy']
            result['combination model'] = config['combination-model-hyper-params']['CombinedModel.0']

    return result

def config_to_form(config):
    display = config_to_display(config, True)
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
                    result[f"single_hp_{hp.replace('-','_')}"] = display[tab]['hyper-params'][hp]
                for optimizer in result['single_hp_optimizer_params']:
                    for field in result['single_hp_optimizer_params'][optimizer]:
                        result[f"single_hp_opt_{field.replace('-', '_')}"] = result['single_hp_optimizer_params'][optimizer][field]

            case "ensemble classifiers":
                for i in range(len(display[tab])):
                    obj = display[tab][i]
                    result[f"ens_{i}_classifier"] = obj['classifier']
                    result[f"ens_{i}_inmode"] = obj['inmode']
                    for hp in obj['hyper-params']:
                        result[f"ens_{i}_hp_{hp}"] = obj["hyper-params"][hp]
                        for optimizer in result[f"ens_{i}_hp_optimizer_params"]:
                            for field in result[f"ens_{i}_hp_optimizer_params"][optimizer]:
                                result[f"ens_{i}_hp_opt_{field.replace('-', '_')}"] = result[f"ens_{i}_hp_optimizer_params"][optimizer][field]
                    for p in obj["params"]:
                        result[f"ens_{i}_p_{p}"] = obj["params"][p]
                        
            case "meta classifier":
                result['stacker_classifier'] = display[tab]['classifier']
                for hp in display[tab]['hyper-params']:
                    if display[tab]['hyper-params'][hp]:
                        result[f'stacker_hp_{hp}'] = display[tab]['hyper-params'][hp]
                    for optimizer in result[f"stacker_hp_optimizer_params"]:
                        for field in result[f"stacker_hp_optimizer_params"][optimizer]:
                            result[f"stacker_hp_opt_{field.replace('-', '_')}"] = result[f"stacker_hp_optimizer_params"][optimizer][field]

    if type(result['train_training_data_query']) != dict:
        import json
        result['train_training_data_query'] = json.loads(result['train_training_data_query'])

    if 'analyze-keywords' in display['general']:
        result['single_analyze_keywords'] = display['general']['analyze-keywords']

    return result