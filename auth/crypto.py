import dotenv
import os
import hashlib
import secrets

dotenv.load_dotenv()

PASSWORD_SALT = os.getenv('PASSWORD_SALT') or ''
assert len(PASSWORD_SALT) > 0

def hash_password(password: str) -> str:
  return hashlib.sha512((password + PASSWORD_SALT).encode()).hexdigest()

def generate_access_token() -> str:
  return secrets.token_urlsafe(32)