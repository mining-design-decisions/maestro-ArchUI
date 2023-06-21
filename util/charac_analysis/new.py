from matplotlib import pyplot as plt
import numpy
import json
import matplotlib.patches as mpatches
import requests
from datetime import datetime

# load settings
with open('config.json') as f:
    rawfile = json.load(f)
    colors = rawfile['colors']
    hatches = rawfile['hatches']
    database = rawfile['database']
    domains = rawfile['domains']
    split_nonarch = rawfile['split_nonarch']
    keep_format = rawfile['include formatting and stopwords']
    widths = 0.6 / len(domains) - 0.05

def count_words(str):
    if keep_format:
        return len(str.split())
    else:
        from nltk.corpus import stopwords
        stop = set(stopwords.words('english'))
        return len([x for x in str.lower().split() if x not in stop])

def avg_len(list_of_str):
    sum = 0
    for str in list_of_str:
        sum += count_words(str)
    return float(sum) / len(list_of_str)

def get_duration(issue_dic):
    datetime_format = "%Y-%m-%dT%H:%M:%S.%f%z" # https://docs.python.org/3/library/datetime.html#strftime-and-strptime-format-codes
    if not 'created' in issue_dic:
        return None
    created_dt = datetime.strptime(issue_dic['created'], datetime_format)
    del issue_dic['created']
    if 'resolutiondate' in issue_dic and issue_dic['resolutiondate'] is not None:
        resolved_dt = datetime.strptime(issue_dic['resolutiondate'], datetime_format)
        del issue_dic['resolutiondate']
    else:
        return None
    return (resolved_dt - created_dt).days

def get_domain_data(domain):
    x = requests.get(database+"/projects", verify=False)
    if x.status_code != 200:
        print(x.json())
        return None
    projects = x.json()
    domain_tags = []
    for p in projects:
        if 'merged_domain' in p['additional_properties']:
            if domain.lower() in p['additional_properties']['merged_domain']:
                domain_tags.append(f"{p['ecosystem']}-{p['key']}")
    
    x = requests.get(database+"/issue-ids", json={"filter": {"$or": [{"tags": {"$eq": tag}} for tag in domain_tags]}}, verify=False)
    if x.status_code != 200:
        print(x.json())
        return None
    issue_ids = x.json()

    x = requests.get(database+"/statistics", json=issue_ids, verify=False)
    if x.status_code != 200:
        print(x.json())
        return None
    statistics = x.json()
    
    children = []

    for issue in statistics:
        # description size
        statistics[issue]['description size'] = count_words(statistics[issue]['description']) if 'description' in statistics[issue] else 0
        if 'description' in statistics[issue]:
            del statistics[issue]['description']

        # comments
        statistics[issue]['comment count'] = len(statistics[issue]['comments']) if 'comments' in statistics[issue] else 0
        statistics[issue]['comment avg size'] = 0 if statistics[issue]['comment count'] == 0 else avg_len(statistics[issue]['comments'])
        if 'comments' in statistics[issue]:
            del statistics[issue]['comments']

        # hierarchy step 1
        if 'hierarchy' in statistics[issue]:
            children.extend(statistics[issue]['hierarchy'])
        statistics[issue]['hierarchy'] = 'Parent' if 'hierarchy' in statistics[issue] and len(statistics[issue]['hierarchy']) > 0 else 'Independent'

        # duration
        statistics[issue]['duration'] = get_duration(statistics[issue])

    # hierarchy part 2
    for child in children:
        statistics[child]['hierarchy'] = "Child"
    print(domain)

    return statistics['data']

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

    return result

def get_simple_bar_data(data, characteristic, decisiontype):
    result = {}
    for issue in data:
        if characteristic not in data[issue]:
            continue
        char = str(data[issue][characteristic])
        
        if not char in result:
            result[char] = {}
        label = get_label_str(decisiontype, data[issue])
        if label is not None:
            for tag in label:
                if tag not in result[char]:
                    result[char][tag] = 0
                result[char][tag] += 1
    return result

def get_simple_box_data(data, characteristic, decisiontype):
    result = {}
    for issue in data:
        if characteristic not in data[issue]:
            continue
        char = data[issue][characteristic] # number data
        if char is not None:
            label = get_label_str(decisiontype, data[issue])
            if label is not None:
                for tag in label:
                    if tag not in result:
                        result[tag] = []
                    result[tag].append(char)
    return result

def bar_chart(characteristic, labeling, dom_data):
    if split_nonarch:
        x_labels = ['Exis.', 'Exec.', 'Prop.']
    else:
        x_labels = ["Non-Arch.", 'Exis.', 'Exec.', 'Prop.']

    fig, ax = plt.subplots()

    legend_colors = {}
    legend_hatches = {}

    for k in range(len(domains)):
        dom = domains[k]
        bottoms = [0 for _ in x_labels]
        data = get_simple_bar_data(dom_data[dom], characteristic, labeling)

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
    plt.title(f"Manual Label Distribution for Issue Characteristic {characteristic}")
    plt.savefig(f"figures/bar_{characteristic}.png")
    plt.close()

    # todo plot nonarch too?

def box_chart(characteristic, labeling, dom_data):
    if split_nonarch:
        x_labels = ['Exis.', 'Exec.', 'Prop.']
    else:
        x_labels = ["Non-Arch.", 'Exis.', 'Exec.', 'Prop.']

    xticks = []
    for j in range(0, len(x_labels)):
        for i in range(0, len(domains)):
            xticks.append((j+1) - 0.3 + i * (0.6/(len(domains)-1)))

    # todo cut off outliers past a certain point

    to_plot = {}
    fig, ax = plt.subplots()
    for dom in domains:
        to_plot[dom] = []

        data = get_simple_box_data(dom_data[dom], characteristic, labeling)

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
    ax.set_ylabel(characteristic)
    ax.set_xlabel('Per manual decision type')

    colours = []
    for i in range(0, len(domains)):
        col, = plt.plot([1,1], colors[i])
        colours.append((col, domains[i]))
    cols, doms = zip(*colours)
    plt.legend(cols, doms)
    for col in cols:
        col.set_visible(False)

    plt.title(f"{labeling.title()} Label Distribution for Issue Characteristic {characteristic}")
    plt.savefig(f"figures/box_{characteristic}.png")
    plt.close()

charac_to_type = {
    "description size": "box",
    "comment count": "box",
    "comment avg size": "box",
    "hierarchy": "bar",
    "duration": "box", #avoid counting the nulls they have meaning
    "issue_type": "bar",
    "num_attachments": "box",
    "num_pdf_attachments": "box",
    "resolution": "bar",
    "status": "bar",
    "votes": "box",
    "watches": "box"
}

def plot(charac, labeling, dom_data):
    if charac_to_type[charac] == 'box':
        box_chart(charac, labeling, dom_data)
    else:
        bar_chart(charac, labeling, dom_data)

dom_data = {}
complete = True
for dom in domains:
    dom_data[dom] = get_domain_data(dom)
    if dom_data[dom] is None:
        complete = False
        break
    break # todo remove

#with open('test.json', 'w') as f:
#    json.dump(dom_data, f)

if complete:
    plot('comment avg size', 'manual', dom_data)