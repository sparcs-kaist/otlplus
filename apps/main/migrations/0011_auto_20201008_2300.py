# -*- coding: utf-8 -*-
# Generated by Django 1.11.28 on 2020-10-08 14:00
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0010_notice'),
    ]

    database_operations = [migrations.AlterModelTable('Notice', 'support_notice')]

    state_operations = [migrations.DeleteModel('Notice')]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=database_operations,
            state_operations=state_operations
        )
    ]