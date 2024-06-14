from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

from .models import Test_case

def index(request):
    return render(request, 'index.html')
    

def database_response(request):
    if request.method == "GET":
        response = Test_case.objects.get(id=1).response_text
    
        return render(request, 'data_response.html', {
            "message": response
        })
        
def api_response(request):
    return render(request, 'api_response.html')

def api_url(request):
    response = Test_case.objects.get(id=2).response_text
    return JsonResponse({
        'message': response
        }, status=200
    )