CREATE TABLE IF NOT EXISTS mf_vocabulary_set_access (
  id SERIAL PRIMARY KEY AUTO INCREMENT,
  vocabulary_set_id FOREIGN KEY REFERENCES mf_vocabulary_set(id),
  student_id FOREIGN KEY REFERENCES mf_student(id)
);