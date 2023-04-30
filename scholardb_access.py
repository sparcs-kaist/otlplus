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

    os.system("scp -oStrictHostKeyChecking=no -i ~/key.pem -P 8022 /tmp/otl_db_ssh_args wheel@143.248.234.126:/tmp > /dev/null")
    os.remove("/tmp/otl_db_ssh_args")
    os.system(
        "ssh -oStrictHostKeyChecking=no -i ~/key.pem -p 8022 wheel@143.248.234.126 python db.py > /dev/null")
    os.system("scp -oStrictHostKeyChecking=no -i ~/key.pem -P 8022 wheel@143.248.234.126:/tmp/otl_db_dump_result /tmp > /dev/null")
    os.system("ssh -oStrictHostKeyChecking=no -i ~/key.pem -p 8022 wheel@143.248.234.126 rm /tmp/otl_db_dump_result > /dev/null")
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
