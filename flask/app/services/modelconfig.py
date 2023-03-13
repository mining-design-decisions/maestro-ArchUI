def get_by_prefix(formdata, prefix):
    return [x for x in formdata if x.startswith(prefix)]

def raw_to_config(formdata):
    config = {}

    # tab: general
    config['output_mode'] = formdata.get('gen_output_mode', None)
    model_mode = formdata.get('gen_model_mode', 'Single')
    config['combination_strategy'] = formdata.get('gen_combination_strategy', None)

    if model_mode == 'Single':
        # single mode tabs:
        # pre-processing
        config['input_mode'] = [formdata.get('single_inmode')]
        params = get_by_prefix()

        # classifier

    else:
        # ensemble mode tabs:
        pass

    return config