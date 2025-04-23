from rest_framework import serializers
from .models import TopicRoadmap
from topics.models import Topic
from roadmaps.models import Roadmap

class TopicRoadmapSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopicRoadmap
        fields = ['TopicID', 'RoadmapID']

    def validate_topic(self, value):
        if not Topic.objects.filter(id=value).exists():
            raise serializers.ValidationError("Topic không tồn tại.")
        return value

    def validate_roadmap(self, value):
        if not Roadmap.objects.filter(id=value).exists():
            raise serializers.ValidationError("Roadmap không tồn tại.")
        return value

    def validate(self, data):
        TopicID = data.get('TopicID')
        RoadmapID = data.get('RoadmapID')
        # Kiểm tra tính duy nhất của cặp (topic, roadmap)
        if TopicRoadmap.objects.filter(TopicID=TopicID, RoadmapID=RoadmapID).exists():
            raise serializers.ValidationError("Mapping này đã tồn tại.")
        return data

    def create(self, validated_data):
        return TopicRoadmap.objects.create(**validated_data)
