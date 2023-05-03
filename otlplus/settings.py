"""
Django settings for otlplus project.

Generated by 'django-admin startproject' using Django 1.8.2.

For more information on this file, see
https://docs.djangoproject.com/en/1.8/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.8/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.8/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!

with open(os.path.join(BASE_DIR, "keys/django_secret")) as f:
    SECRET_KEY = f.read().strip()
GOOGLE_OAUTH2_CLIENT_SECRETS_JSON = os.path.join(
    BASE_DIR, "keys/google_client_secrets.json")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []

# Application definition

INSTALLED_APPS = (
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "apps.main.apps.MainConfig",
    "apps.session.apps.SessionConfig",
    "apps.support.apps.SupportConfig",
    "apps.review.apps.ReviewConfig",
    "apps.subject.apps.SubjectConfig",
    "apps.timetable.apps.TimetableConfig",
    "corsheaders",
)

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "otlplus.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "APP_DIRS": True,
        "DIRS": [
            os.path.join(BASE_DIR, "react/build"),
        ],
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "otlplus.wsgi.application"

# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'otlplus',
        'USER': 'root',
        'PASSWORD': 'p@ssw0rd',
        'HOST': 'otlplus-db',
        'PORT': '3306',
    }
}

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "otl-plus",
        "OPTIONS": {
            "MAX_ENTRIES": 5000,
        },
    },
}

# Internationalization
# https://docs.djangoproject.com/en/1.8/topics/i18n/

LANGUAGE_CODE = "ko-KR"


def ugettext(s):
    return s


LANGUAGES = (
    ("ko", ugettext("Korean")),
    ("en", ugettext("English")),
)

LOCALE_PATHS = (os.path.join(BASE_DIR, "locale"),)

TIME_ZONE = "Asia/Seoul"

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.8/howto/static-files/

STATIC_URL = "/static/"
STATICFILES_DIRS = (os.path.join(BASE_DIR, "react/build/static"),)

AUTHENTICATION_BACKENDS = (
    "apps.session.auth_backend.PasswordlessModelBackend",
    "django.contrib.auth.backends.ModelBackend",
)

# SPARCS SSO

with open(os.path.join(BASE_DIR, "keys/sso_secret")) as f:
    SSO_SECRET_KEY = f.read().strip()
SSO_CLIENT_ID = os.getenv("SSO_CLIENT_ID")
SSO_IS_BETA = DEBUG

LOGIN_URL = "/session/login/"
LOGOUT_URL = "/session/logout/"

VERSION = "3.2.4.5"

try:
    from settings_local import *  # pylint: disable=wildcard-import, unused-wildcard-import
except ImportError:
    pass

# CORS
CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOW_CREDENTIALS = True
