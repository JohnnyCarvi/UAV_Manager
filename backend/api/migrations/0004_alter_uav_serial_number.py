# Generated by Django 5.1.7 on 2025-04-01 20:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_alter_uav_manufacturer_alter_uav_serial_number'),
    ]

    operations = [
        migrations.AlterField(
            model_name='uav',
            name='serial_number',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
