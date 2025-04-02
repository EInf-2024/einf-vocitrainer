CREATE TABLE IF NOT EXISTS mf_access_token (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT,
  student_id INT,
  token VARCHAR(64) NOT NULL,
  created_at INT NOT NULL,

  FOREIGN KEY (teacher_id) REFERENCES mf_teacher(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES mf_student(id) ON DELETE CASCADE
);