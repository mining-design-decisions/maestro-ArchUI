import os

def rec_del(path):
    if os.path.isdir(path):
        for item in os.listdir(path):
            rec_del(f"{path}/{item}")
        os.rmdir(path)
    else:
        os.remove(path)


def rec_del_safe(path):
    if os.path.exists(path):
        rec_del(path)

def get_default_run_name():
    runs_path = "app/data/runs"
    prev_highest_run = 0
    if not os.path.exists(runs_path):
        os.mkdir(os.path.join('app/data', 'runs'))
        return 'run_0'
    for item in os.listdir(runs_path):
        if item.startswith('run_'):
            this_run = int(item[4:-5])
            prev_highest_run = this_run if (this_run>prev_highest_run) else prev_highest_run

    return f'run_{prev_highest_run+1}'