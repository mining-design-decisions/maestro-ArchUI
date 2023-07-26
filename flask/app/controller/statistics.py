import requests
from nltk.corpus import stopwords
from datetime import datetime
from matplotlib import pyplot as plt
import numpy
import json
import matplotlib.patches as mpatches

from app.data import statistics as stats_data
from app.data import login

stop = set(stopwords.words('english'))

label_models = {
    "bert round 2": {
        "model_id": "6415802db81129a9de0c4f77",
        "version_id": "641b35e5d9255e00b158f178"
    }
}
hatches = [
    "oo",
    "++",
    "OO",
    "xx",
    "..",
    "**",
    "//",
    "\\\\",
    "||",
    "--",
    "+o",
    "/O",
    "x*"
]
colors = [
    "tab:blue",
    "tab:orange",
    "tab:green",
    "tab:pink",
    "cyan",
    "tab:gray",
    "tab:brown",
    "tab:olive",
    "tab:purple",
    "blue",
    "gold",
    "gray",
    "coral"
]

def count_words(str, keep_format):
    if str is None:
        return 0
    if keep_format:
        return len(str.split())
    else:
        from nltk.corpus import stopwords
        stop = set(stopwords.words('english'))
        return len([x for x in str.lower().split() if x not in stop])

def avg_len(list_of_str, keep_format):
    sum = 0
    for str in list_of_str:
        sum += count_words(str, keep_format)
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

def get_domain_data(domain, labeling, keep_format, database):
    x = requests.get(database+"/projects", verify=False)
    if x.status_code != 200:
        print(x.status_code)
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
    statistics = x.json()['data']
    
    children = []

    for issue in statistics:
        # description size
        statistics[issue]['description size'] = count_words(statistics[issue]['description'], keep_format) if 'description' in statistics[issue] else 0
        if 'description' in statistics[issue]:
            del statistics[issue]['description']

        # comments
        statistics[issue]['comment count'] = len(statistics[issue]['comments']) if 'comments' in statistics[issue] else 0
        statistics[issue]['comment avg size'] = 0 if statistics[issue]['comment count'] == 0 else avg_len(statistics[issue]['comments'], keep_format)
        if 'comments' in statistics[issue]:
            del statistics[issue]['comments']

        # hierarchy step 1
        if 'hierarchy' in statistics[issue]:
            children.extend(statistics[issue]['hierarchy'])
        statistics[issue]['hierarchy'] = 'Parent' if 'hierarchy' in statistics[issue] and len(statistics[issue]['hierarchy']) > 0 else 'Independent'

        # duration
        statistics[issue]['duration'] = get_duration(statistics[issue])

        # status
        status_to_count = ["Closed", "Open", "Resolved", "In Progress", "Blocked", "Done","In Review", "Backlog"]
        if statistics[issue]['status'] not in status_to_count:
            statistics[issue]['status'] = None

        # resolution
        # todo find better reasoning about this
        resolution_to_count = ["fixed", "done", "won't fix", "duplicate", "resolved"]
        if statistics[issue]['resolution'] is not None:
            if statistics[issue]['status'] is None:
                statistics[issue]['resolution'] = None
            else:
                if (statistics[issue]['status'].lower() not in ['closed','resolved','done']) or (statistics[issue]['resolution'].lower() not in resolution_to_count):
                    statistics[issue]['resolution'] = None
                else:
                    statistics[issue]['resolution'] = statistics[issue]['resolution'].lower()

        # issue type
        # todo find better reasoning for this
        issue_type_to_count = ["Improvement", "Bug", "Task", "Sub-task", "New Feature", "Epic"]
        if statistics[issue]['issue_type'] not in issue_type_to_count:
            statistics[issue]['issue_type'] = None



    # hierarchy part 2
    for child in children:
        if child in statistics:
            statistics[child]['hierarchy'] = "Child"
    print(domain)

    # labeling
    if labeling == 'manual':
        x = requests.get(database+"/manual-labels", verify=False, json=issue_ids).json()
        if "detail" in x:
            opening = x['detail'].find('[')
            closing = x['detail'].find(']')
            cut = x['detail'][opening+1:closing].split(', ')
            issues_to_skip = [x[1:-1] for x in cut]
            has_manual_label_ids = issue_ids['issue_ids'].copy()
            for issue in issues_to_skip:
                has_manual_label_ids.remove(issue)
            x = requests.get(f"{database}/manual-labels", json={"issue_ids": has_manual_label_ids}, verify=False).json()

        labels = x['manual_labels']
        for issue in statistics:
            statistics[issue]['label'] = labels[issue] if issue in labels else None
    elif labeling.startswith('model.'):
        model_name = labeling[len('model.'):]
        model_data = label_models[model_name]
        x = requests.get(f"{database}/models/{model_data['model_id']}/versions/{model_data['version_id']}/predictions", json=issue_ids, verify=False)
        if x.status_code != 200:
            print(x.json())
            return None
        labels = x.json()['predictions']
        for issue in statistics:
            statistics[issue]['label'] = None
            if issue in labels:
                for label in labels[issue]:
                    statistics[issue]['label'][label] = labels[issue][label]['prediction']

    return statistics

def get_label_str(issue):
    types = {
        "existence": "Exis.",
        "executive": "Exec.",
        "property": "Prop."
    }
    result = []
    if issue['label'] is None:
        return None

    for type in types:
        if issue['label'][type]:
            result.append(types[type])
    
    if len(result) == 0:
        result.append('Non-Arch.')

    return result

