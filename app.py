from flask import Flask, render_template, jsonify
import backend.route as route
import backend.routes as routes
import dotenv
import os

# Load environment variables
dotenv.load_dotenv()
PROD_ENVIRONMENT = os.getenv('PROD') == 'true'

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
TODO = lambda: jsonify({'error': 'Not implemented yet'})

app.route('/api/login', methods=['POST'])(routes.login)
route.authenticated(app, '/api/departments', ['teacher'], ['GET'])(routes.departments)
route.authenticated(app, '/api/departments/create', ['teacher'], ['PUT'])(routes.department_create)

route.authenticated(app, '/api/departments/<int:department_id>', ['teacher'], ['GET'])(routes.department)
route.authenticated(app, '/api/departments/<int:department_id>/delete', ['teacher'], ['DELETE'])(TODO)
route.authenticated(app, '/api/departments/<int:department_id>/students/create', ['teacher'], ['PATCH'])(TODO)
route.authenticated(app, '/api/departments/<int:department_id>/students/<int:student_id>/delete', ['teacher'], ['DELETE'])(TODO)

route.authenticated(app, '/api/vocabulary-sets', ['teacher', 'student'], ['GET'])(TODO)
route.authenticated(app, '/api/vocabulary-sets/create', ['teacher'], ['PUT'])(TODO)

route.authenticated(app, '/api/vocabulary-sets/<int:vocabulary_set_id>', ['teacher', 'student'], ['GET'])(TODO)
route.authenticated(app, '/api/vocabulary-sets/<int:vocabulary_set_id>/delete', ['teacher'], ['DELETE'])(TODO)
route.authenticated(app, '/api/vocabulary-sets/<int:vocabulary_set_id>/words/create', ['teacher'], ['PATCH'])(TODO)
route.authenticated(app, '/api/vocabulary-sets/<int:vocabulary_set_id>/words/<int:word_id>/delete', ['teacher'], ['DELETE'])(TODO)
route.authenticated(app, '/api/vocabulary-sets/<int:vocabulary_set_id>/words/<int:word_id>/update', ['teacher'], ['PATCH'])(TODO)

route.authenticated(app, '/api/vocabulary-sets/<int:vocabulary_set_id>/words/<int:word_id>/log', ['student'], ['PATCH'])(TODO)

route.authenticated(app, '/api/vocabulary-sets/<int:vocabulary_set_id>/statistics', ['teacher'], ['GET'])(TODO)

route.authenticated(app, '/api/vocabulary-sets/<int:vocabulary_set_id>/generate-context-sentences', ['teacher'], ['GET'])(TODO)


if __name__ == '__main__':
  app.run(debug=not PROD_ENVIRONMENT)