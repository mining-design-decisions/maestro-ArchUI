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
domains = ["Data storage and analysis", "Middleware"]
dom_colors = ["blue", "red"]

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
        to_plot = {}
        fig, ax = plt.subplots()
        for dom in domains:
            to_plot[dom] = []

            data = get_simple_box_data(dom, charac, 'manual')

            for i in range(0, len(x_labels)):
                counts = []
                if x_labels[i] in data:
                    counts = data[x_labels[i]]
                to_plot[dom].append(counts)

        xticks = []
        to_plot_arranged = []
        for j in range(0, len(x_labels)):
            for i in range(0, len(domains)):
                xticks.append((j+1) - 0.4 + i * (0.8/(len(domains)-1)))
                to_plot_arranged.append(to_plot[domains[i]][j])

        bp = ax.boxplot(to_plot_arranged, positions=xticks, widths=0.8 / len(domains) - 0.05)

        for j in range(0, len(x_labels)):
            for i in range(0, len(domains)):
                this_idx = j*len(domains) + i
                plt.setp(bp['boxes'][this_idx], color=dom_colors[i])
                plt.setp(bp['medians'][this_idx], color=dom_colors[i])
                
                plt.setp(bp['caps'][this_idx*2], color=dom_colors[i])
                plt.setp(bp['caps'][this_idx*2+1], color=dom_colors[i])
                
                plt.setp(bp['whiskers'][this_idx*2], color=dom_colors[i])
                plt.setp(bp['whiskers'][this_idx*2+1], color=dom_colors[i])
                
                if len(bp['fliers']) == 2*len(bp['boxes']):
                    plt.setp(bp['fliers'][this_idx*2], color=dom_colors[i])
                    plt.setp(bp['fliers'][this_idx*2+1], color=dom_colors[i])

        plt.xticks([x+1 for x in range(0, len(x_labels))], x_labels)
        ax.set_ylabel('Issue Count')
        ax.set_xlabel('Per manual decision type')
        plt.title(f"Manual Label Distribution for Issue Characteristic {charac}")
        plt.savefig(f"figures/box_{charac}.png")
        plt.close()

box_charts()