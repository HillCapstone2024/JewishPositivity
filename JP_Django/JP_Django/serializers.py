from rest_framework import serializers
from .models import Prompt

class PromptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prompt
        fields = ['id', 'checkin_type', 'text']