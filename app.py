from flask import Flask, render_template, jsonify
import auth
import dotenv

# Load environment variables
dotenv.load_dotenv()

# Create Flask app
app = Flask(__name__)

# Frontend
@app.route('/')
def index():
  return render_template('index.html')

@auth.route(app, '/authenticated-sample', redirect_url='/')
def test():
  return render_template("authenticated-sample.html")

# Backend
app.route('/api/login', methods=['POST']) \
  (auth.login)

@auth.route(app, '/api/sample-api', ['teacher'], ['GET'])
def sample_api():
  return jsonify({'message': 'Hello, World!'})

# Run the app
if __name__ == '__main__':
  app.run(debug=True)