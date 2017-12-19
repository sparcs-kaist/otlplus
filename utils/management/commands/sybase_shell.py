# -*- coding: utf-8 -*-

import Sybase
from pprint import PrettyPrinter, pprint
from django.core.management.base import BaseCommand

db_encoding = 'cp949'
term_encoding = 'utf8'

class StrPrettyPrinter(PrettyPrinter):
    def format(self, object, context, maxlevels, level):
        if isinstance(object, basestring):
            if isinstance(object, str):
                object = object.decode(db_encoding)
            return "'%s'" % unicode(object).encode(term_encoding), True, False
        else:
            return PrettyPrinter.format(self, object, context, maxlevels, level)

def pprint2(object, indent=2, width=80, depth=None):
    StrPrettyPrinter(indent=indent, width=width, depth=depth).pprint(object)

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        pprint
        print 'Connecting...'
        try:
            db = Sybase.connect('143.248.5.170:4000', 'otl_academics', 'whgdmstltmxpa!', 'scholar')
        except Sybase.DatabaseError:
            print 'Connection failed!'
            return
        print 'OK.'
        cur = db.cursor()
        while True:
            try:
                command = raw_input('>> ')
            except (EOFError, KeyboardInterrupt):
                print ''
                break
            try:
                cur.execute(command)
                rows = cur.fetchall()
                pprint2(rows)
            except Exception, e:
                if e.message == 'No result set':
                    print 'OK, but no result set.'
                else:
                    print str(e)
        cur.close()
        db.close()

