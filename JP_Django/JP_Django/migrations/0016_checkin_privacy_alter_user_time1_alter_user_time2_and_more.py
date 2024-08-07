# Generated by Django 4.2 on 2024-07-05 16:13

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('JP_Django', '0015_alter_communityuser_status_alter_user_time1_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='checkin',
            name='privacy',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='user',
            name='time1',
            field=models.DateTimeField(default=datetime.datetime(2024, 7, 5, 8, 0)),
        ),
        migrations.AlterField(
            model_name='user',
            name='time2',
            field=models.DateTimeField(default=datetime.datetime(2024, 7, 5, 15, 0)),
        ),
        migrations.AlterField(
            model_name='user',
            name='time3',
            field=models.DateTimeField(default=datetime.datetime(2024, 7, 5, 21, 0)),
        ),
    ]
