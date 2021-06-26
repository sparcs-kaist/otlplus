from django.http import HttpResponse


def login_required_ajax(function=None, response_content="You have to log in first"):
    """
    Decorator to replace Django's original login_required for AJAX calls.
    XMLHttpRequest objects process redirect reponses automatically and this may cause unwanted behaviour.
    """

    def decorate(view_func):
        def handler(request, *args, **kwargs):
            if request.user.is_authenticated:
                return view_func(request, *args, **kwargs)
            return HttpResponse(status=401)

        return handler

    return decorate(function)
