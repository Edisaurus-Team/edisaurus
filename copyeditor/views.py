import json

from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, HttpResponseNotFound, StreamingHttpResponse
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError

from .models import User, Archive
from .functions import openai_call, compare_text, create_html

@csrf_exempt
def index(request):
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse('login'))
    return render(request, 'index.html')

@csrf_exempt
def login_view(request):
    if request.method == "POST":
        
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse('index'))

        else:
            return render(request, "login.html", {
                "error_message": True
            })
    else:
        return render(request, "login.html")
    
@csrf_exempt
def signup(request):
    if request.method == "POST":
        try:
            if request.POST["survey"]:
                return render(request, "login.html", {
                    "error_message": True
                })
        except:
            pass
        username = request.POST["username"]
        email = request.POST["email"]
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "signup.html", {
                "alert": "Passwords do not match."
            })

        try:
            user = User.objects.create_user(username, email, password)
        except IntegrityError: 
            return render(request, "signup.html", {
                "alert": "Username already taken."
            })
        
        user.save()
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "signup.html")
    

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def get_table(request):
    articles = Archive.objects.values('id', 'title').filter(user=request.user.id)
    return JsonResponse(list(articles), safe=False)


@csrf_exempt
def settings(request):
    data = User.objects.get(username=request.user, key=request.user.key)
    if request.method == "GET":
        
        return JsonResponse( {
            "user": data.username,
            "apiKey": data.key
        })
    if request.method == "POST":
        updated_data = json.loads(request.body.decode('utf-8'))
        key = updated_data.get('updated_key')
        data.key = key.strip()
        data.save()
        return HttpResponse(status=200)


@csrf_exempt
def stream_response(request):
    # Uploader
    if request.method == "POST":   
        
        data = json.loads(request.body.decode('utf-8'))
        
        edit_type = data.get('edit_type')
        custom_prompt = data.get('custom_prompt')
        temperature = float(data.get('temperature'))
        model = data.get('model')
        
        if edit_type == "copyedit":
            prompt = "You are a professional copy editor who fixes typos and grammatical mistakes in text. You follow the Chicago Manual of Style for making corrections. You make MINIMAL edits to the voice or style of the prose, only correcting when there are obvious errors."
        if edit_type == "resume":
            prompt = "You are a professional recruiter who fixes resumes. You review text for consistency in punctuation, dates, and verb usage. Current job positions should be expressed in present tense. Past positions should be expressed in past tense. Strengthen the language to sound more professional when necessary. Fragmented sentences are acceptable."
        if edit_type == "custom":
            prompt = custom_prompt

        submit_text = data.get('submit_text', '')

        key = request.user.key
        if key == '':
            key = False

        # magic begins here :)
        response = StreamingHttpResponse(openai_call(prompt, submit_text, model, temperature, key), content_type='text/plain')
        response['Cache-Control'] = 'no-cache'
        
        return response


@csrf_exempt
def create_article(request):
    if request.method == "POST":

        data = json.loads(request.body.decode('utf-8'))
        submit_text = data.get('submit_text', '')
        edited_text = data.get('edited_text', '')
        edit_type = data.get('edit_type', '')
        model_choice = data.get('model_choice', '')
        temperature = float(data.get('temperature', ''))
        custom_prompt = data.get('custom_prompt', '')

        # # create title from first 50 characters, or all that comes before a line break
        title = edited_text[:50].split("\n")[0]

        diffs = compare_text(submit_text, edited_text)
        save_in_archive = Archive(user=request.user, 
                                  title=title, 
                                  original_text=submit_text, 
                                  edited_text=edited_text, 
                                  diffs=diffs, 
                                  edit_type=edit_type, 
                                  temp=temperature, 
                                  language_model=model_choice,
                                  custom_prompt=custom_prompt
                                  )
        save_in_archive.save()

        return JsonResponse({"articleId": save_in_archive.id})


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
    if article.user.id == request.user.id:
        html = create_html(article.diffs)
        return JsonResponse({
            "htmlChanges": html,
            "submitDate": article.submit_time,
            "editType": article.edit_type,
            "model": article.language_model,
            "temp": article.temp,
            "customPrompt": article.custom_prompt,
            "originalText": article.original_text
        })
    else:
        #** Need to get a proper error message sent through. Currently nothing renders on the page.
        return HttpResponse("That is not your article")
    
@csrf_exempt
def save_article(request, id):
    if request.method == 'UPDATE':

        article = Archive.objects.get(id=id)
        if article.user.id == request.user.id:
            data = json.loads(request.body.decode('utf-8'))
            updated_og_text = data.get('updated_og_text', '')
            updated_edited_text = data.get('updated_edited_text', '')
            article.original_text = updated_og_text
            article.edited_text = updated_edited_text
            article.diffs = compare_text(updated_og_text, updated_edited_text)
            article.save()

            return HttpResponse(status=200)