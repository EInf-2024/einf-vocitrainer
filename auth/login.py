from flask import jsonify, request
import auth.connection as connection
import auth.crypto as crypto
import time

def login():
  """
  POST /api/login
  
  **Request Format**
  .. code-block:: json
    {
      "username": "Bob",
      "password": "password123"
    }
    
  **Response Format**
  .. code-block:: json
    {
      "access_token": "a1b2c3d4e5f6",
      "role": "student"
    }
  """
  data = request.get_json()
  
  if 'username' not in data or 'password' not in data:
    return jsonify({'error': "Missing username or password."}), 400
  
  username = data['username']
  hashed_password = crypto.hash_password(data['password'])
  
  try:
    with connection.open() as (conn, cursor):
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
      if result is None: return jsonify({'error': "User doesn't exist."}), 401
      
      # Generate access token
      access_token = crypto.generate_access_token()
      
      # Insert access token into database
      cursor.execute("INSERT INTO mf_access_token (token, teacher_id, student_id, created_at) VALUES (%s, %s, %s, %s)", (
        access_token, 
        result['id'] if not is_student else None,
        result['id'] if is_student else None,
        int(time.time())
      ))
      conn.commit()
      
    response = jsonify({
      'access_token': access_token,
      'role': 'student' if is_student else 'teacher'
    })
    response.set_cookie('auth', access_token) # Set cookie
      
    return response
  except Exception as e:
    return jsonify({'error': str(e)}), 500