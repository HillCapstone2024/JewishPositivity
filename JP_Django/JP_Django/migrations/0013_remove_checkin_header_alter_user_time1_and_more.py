# Generated by Django 4.2 on 2024-04-16 11:14

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('JP_Django', '0012_alter_user_time1_alter_user_time2_alter_user_time3_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='checkin',
            name='header',
        ),
        migrations.AlterField(
            model_name='user',
            name='time1',
            field=models.DateTimeField(default=datetime.datetime(2024, 4, 16, 8, 0)),
        ),
        migrations.AlterField(
            model_name='user',
            name='time2',
            field=models.DateTimeField(default=datetime.datetime(2024, 4, 16, 15, 0)),
        ),
        migrations.AlterField(
            model_name='user',
            name='time3',
            field=models.DateTimeField(default=datetime.datetime(2024, 4, 16, 21, 0)),
        ),
    ]