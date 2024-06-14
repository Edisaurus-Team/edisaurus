from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout

from .models import User, Archive


def index(request):
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse('login'))
    return render(request, 'index.html')


def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        return_to = request.POST["return_to"]

        if user is not None:
            login(request, user)
            try:
                return HttpResponseRedirect(reverse(return_to))
            except:
                return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "login.html")
    

def signup(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "signup.html", {
                "alert": "Passwords do not match."
            })

        user = User.objects.create_user(username, email, password)
        user.save()
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "signup.html")
    

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))