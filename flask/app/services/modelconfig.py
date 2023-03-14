def get_by_prefix(formdata, prefix):
    return [x for x in formdata if x.startswith(prefix)]

def raw_to_config(formdata):
    config = {}

    # tab: general
    config['output_mode'] = formdata.get('gen_output_mode', None)
    model_mode = formdata.get('gen_model_mode', 'Single')
    # config['combination_strategy'] = formdata.get('gen_combination_strategy', None)

    strat = formdata.get('gen_combination_strategy', None)
    config['ensemble_strategy'] = "none" # default?
    config['combination_strategy'] = "concat" # default?
    if strat.lower() in ["stacking", "voting"]:
        config['ensemble_strategy'] = strat.lower()
    elif strat:
        config['combination_strategy'] = strat.lower()

    config['stacking_meta_classifier'] = None
    config['stacking_meta_classifier_hyper_parameters'] = None
    config['stacking_use_concat'] = False
    config['stacking_no_matrix'] = True

    if model_mode == 'Single':
        # single mode tabs:
        # pre-processing
        config['input_mode'] = [formdata.get('single_inmode')]
        p_prefix = "single_p_"
        params = get_by_prefix(formdata, p_prefix)
        config['params'] = [f"{p[len(p_prefix):].replace('_', '-')}={formdata.get(p)}" for p in params]

        # classifier
        config['classifier'] = [formdata.get('single_classifier')]
        h_prefix = "single_hp_"
        hparams = get_by_prefix(formdata, h_prefix)
        config['hyper_params'] = [f"{hp[len(h_prefix):].replace('_', '-')}={formdata.get(hp)}" for hp in hparams]

    else:
        # ensemble mode tabs:
        # ensemble classifiers
        class_count = {}
        inmode_count = {}
        hparams = []
        params = []

        config['hyper_params'] = []
        config['params'] = []
        config['classifier'] = []
        config['input_mode'] = []

        amt = formdata.get('ens_classifier_count')
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

            hp_pref = f"ens_{i}_hp_"
            for hp in get_by_prefix(formdata, hp_pref):
                if (formdata.get(hp)):
                    config['hyper_params'].append(f"{this_class}[{class_count[this_class]}].{hp[len(hp_pref):].replace('_', '-')}={formdata.get(hp)}")

            class_count[this_class] += 1

            # params
            if this_inmode not in inmode_count:
                inmode_count[this_inmode] = 0

            p_pref = "ens_{i}_p_"

            for p in get_by_prefix(formdata, p_pref):
                if (formdata.get(p)):
                    config['params'].append(f"{this_inmode}[{inmode_count[this_inmode]}].{p[len(p_pref):].replace('_', '-')}={formdata.get(p)}")

            inmode_count[this_inmode] += 1

        # if applicable, the stacker
        if config['ensemble_strategy'] == "stacking":
            config['stacking_meta_classifier'] = formdata.get('stacker_classifier', None)
            prefix = 'stacker_hp_'
            config['stacking_meta_classifier_hyper_parameters'] = []

            for hp in get_by_prefix(formdata, prefix):
                if formdata.get(hp):
                    config['stacking_meta_classifier_hyper_parameters'].append(f"{hp[len('stacker_hp_'):].replace('_','-')}={formdata.get(hp)}")

    # training
    config['ontology_classes'] = "app/dl_manager/feature_generators/util/ontologies.json"
    config['apply_ontology_classes'] = formdata.get('train_apply_ontology_classes', False)
    config['epochs'] = formdata.get('train_epochs', 1000)
    config['split_size'] = formdata.get('train_split_size', None)
    config['max_train'] = formdata.get('train_max_train', -1)
    config['architectural_only'] = formdata.get('train_architectural_only', False)
    cb = formdata.get('train_class_balancer', "None")
    config['class_balancer'] = cb if len(cb) > 0 else "None"
    config['batch_size'] = formdata.get('train_batch_size', 32)
    config['boosting_rounds'] = 0 # not used
    config['use_early_stopping'] = formdata.get('train_use_early_stopping', False)
    config['early_stopping_patience'] = formdata.get('train_early_stopping_patience', 5)
    config['early_stopping_min_delta'] = []
    config['early_stopping_attribute'] = []
    if (formdata.get('train_early_stopping_min_delta', None) != None):
        config['early_stopping_min_delta'] = [formdata.get('train_early_stopping_min_delta', None)] # todo input these better
    if (formdata.get('train_early_stopping_attribute', None) != None):
        config['early_stopping_attribute'] = [formdata.get('train_early_stopping_attribute', "loss")]

    # other assorted parameters
    config['store_model'] = True

    return config

def config_to_display(config):
    # two common tabs for single & ensemble
    general = {
        "output mode": config['output_mode'],
        "combination strategy": config["combination_strategy"],
        "ensemble strategy": config["ensemble_strategy"]
    }

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
        train_key = field.replace('_', ' ')
        # if type(config[field]) == list:
        #     training[train_key] = ', '.join(str(config[field]))
        # else:
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
        for hp in config['hyper_params']:
            split = hp.split('=')
            classifier['hyper-params'][split[0]] = split[1]
        
        input_mode = {
            'input-mode': config['input_mode'][0],
            "params": {}
        }
        for p in config['params']:
            split = p.split('=')
            input_mode['params'][split[0]] = split[1]

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
            this_obj = {
                'classifier': this_classifier,
                'input-mode': this_inmode,
                'params': {},
                'hyper-params': {}
            }
            if not this_classifier in class_count:
                class_count[this_classifier] = 0
            if not this_inmode in inmode_count:
                inmode_count[this_inmode] = 0

            hp_pref = f"{this_classifier}[{class_count[this_classifier]}]."
            
            for hp in [x[len(hp_pref):] for x in config['hyper_params'] if x.startswith(hp_pref)]:
                split = hp.split('=')
                this_obj['hyper-params'][split[0]] = split[1]
            
            p_pref = f"{this_inmode}[{inmode_count[this_inmode]}]."
            for p in [x[len(p_pref):] for x in config['params'] if x.startswith(p_pref)]:
                split = p.split('=')
                this_obj['params'][split[0]] = split[1]

            class_count[this_classifier] += 1
            inmode_count[this_inmode] += 1
            result['ensemble classifiers'].append(this_obj)


        # stacker?
        if config['ensemble_strategy'] == "stacking":
            result['meta classifier'] = {
                "classifier": config['stacking_meta_classifier'],
                "hyper-params": {}
            }

            for hp in config['stacking_meta_classifier_hyper_parameters']:
                split = hp.split('=')
                result['hyper-params'][split[0]] = split[1]

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