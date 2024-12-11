import re

from dotenv import load_dotenv
from openai import OpenAI
from diff_match_patch import diff_match_patch
from json import dumps, loads

def openai_call(prompt, submit_text, model, temperature, key):
    """
    Called in 'uploader' in 'views.py'
    """
    if key == False:
        # No key provided, relying on .env
        load_dotenv()
        client = OpenAI()
    else:
        # User's personal key provided
        client = OpenAI(api_key=key)

    completion = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": submit_text}
        ],
        temperature=temperature,
        stream=True
    )

    for chunk in completion:
        content = chunk.choices[0].delta.content
        if content:
            yield content
    


def compare_text(original_text, edited_text):
    """
    Use diff-match-patch to return a string of diffs data.
    Later, json.loads() is used to render the diffs into a list.
    """

    dmp = diff_match_patch()
    dmp.Diff_Timeout = 0
    diffs = dmp.diff_main(original_text, edited_text)
    dmp.diff_cleanupSemantic(diffs)

    # make the list of diffs a string so SQLite can store it
    diffs = dumps(diffs)
    return diffs

    
def create_html(diffs):
    """
    Called in 'workshop_render'. Builds the HTML page from the diffs and original text.
    """
    # "unpack" the diff data back into a list
    diffs = loads(diffs)
    dmp = diff_match_patch()
    html = []
    
    # This is the dmp.diff_prettyHtml method with added lines (commented below) so that we can
    # separate inserted or deleted <br> tags ("\n" characters) into their own HTML elements.
    for op, data in diffs:
        text = (
            data.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\n", "<br>")
        )
        if op == dmp.DIFF_INSERT:
            if text != "<br>": 
                text = re.sub(r'<br>', r'</ins><ins><br></ins><ins>', text) #added for this project
            html.append('<ins>%s</ins>' % text)
        elif op == dmp.DIFF_DELETE:
            if text != "<br>": 
                text = re.sub(r'<br>', r'</del><del><br></del><del>', text) #added for this project
            html.append('<del>%s</del>' % text)
        elif op == dmp.DIFF_EQUAL:
            html.append("<span>%s</span>" % text)

    return "".join(html)