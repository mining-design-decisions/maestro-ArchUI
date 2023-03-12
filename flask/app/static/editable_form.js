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


function generate_hparam_html(hp, prefix="", size="small", defaults={}) {
    new_html = ''
    col_a = "sm-2"
    col_b = "sm-10"
    if (size == "large") {
        col_a = "sm-4"
        col_b = "sm-8"
    }

    hp.forEach(hparam => {
        tooltip = `[min, max] = [${hparam.min}, ${hparam.max}] -- default = ${hparam.default}`
        new_html += '<div class="form-group row">\n'

        switch(hparam.name) {
            case 'loss':
                new_html += render_field_select(col_a, col_b, tooltip, prefix+'hparam_', hparam.name, ['crossentropy','hinge'], defaults)
                break;

            case 'optimizer':
                // cannot generalize this in existing functions, too specific (as of right now)
                new_html += `<label class="col-${col_a} col-form-label" title="${tooltip}" for="${prefix}hparam_${hparam.name}">${hparam.name} </label>\n`
                new_html += `<div class="col-${col_b}">`
                new_html += `<select title="${tooltip}" name="${prefix}hparam_${hparam.name}" id="${prefix}hparam_${hparam.name}" onchange="optimizerChange('${prefix}')">\n`
                options = ['adam', 'sgd']

                default_option = ''
                if (`${prefix}hparam_${hparam.name}` in defaults) {
                    default_option = defaults[`${prefix}hparam_${hparam.name}`]
                }

                options.forEach(option => {
                    select_str = ''
                    if (option == default_option) {
                        select_str = 'selected'
                    }
                    new_html += `<option value="${option}" ${select_str}>${option}</option>\n`
                })
                new_html += `</select>\n`
                new_html += '</div></div>\n'

                // need to allow users to input a float for the sgd
                new_html += `<div class='d-none' id='${prefix}hparam_optimizer_sgd_container'>\n`
                new_html += `<div class='form-group row'>\n`
                // got below from https://keras.io/api/optimizers/sgd/
                tooltip = "Float hyperparameter >= 0 that accelerates gradient descent in the relevant direction and dampens oscillations. Defaults to 0, i.e., vanilla gradient descent."
                name = `hparam_optimizer_sgdvalue`
                new_html += `<label class="col-${col_a} col-form-label ps-4" title="${tooltip}" for="${prefix}${name}">SGD Momentum</label>\n`
                new_html += `<div class="col-${col_b}">`

                default_val = '0.0'
                if (`${prefix}${name}` in defaults) {
                    default_val = defaults[`${prefix}${name}`]
                }

                new_html += `<input title="${tooltip}" type="number" size="10" name="${prefix}${name}" id="${prefix}${name}" value="${default_val}" step=any>\n`
                new_html += `</div></div>\n`
                new_html += `</div>\n`
                break;

            default:
                switch(hparam.type) {
                    case 'str':
                        new_html += render_field_str(col_a, col_b, tooltip, prefix+'hparam_', hparam.name, defaults)
                        break;
                    case 'int':
                        new_html += render_field_int(col_a, col_b, tooltip, prefix+'hparam_', hparam.name, defaults)
                        break;
                    case 'bool':
                        new_html += render_field_bool(col_a, col_b, tooltip, prefix+'hparam_', hparam.name, defaults)
                        break;
                    default:
                        console.log('ERROR: unhandled type: ' + hparam.type)
                        break;
                }
                new_html += '</div>\n'
                break;
        }
    });
    return new_html
}

function generate_inmode_param_html(params, prefix="", size="small", defaults={}) {
    col_a = "sm-2"
    col_b = "sm-10"
    if (size == "large") {
        col_a = "sm-4"
        col_b = "sm-8"
    }

    result = ''
    use_stemming_lemma = false
    params.forEach(param => {
        // can't support pretrained anything with --store-model/--force-regenerate-etc forced on
        if (param.name.startsWith('pretrained-')) 
            return; 

        // cannot use these two at the same time, make a special case for them
        switch (param.name) {
            case 'use-stemming':
            case 'use-lemmatization':
                use_stemming_lemma = true;
                return
        }
            
        result += '<div class="form-group row">\n'
        switch(param.type) {
            case 'str':
                result += render_field_str(col_a, col_b, param.desc, prefix+'param_', param.name, defaults)
                break;
            case 'int':
                result += render_field_int(col_a, col_b, param.desc, prefix+'param_', param.name, defaults)
                break;
            case 'bool':
                result += render_field_bool(col_a, col_b, param.desc, prefix+'param_', param.name, defaults)
                break;
            default:
                console.log('ERROR: unhandled type: ' + param.type)
        }
        result += '</div>\n'
    })
    
    if (use_stemming_lemma) {
        // cannot generalize
        tooltip = "Stem the words in the text, use lemmatization on them, or neither."
        result += '<div class="form-group row">\n'
        result += render_field_select(col_a, col_b, tooltip, '', `${prefix}param_stemming_lemma`, ["", "Stemming", "Lemmatization"], defaults, specific_label='Stemming or Lemmatization')
    }
    
    return result
}

// --------------------------
// new functions start here!!
// --------------------------
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
function render_field_select(css_label, css_input, tooltip, name, options, defaults, label, extra_attr, field_default) {
    default_option = ''
    if (`${name}` in defaults) {
        default_option = defaults[`${name}`]
    }
    else if (field_default) {
        default_option = field_default
    }

    new_html = `<label class="${css_label}" title="${tooltip}" for="${name}">${label} </label>\n`
    new_html += `<div class="${css_input}">`
    new_html += `<select title="${tooltip}" name="${name}" id="${name}" ${extra_attr}>\n`
    options.forEach(option => {
        selected = ''
        if (option == default_option)
            selected = 'selected'
        new_html += `<option value="${option}" ${selected}>${option}</option>\n`
    })
    new_html += `</select>\n`
    new_html += '</div></div>\n'
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
    
    if ("extra" in field_config) {
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

// subtab generators
function generate_classifier(prefix="", size="small", defaults={}) {
    // todo
    return ""
}
function generate_inmode(prefix="", size="small", defaults={}) {
    // todo
    return ""
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
    return generate_inmode("prepro_", "large", defaults)
}

function generate_tab_classifier(defaults, data) {
    return generate_classifier("class_", "large", defaults)
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

function generate_tab_ensemble(defaults, data) {
    // todo
    return ""
}

function generate_tab_stacker(defaults, data) {
    // todo
    return ""
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
