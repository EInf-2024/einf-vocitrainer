from flask import Flask, jsonify, render_template
from pydantic import BaseModel
import openai
import backend.route as route
import backend.routes as routes

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

@route.authenticated(app, '/api/department', 'teacher', ['GET'])
def department():
  return jsonify({'success': True, 'data': 'Department data'})
  
if __name__ == '__main__':
  app.run(debug=True)