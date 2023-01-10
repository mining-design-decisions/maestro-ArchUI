// helpers for below
function render_field_str(col_a, col_b, tooltip, prefix, name, defaults) {
    new_html = `<label class="col-${col_a} col-form-label" title="${tooltip}" for="${prefix}${name}">${name} </label>\n`
    new_html += `<div class="col-${col_b}">`
    new_html += `<input title="${tooltip}" type="text" size="30" name="${prefix}${name}" id="${prefix}${name}">\n`
    new_html += `</div>`
    return new_html
}
function render_field_int(col_a, col_b, tooltip, prefix, name, defaults) {
    new_html = `<label class="col-${col_a} col-form-label" title="${tooltip}" for="${prefix}${name}">${name} </label>\n`
    new_html += `<div class="col-${col_b}">`
    ending = ''
    if (name == 'vector-length') {
        ending = ' required value=400'
    }
    new_html += `<input title="${tooltip}" type="number" size="10" name="${prefix}${name}" id="${prefix}${name}" ${ending}>\n`
    new_html += `</div>`
    return new_html
}
function render_field_bool(col_a, col_b, tooltip, prefix, name, defaults) {
    new_html = `<div class="col-${col_b} offset-${col_a}">`
    new_html += `<input title="${tooltip}" type="checkbox" size="1" name="${prefix}${name}" id="${prefix}${name}">\n`
    new_html += `<label title="${tooltip}" for="${prefix}${name}"> ${name}</label>\n`
    new_html += `</div>`
    return new_html
}
function render_field_select(col_a, col_b, tooltip, prefix, name, options, defaults, specific_label=null) {
    label = name
    if (specific_label)  {
        label = specific_label
    }

    new_html = `<label class="col-${col_a}" col-form-label" title="${tooltip}" for="${prefix}${name}">${label} </label>\n`
    new_html += `<div class="col-${col_b}">`
    new_html += `<select title="${tooltip}" name="${prefix}${name}" id="${prefix}${name}">\n`
    options.forEach(option => {
        new_html += `<option value="${option}">${option}</option>\n`
    })
    new_html += `</select>\n`
    new_html += '</div></div>\n'
    return new_html
}


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
                options.forEach(option => {
                    new_html += `<option value="${option}">${option}</option>\n`
                })
                new_html += `</select>\n`
                new_html += '</div></div>\n'

                // need to allow users to input a float for the sgd
                new_html += `<div class='d-none' id='${prefix}hparam_optimizer_sgd_container'>\n`
                new_html += `<div class='form-group row'>\n`
                // got below from https://keras.io/api/optimizers/sgd/
                tooltip = "Float hyperparameter >= 0 that accelerates gradient descent in the relevant direction and dampens oscillations. Defaults to 0, i.e., vanilla gradient descent."
                name = "hparam_optimizer_sgdvalue"
                new_html += `<label class="col-${col_a} col-form-label ps-4" title="${tooltip}" for="${prefix}${name}">SGD Momentum</label>\n`
                new_html += `<div class="col-${col_b}">`
                new_html += `<input title="${tooltip}" type="number" size="10" name="${prefix}${name}" id="${prefix}${name}" value="0.0" step=any>\n`
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

// todo defaults!
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
