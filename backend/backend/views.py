from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from rest_framework.response import Response 
from .serializers import UserSerializer, LoginSerializer # Importing all views from serializers
from django.contrib.auth import authenticate, login, get_user_model, logout # Importing all the views
from .places import run_process
from .algorithm import update_preferences
import json
import logging # This is so I am able to check the backend debug logs

logger = logging.getLogger(__name__)
User = get_user_model()

# All of my views
def index(request):
    """
    Renders the index.html template.
    """
    return render(request, 'index.html')


@csrf_exempt
@login_required
def delete_account(request):
    """
    Deletes the user account.
    """
    if request.method == 'DELETE':
        user = request.user
        user.delete()
        return JsonResponse({'message': 'Account deleted successfully'}, status=204)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)


# This is for my logout procedure
@api_view(['POST'])
def logout_view(request):
    """
    Logs out the user.
    """
    logout(request)
    return Response({"message": "Logged out successfully"})


class UserDetailView(APIView):
    """
    Provides user details.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieves user details.
        """
        user = request.user
        if user.is_authenticated:
            logger.debug(f"User preferences sent: {user.preferences}")  # Log the preferences
            return Response({
                'name': user.name,
                'username': user.username,
                'preferences': user.preferences
            })
        else:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)


    def patch(self, request):
        """
        Updates user details.
        """
        logger.info(f"Received data for update: {request.data}")
        user = request.user
        if user.is_authenticated:
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                logger.info(f"Updated user data: {serializer.data}")
                return Response(serializer.data)
            else:
                logger.error(f"Errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)


# This is for my user registration 
class CreateUserView(generics.CreateAPIView):
    """
    Registers a new user.
    """
    serializer_class = UserSerializer


# This is for my user login and authentication
class LoginView(APIView):
    """
    Logs in the user.
    """
    def post(self, request, *args, **kwargs):
        try:
            serializer = LoginSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.validated_data
                login(request, user)  # Start the session
                logger.info(f"User {user.username} authenticated successfully")
                return Response({'message': 'Login successful', 'user_id': user.id})
            else:
                logger.error(f"Login failed: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
                logger.exception("An error occurred during login.")
                return Response({'error': 'An internal error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def get_image_urls(request):
    data = request.data
    preferences = data.get('preferences', [])
    try:
        preferences_list = [int(p) for p in preferences if isinstance(p, int)]
        images = run_process(preferences_list)  # Assuming run_process() is your function to fetch images
        return Response({'images': images}, status=200)
    except (ValueError, TypeError) as e:
        return Response({'error': f'Invalid preferences format: {str(e)}'}, status=400)





@api_view(['POST'])
def process(request):
    """
    Processes user interactions.
    """
    if request.content_type == 'application/json':
        try:
            # Directly use request.data, which is already parsed from JSON
            data = request.data  
            preferences = data.get('preferences')
            logger.info(f"Received preferences: {preferences}")
            updated_preferences = update_preferences(preferences)
            return Response({'updated_preferences': updated_preferences}, status=status.HTTP_200_OK)
        except KeyError as e:
            logger.error(f"KeyError: {str(e)} - Incomplete data provided.")
            return Response({'error': 'Incomplete data provided'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("An error occurred during processing.")
            return Response({'error': 'An internal error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        return Response({'error': 'Unsupported Media Type'}, status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)