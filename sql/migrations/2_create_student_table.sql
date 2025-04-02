CREATE TABLE IF NOT EXISTS mf_student (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  department_id INT NOT NULL,
  username VARCHAR(32) NOT NULL UNIQUE,
  password_hash VARCHAR(128),

  FOREIGN KEY (department_id) REFERENCES mf_department(id) ON DELETE CASCADE
);