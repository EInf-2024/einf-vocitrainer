import secrets
import bcrypt
import random

password_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?"
password_length = (8, 10)
def generate_password(_department_label: str, _student_username: str) -> str:
  return "".join(random.choices(
    password_chars,
    k=random.randint(*password_length)
  ))

def hash_password(password: str) -> str:
  salt = bcrypt.gensalt()
  return bcrypt.hashpw(password.encode(), salt).decode()

def verify_password(password: str, hashed_password: str) -> bool:
  return bcrypt.checkpw(password.encode(), hashed_password.encode())

def generate_access_token() -> str:
  return secrets.token_urlsafe(32)