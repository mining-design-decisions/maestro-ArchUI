from matplotlib import pyplot as plt
import numpy
import json
import matplotlib.patches as mpatches

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

    values_condensed = {
        "resolution": {
            "Fixed": ["fixed", "implemented", "done", "resolved", "delivered", "rxplained", "information provided"],
            "Won't Do": ["none", "invalid", "won't fix", "not a problem", "won't do", "not a bug", "auto closed", "works for me", "workaround", "abandoned", "out of date", "obsolete", "rejected"],
            "Duplicate": ["duplicate", "duplicate issue"],
            "Deferred": ["later", "deferred"],
            "Incomplete Data": ["cannot reproduce", "incomplete", "incomplete description"],
            "In Progress": ["pending closed", "partially completed"]
        }
    }

    result = {}
    for issue in raw:
        char = str(raw[issue][characteristic])
        if characteristic in values_condensed:
            for new_val in values_condensed[characteristic]:
                if char.lower() in values_condensed[characteristic][new_val]:
                    char = new_val
                    break
        
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

with open('config.json') as f:
    file = json.load(f)
    colors = file['colors']
    hatches = file['hatches']

xticks = []
for j in range(0, len(x_labels)):
    for i in range(0, len(domains)):
        xticks.append((j+1) - 0.3 + i * (0.6/(len(domains)-1)))
widths = 0.6 / len(domains) - 0.05

def bar_charts():
    bar_characs = ['type', 'resolution', 'hierarchy', 'status']
    
    for charac in bar_characs:
        fig, ax = plt.subplots()
        # for dom in domains:
        legend_colors = {}
        legend_hatches = {}
        for k in range(0, len(domains)):
            dom = domains[k]
            bottoms = [0 for _ in x_labels]
            data = get_simple_bar_data(dom, charac, 'manual')
            # for this_char in data:
            this_chars = list(data.keys())
            for j in range(0, len(this_chars)):
                this_char = this_chars[j]
                labels = list(data[this_char].keys())
                if len(labels) == 0:
                    continue
                
                for i in range(0, len(x_labels)):
                    this_label = x_labels[i]
                    count = 0
                    if this_label in data[this_char]:
                        count = data[this_char][this_label]
                    ax.bar(x=(i+1) - 0.3 + k* (0.6 / (len(domains) - 1)), height=count, width=widths, label=this_label, bottom=bottoms[i], hatch=hatches[k], color=colors[j], edgecolor="black")
                    legend_colors[this_char] = colors[j]
                    legend_hatches[domains[k]] = hatches[k]
                    bottoms[i] += count

        handles = [mpatches.Patch(facecolor=legend_colors[this_char], edgecolor='black', label=this_char) for this_char in legend_colors]
        handles.extend([mpatches.Patch(facecolor='white', edgecolor='black', hatch=legend_hatches[this_dom], label=this_dom) for this_dom in legend_hatches])

        ax.legend(handles=handles)

        ax.set_ylabel('Issue Count')
        ax.set_xlabel('Per manual decision type')
        plt.xticks([x+1 for x in range(0, len(x_labels))], x_labels)
        plt.title(f"Manual Label Distribution for Issue Characteristic {charac}")
        plt.savefig(f"figures/bar_{charac}.png")
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

        to_plot_arranged = []
        for j in range(0, len(x_labels)):
            for i in range(0, len(domains)):
                to_plot_arranged.append(to_plot[domains[i]][j])

        bp = ax.boxplot(to_plot_arranged, positions=xticks, widths=widths)

        for j in range(0, len(x_labels)):
            for i in range(0, len(domains)):
                this_idx = j*len(domains) + i
                plt.setp(bp['boxes'][this_idx], color=colors[i])
                plt.setp(bp['medians'][this_idx], color=colors[i])
                
                plt.setp(bp['caps'][this_idx*2], color=colors[i])
                plt.setp(bp['caps'][this_idx*2+1], color=colors[i])
                
                plt.setp(bp['whiskers'][this_idx*2], color=colors[i])
                plt.setp(bp['whiskers'][this_idx*2+1], color=colors[i])
                
                if len(bp['fliers']) == 2*len(bp['boxes']):
                    plt.setp(bp['fliers'][this_idx*2], color=colors[i])
                    plt.setp(bp['fliers'][this_idx*2+1], color=colors[i])

        plt.xticks([x+1 for x in range(0, len(x_labels))], x_labels)
        ax.set_ylabel(charac)
        ax.set_xlabel('Per manual decision type')

        colours = []
        for i in range(0, len(domains)):
            col, = plt.plot([1,1], colors[i])
            colours.append((col, domains[i]))
        cols, doms = zip(*colours)
        plt.legend(cols, doms)
        for col in cols:
            col.set_visible(False)

        plt.title(f"Manual Label Distribution for Issue Characteristic {charac}")
        plt.savefig(f"figures/box_{charac}.png")
        plt.close()

bar_charts()
box_charts()