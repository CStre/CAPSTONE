from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response 
from .serializers import UserSerializer, LoginSerializer #Importing all views from serializers
from django.contrib.auth import authenticate, login, get_user_model, logout #Importing all the views

import logging #This is so I am able to check the backend debug logs
logger = logging.getLogger(__name__)

User = get_user_model()

# All of my views
def index(request):
    return render(request, 'index.html')

# This is for my logout procedure
@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({"message": "Logged out successfully"})

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Assuming the user is already authenticated
        user = request.user
        if user.is_authenticated:
            return Response({
                'name': user.name,
                'username': user.username,
            })
        else:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

# This is for my user registration 
class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer

# This is for my user login and authentication
class LoginView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            serializer = LoginSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.validated_data
                login(request, user)  # Start the session
                # User is authenticated, perform any additional actions like creating a session if required
                logger.info(f"User {user.username} authenticated successfully")
                return Response({'message': 'Login successful', 'user_id': user.id})
            else:
                # Authentication failed
                logger.error(f"Login failed: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
                logger.exception("An error occurred during login.")
                return Response({'error': 'An internal error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)