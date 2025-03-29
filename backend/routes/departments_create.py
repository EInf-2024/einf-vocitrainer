from flask import jsonify, request
import backend.connection as connection

def departments_create(user_id: int, user_role: str):
  """
  POST /api/departments/create

  **Request Format**
  .. code-block:: json
    {
      "label": "G2025D"
    }

  **Response Format**
  .. code-block:: json
    {
      "id": 1,
      "label": "G2025D"
    }
  """
  data = request.get_json()
  
  if 'label' not in data:
    return jsonify({'error': "Missing label key."}), 400
  
  label = data['label']
  
  with connection.open() as (conn, cursor):
    # Create a new department
    cursor.execute("INSERT INTO mf_department (teacher_id, label) VALUES (%s, %s)", (user_id, label))
    conn.commit()
    
    department_id = cursor.lastrowid
    
  return jsonify({
    'id': department_id,
    'label': label
  })