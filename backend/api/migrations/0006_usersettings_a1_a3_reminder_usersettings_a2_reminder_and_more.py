# Generated by Django 5.1.7 on 2025-04-18 20:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_maintenancelog_file'),
    ]

    operations = [
        migrations.AddField(
            model_name='usersettings',
            name='a1_a3_reminder',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='usersettings',
            name='a2_reminder',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='usersettings',
            name='reminder_months_before',
            field=models.IntegerField(default=3),
        ),
        migrations.AddField(
            model_name='usersettings',
            name='sts_reminder',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='flightlog',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
        migrations.AlterField(
            model_name='flightlog',
            name='departure_date',
            field=models.DateField(db_index=True),
        ),
        migrations.AlterField(
            model_name='flightlog',
            name='departure_place',
            field=models.CharField(db_index=True, max_length=255),
        ),
        migrations.AlterField(
            model_name='flightlog',
            name='departure_time',
            field=models.TimeField(db_index=True),
        ),
        migrations.AlterField(
            model_name='flightlog',
            name='flight_duration',
            field=models.IntegerField(db_index=True),
        ),
        migrations.AlterField(
            model_name='flightlog',
            name='landing_place',
            field=models.CharField(db_index=True, max_length=255),
        ),
        migrations.AlterField(
            model_name='flightlog',
            name='light_conditions',
            field=models.CharField(choices=[('Day', 'Day'), ('Night', 'Night')], db_index=True, max_length=255),
        ),
        migrations.AlterField(
            model_name='flightlog',
            name='ops_conditions',
            field=models.CharField(choices=[('VLOS', 'VLOS'), ('BLOS', 'BLOS')], db_index=True, max_length=255),
        ),
        migrations.AlterField(
            model_name='flightlog',
            name='pilot_type',
            field=models.CharField(choices=[('PIC', 'PIC'), ('Dual', 'Dual'), ('Instruction', 'Instruction')], db_index=True, max_length=255),
        ),
        migrations.AlterField(
            model_name='maintenancelog',
            name='file',
            field=models.FileField(blank=True, null=True, upload_to=''),
        ),
        migrations.AddIndex(
            model_name='flightlog',
            index=models.Index(fields=['user', 'departure_date'], name='api_flightl_user_id_ea23d0_idx'),
        ),
        migrations.AddIndex(
            model_name='flightlog',
            index=models.Index(fields=['uav', 'departure_date'], name='api_flightl_uav_id_878ea0_idx'),
        ),
    ]
