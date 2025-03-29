import secrets
import bcrypt

def generate_password(department_label: str, student_username: str) -> str:
  """
  Generates a password for a student based on their username and department label.
  
  :param department_label: The label of the department.
  :param student_username: The username of the student.
  :return: A generated password.
  """
  return f"{department_label}_{student_username}"

def hash_password(password: str) -> str:
  salt = bcrypt.gensalt()
  return bcrypt.hashpw(password.encode(), salt).decode()

def verify_password(password: str, hashed_password: str) -> bool:
  return bcrypt.checkpw(password.encode(), hashed_password.encode())

def generate_access_token() -> str:
  return secrets.token_urlsafe(32)