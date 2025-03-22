from flask import Flask, render_template
from pydantic import BaseModel
import openai
import backend.route as route
import backend.routes as routes
import dotenv
import os

# Load environment variables
dotenv.load_dotenv()
PROD_ENVIRONMENT = os.getenv('PROD') == 'true'

# Init openai
OPENAI_MODEL = "gpt-4o-mini"
openai_client = openai.OpenAI()

class SqlQueryFormat(BaseModel):
  query: str
  explanation: str

# Create Flask app
app = Flask(__name__)

# Frontend
@app.route('/')
def index():
  return render_template('index.html')

@app.route("/test")
def test():
  return render_template("test.html")

# Backend
app.route('/api/login', methods=['POST'])(routes.login)
route.authenticated(app, '/api/departments', 'teacher', ['GET'])(routes.departments)
route.authenticated(app, '/api/departments/<int:department_id>', 'teacher', ['GET'])(routes.department)

if __name__ == '__main__':
  app.run(debug=not PROD_ENVIRONMENT)