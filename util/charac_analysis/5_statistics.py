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

def get_simple_box_data(domain, characteristic, decisiontype):
    with open(f"manual/{domain}.json") as f:
        raw = json.load(f)
    result = {}
    for issue in raw:
        char = raw[issue][characteristic] # number data

        label = get_label_str(decisiontype, raw[issue])
        if label is not None:
            for tag in label:
                if tag not in result:
                    result[tag] = []
                result[tag].append(char)
    return result

x_labels = ["Non-Arch.", 'Exis.', 'Exec.', 'Prop.']

def bar_charts():
    # domains = ['data', 'SOA']
    # characteristics = ['type', 'resolution', 'status', 'description size', 'duration', 'hierarchy', 'comment avg size', 'comment count']

    bar_characs = ['type', 'resolution', 'hierarchy', 'status']

    for charac in bar_characs:
        data = get_simple_bar_data('data', charac, 'manual')
        for this_char in data:

            labels = list(data[this_char].keys())
            if len(labels) > 0:
                fig, ax = plt.subplots()
                for i in range(0, len(x_labels)):
                    this_label = x_labels[i]
                    count = 0
                    if this_label in data[this_char]:
                        count = data[this_char][this_label]
                    ax.bar(i, count, 0.7, label=this_label)

                ax.set_ylabel('Issue Count')
                ax.set_xlabel('Per manual decision type')
                plt.xticks(range(0, len(x_labels)), x_labels)
                plt.title(f"Manual Label Distribution for Issue Characteristic {charac}: {this_char}")
                plt.savefig(f"figures/bar_{charac}_{this_char}.png")
                plt.close()

def box_charts():
    box_characs = ["description size", "duration", "comment avg size", "comment count"]

    for charac in box_characs:
        data = get_simple_box_data('data', charac, 'manual')

        fig, ax = plt.subplots()
        to_plot = []
        for i in range(0, len(x_labels)):
            counts = []
            if x_labels[i] in data:
                counts = data[x_labels[i]]
            to_plot.append(counts)
        ax.boxplot(to_plot)
        plt.xticks([x+1 for x in range(0, len(x_labels))], x_labels)
        ax.set_ylabel('Issue Count')
        ax.set_xlabel('Per manual decision type')
        plt.title(f"Manual Label Distribution for Issue Characteristic {charac}")
        plt.savefig(f"figures/box_{charac}.png")
        plt.close()
    pass

box_charts()