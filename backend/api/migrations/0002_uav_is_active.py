# Generated by Django 5.1.7 on 2025-03-30 20:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='uav',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]
