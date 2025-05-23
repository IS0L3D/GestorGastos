# Generated by Django 5.2 on 2025-04-21 07:53

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('backPresupuestos', '0002_initial'),
        ('backTransacciones', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='alerta',
            name='usuario',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='transaccion',
            name='categoria',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='backPresupuestos.categoria'),
        ),
        migrations.AddField(
            model_name='transaccion',
            name='usuario',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
