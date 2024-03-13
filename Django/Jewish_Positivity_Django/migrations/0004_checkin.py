# Generated by Django 4.1.6 on 2024-03-13 13:15

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('Jewish_Positivity_Django', '0003_user_time1_user_time2_user_time3'),
    ]

    operations = [
        migrations.CreateModel(
            name='Checkin',
            fields=[
                ('checkin_id', models.AutoField(primary_key=True, serialize=False)),
                ('date', models.DateField()),
                ('moment_number', models.IntegerField()),
                ('content_type', models.CharField(max_length=100)),
                ('content', models.BinaryField()),
                ('user_id', models.ForeignKey(db_column='id', on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
