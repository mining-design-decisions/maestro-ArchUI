// -----------------------------------
// "field configs" are my own version of flask wtf
// because i do not find it intuitive/versatile enough
// they are passed in with "generate_tab"

// explanation of variables in a field config object:
//   -name: present on all objects, is the name/id of the field, will get prefixes attached to it
//   -label: what to label this input field
//   -type: present on all objects, can be str/number/bool/select
//   -tooltip: present on all objects, is displayed on hover
//   -options: only present on type=select objects, contains all options
//   -extra: extra stuff to put in the html, like extra attributes or putting the field inside of a div

// format/options of extra:
//   -"type": "attribute" - requires a "value":str field in this object to specify, this will put the obj["value"] in the html input element as an attribute. good for stuff like onchange
//   -"type": "in_div" - puts a div wrapper with id="{obj["name"]}_div" around this field
//   -"type": "indent" - indents the field
//   -"type": "disabled_if_default" - if there is a default value found for this object, disable input (eg: gen_model_name)
//   -"type": "default" - for field-default values. get overwritten on edit.
// -----------------------------------


// helpers for below
function render_field_str(css_label, css_input, tooltip, name, defaults, label, extra_attr, field_default) {
    if (`${name}` in defaults) {
        val = defaults[`${name}`]
        if (typeof val !== 'string') {
            val = JSON.stringify(val)
        }
        extra_attr += ` value='${val}'`
    }
    else if (field_default) {
        field_default_str = field_default
        if (typeof field_default_str === 'string')
            extra_attr += ` value='${field_default}'`
        else
            extra_attr += ` value='${JSON.stringify(field_default)}'`
    }
    new_html = `<label class="${css_label}" title="${tooltip}" for="${name}">${label} </label>\n`
    new_html += `<div class="${css_input}">`
    new_html += `<input title="${tooltip}" type="text" size="30" name="${name}" id="${name}" ${extra_attr}>\n`
    new_html += `</div>`
    return new_html
}
function render_field_number(css_label, css_input, tooltip, name, defaults, label, extra_attr, field_default) {
    if (`${name}` in defaults) {
        extra_attr += ` value=${defaults[`${name}`]}`
    }
    else if (field_default) {
        extra_attr += ` value=${field_default}`
    }
    new_html = `<label class="${css_label}" title="${tooltip}" for="${name}">${label} </label>\n`
    new_html += `<div class="${css_input}">`
    new_html += `<input title="${tooltip}" type="number" size="10" name="${name}" id="${name}" ${extra_attr}>\n`
    new_html += `</div>`
    return new_html
}
function render_field_bool(css, tooltip, name, defaults, label, extra_attr, field_default) {
    if (`${name}` in defaults) {
        if (defaults[`${name}`])
            extra_attr += ` checked=checked`
    }
    else if (field_default) {
        extra_attr += ' checked=checked'
    }

    new_html = `<div class="${css} mb-1">`
    new_html += `<input title="${tooltip}" type="checkbox" size="1" name="${name}" id="${name}" ${extra_attr}>\n`
    new_html += `<label title="${tooltip}" for="${name}"> ${label}</label>\n`
    new_html += `</div>`
    return new_html
}
function generate_select_options(name, options, defaults, field_default = null) {
    default_option = ''
    if (`${name}` in defaults) {
        default_option = defaults[`${name}`]
    }
    else if (field_default) {
        default_option = field_default
    }
    new_html = ""
    options.forEach(option => {
        selected = ''
        if (option == default_option)
            selected = 'selected'
        new_html += `<option value="${option}" ${selected}>${option}</option>\n`
    })
    return new_html
}
function render_field_select(css_label, css_input, tooltip, name, options, defaults, label, extra_attr, field_default) {
    new_html = `<label class="${css_label}" title="${tooltip}" for="${name}">${label} </label>\n`
    new_html += `<div class="${css_input}">`
    new_html += `<select title="${tooltip}" name="${name}" id="${name}" ${extra_attr}>\n`
    new_html += generate_select_options(name, options, defaults, field_default)
    new_html += `</select>\n`
    new_html += '</div>\n'
    return new_html
}

