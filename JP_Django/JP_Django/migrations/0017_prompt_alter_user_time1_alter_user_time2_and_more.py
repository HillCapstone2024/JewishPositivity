# Generated by Django 4.2 on 2024-07-10 16:08

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("JP_Django", "0016_checkin_privacy_alter_user_time1_alter_user_time2_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="Prompt",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "checkin_type",
                    models.CharField(
                        choices=[
                            ("ModehAni", "Modeh Ani"),
                            ("Ashrei", "Ashrei"),
                            ("Shema", "Shema"),
                        ],
                        max_length=10,
                    ),
                ),
                ("text", models.TextField()),
            ],
        ),
        migrations.AlterField(
            model_name="user",
            name="time1",
            field=models.DateTimeField(default=datetime.datetime(2024, 7, 10, 8, 0)),
        ),
        migrations.AlterField(
            model_name="user",
            name="time2",
            field=models.DateTimeField(default=datetime.datetime(2024, 7, 10, 15, 0)),
        ),
        migrations.AlterField(
            model_name="user",
            name="time3",
            field=models.DateTimeField(default=datetime.datetime(2024, 7, 10, 21, 0)),
        ),
    ]
