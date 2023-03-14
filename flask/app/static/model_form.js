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
        extra_attr += ` value="${defaults[`${name}`]}"`
    }
    else if (field_default) {
        extra_attr += ` value=${field_default}`
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
    /* todo place in field_configs.json
    if (name == 'vector-length') {
        if (default_int.length > 0) {
            default_int += ' required'
        }
        else {
            default_int = ' required value=400'
        }
    }
    */
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
                        extra_attr += " disabled"
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
function generate_count_fields(count, field, prefix, size, defaults) {
    result = ""
    for (let i = 0; i < count; i++) {
        config = deep_copy(data[field])
        config['label'] += ` ${i+1}`
        result += render_field(config, prefix, size, defaults)
    }
    return result
}

function get_hparams_for(classifier, prefix, size, defaults) {
    result = ""
    pref = prefix+'hp_'
    switch(classifier) {
        case "FullyConnectedModel":
            // hidden layers
            result += render_field(data['hparam_number_of_hidden_layers'], pref, size, defaults)
            result += `<div id="${pref}hidden_layers_div">`
            // todo should probably be pulled from somewhere
            result += generate_count_fields(1, 'hparam_hidden_layer_size', pref, size, defaults)
            result += `</div>`
            
            // optimizer, loss, use-trainable-embedding
            remfields = ["hparam_optimizer", "hparam_optimizer_sgdvalue","hparam_loss","hparam_use_trainable_embedding"]
            remfields.forEach(field => {
                result += render_field(data[field], pref, size, defaults)
            })
            break;
        case "LinearConv1Model":
            fields = ["hparam_fully_connected_layer_size", "hparam_filters", "hparam_number_of_convolutions"]
            fields.forEach(field => {
                result += render_field(data[field], pref, size, defaults)
            })
            result += `<div id="${pref}convolutions_div">`
            result += generate_count_fields(1, 'hparam_kernel_size', pref, size, defaults)
            result += `</div>`

            // optimizer, loss, use-trainable-embedding
            remfields = ["hparam_optimizer", "hparam_optimizer_sgdvalue","hparam_loss","hparam_use_trainable_embedding"]
            remfields.forEach(field => {
                result += render_field(data[field], pref, size, defaults)
            })
            break;
        case "LinearRNNModel":
            fields = ["hparam_bidirectional_layer_size", "hparam_number_of_hidden_layers_rnn"]
            fields.forEach(field => {
                result += render_field(data[field], prefix, size, defaults)
            })
            result += `<div id="${prefix}hidden_layers_div">`
            hidden_layer_size_config = deep_copy(data['hparam_hidden_layer_size'])
            hidden_layer_size_config['label'] += ' 1'
            result += render_field(hidden_layer_size_config, prefix, size, defaults)
            result += `</div>`

            // optimizer, loss, use-trainable-embedding
            remfields = ["hparam_optimizer", "hparam_optimizer_sgdvalue","hparam_loss","hparam_use_trainable_embedding"]
            remfields.forEach(field => {
                result += render_field(data[field], prefix, size, defaults)
            })
            break;
        case "Bert":
            // optimizer, loss
            remfields = ["hparam_optimizer", "hparam_optimizer_sgdvalue","hparam_loss"]
            remfields.forEach(field => {
                result += render_field(data[field], pref, size, defaults)
            })
            break;
    }
    return result
}

function get_params_for(inmode, prefix, size, defaults) {
    result = ""

    const params_per_inmode = {
        "Word2Vec1D": [
            "param_vector_length",
            "param_min_count",
            "param_max_len",
            "param_disable_lowercase",
            "param_disable_stopwords",
            "param_use_stemming",
            "param_use_lemmatization",
            "param_use_pos",
            "param_class_limit"
        ],
        "Doc2Vec": [
            "param_vector_length",
            "param_max_len",
            "param_disable_lowercase",
            "param_disable_stopwords",
            "param_use_stemming",
            "param_use_lemmatization",
            "param_use_pos",
            "param_class_limit"
        ],
        "BOWFrequency": [
            "param_min_doc_count",
            "param_max_len",
            "param_disable_lowercase",
            "param_disable_stopwords",
            "param_use_stemming",
            "param_use_lemmatization",
            "param_use_pos",
            "param_class_limit"
        ],
        "BOWNormalized": [
            "param_min_doc_count",
            "param_max_len",
            "param_disable_lowercase",
            "param_disable_stopwords",
            "param_use_stemming",
            "param_use_lemmatization",
            "param_use_pos",
            "param_class_limit"
        ],
        "Bert": [
            "param_max_len",
            "param_disable_lowercase",
            "param_disable_stopwords",
            "param_use_stemming",
            "param_use_lemmatization",
            "param_use_pos",
            "param_class_limit"
        ],
        "TfidfGenerator": [
            "param_max_len",
            "param_disable_lowercase",
            "param_disable_stopwords",
            "param_use_stemming",
            "param_use_lemmatization",
            "param_use_pos",
            "param_class_limit"
        ],
        "Metadata": [
            "param_max_len",
            "param_disable_lowercase",
            "param_disable_stopwords",
            "param_use_stemming",
            "param_use_lemmatization",
            "param_use_pos",
            "param_class_limit"
        ],
        "OntologyFeatures": [
            "param_max_len",
            "param_disable_lowercase",
            "param_disable_stopwords",
            "param_use_stemming",
            "param_use_lemmatization",
            "param_use_pos",
            "param_class_limit"
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

// tab generators
function generate_tab_general(defaults, data) {
    const fields = [
        "gen_model_name",
        "gen_output_mode",
        "gen_model_mode",
        "gen_combination_strategy"
    ]

    result = ""
    fields.forEach(field => {
        result += render_field(data[field], "gen_", defaults)
    })
    return result
}

function generate_tab_prepro(defaults, data) {
    return generate_inmode("single_", "small", defaults)
}

function generate_tab_classifier(defaults, data) {
    return generate_classifier("single_", "small", defaults)
}

function generate_tab_training(defaults, data) {
    const fields = [
        "train_epochs",
        "train_split_size",
        "train_max_train",
        "train_apply_ontology_classes",
        "train_architectural_only",
        "train_class_balancer",
        "train_batch_size",
        "train_use_early_stopping"
    ]
    const early_stopping_fields = [
        "train_early_stopping_patience",
        "train_early_stopping_min_delta",
        "train_early_stopping_attribute"
    ]

    result = ""
    fields.forEach(field => {
        result += render_field(data[field], "train_", defaults)
    })
    result += "<div id=\"train_early_stopping_div\">"
    early_stopping_fields.forEach(field => {
        result += render_field(data[field], "train_", defaults)
    })
    result += "</div>"

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
    classifier_config['options'] = ["FullyConnectedModel"]
    result += render_field(classifier_config, "stacker_", "small", defaults)
    result += `<hr />`

    
    result += `<div id="stacker_hparams_div">`
    result += get_hparams_for("FullyConnectedModel", "stacker_", "small", defaults)
    result += `</div>`
    return result
}

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