from jira import JIRA
import nltk
import gensim


APACHE_JIRA_SERVER = 'https://issues.apache.org/jira/'

# -- Getting issue data from Jira
def _get_issue_var(fields, path, field_type):
    value = fields
    for step in path:
        if not hasattr(value, step):
            value = None
            break
        value = getattr(value, step)

    if value is None:
        if field_type is bool or field_type is int:
            return 0
        if field_type is list:
            return []
        if field_type is str:
            return ''
    if field_type is bool:
        return 1
    if field_type is list:
        if path == ['issuelinks'] or path == ['labels'] or path == ['subtasks']:
            return value
        return [item.name for item in value]
    return value

def _get_detailed_issues_for(project: str):
    fields = 'key, parent, summary, description, ' \
             'attachment, comment, issuelinks, ' \
             'issuetype, labels, priority, ' \
             'resolution, status, subtasks, ' \
             'votes, watches, components'
    limit = 100

    # jira = JIRA(APACHE_JIRA_SERVER, basic_auth=(config.username, config.password))
    jira = JIRA(APACHE_JIRA_SERVER) # no auth because no account? todo

    issues = []
    raw = jira.search_issues(f'project={project} order by key desc', maxResults=limit, fields=fields)
    while len(raw) > 0:
        issues.extend(raw)
        raw = jira.search_issues(f'project={project} and key < {issues[-1]} order by key desc', maxResults=limit, fields=fields)

    json_issues = []

    for issue in issues:
        fields = issue.fields

        comments = []
        if hasattr(fields, 'comment') and  fields.comment is not None:
            comments = [comment.body for comment in fields.comment.comments]

        attachments = []
        if hasattr(fields, 'attachment') and fields.attachment is not None:
            attachments = len(fields.attachment)

        
        dictionary = {
            'key': issue.key,
            'n_attachments': attachments,
            'n_comments': len(comments),
            'comments': comments,
            'n_components': len(_get_issue_var(fields, ['components'], list)),
            'components': _get_issue_var(fields, ['components'], list),
            'description': _get_issue_var(fields, ['description'], str),
            'n_issuelinks': len(_get_issue_var(fields, ['issuelinks'], list)),
            'issuetype': _get_issue_var(fields, ['issuetype', 'name'], str),
            'n_labels': len(_get_issue_var(fields, ['labels'], list)),
            'labels': _get_issue_var(fields, ['labels'], list),
            'parent': _get_issue_var(fields, ['parent'], bool),
            'priority': _get_issue_var(fields, ['priority', 'name'], str),
            'resolution': _get_issue_var(fields, ['resolution', 'name'], str),
            'status': _get_issue_var(fields, ['status', 'name'], str),
            'n_subtasks': len(_get_issue_var(fields, ['subtasks'], list)),
            'summary': _get_issue_var(fields, ['summary'], str),
            'n_votes': _get_issue_var(fields, ['votes', 'votes'], int),
            'n_watches': _get_issue_var(fields, ['watches', 'watchCount'], int),
        }
        json_issues.append(dictionary)

    return json_issues


# -- Formatting issue data for ML
from app.ml_link import remove_formatting, fix_punctuation, FormattingHandling

def _clean_issue_text(text: str, key: str, formatting_handling) -> list[str]:
    text = fix_punctuation(remove_formatting(text, key, formatting_handling))
    sentences = nltk.tokenize.sent_tokenize(text)
    return [f"{' '.join(gensim.utils.tokenize(sent))}" for sent in sentences]

def _get_encodings(issues, keys):
    encodings = {}
    for key in keys:
        values = []
        for issue in issues:
            if type(issue[key]) is list:
                for value in issue[key]:
                    values.append(value)
            else:
                values.append(issue[key])
        value_to_idx = {}
        idx = 0
        for value in values:
            if value not in value_to_idx.keys():
                value_to_idx[value] = idx
                idx += 1
        encodings[key] = value_to_idx
    return encodings

def _format_issues(issues, labels):
    encoded_labels = ['components', 'issuetype', 'labels', 'priority', 'resolution', 'status']
    encodings = _get_encodings(issues, encoded_labels)

    formatted_issues = []
    for raw_issue in issues:
        issue = {
            'key': raw_issue['key'],
            'summary': _clean_issue_text(raw_issue['summary'], raw_issue['key'], FormattingHandling.Markers),
            'description': _clean_issue_text(raw_issue['description'], raw_issue['key'], FormattingHandling.Markers),
            'study': 'ArchUI'
        }

        comments_len = 0
        for comment in raw_issue['comments']:
            comments_len += len(remove_formatting(str(comment), issue['key'], FormattingHandling.Markers).split())
        summary_len = len(remove_formatting(raw_issue['summary'], issue['key'], FormattingHandling.Markers).split())
        description_len = len(remove_formatting(raw_issue['description'], issue['key'], FormattingHandling.Markers).split())

        metadata = {
            'n_attachments': [raw_issue['n_attachments']],
            'n_comments': [raw_issue['n_comments']],
            'len_comments': [comments_len],
            'n_components': [raw_issue['n_components']],
            'len_description': [description_len],
            'n_issuelinks': [raw_issue['n_issuelinks']],
            'n_labels': [raw_issue['n_labels']],
            'parent': [raw_issue['parent']],
            'n_subtasks': [raw_issue['n_subtasks']],
            'len_summary': [summary_len],
            'n_votes': [raw_issue['n_votes']],
            'n_watches': [raw_issue['n_watches']]
        }

        for key in encoded_labels:
            value_to_idx = encodings[key]
            vector = [0] * len(value_to_idx.keys())
            if type(raw_issue[key]) is list:
                for value in raw_issue[key]:
                    idx = value_to_idx[value]
                    vector[idx] = 1
            else:
                idx = value_to_idx[raw_issue[key]]
                vector[idx] = 1
            metadata[key] = vector

        issue['metadata'] = metadata

        formatted_issues.append(issue)

    # append labels & return
    label_dict = {}
    for label in labels:
        label_dict[label['key']] = label

    empty_label = {
        "is-design": False,
        "is-cat1": {
        "name": "Existence",
        "value": False
        },
        "is-cat2": {
        "name": "Executive",
        "value": False
        },
        "is-cat3": {
        "name": "Property",
        "value": False
        }
    }
    
    for issue in formatted_issues:
        if issue['key'] in label_dict:
            issue |= label_dict[issue['key']]
        else:
            issue |= empty_label # to not mess up the DL code?

    return formatted_issues


# -- Main function of this file
# Structure of labels list:
"""
[
    {
        "key": str,
        "is-design": bool,
        "is_cat1": {
            "name": str, # Existence, Executive, Property
            "value": bool
        },
        "is_cat2": {
            "name": str, # Existence, Executive, Property
            "value": bool
        },
        "is_cat3": {
            "name": str, # Existence, Executive, Property
            "value": bool
        }
    }
]
"""
# The labels are OPTIONAL! Provide them to generate a TRAINING FILE
# and do not provide them to generate a PREDICTION TASK FILE
def load_issues_for(project: str, labels = []):
    issues = _get_detailed_issues_for(project)
    return _format_issues(issues, labels)
