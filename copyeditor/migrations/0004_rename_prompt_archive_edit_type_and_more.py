# Generated by Django 5.0.1 on 2025-02-01 21:01

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('copyeditor', '0003_archive_engine_archive_prompt_archive_temp'),
    ]

    operations = [
        migrations.RenameField(
            model_name='archive',
            old_name='prompt',
            new_name='edit_type',
        ),
        migrations.RenameField(
            model_name='archive',
            old_name='engine',
            new_name='language_model',
        ),
    ]
