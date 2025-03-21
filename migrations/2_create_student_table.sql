CREATE TABLE IF NOT EXISTS mf_student (
  id SERIAL PRIMARY KEY AUTO INCREMENT,
  department_id FOREIGN KEY REFERENCES mf_department(id),
  username VARCHAR(32) NOT NULL,
  password_hash VARCHAR(64) NOT NULL
);