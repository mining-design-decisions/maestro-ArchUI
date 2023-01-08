function generate_hparam_html(hp, prefix="", size="small") {
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
                new_html += `<label class="col-${col_a}" col-form-label" title="${tooltip}" for="${prefix}hparam_${hparam.name}">${hparam.name} </label>\n`
                new_html += `<div class="col-${col_b}">`
                new_html += `<select title="${tooltip}" name="${prefix}hparam_${hparam.name}" id="${prefix}hparam_${hparam.name}">\n`
                options = ['crossentropy', 'hinge']
                options.forEach(option => {
                    new_html += `<option value="${option}">${option}</option>\n`
                })
                new_html += `</select>\n`
                new_html += '</div></div>\n'
                break;

            case 'optimizer':
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
                        new_html += `<label class="col-${col_a} col-form-label" title="${tooltip}" for="${prefix}hparam_${hparam.name}">${hparam.name} </label>\n`
                        new_html += `<div class="col-${col_b}">`
                        new_html += `<input title="${tooltip}" type="text" size="30" name="${prefix}hparam_${hparam.name}" id="${prefix}hparam_${hparam.name}">\n`
                        new_html += `</div>`
                        break;
                    case 'int':
                        new_html += `<label class="col-${col_a} col-form-label" title="${tooltip}" for="${prefix}hparam_${hparam.name}">${hparam.name} </label>\n`
                        new_html += `<div class="col-${col_b}">`
                        new_html += `<input title="${tooltip}" type="number" size="10" name="${prefix}hparam_${hparam.name}" id="${prefix}hparam_${hparam.name}">\n`
                        new_html += `</div>`
                        break;
                    case 'bool':
                        new_html += `<div class="col-${col_b} offset-${col_a}">`
                        new_html += `<input title="${tooltip}" type="checkbox" size="1" name="${prefix}hparam_${hparam.name}" id="${prefix}hparam_${hparam.name}">\n`
                        new_html += `<label title="${tooltip}" for="${prefix}hparam_${hparam.name}"> ${hparam.name}</label>\n`
                        new_html += `</div>`
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

function generate_inmode_param_html(params, prefix="", size="small") {
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
                result += `<label class="col-${col_a} col-form-label" title="${param.desc}" for="${prefix}param_${param.name}">${param.name} </label>\n`
                result += `<div class="col-${col_b}">`
                result += `<input title="${param.desc}" type="text" size="30" name="${prefix}param_${param.name}" id="${prefix}param_${param.name}">\n`
                result += `</div>`
                break;
            case 'int':
                result += `<label class="col-${col_a} col-form-label" title="${param.desc}" for="${prefix}param_${param.name}">${param.name} </label>\n`
                result += `<div class="col-${col_b}">`
                ending = ''
                if (param.name == 'vector-length') {
                    ending = ' required value=400'
                }
                result += `<input title="${param.desc}" type="number" size="10" name="${prefix}param_${param.name}" id="${prefix}param_${param.name}" ${ending}>\n`
                result += `</div>`
                break;
            case 'bool':
                result += `<div class="col-${col_b} offset-${col_a}">`
                result += `<input title="${param.desc}" type="checkbox" size="1" name="${prefix}param_${param.name}" id="${prefix}param_${param.name}">\n`
                result += `<label title="${param.desc}" for="${prefix}param_${param.name}"> ${param.name}</label>\n`
                result += `</div>`
                break;
            default:
                console.log('ERROR: unhandled type: ' + param.type)
        }
        result += '</div>\n'
    })
    
    if (use_stemming_lemma) {
        tooltip = "Stem the words in the text, use lemmatization on them, or neither."
        name = `${prefix}param_stemming_lemma`
        result += '<div class="form-group row">\n'
        result += `<label class="col-${col_a} col-form-label" title="${tooltip}" for="${name}">Stemming or Lemmatization </label>\n`
        result += `<div class="col-${col_b}">`
        result += `<select title="${tooltip}" id="${name}" name="${name}">`
        options = ["", "Stemming", "Lemmatization"]
        options.forEach(option => {
            result += `<option value="${option}">${option}</option>`
        })
        result += `</select>`
        result += `</div>`
        result += '</div>\n'
    }
    
    return result
}