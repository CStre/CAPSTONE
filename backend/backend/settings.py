import os
import pymysql

from dotenv import load_dotenv # Used to conceal important varialbles from public access
load_dotenv()

pymysql.install_as_MySQLdb()
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY') # Commented for security

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# This is where my website can be accessed through Django!
ALLOWED_HOSTS = [os.environ.get('HOST_1'),
                 os.environ.get('HOST_2'),
                 os.environ.get('HOST_3'),
                 os.environ.get('HOST_4')
                 ]

# Application definitions

INSTALLED_APPS = [
    'backend', # Must always add the application to installations since I have API Requests
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.middleware.common.CommonMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

AUTHENTICATION_BACKENDS = ['django.contrib.auth.backends.ModelBackend'] # This overrides Djangos typical backend authenticator

SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'None'  # Use 'Lax' or 'Strict' if not cross-domain
SESSION_COOKIE_SECURE = True  # Set to False if not using HTTPS
CSRF_COOKIE_SECURE = True     # Send CSRF cookie only over HTTPS.

ROOT_URLCONF = 'backend.urls'

CORS_ALLOW_CREDENTIALS = True # This is used for authentication allowence
CORS_ORIGIN_WHITELIST = [
    'http://localhost:3000', # For Django backend
    'https://buildingbetteralgorithms.com' # For registered domain in deployment
]

# Added the path to the React app's build folder
REACT_APP_DIR = os.path.join(BASE_DIR, 'build')


TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [REACT_APP_DIR], # added this to connect React
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application' # This tells AWS Elastic Beanstalk where to find the application script


# Database Configuration
# All database varialbes are concealed for security

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('NAME'),
        'USER': os.environ.get('USER'),
        'PASSWORD': os.environ.get('PASSWORD'),
        'HOST': os.environ.get('HOST'),
        'PORT': os.environ.get('PORT'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        }
    }
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField' # Another Django default 


# Password validation
# This is a bunch of Django default password authenticators and was not changed

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

AUTH_USER_MODEL = 'backend.CustomUser'  # This was used to override Djangos default Auth Model


# Internationalization
# https://docs.djangoproject.com/en/2.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.2/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = 'static'
STATICFILES_DIRS = [  # Added this for React
    os.path.join(BASE_DIR, 'build', 'static'),  # Added the path to the static files of the React app
]

# This is used for development and testing and will eventually be removed
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': 'debug.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}

