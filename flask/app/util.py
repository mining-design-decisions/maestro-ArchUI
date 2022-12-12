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