function render_field(field_config, prefix="", size="small", defaults={}) {
    col_a = "sm-2"
    col_b = "sm-10"
    if (size == "large") {
        col_a = "sm-4"
        col_b = "sm-8"
    }
    css_label = `col-${col_a} col-form-label`
    css_input = `col-${col_b}`

    tooltip = field_config["tooltip"]
    field_name = prefix + field_config["name"]
    label = field_config["label"]
    extra_attr = ""
    field_default = null

    in_div = false
    
    if (field_config.hasOwnProperty("extra")) {
        field_config['extra'].forEach(extraObj => {
            switch(extraObj['type']) {
                case "attribute":
                    extra_attr += " " + extraObj['value']
                    break;
                case "in_div":
                    in_div = true
                    break;
                case "indent":
                    css_label += ` ps-4`
                    break;
                case "disabled_if_default":
                    if (field_name in defaults) 
                        extra_attr += " readonly"
                    break;
                case "default":
                    field_default = extraObj['value']
                    break;
            }
        })
    }
    
    field_html = ""

    switch(field_config["type"]) {
        case "str": 
            field_html = render_field_str(css_label, css_input, tooltip, field_name, defaults, label, extra_attr, field_default)
            break
        case "select":
            field_html = render_field_select(css_label, css_input, tooltip, field_name, field_config["options"], defaults, label, extra_attr, field_default)
            break
        case "bool":
            field_html = render_field_bool(`col-${col_b} offset-${col_a}`, tooltip, field_name, defaults, label, extra_attr, field_default)
            break
        case "number":
            field_html = render_field_number(css_label, css_input, tooltip, field_name, defaults, label, extra_attr, field_default)
            break
        default:
            console.log("Unknown type in field config")
            console.log(field_config)
    }

    field_html = `<div class="form-group row">${field_html}</div>`

    if (in_div) {
        field_html = `<div id="${field_name}_div">${field_html}</div>`
    }

    return field_html
}

function deep_copy(obj) {
    return JSON.parse(JSON.stringify(obj))
}

// hparam helpers
function generate_count_fields(count, field, prefix, size, defaults, toAppend = "size") {
    result = ""
    for (let i = 0; i < count; i++) {
        config = deep_copy(data[field])
        config['label'] += ` ${i+1}`
        new_name = config['name'].split('_')
        new_name.pop()
        new_name.push((i+1).toString())
        new_name.push(toAppend)
        new_name = new_name.join('_')
        config['name'] = new_name
        result += render_field(config, prefix, size, defaults)
    }
    return result
}

