# Generated by Django 4.1.6 on 2024-03-28 22:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('JP_Django', '0005_remove_checkin_content_alter_user_time1_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='checkin',
            name='content',
            field=models.BinaryField(null=True),
        ),
        migrations.AddField(
            model_name='checkin',
            name='text_entry',
            field=models.CharField(max_length=255, null=True),
        ),
    ]
