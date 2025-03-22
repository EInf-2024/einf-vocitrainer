from flask import jsonify, request
import backend.connection as connection
import backend.crypto as crypto
import time

def login():
  data = request.get_json()
  username = data['username']
  hashed_password = crypto.hash_password(data['password'])
  
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
    conn.commit()
    
    response = jsonify({
      'success': True,
      'access_token': access_token,
      'role': 'student' if is_student else 'teacher'
    })
    response.set_cookie('auth', access_token) # Set cookie
    
    return response