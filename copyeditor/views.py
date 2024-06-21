import re
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from .models import User, Archive

from .functions import run_editor, compare_text, create_html

@csrf_exempt
def index(request):
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse('login'))
    return render(request, 'index.html')


def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse('index'))

        else:
            return render(request, "login.html")
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


def get_table(request):
    articles = Archive.objects.values('id', 'title')
    return JsonResponse(list(articles), safe=False)


def settings(request):
    print("request recieved")
    user = User.objects.get(username=request.user)
    
    if request.method == "POST":
        user.key = request.POST["api-key"]
        user.save()
        return HttpResponseRedirect(reverse("settings"))

    return JsonResponse( {
        "user": user.username,
        "key": user.key
    })

@csrf_exempt
def uploader(request):
    if request.method == "POST":
        submit_text = request.POST["text_box"].strip()
        key = User.objects.get(username=request.user).key

        # magic begins here :)
        edited_text = run_editor(submit_text, key)

        # # create title from first 50 characters, or all that comes before a line break
        title = edited_text[:50].split("\n")[0]

        diffs = compare_text(submit_text, edited_text)
        save_in_archive = Archive(user=request.user, title=title, original_text=submit_text, edited_text=edited_text, diffs=diffs)
        save_in_archive.save()

        return HttpResponseRedirect(f"/workshop/{save_in_archive.id}")


def get_article(request, id):
    article = Archive.objects.get(id=id)
    html = create_html(article.diffs)
    
    return JsonResponse({
        "htmlChanges": html
    })