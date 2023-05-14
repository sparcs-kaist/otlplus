import os
import threading
import pickle


def synchronized(func):
    func.__lock__ = threading.Lock()

    def synced_func(*args, **kws):
        with func.__lock__:
            return func(*args, **kws)

    return synced_func


@synchronized
def execute(host, port, user, password, query):
    f = open("/tmp/otl_db_ssh_args", "w")
    f.write("%s\n%s\n%s\n%s\n%s" % (host, port, user, password, query))
    f.close()

    os.system("scp /tmp/otl_db_ssh_args xen:/tmp > /dev/null")
    os.remove("/tmp/otl_db_ssh_args")
    os.system("ssh xen python db.py > /dev/null")
    os.system("scp xen:/tmp/otl_db_dump_result /tmp > /dev/null")
    os.system("ssh xen rm /tmp/otl_db_dump_result > /dev/null")
    result = pickle.load(open("/tmp/otl_db_dump_result", "rb"), encoding="bytes")
    os.remove("/tmp/otl_db_dump_result")

    for row in result:
        for j, elem in enumerate(row):
            if isinstance(elem, bytes):
                try:
                    row[j] = elem.decode("cp949")
                except UnicodeDecodeError as e:
                    print(f"Cannot decode {elem}")
                    print(e)

    return result
