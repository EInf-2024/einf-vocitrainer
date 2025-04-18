from flask import Flask, jsonify, Response, request, redirect
from typing import Callable, Literal, Any, Union
from functools import wraps
import backend.connection as connection
import time
from backend.config import get_config

ACCESS_TOKEN_TTL: int = get_config('access_token_ttl', int)

def route(
  app: Flask, 
  route: str,
  required_role: list[Literal["student", "teacher"]] = ['student', 'teacher'],
  methods: list[Literal["GET", "POST", "PUT", "PATCH", "DELETE"]] = ['GET'],
  redirect_url: Union[str, None] = None
):
  def decorator(func: Callable[..., Union[str, Response, tuple[Response, int]]]):
    @app.route(route, methods=methods)
    @wraps(func)
    def wrapper(*args: Any, **kwargs: Any):
      def handle_error(error: str, status_code: int):
        if redirect_url is not None: return redirect(redirect_url)
        return jsonify({'error': error}), status_code
      
      auth_cookie = request.cookies.get('auth')
      if auth_cookie is None: return handle_error("Unauthorized", 401)
      
      try:
        with connection.open() as (conn, cursor):
          cursor.execute("SELECT * FROM mf_access_token WHERE token = %s", (auth_cookie,))
          result = cursor.fetchone()
          cursor.nextset()
          if result is None: return handle_error("Invalid token", 401)
          
          # Determine id and role of the user
          user_role = 'student' if result['teacher_id'] is None else 'teacher'
          user_id = result['student_id'] if user_role == 'student' else result['teacher_id']
          
          # Check if created_at is expired -> return 401
          created_at = result['created_at']
          if (time.time() - created_at) > ACCESS_TOKEN_TTL:
            # Not just delete the used token, but delete all expired tokens
            cursor.execute(
              "DELETE FROM mf_access_token WHERE %s = %s AND created_at < %s", 
              (
                'student_id' if user_role == 'student' else 'teacher_id',
                user_id,
                int(time.time()) - ACCESS_TOKEN_TTL
              )
            )
            conn.commit()
            return handle_error("Token expired", 401)
              
        # Check if the role matches the required role -> return 403
        if user_role not in required_role: return handle_error("Forbidden", 403)
        
        # If all checks pass, execute the function and return the real response
        return func(*args, **kwargs, user_id=user_id, user_role=user_role)
      except Exception as e:
        print(e)
        return handle_error(str(e), 500)
    
    return wrapper
  return decorator