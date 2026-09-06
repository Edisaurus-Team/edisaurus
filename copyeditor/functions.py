import re
import anthropic

from dotenv import load_dotenv
from diff_match_patch import diff_match_patch
from json import dumps, loads

def get_max_output_tokens(client, model):
    """Query the Models API for this model's real output-token ceiling."""
    return client.models.retrieve(model).max_tokens


def split_into_chunks(client, model, text, target_input_tokens):
    """
    Split `text` into chunks targeting roughly `target_input_tokens` tokens
    each, breaking only on paragraph boundaries. Groups paragraphs with a
    character-count heuristic, then verifies each candidate chunk's real
    token count via count_tokens() before finalizing it.
    """
    parts = re.split(r'(\n\s*\n)', text)
    pieces = [
        parts[i] + (parts[i + 1] if i + 1 < len(parts) else '')
        for i in range(0, len(parts), 2)
    ]

    char_budget = target_input_tokens * 4
    chunks = []
    current = []
    current_chars = 0

    for piece in pieces:
        if current and current_chars + len(piece) > char_budget:
            candidate = ''.join(current)
            actual = client.messages.count_tokens(
                model=model,
                messages=[{"role": "user", "content": candidate}],
            ).input_tokens
            if actual > target_input_tokens and len(current) > 1:
                overflow = current.pop()
                chunks.append(''.join(current))
                current = [overflow]
                current_chars = len(overflow)
            else:
                chunks.append(candidate)
                current = []
                current_chars = 0
        current.append(piece)
        current_chars += len(piece)

    if current:
        chunks.append(''.join(current))

    return chunks


def llm_api_call(prompt, submit_text, model, key):
    """
    Called in 'uploader' in 'views.py'.
    Splits long submissions into model-sized chunks and streams each
    chunk's edited text back in sequence.
    """
    if key == False:
        # No key provided, relying on .env
        load_dotenv()
        client = anthropic.Anthropic()
    else:
        # User's personal key provided
        client = anthropic.Anthropic(api_key=key)

    max_output = get_max_output_tokens(client, model)
    chunks = split_into_chunks(client, model, submit_text, max_output // 2)

    for i, chunk in enumerate(chunks):
        if i > 0:
            yield "\n\n"
        with client.messages.stream(
            model=model,
            max_tokens=max_output,
            system=prompt,
            messages=[
                {"role": "user", "content": chunk}
            ],
        ) as stream:
            for text in stream.text_stream:
                yield text



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