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
app.route('/api/login', methods=['POST']) \
  (routes.login)

auth.route(app, '/api/departments', ['teacher'], ['GET']) \
  (routes.departments)
auth.route(app, '/api/departments/create', ['teacher'], ['PUT']) \
  (routes.departments_create)

auth.route(app, '/api/departments/<int:department_id>', ['teacher'], ['GET']) \
  (routes.departments_id)
auth.route(app, '/api/departments/<int:department_id>/delete', ['teacher'], ['DELETE']) \
  (routes.departments_id_delete)
  
auth.route(app, '/api/departments/<int:department_id>/students/create', ['teacher'], ['PATCH']) \
  (routes.departments_id_students_create) # TODO
auth.route(app, '/api/departments/<int:department_id>/students/<int:student_id>/delete', ['teacher'], ['DELETE']) \
  (routes.departments_id_students_id_delete) # TODO
auth.route(app, '/api/departments/<int:department_id>/students/generate-passwords', ['teacher'], ['GET']) \
  (routes.departments_id_students_generate_passwords) # TODO

auth.route(app, '/api/vocabulary-sets', ['teacher', 'student'], ['GET']) \
  (routes.vocabulary_sets) # TODO
auth.route(app, '/api/vocabulary-sets/create', ['teacher'], ['PUT']) \
  (routes.vocabulary_sets_create) # TODO

auth.route(app, '/api/vocabulary-sets/<int:vocabulary_set_id>', ['teacher', 'student'], ['GET']) \
  (routes.vocabulary_sets_id) # TODO
auth.route(app, '/api/vocabulary-sets/<int:vocabulary_set_id>/delete', ['teacher'], ['DELETE']) \
  (routes.vocabulary_sets_id_delete) # TODO

auth.route(app, '/api/vocabulary-sets/<int:vocabulary_set_id>/departments/add', ['teacher'], ['PATCH']) \
  (routes.vocabulary_sets_id_departments_add) # TODO
auth.route(app, '/api/vocabulary-sets/<int:vocabulary_set_id>/departments/remove', ['teacher'], ['PATCH']) \
  (routes.vocabulary_sets_id_departments_remove) # TODO

auth.route(app, '/api/vocabulary-sets/<int:vocabulary_set_id>/words/create', ['teacher'], ['PATCH']) \
  (routes.vocabulary_sets_id_words_create) # TODO
auth.route(app, '/api/vocabulary-sets/<int:vocabulary_set_id>/words/<int:word_id>/delete', ['teacher'], ['DELETE']) \
  (routes.vocabulary_sets_id_words_id_delete) # TODO
auth.route(app, '/api/vocabulary-sets/<int:vocabulary_set_id>/words/<int:word_id>/update', ['teacher'], ['PATCH']) \
  (routes.vocabulary_sets_id_words_id_update) # TODO
auth.route(app, '/api/vocabulary-sets/<int:vocabulary_set_id>/words/<int:word_id>/log', ['student'], ['PATCH']) \
  (routes.vocabulary_sets_id_words_id_log) # TODO

auth.route(app, '/api/vocabulary-sets/<int:vocabulary_set_id>/statistics', ['teacher'], ['GET']) \
  (routes.vocabulary_sets_id_statistics) # TODO
auth.route(app, '/api/vocabulary-sets/<int:vocabulary_set_id>/generate-context-sentences', ['student'], ['GET']) \
  (routes.vocabulary_sets_id_generate_context_sentences) # TODO

# Run the app
if __name__ == '__main__':
  app.run(debug=not PROD_ENVIRONMENT)