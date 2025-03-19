CREATE TABLE IF NOT EXISTS vocabulary_set_access (
  id SERIAL PRIMARY KEY AUTO INCREMENT,
  vocabulary_set_id FOREIGN KEY REFERENCES vocabulary_set(id),
  student_id FOREIGN KEY REFERENCES student(id)
);