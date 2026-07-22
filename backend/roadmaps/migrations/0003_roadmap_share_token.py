import uuid
from django.db import migrations, models


def generate_unique_tokens(apps, schema_editor):
    Roadmap = apps.get_model('roadmaps', 'Roadmap')
    for roadmap in Roadmap.objects.all():
        roadmap.share_token = uuid.uuid4()
        roadmap.save(update_fields=['share_token'])


class Migration(migrations.Migration):

    dependencies = [
        ('roadmaps', '0002_resource_notes'),
    ]

    operations = [
        migrations.AddField(
            model_name='roadmap',
            name='share_token',
            field=models.UUIDField(default=uuid.uuid4, null=True),
        ),
        migrations.RunPython(generate_unique_tokens),
        migrations.AlterField(
            model_name='roadmap',
            name='share_token',
            field=models.UUIDField(default=uuid.uuid4, unique=True),
        ),
    ]