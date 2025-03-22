from flask import Flask, jsonify, Response, request
from typing import Callable, Literal
from functools import wraps
import backend.connection as connection
import time

# Get access token TTL from database
with connection.open() as (_conn, cursor):
  cursor.execute("SELECT value FROM mf_config WHERE config_key = 'access_token_ttl'")
  ACCESS_TOKEN_TTL = int(cursor.fetchone()['value'])
assert ACCESS_TOKEN_TTL is not None

def authenticated(app: Flask, route: str, role: Literal["student", "teacher"], methods: list[Literal["GET", "POST", "PUT", "DELETE"]] = ['GET']):
  def decorator(func: Callable[[], Response]):
    @app.route(route, methods=methods)
    @wraps(func)
    def wrapper():
      auth_cookie = request.cookies.get('auth')
      # Check if cookie is None -> return 401
      if auth_cookie is None: return jsonify({'success': False, 'message': "Cookie 'auth' not found"}), 401
      
      with connection.open() as (_conn, cursor):        
        cursor.execute("SELECT * FROM mf_access_token WHERE token = %s", (auth_cookie,))
        result = cursor.fetchone()
        
        # Check if token is not found -> return 403
        if result is None: return jsonify({'success': False, 'message': "Invalid token"}), 401
        
        # Check if created_at is expired -> return 401
        created_at = result['created_at']
        
        if (time.time() - created_at) > ACCESS_TOKEN_TTL:
          cursor.execute("DELETE FROM mf_access_token WHERE token = %s", (auth_cookie,))
          return jsonify({'success': False, 'message': "Token expired"}), 401
          
        # Determine role of the user and check if it matches the required role
        auth_role = 'student' if result['teacher_id'] is None else 'teacher'
        if role != auth_role: return jsonify({'success': False, 'message': "Invalid role"}), 403
        
        # If all checks pass, execute the function and return the real response
        return func()
    
    return wrapper
  return decorator