from flask import Flask, render_template
import backend.auth as auth
import dotenv
import os
import backend.routes as routes

# Load environment variables
dotenv.load_dotenv()
PROD_ENVIRONMENT = os.getenv('PROD') == 'true'

# Create Flask app
app = Flask(__name__)

# Frontend
@app.route('/')
def index():
  return render_template('index.html')

@auth.route(app, '/test', redirect_url='/')
def test():
  return render_template("test.html")

# Backend
app.route('/api/login', methods=['POST'])(routes.login)

auth.route(app, '/api/departments', ['teacher'], ['GET'])(routes.departments)
auth.route(app, '/api/departments/create', ['teacher'], ['PUT'])(routes.departments_create)

auth.route(app, '/api/departments/<int:department_id>', ['teacher'], ['GET'])(routes.departments_id)
auth.route(app, '/api/departments/<int:department_id>/delete', ['teacher'], ['DELETE'])(routes.departments_id_delete)
auth.route(app, '/api/departments/<int:department_id>/students/create', ['teacher'], ['PATCH'])(routes.departments_id_students_create)
auth.route(app, '/api/departments/<int:department_id>/students/generate-passwords', ['teacher'], ['GET'])(routes.departments_id_students_generate_passwords)
# auth.route(app, '/api/departments/<int:department_id>/students/<int:student_id>/delete', ['teacher'], ['DELETE'])(TODO)

# auth.route(app, '/api/vocabulary-sets', ['teacher', 'student'], ['GET'])(TODO)
# auth.route(app, '/api/vocabulary-sets/create', ['teacher'], ['PUT'])(TODO)

# auth.route(app, '/api/vocabulary-sets/<int:vocabulary_set_id>', ['teacher', 'student'], ['GET'])(TODO)
# auth.route(app, '/api/vocabulary-sets/<int:vocabulary_set_id>/delete', ['teacher'], ['DELETE'])(TODO)
# auth.route(app, '/api/vocabulary-sets/<int:vocabulary_set_id>/words/create', ['teacher'], ['PATCH'])(TODO)
# auth.route(app, '/api/vocabulary-sets/<int:vocabulary_set_id>/words/<int:word_id>/delete', ['teacher'], ['DELETE'])(TODO)
# auth.route(app, '/api/vocabulary-sets/<int:vocabulary_set_id>/words/<int:word_id>/update', ['teacher'], ['PATCH'])(TODO)

# auth.route(app, '/api/vocabulary-sets/<int:vocabulary_set_id>/generate-context-sentences', ['student'], ['GET'])(TODO)
# auth.route(app, '/api/vocabulary-sets/<int:vocabulary_set_id>/words/<int:word_id>/log', ['student'], ['PATCH'])(TODO)

# auth.route(app, '/api/vocabulary-sets/<int:vocabulary_set_id>/statistics', ['teacher'], ['GET'])(TODO)


if __name__ == '__main__':
  app.run(debug=not PROD_ENVIRONMENT)