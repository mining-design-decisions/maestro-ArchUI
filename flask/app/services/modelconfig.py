import json
import app.ml_link as lib

bools = lib.get_cli_json_bools()

def add_if_relevant(formdata, key, targetkey, target):
    if key in formdata:
        if ('param_' in key and formdata[key] == 'on') or targetkey in bools:
            target[targetkey] = True
        elif formdata[key]:
            target[targetkey] = formdata[key]

# used in creating (& editing) models
def raw_to_config(formdata):
    print(bools)
    model = {}

    # tab: general
    general = {}
    general['output-mode'] = formdata.get('output_mode_field')
    general['mode'] = formdata.get('model_mode_field')
    if general['mode'] == "Single":
        pass # nothing else here really
    else: # Ensemble
        general['combination-strategy'] = formdata.get('combination_strategy_field')
    model['general'] = general

    # if single:
    if general['mode'] == "Single":
        # tab: pre-processing
        prepro = {}
        prepro['input-mode'] = formdata.get('input_mode_field')
        # get all params
        input_params = [x for x in formdata if x.startswith('param_')]
        params = {}
        for p in input_params:
            add_if_relevant(formdata, p, p[6:], params)
        prepro['params'] = params

        model['pre-processing'] = prepro

        # tab: classifier
        classifier = {}
        classifier['classifier'] = formdata.get('classifier_field')
        hyper_params = [x for x in formdata if x.startswith('hparam_')]
        hparams = {}
        for p in hyper_params:
            add_if_relevant(formdata, p, p[7:], hparams)
        classifier['hyper-params'] = hparams
        model['classifier'] = classifier
    else: # ensemble
        # tab: ensemble classifiers
        ens_class = []
        ens_classifiers_count = int(formdata.get('ensemble_classifier_count_field', 0))
        
        for i in range(ens_classifiers_count):
            hparam_prefix = f'ens{i}_hparam_'
            hyper_params = [x for x in formdata if x.startswith(hparam_prefix)]
            hparams = {}
            for p in hyper_params:
                add_if_relevant(formdata, p, p[len(hparam_prefix):], hparams)

            param_prefix = f'ens{i}_param_'
            input_params = [x for x in formdata if x.startswith(param_prefix)]
            params = {}
            for p in input_params:
                add_if_relevant(formdata, p, p[len(param_prefix):], params)

            ens_class.append({
                'classifier': formdata.get(f'ens_class_{i}_select'),
                'hyper-params': hparams, 
                'input-mode': formdata.get(f'ens_input_{i}_select'),
                'params': params
            })
        model['ensemble classifiers'] = ens_class

        if general['combination-strategy'] == 'stacking':
            # tab: ensemble meta classifier
            meta_class = {}
            meta_class['classifier'] = formdata.get('stacking_meta_classifier_field')
            prefix = 'stacker_hparam_'
            hyper_params = [x for x in formdata if x.startswith(prefix)]
            hparams = {}
            for p in hyper_params:
                add_if_relevant(formdata, p, p[len(prefix):], hparams)
            meta_class['hyper-params'] = hparams

            model['ensemble meta classifier'] = meta_class

    # tab: training
    training = {}
    training['epochs'] = formdata.get('epochs_field')
    add_if_relevant(formdata, 'split_size_field', 'split-size', training)
    add_if_relevant(formdata, 'max_train_field', 'max-train', training)
    add_if_relevant(formdata, 'architectural_only_field', 'architectural-only', training)
    add_if_relevant(formdata, 'project_mode_field', 'project-mode', training)
    if 'project-mode' in training and training['project-mode'].lower() == 'test-project':
        training['test-project'] = formdata['test_project_field']
    add_if_relevant(formdata, 'class_balancer_field', 'class-balancer', training)
    add_if_relevant(formdata, 'apply_ontology_classes_field', 'apply-ontology-classes', training)
    add_if_relevant(formdata, 'batch_size_field', 'batch-size', training)
    if 'use_early_stopping_field' in formdata:
        training['use-early-stopping'] = True
        add_if_relevant(formdata, 'early_stopping_patience_field', 'early-stopping-patience', training)
        add_if_relevant(formdata, 'early_stopping_min_delta_field', 'early-stopping-min-delta', training)
        add_if_relevant(formdata, 'early_stopping_attribute_field', 'early-stopping-attribute', training)

    model['training'] = training

    return model

# used in training models
def config_to_cli():
    return []

# to be used in edit model. convert a config to default values for the form
def config_to_raw():
    # todo
    return {}