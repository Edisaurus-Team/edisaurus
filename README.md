# Edisaurus

A copyediting tool, powered by AI!

## Installation

This is a Django project that uses Webpack for compiling JSX. You will need an environment with Django and Node installed.

After pulling the repo into a folder, make your Django migrations:

`python manage.py makemigrations`

And install the Node dependencies:

`npm install`

You will also need an OpenAI API key for submitting documents. If you already have an environment variable set in your operating system, then you are good to go. If not, you will need to create a `.env` file in the root folder with an API key:

`OPENAI_API_KEY = ""`