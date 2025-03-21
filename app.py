from flask import Flask, jsonify, request, render_template
from pydantic import BaseModel
import openai
import backend.connection as connection
import backend.route as route
import backend.crypto as crypto
import time

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
@app.route('/api/login', methods=['POST'])
def login():
  data = request.get_json()
  username = data['username']
  hashed_password = crypto.hash_password(data['password'])
  
  with connection.open() as (_conn, cursor):
    # Try to login as student
    is_student = True
    cursor.execute("SELECT * FROM mf_student WHERE username = %s AND password_hash = %s", (username, hashed_password))
    result = cursor.fetchone()
    
    # Else, try to login as teacher
    if result is None:
      is_student = False
      cursor.execute("SELECT * FROM mf_teacher WHERE abbreviation = %s AND password_hash = %s", (username, hashed_password))
      result = cursor.fetchone()
    
    # Check if user exists
    if result is None: return jsonify({'success': False}), 401
    
    # Generate access token
    access_token = crypto.generate_access_token()
    
    # Insert access token into database
    cursor.execute("INSERT INTO mf_access_token (token, teacher_id, student_id, created_at) VALUES (%s, %s, %s, %s)", (
      access_token, 
      result['id'] if not is_student else None,
      result['id'] if is_student else None,
      int(time.time())
    ))
    
    response = jsonify({
      'success': True,
      'access_token': access_token,
      'role': 'student' if is_student else 'teacher'
    })
    response.set_cookie('auth', access_token) # Set cookie
    
    return response

@route.authenticated(app, '/api/department', 'teacher', ['GET'])
def department():
  return jsonify({'success': True, 'data': 'Department data'})

'''
@app.route('/api/init', methods=['GET'])
def init():
  conn = connection.open()
  cursor = conn.cursor(dictionary=True)
  
  cursor.execute("CREATE TABLE IF NOT EXISTS ms_exo (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))")
  cursor.execute("DELETE FROM ms_exo WHERE name = 'John Doe'")
  cursor.execute("INSERT INTO ms_exo (name) VALUES ('John Doe')")
  
  conn.commit()
  
  cursor.close()
  conn.close()
  
  return jsonify({'success': True})

@app.route('/api/generate-query', methods=['POST'])
def prompt():
  data = request.get_json()
  prompt = data['prompt']
  
  completion = openai_client.beta.chat.completions.parse(
    model=OPENAI_MODEL,
    messages=[
      {"role": "system", "content": "You generate json that contains a SQL query for the table ms_exo(id PK AUTO INCREMENT, name STR) and an explanation based on a prompt."},
      {"role": "user", "content": prompt}
    ],
    max_tokens=500,
    response_format=SqlQueryFormat
  )
  sql_query = completion.choices[0].message.parsed
  
  if sql_query is None:
    return jsonify({'success': False, 'message': 'Failed to parse SQL query'}), 400
  
  return jsonify({
    'success': True,
    'data': {
      'sql_query': sql_query.query,
      'explanation': sql_query.explanation
    }
  })

@app.route('/api/get', methods=['GET'])
def api():
  id_param = request.args.get('id')
  
  conn = connection.open()
  cursor = conn.cursor(dictionary=True)
  
  if id_param is not None: 
    cursor.execute("SELECT * FROM ms_exo WHERE id = %s", (id_param,))
  else: cursor.execute("SELECT * FROM ms_exo")
  
  results = cursor.fetchall()
  
  cursor.close()
  conn.close()
  
  return jsonify({
    'success': True,
    'data': results
  })
'''
  
if __name__ == '__main__':
  app.run(debug=True)