from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

from .models import Test_case

# Create your views here.
def index(request):
    return HttpResponse("hello world")

def api(request):
    if request.method == "GET":
        response = Test_case.objects.get(id=1).response_text
        print(response)
        return JsonResponse({
            'message': response
        })
        