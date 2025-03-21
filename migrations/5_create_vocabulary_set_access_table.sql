CREATE TABLE IF NOT EXISTS mf_vocabulary_set_access (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  vocabulary_set_id INT NOT NULL REFERENCES mf_vocabulary_set(id),
  student_id INT NOT NULL REFERENCES mf_student(id)
);