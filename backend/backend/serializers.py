from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'username', 'password', 'preferences']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        username = validated_data.get('username')
        if CustomUser.objects.filter(username=username).exists():
            raise serializers.ValidationError('This email is already in use.')
        
        return CustomUser.objects.create_user(**validated_data)

class LoginSerializer(serializers.Serializer):
    username = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        print("Authenticating:", data.get('username'))  # Add for debugging
        user = authenticate(username=data.get('username'), password=data.get('password'))
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Unable to log in with provided credentials.")

