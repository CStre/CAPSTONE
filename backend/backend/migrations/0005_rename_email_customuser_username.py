# Generated by Django 4.1.13 on 2024-04-03 22:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0004_customuser_is_active_customuser_is_superuser'),
    ]

    operations = [
        migrations.RenameField(
            model_name='customuser',
            old_name='email',
            new_name='username',
        ),
    ]
