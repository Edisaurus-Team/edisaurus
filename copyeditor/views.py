import json

from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, HttpResponseNotFound, StreamingHttpResponse
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt

from .models import User, Archive
from .functions import openai_call, compare_text, create_html

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
    user = User.objects.get(username=request.user)

    return JsonResponse( {
        "user": user.username,
    })

@csrf_exempt
def uploader(request):
    if request.method == "POST":

        data = json.loads(request.body.decode('utf-8'))
        submit_text = data.get('submit_text', '')
        edited_text = data.get('edited_text', '')     

        # # create title from first 50 characters, or all that comes before a line break
        title = edited_text[:50].split("\n")[0]

        diffs = compare_text(submit_text, edited_text)
        save_in_archive = Archive(user=request.user, title=title, original_text=submit_text, edited_text=edited_text, diffs=diffs)
        save_in_archive.save()

        return JsonResponse({"articleId": save_in_archive.id})


@csrf_exempt
def stream_response(request):
    if request.method == "POST":   
        
        data = json.loads(request.body.decode('utf-8'))
        prompt = "You are a professional copy editor who fixes typos and grammatical mistakes in text. You follow MLA style for making corrections. You make MINIMAL edits to the voice or style of the prose, only correcting when there are obvious errors."
        submit_text = data.get('submit_text', '')        

        # magic begins here :)
        response = StreamingHttpResponse(openai_call(prompt, submit_text), content_type='text/plain')
        response['Cache-Control'] = 'no-cache'
        
        return response

@csrf_exempt
# @cache_control(no_cache=True, must_revalidate=True, no_store=True)
def workshop_api(request, id):
    
    # delete article, sent from WorkshopTable.jsx
    if request.method == "DELETE":
        try:
            article = Archive.objects.get(id=id)
            article.delete()
            return JsonResponse({"message": "Article deleted"}, status=204)
        except Archive.DoesNotExist:
            return HttpResponseNotFound("Article not found")


def get_article(request, id):
    article = Archive.objects.get(id=id)
    html = create_html(article.diffs)
    
    return JsonResponse({
        "htmlChanges": html
    })