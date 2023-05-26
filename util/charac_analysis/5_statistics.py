from matplotlib import pyplot as plt
import numpy
import json

def get_label_str(decisiontype, issue):
    types = {
        "existence": "Exis.",
        "executive": "Exec.",
        "property": "Prop."
    }
    result = []
    if decisiontype == 'manual':
        if issue['manual'] is None:
            return None
        for type in types:
            if issue['manual'][type]:
                result.append(types[type])
    elif decisiontype.split('.')[0] == 'model':
        model = decisiontype.split('.')[1]
        if not model in issue['models']:
            return ""
        if issue['models'][model] is None:
            return None
        for type in types:
            if issue['models'][model][type]:
                result.append(types[type])
    
    if len(result) == 0:
        result.append('Non-Arch.')

    # return ', '.join(result)
    return result

# data format: dic of label -> count
def get_simple_bar_data(domain, characteristic, decisiontype):
    with open(f"manual/{domain}.json") as f:
        raw = json.load(f)
    result = {}
    for issue in raw:
        char = str(raw[issue][characteristic])
        if not char in result:
            result[char] = {}
        label = get_label_str(decisiontype, raw[issue])
        if label is not None:
            for tag in label:
                if tag not in result[char]:
                    result[char][tag] = 0
                result[char][tag] += 1
    return result

def bar_charts():
    # domains = ['data', 'SOA']
    # characteristics = ['type', 'resolution', 'status', 'description size', 'duration', 'hierarchy', 'comment avg size', 'comment count']

    data = get_simple_bar_data('data', 'type', 'manual')
    for char in data:
        x_labels = ["Non-Arch.", 'Exis.', 'Exec.', 'Prop.']

        labels = list(data[char].keys())
        if len(labels) > 0:
            fig, ax = plt.subplots()
            for i in range(0, len(x_labels)):
                this_label = x_labels[i]
                count = 0
                if this_label in data[char]:
                    count = data[char][this_label]
                print(f"{char}-{this_label}: {count}")
                ax.bar(i, count, 0.7, label=this_label)

            ax.set_ylabel('Issue Count')
            ax.set_xlabel('Per manual decision type')
            plt.xticks(range(0, len(x_labels)), x_labels)
            plt.title(f"Manual Label Distribution for Issue Characteristic: {char}")
            plt.savefig(f"figures/simplebar_{char}.png")



bar_charts()