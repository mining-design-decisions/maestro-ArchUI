from app.data import search as search_data

def get_issue_data_label(issue_id):
    data = search_data.get_single_issue_data(issue_id)
    labels = []
    unclassified = False
    for label in ['existence', 'executive', 'property']:
        if data['manual_label'][label] is None:
            unclassified = True
            break
        if data['manual_label'][label]:
            labels.append(label.title())
    if unclassified:
        labels=["Not Manually Classified"]
    if len(labels) == 0:
        labels=["Non-Architectural"]
    return data, labels