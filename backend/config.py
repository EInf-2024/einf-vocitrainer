import backend.connection as connection
from typing import Any

def get_config(key: str, type: Any) -> Any:
  with connection.open() as (_conn, cursor):
    cursor.execute("SELECT value FROM mf_config WHERE config_key = %s", (key,))
    result = cursor.fetchone()
  assert result is not None, f"Config key '{key}' not found"
  
  parsed_result = type(result['value'])
  assert parsed_result is not None, f"Config key '{key}' could not be parsed as {type.__name__}"
  
  return parsed_result