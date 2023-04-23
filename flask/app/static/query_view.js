function getPageLink(i, pageLimit, title, thisPage, disabled=false) {
    if (i != null) {
        link = `/classify/view/{{query}}/${i}?page_limit=${pageLimit}`
        sort = '{{sort if sort else null}}'
        sort_asc = '{{sort_asc if sort_asc else "false" }}'
        if (sort !== '') link += `&sort=${sort}`
        if (sort_asc !== '') link += `&sort_asc=${sort_asc.toLowerCase()}`

        return `<li class="page-item ${(i == thisPage)? 'active' : (disabled? 'disabled' : '')}"><a class="page-link" href="${link}">${title}</a></li>`
    }
    else {
        return `<li class="page-item disabled"><a class="page-link" href="#">...</a></li>`
    }
}
function max(a, b) {
    return a > b ? a : b
}
function min(a, b) {
    return a > b ? b : a
}

function getPaginationHtml(thisPage, pageLimit, total) {
    new_html = ""
    if (total <= 10) {
        // just display all
        new_html += getPageLink(thisPage-1, pageLimit, 'Previous', thisPage, thisPage == 1)
        for (i = 0; i < total; i++) {
            new_html += getPageLink(i+1, pageLimit, i+1, thisPage)
        }
        new_html += getPageLink(thisPage+1, pageLimit, 'Next', thisPage, thisPage == total)
    }
    else {
        // max: 5 or so
        min_i = max(1, thisPage-2)
        new_html += getPageLink(1, pageLimit, 'First', thisPage, min_i <= 1)

        new_html += getPageLink(thisPage-1, pageLimit, 'Previous', thisPage, thisPage == 1)
        
        max_i = min(thisPage+2, total)
        
        if (min_i <= 2) max_i = min_i + 4
        if (max_i >= (total - 1)) min_i = max_i - 4

        for (i = min_i; i <= max_i; i++) {
            new_html += getPageLink(i, pageLimit, i, thisPage)
        }
        
        new_html += getPageLink(thisPage+1, pageLimit, 'Next', thisPage, thisPage == total)

        new_html += getPageLink(total, pageLimit, 'Last', thisPage, max >= (total-1))
    }
    return new_html
}

function getCommentDataHtml(data) {
    result = ""
    Object.keys(data).forEach(comment_id => {
        comment_obj = data[comment_id]
        author = comment_obj.author
        text = comment_obj.comment.replaceAll('\n', '<br />')

        new_html = `<p><b>${author}</b>:</p><p id="comment_${comment_id}_text">${text}</p>`
        if (thisuser === author) {
            new_html += "<div class='row my-2'>"
            new_html += `<button type="button" class="btn btn-danger col-sm mx-2" onclick="deleteComment('${comment_id}')">Delete</button>`
            new_html += `<button type="button" class="btn btn-secondary col-sm mx-2" onclick="editComment('${comment_id}')">Edit</button>`
            new_html += "</div>"
        }
        new_html = `<div id='comment_${comment_id}'>${new_html}</div><hr />`

        result += new_html
    });
    return result
}

function resizeCommentbox(textarea_element) {
    textarea = textarea_element[0]
    textarea.style.height = 0
    textarea.style.height = textarea.scrollHeight + "px"
}

function alertDbError(response) {
    str = `Something went wrong while processing your request: DB API returned code ${response.status}.`
    if (response.status == 401)
        str += " Double-check if you're logged in correctly!"
    response.json().then(data => {
        str += "\n\nResponse body:\n"
        str += JSON.stringify(data)
        alert(str)
    })
    .catch(e => {
        alert(str)
    })
}