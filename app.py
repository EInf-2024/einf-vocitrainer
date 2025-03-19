from flask import Flask, jsonify, request
from pydantic import BaseModel
import openai
import connection

# Init openai
OPENAI_MODEL = "gpt-4o-mini"
openai_client = openai.OpenAI()

class SqlQueryFormat(BaseModel):
  query: str
  explanation: str

# Create Flask app
app = Flask(__name__)

@app.route('/')
def index():
  return jsonify({'success': False, 'message': 'Mika'}), 403

@app.route('/api/init', methods=['GET'])
def init():
  conn = connection.open()
  cursor = conn.cursor(dictionary=True)
  
  cursor.execute("CREATE TABLE IF NOT EXISTS ms_exo (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))")
  cursor.execute("DELETE FROM ms_exo WHERE name = 'John Doe'")
  cursor.execute("INSERT INTO ms_exo (name) VALUES ('John Doe')")
  
  conn.commit()
  
  cursor.close()
  conn.close()
  
  return jsonify({'success': True})

@app.route('/api/generate-query', methods=['POST'])
def prompt():
  data = request.get_json()
  prompt = data['prompt']
  
  completion = openai_client.beta.chat.completions.parse(
    model=OPENAI_MODEL,
    messages=[
      {"role": "system", "content": "You generate json that contains a SQL query for the table ms_exo(id PK AUTO INCREMENT, name STR) and an explanation based on a prompt."},
      {"role": "user", "content": prompt}
    ],
    max_tokens=500,
    response_format=SqlQueryFormat
  )
  sql_query = completion.choices[0].message.parsed
  
  if sql_query is None:
    return jsonify({'success': False, 'message': 'Failed to parse SQL query'}), 400
  
  return jsonify({
    'success': True,
    'data': {
      'sql_query': sql_query.query,
      'explanation': sql_query.explanation
    }
  })

@app.route('/api/get', methods=['GET'])
def api():
  id_param = request.args.get('id')
  
  conn = connection.open()
  cursor = conn.cursor(dictionary=True)
  
  if id_param is not None: 
    cursor.execute("SELECT * FROM ms_exo WHERE id = %s", (id_param,))
  else: cursor.execute("SELECT * FROM ms_exo")
  
  results = cursor.fetchall()
  
  cursor.close()
  conn.close()
  
  return jsonify({
    'success': True,
    'data': results
  })
  
if __name__ == '__main__':
  app.run(debug=True)