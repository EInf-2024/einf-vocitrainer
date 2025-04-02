from flask import jsonify, request
import backend.connection as connection
import backend.crypto as crypto
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
  password = data['password']
  
  try:
    with connection.open() as (conn, cursor):
      # Try to login as student
      is_student = True
      cursor.execute("SELECT id, password_hash FROM mf_student WHERE username = %s", (username,))
      user = cursor.fetchone()
      cursor.nextset()

      # Else, try to login as teacher
      if user is None:
        is_student = False
        cursor.execute("SELECT id, password_hash FROM mf_teacher WHERE abbreviation = %s", (username,))
        user = cursor.fetchone()
        cursor.nextset()

      # Check if user exists
      if user is None:
        return jsonify({'error': "User doesn't exist."}), 401
      
      user_password_hash = user['password_hash']

      # Verify password
      if not crypto.verify_password(password, user_password_hash):
        return jsonify({'error': "Invalid password."}), 401
      
      # Generate access token
      access_token = crypto.generate_access_token()
      
      # Insert access token into database
      cursor.execute("INSERT INTO mf_access_token (token, teacher_id, student_id, created_at) VALUES (%s, %s, %s, %s)", (
        access_token, 
        user['id'] if not is_student else None,
        user['id'] if is_student else None,
        int(time.time())
      ))
      conn.commit()
      
    response = jsonify({
      'access_token': access_token,
      'role': 'student' if is_student else 'teacher'
    })
    response.set_cookie('auth', access_token, httponly=True, samesite='Strict', secure=True) # Set cookie
      
    return response
  except Exception as e:
    return jsonify({'error': str(e)}), 500