function get_hparams_for(classifier, prefix, size, defaults) {
    result = ""
    pref = prefix+'hp_'
    remfields = [
        "hparam_loss", 
        "hparam_learning_rate_start", 
        "hparam_learning_rate_stop", 
        "hparam_learning_rate_steps", 
        "hparam_learning_rate_power", 
        "hparam_use_trainable_embedding"
    ]
    switch(classifier) {
        case "FullyConnectedModel":
            // hidden layers
            result += "<h5>Hidden Layers</h5>"
            result += render_field(data['hparam_number_of_hidden_layers'], pref, size, defaults)
            result += `<div id="${pref}hidden_layers_div">`
            // todo should probably be pulled from somewhere
            result += generate_count_fields(1, 'hparam_hidden_layer_size', pref, size, defaults)
            // result += generate_count_fields(1, 'hparam_layer_activation', pref, size, defaults, 'activation')
            result += generate_count_fields(1, 'hparam_layer_dropout', pref, size, defaults, 'dropout')
            result += `</div>`

            result += "<hr />"

            result += render_field(data['hparam_layer_activation'], pref, size, defaults)
            result += render_field(data['hparam_layer_activation_alpha'], pref, size, defaults)
            result += render_field(data['hparam_layer_kernel_l1'], pref, size, defaults)
            result += render_field(data['hparam_layer_kernel_l2'], pref, size, defaults)
            result += render_field(data['hparam_layer_bias_l1'], pref, size, defaults)
            result += render_field(data['hparam_layer_bias_l2'], pref, size, defaults)
            result += render_field(data['hparam_layer_activity_l1'], pref, size, defaults)
            result += render_field(data['hparam_layer_activity_l2'], pref, size, defaults)
            break;
        case "LinearConv1Model":
            result += render_field(data['hparam_fully_connected_layer_size'], pref, size, defaults)
            result += render_field(data['hparam_fully_connected_layer_activation'], pref, size, defaults)
            result += render_field(data['hparam_filters'], pref, size, defaults)

            // convolutions
            result += "<hr /><h5>Convolutions</h5>"
            result += render_field(data['hparam_number_of_convolutions'], pref, size, defaults)
            result += `<div id="${pref}convolutions_div">`
            result += generate_count_fields(1, 'hparam_kernel_size', pref, size, defaults)
            result += `</div>`

            // other
            result += "<hr />"
            result += render_field(data['hparam_fnn_layer_activation_alpha'], pref, size, defaults)

            result += render_field(data['hparam_layer_activation'], pref, size, defaults)
            result += render_field(data['hparam_layer_activation_alpha'], pref, size, defaults)
            result += render_field(data['hparam_layer_kernel_l1'], pref, size, defaults)
            result += render_field(data['hparam_layer_kernel_l2'], pref, size, defaults)
            result += render_field(data['hparam_layer_bias_l1'], pref, size, defaults)
            result += render_field(data['hparam_layer_bias_l2'], pref, size, defaults)
            result += render_field(data['hparam_layer_activity_l1'], pref, size, defaults)
            result += render_field(data['hparam_layer_activity_l2'], pref, size, defaults)
            break;
        case "LinearRNNModel":
            // hidden layers
            result += "<h5>Hidden Layers</h5>"
            result += render_field(data['hparam_number_of_hidden_layers_rnn'], pref, size, defaults)
            result += `<div id="${pref}hidden_layers_div">`
            result += generate_count_fields(1, 'hparam_rnn_layer_type', pref, size, defaults, 'type')
            result += generate_count_fields(1, 'hparam_rnn_layer_size', pref, size, defaults, 'size')
            result += generate_count_fields(1, 'hparam_rnn_layer_dropout', pref, size, defaults, 'dropout')
            result += generate_count_fields(1, 'hparam_rnn_layer_recurrent-dropout', pref, size, defaults, 'recurrent-dropout')
            result += `</div>`

            // dense layers
            result += "<hr /><h5>Dense Layers</h5>"
            result += render_field(data['hparam_number_of_dense_layers'], pref, size, defaults)
            result += `<div id="${pref}dense_layers_div">`
            result += generate_count_fields(1, 'hparam_dense_layer_size', pref, size, defaults, 'size')
            result += `</div>`

            // all the others
            result += "<hr /><h5>Other Parameters</h5>"
            fields = [
                "hparam_rnn_layer_activation",
                "hparam_rnn_layer_recurrent_activation",
                "hparam_rnn_layer_activation_alpha",
                "hparam_rnn_layer_recurrent_activation_alpha",

                "hparam_rnn_layer_kernel_l1",
                "hparam_rnn_layer_kernel_l2",
                "hparam_rnn_layer_recurrent_l1",
                "hparam_rnn_layer_recurrent_l2",
                "hparam_rnn_layer_bias_l1",
                "hparam_rnn_layer_bias_l2",
                "hparam_rnn_layer_activity_l1",
                "hparam_rnn_layer_activity_l2",
            ]
            fields.forEach(field => {
                result += render_field(data[field], pref, size, defaults)
            })
            break;
        case "Bert":
            result += render_field(data['hparam_number_of_frozen_layers'], pref, size, defaults)
            break;
    }
    // optimizer
    result += "<hr /><h5>Optimizer</h5>"
    result += render_field(data["hparam_optimizer"], pref, size, defaults)
    result += `<div id="${pref}optimizer_params_div"></div>` // gets generated in-place

    // loss, learning rate, use-trainable-embedding
    result += "<hr />"
    remfields.forEach(field => {
        result += render_field(data[field], pref, size, defaults)
    })

    return result
}

function get_optimizer_params_for(optimizer, prefix, size, defaults) {
    result = ""

    fields_per_optimizer = {
        "adam": ["beta_1", "beta_2", "epsilon"],
        "nadam": ["beta_1", "beta_2", "epsilon"],
        "sgd": ["momentum", "use_nesterov"]
    }

    pref = prefix+"opt_"

    fields_per_optimizer[optimizer].forEach(field => {
        result += render_field(data["optimizer_"+field], pref, size, defaults)
    })

    return result
}

