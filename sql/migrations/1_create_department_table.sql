CREATE TABLE IF NOT EXISTS mf_department (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  label VARCHAR(6) NOT NULL,

  FOREIGN KEY (teacher_id) REFERENCES mf_teacher(id) ON DELETE CASCADE
);