def get_simple_bar_data(data, characteristic):
    result = {}

    for issue in data:
        if characteristic not in data[issue]:
            continue
        if data[issue][characteristic] is None:
            continue
        char = str(data[issue][characteristic])
        
        if not char in result:
            result[char] = {}
        label = get_label_str(data[issue])
        if label is not None:
            for tag in label:
                if tag not in result[char]:
                    result[char][tag] = 0
                result[char][tag] += 1
    return result

def get_simple_box_data(data, characteristic):
    result = {}
    for issue in data:
        if characteristic not in data[issue]:
            continue
        char = data[issue][characteristic] # number data
        if char is not None:
            label = get_label_str(data[issue])
            if label is not None:
                for tag in label:
                    if tag not in result:
                        result[tag] = []
                    result[tag].append(char)
    return result

def bar_chart(characteristic, labeling, dom_data, split_nonarch, widths):
    if split_nonarch:
        x_labels = ['Exis.', 'Exec.', 'Prop.']
    else:
        x_labels = ["Non-Arch.", 'Exis.', 'Exec.', 'Prop.']

    fig, ax = plt.subplots()
    fig.set_figheight(12)
    fig.set_figwidth(20)

    legend_colors = {}
    legend_hatches = {}

    dom_keys = list(dom_data.keys())
    for k in range(len(dom_keys)):
        dom = dom_keys[k]
        bottoms = [0 for _ in x_labels]
        data = get_simple_bar_data(dom_data[dom], characteristic)

        this_chars = list(data.keys())
        print(characteristic)
        print(this_chars)
        print('\n')
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
                ax.bar(x=(i+1) - 0.3 + k* (0.6 / max((len(dom_keys) - 1), 1)), height=count, width=widths, label=this_label, bottom=bottoms[i], hatch=hatches[k], color=colors[j], edgecolor="black")
                legend_colors[this_char] = colors[j]
                legend_hatches[dom_keys[k]] = hatches[k]
                bottoms[i] += count

    handles = [mpatches.Patch(facecolor=legend_colors[this_char], edgecolor='black', label=this_char) for this_char in legend_colors]
    handles.extend([mpatches.Patch(facecolor='white', edgecolor='black', hatch=legend_hatches[this_dom], label=this_dom) for this_dom in legend_hatches])

    ax.legend(handles=handles)

    ax.set_ylabel('Issue Count')
    ax.set_xlabel('Per manual decision type')
    plt.xticks([x+1 for x in range(0, len(x_labels))], x_labels)
    plt.title(f"{labeling.title()} Label Distribution for Issue Characteristic {characteristic}")
    filename = f"app/static/figures/bar_{characteristic}.png"
    plt.savefig(filename)
    plt.close()
    return filename

    # todo plot nonarch too?

def box_chart(characteristic, labeling, dom_data, split_nonarch, widths, show_outliers):
    if split_nonarch:
        x_labels = ['Exis.', 'Exec.', 'Prop.']
    else:
        x_labels = ["Non-Arch.", 'Exis.', 'Exec.', 'Prop.']

    xticks = []
    dom_keys = list(dom_data.keys())
    for j in range(0, len(x_labels)):
        for i in range(0, len(dom_keys)):
            xticks.append((j+1) - 0.3 + i * (0.6/max((len(dom_keys) - 1), 1)))

    # todo cut off outliers past a certain point

    to_plot = {}
    fig, ax = plt.subplots()
    fig.set_figheight(12)
    fig.set_figwidth(20)
    for dom in dom_keys:
        to_plot[dom] = []

        data = get_simple_box_data(dom_data[dom], characteristic)

        for i in range(0, len(x_labels)):
            counts = []
            if x_labels[i] in data:
                counts = data[x_labels[i]]
            to_plot[dom].append(counts)

    to_plot_arranged = []
    for j in range(0, len(x_labels)):
        for i in range(0, len(dom_keys)):
            to_plot_arranged.append(to_plot[dom_keys[i]][j])

    bp = ax.boxplot(to_plot_arranged, positions=xticks, widths=widths, showfliers=show_outliers)

    for j in range(0, len(x_labels)):
        for i in range(0, len(dom_keys)):
            this_idx = j*len(dom_keys) + i
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
    for i in range(0, len(dom_keys)):
        col, = plt.plot([1,1], colors[i])
        colours.append((col, dom_keys[i]))
    cols, doms = zip(*colours)
    plt.legend(cols, doms)
    for col in cols:
        col.set_visible(False)

    plt.title(f"{labeling.title()} Label Distribution for Issue Characteristic {characteristic}")
    filename = f"app/static/figures/box_{characteristic}.png"
    plt.savefig(filename)
    plt.close()
    return filename

def plot(labeling, domains, split_nonarch, keep_format, show_outliers):
    dom_data = {}
    complete = True
    for dom in domains:
        dom_data[dom] = get_domain_data(dom, labeling, keep_format, login.get_db())
        if dom_data[dom] is None:
            complete = False
            print("Incomplete data")
            break

    if complete:
        widths = 0.6 / len(domains) - 0.05
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

        filenames = []

        for charac in charac_to_type:
            if charac_to_type[charac] == 'box':
                filenames.append(box_chart(charac, labeling, dom_data, split_nonarch, widths, show_outliers))
            else:
                filenames.append(bar_chart(charac, labeling, dom_data, split_nonarch, widths))
        return filenames
    return []

def generate_statistics(labeling, domains, split_nonarch, include_format, show_outliers, name):
    figure_paths = plot(labeling, domains, split_nonarch, include_format, show_outliers)

    file_ids = stats_data.post_stat_graphs(figure_paths)
    graphs = [{"file_id": file_id, "label": "temp"} for file_id in file_ids]

    obj = {
        "timestamp": str(datetime.datetime.now()),
        "name": name,
        "graphs": graphs
    }

    s_id = stats_data.post_stat_obj(name, obj)
    return s_id