function get_params_for(inmode, prefix, size, defaults) {
    result = ""

    // commented-out are covered in embeddings
    const params_per_inmode = {
        "Word2Vec": [
            // "param_vector_length",
            "param_embedding_id",
            "param_max_len",
            "param_disable_lowercase",
            "param_disable_stopwords",
            // "param_use_stemming",
            // "param_use_lemmatization",
            // "param_use_pos",
            "param_class_limit",
            "param_metadata_attributes",
            // "param_formatting_handling"
        ],
        "Doc2Vec": [
            // "param_vector_length",
            "param_embedding_id",
            "param_max_len",
            "param_disable_lowercase",
            "param_disable_stopwords",
            // "param_use_stemming",
            // "param_use_lemmatization",
            // "param_use_pos",
            "param_class_limit",
            "param_metadata_attributes",
            // "param_formatting_handling"
        ],
        "BOWFrequency": [
            "param_embedding_id", // dictionary-id
            "param_max_len",
            "param_disable_lowercase",
            "param_disable_stopwords",
            // "param_use_stemming",
            // "param_use_lemmatization",
            // "param_use_pos",
            "param_class_limit",
            "param_metadata_attributes",
            // "param_formatting_handling"
        ],
        "BOWNormalized": [
            "param_embedding_id", // dictionary-id
            "param_max_len",
            "param_disable_lowercase",
            "param_disable_stopwords",
            // "param_use_stemming",
            // "param_use_lemmatization",
            // "param_use_pos",
            "param_class_limit",
            "param_metadata_attributes",
            // "param_formatting_handling"
        ],
        "Bert": [
            "param_max_len",
            "param_disable_lowercase",
            "param_disable_stopwords",
            "param_use_stemming",
            "param_use_lemmatization",
            "param_use_pos",
            "param_class_limit",
            "param_metadata_attributes",
            "param_formatting_handling"
        ],
        "TfidfGenerator": [
            "param_max_len",
            "param_disable_lowercase",
            "param_disable_stopwords",
            // "param_use_stemming",
            // "param_use_lemmatization",
            // "param_use_pos",
            "param_class_limit",
            "param_metadata_attributes",
            // "param_formatting_handling",
            "param_embedding_id" // dictionary-id
        ],
        "Metadata": [
            "param_max_len",
            "param_disable_lowercase",
            "param_disable_stopwords",
            "param_use_stemming",
            "param_use_lemmatization",
            "param_use_pos",
            "param_class_limit",
            "param_metadata_attributes",
            "param_formatting_handling"
        ],
        "OntologyFeatures": [
            "param_max_len",
            "param_disable_lowercase",
            "param_disable_stopwords",
            "param_use_stemming",
            "param_use_lemmatization",
            "param_use_pos",
            "param_class_limit",
            "param_metadata_attributes",
            "param_formatting_handling"
        ]
    }

    params_per_inmode[inmode].forEach(field => {
        result += render_field(data[field], prefix+"p_", size, defaults)
    })

    return result;
}

// subtab generators
function generate_classifier(prefix="", size="small", defaults={}) {
    result = ""
    classifier_config = data['class_classifier']
    result += render_field(classifier_config, prefix, size, defaults)
    result += `<hr />`

    result += `<div id="${prefix}hparams_div">`
    result += get_hparams_for(classifier_config["extra"][0]["value"], prefix, size, defaults)
    result += `</div>`

    return result
}
function generate_inmode(prefix="", size="small", defaults={}) {
    result = ""

    inmode_config = data['prepro_inmode']
    result += render_field(inmode_config, prefix, size, defaults)
    result += `<hr />`

    result += `<div id="${prefix}params_div">`
    result += get_params_for(inmode_config['extra'][0]["value"], prefix, size, defaults)

    return result
}

function generate_early_stopping_attribs(amt, defaults) {
    left = generate_count_fields(amt, 'train_early_stopping_min_delta', 'train_', 'large', defaults)
    right = generate_count_fields(amt, 'train_early_stopping_attribute', 'train_', 'large', defaults)
    result = `<div class="row"><div class="col-sm">${left}</div><div class="col-sm">${right}</div></div>`
    return result
}

// helper for ens
function generate_ens_classifiers(amt, defaults) {
    result = ""
    for (let i = 0; i < amt; i++) {
        prefix = `ens_${i}_`
        result += `<div class="accordion-item">`
        result += `<h2 class="accordion-header" id="${prefix}header">`
        result += `<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${prefix}div" aria-expanded="false" aria-controls="${prefix}div">`
        result += `Ensemble Classifier ${i+1}</button></h2>`

        result += `<div id="${prefix}div" class="accordion-collapse collapse" area-labelledby="${prefix}header" data-bs-parent="#ens_classifiers">`
        result += `<div class="accordion-body row">`

        result += `<div class="col-sm-6 card"><div class="card-body"><h4>Classifier</h4>${generate_classifier(prefix, "large", defaults)}</div></div>`
        
        result += `<div class="col-sm-6 card"><div class="card-body"><h4>Input Mode</h4>${generate_inmode(prefix, "large", defaults)}</div></div>`

        result += `</div>` // accordion-body row
        result += `</div>` // accordion-collapse

        result += `</div>` // accordion-item
    }
    return result
}

