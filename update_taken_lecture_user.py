#!/usr/bin/python
import os
from datetime import datetime
import sys

'''
f = open("/opt/otl.log", "a")

f.write("Update taken lecture Start\n")
f.write(str(datetime.now()))
f.write("\n")

f.close()
'''
os.chdir('/var/www/otlplus')
os.system('python manage.py import-taken-lecture-user --user=otl_academics --password=whgdmstltmxpa! --host=143.248.5.170 --port=4000 --student_no=' + sys.argv[1])
'''
f = open("/opt/otl.log", "a")

f.write("Update taken lecture Finish\n")

f.close()
'''
