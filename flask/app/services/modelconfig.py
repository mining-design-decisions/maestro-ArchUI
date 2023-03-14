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
            this_class = formdata.get("ens_{i}_classifier")
            config['classifier'].append(this_class)

            # inmode
            this_inmode = formdata.get("ens_{i}_inmode")
            config['input_mode'].append(this_inmode)
            
            # hparams
            if this_class not in class_count:
                class_count[this_class] = 0

            hp_pref = "ens_{i}_hp_"

            config['hyper_params'].extend([f"{this_class}[{class_count[this_class]}].{hp[len(hp_pref):].replace('_', '-')}={formdata.get(hp)}" for hp in get_by_prefix(formdata, hp_pref)])

            class_count[this_class] += 1

            # params
            if this_inmode not in inmode_count:
                inmode_count[this_inmode] = 0

            p_pref = "ens_{i}_p_"

            config['params'].extend([f"{this_inmode}[{inmode_count[this_inmode]}].{p[len(p_pref):].replace('_', '-')}={formdata.get(p)}" for p in get_by_prefix(formdata, p_pref)])

            inmode_count[this_inmode] += 1

        # if applicable, the stacker
        if config['ensemble_strategy'] == "stacking":
            config['stacking_meta_classifier'] = formdata.get('stacker_classifier', None)
            prefix = 'stacker_hp_'
            config['stacking_meta_classifier_hyper_parameters'] = [f"{hp[len('stacker_hp_'):].replace('_','-')}={formdata.get(hp)}" for hp in get_by_prefix(formdata, prefix)]

    # training
    config['ontology_classes'] = "/app/dl_manager/feature_generators/util/ontologies.json"
    config['apply_ontology_classes'] = formdata.get('train_apply_ontology_classes', False)
    config['epochs'] = formdata.get('training_epochs', 1000)
    config['split_size'] = formdata.get('training_split_size', None)
    config['max_train'] = formdata.get('training_max_train', -1)
    config['architectural_only'] = formdata.get('training_architectural_only', False)
    cb = formdata.get('training_class_balancer', "None")
    config['class_balancer'] = cb if len(cb) > 0 else "None"
    config['batch_size'] = formdata.get('training_batch_size', 32)
    config['boosting_rounds'] = 0 # not used
    config['use_early_stopping'] = formdata.get('training_use_early_stopping', False)
    config['early_stopping_patience'] = formdata.get('training_early_stopping_patience', 5)
    config['early_stopping_min_delta'] = [formdata.get('training_early_stopping_min_delta', 0.001)] # todo input these better
    config['early_stopping_attribute'] = [formdata.get('training_early_stopping_attribute', "loss")]

    # other assorted parameters
    config['store_model'] = True

    return config