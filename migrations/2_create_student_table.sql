CREATE TABLE IF NOT EXISTS mf_student (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  department_id INT NOT NULL REFERENCES mf_department(id),
  username VARCHAR(32) NOT NULL,
  password_hash VARCHAR(64) NOT NULL
);