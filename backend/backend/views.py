from django.shortcuts import render
from django.http import JsonResponse
from .models import TestModel
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer, LoginSerializer
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model


User = get_user_model()

# Your existing views
def index(request):
    return render(request, 'index.html')

def test_db(request):
    new_entry = TestModel(name="Test Entry")
    new_entry.save()
    return JsonResponse({'message': 'Data added successfully!'})

class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer

# New view for user login
class LoginView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            # User is authenticated, perform any additional actions like creating a session if required
            return Response({'message': 'Login successful', 'user_id': user.id})
        else:
            # Authentication failed
            return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)