// tab generators
function generate_tab_general(defaults, data) {
    result = ""

    result += render_field(data['gen_model_name'], "gen_", "small", defaults)
    result += render_field(data['gen_seed'], "gen_", "small", defaults)
    result += render_field(data['gen_output_mode'], "gen_", "small", defaults)
    result += render_field(data['gen_model_mode'], "gen_", "small", defaults)
    
    result += '<div id="gen_ensemble_div">'
    result += render_field(data['gen_ensemble_strategy'], "gen_", "small", defaults)
    result += render_field(data['gen_test_separately'], "gen_", "small", defaults)

    result += '<div id="gen_voting_mode_div">'
    result += "<hr />"
    result += render_field(data['gen_voting_mode'], "gen_", "small", defaults)
    result += '</div>'

    result += '<div id="gen_combo_model_hparams_div">'
    result += "<hr />"
    result += render_field(data['gen_combination_strategy'], "gen_", "small", defaults)
    result += "<h5>Combination Model Hyper Parameters</h5>"
    result += "<p><em>Note that in this combination mode, the optimizer and loss parameters for all ensemble models will be ignored.</em></p>"
    result += get_hparams_for('FullyConnectedModel', 'combomodel_', 'small', defaults)
    result += '</div></div>'

    return result
}

function generate_tab_prepro(defaults, data) {
    return generate_inmode("single_", "small", defaults)
}

function generate_tab_classifier(defaults, data) {
    prefix = "single_"
    size = "small"
    
    result = ""
    classifier_config = data['class_classifier']
    result += render_field(classifier_config, prefix, size, defaults)
    result += render_field(data['class_analyze_keywords'], 'single_', 'small', defaults)
    result += `<hr />`

    result += `<div id="${prefix}hparams_div">`
    result += get_hparams_for(classifier_config["extra"][0]["value"], prefix, size, defaults)
    result += `</div>`

    return result
}

function generate_tab_training(defaults, data) {
    const fields = [
        "train_epochs",
        "train_split_size",
        "train_max_train",
        "train_apply_ontology_classes",
        "train_ontology_classes",
        "train_architectural_only",
        "train_training_data_query",
        // "train_class_balancer", // todo?
        "train_batch_size",
        "train_use_early_stopping"
    ]

    result = ""
    fields.forEach(field => {
        result += render_field(data[field], "train_", "small", defaults)
    })

    result += "<div id=\"train_early_stopping_div\">"
    result += render_field(data['train_early_stopping_patience'], "train_", "small", defaults)
    result += render_field(data['train_early_stopping_num_attribs'], "train_", "small", defaults)
    result += "<hr />"
    result += "<div id=\"train_early_stopping_attribs_div\"></div>"
    result += "</div>"

    return result
}

function generate_tab_ensemble(defaults, data) {
    result = ""

    result += render_field(data['ens_classifier_count'], "ens_", "small", defaults)
    result += `<div id="ens_classifiers" class="accordion">`
    
    result += generate_ens_classifiers(2, defaults)

    result += `</div>`

    return result
}

function generate_tab_stacker(defaults, data) {
    result = ""

    classifier_config = deep_copy(data['class_classifier'])
    // classifier_config['options'] = ["FullyConnectedModel"]
    result += render_field(classifier_config, "stacker_", "small", defaults)
    result += render_field(data['stacker_use_concat'], 'stacker_', 'small', defaults)
    result += render_field(data['stacker_no_matrix'], 'stacker_', 'small', defaults)
    result += `<hr />`

    result += `<div id="stacker_hparams_div">`
    result += get_hparams_for("FullyConnectedModel", "stacker_", "small", defaults)
    result += `</div>`
    return result
}

// entry point
function generate_tab(tabName, data, defaults={}) {
    switch(tabName) {
        case "general":
            return generate_tab_general(defaults, data)
        case "training":
            return generate_tab_training(defaults, data)
        case "classifier":
            return generate_tab_classifier(defaults, data)
        case "pre-processing":
            return generate_tab_prepro(defaults, data)
        case "classifiers":
            return generate_tab_ensemble(defaults, data)
        case "meta-classifier":
            return generate_tab_stacker(defaults, data)
    }
}
