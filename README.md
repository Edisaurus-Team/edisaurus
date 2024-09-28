# Copy-Paste Editor

A copyediting tool, powered by AI!

See the project here: <a href="https://copypasteeditor.com">copypasteeditor.com</a>

## Installation

This is a Django project that uses Webpack for bundling JSX. You will need an environment with Django and Node installed.

After pulling the repo into a folder, install the required Python libraries and Node dependencies, then make your Django migrations and make your Webpack bundle:

```
pip install -r requirements.txt
npm install
python manage.py makemigrations
npm run build
```

You will also need an OpenAI API key for submitting documents. If you already have an environment variable set in your operating system, then you are good to go. If not, you will need to create a `.env` file in the root folder with an API key:

`OPENAI_API_KEY = ""`

With that, you should be able to run the project! Django will serve it to localhost:8000

`python manage.py runserver`

