CREATE TABLE IF NOT EXISTS mf_access_token (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT REFERENCES mf_teacher(id),
  student_id INT REFERENCES mf_student(id),
  token VARCHAR(64) NOT NULL,
  created_at INT NOT NULL
);