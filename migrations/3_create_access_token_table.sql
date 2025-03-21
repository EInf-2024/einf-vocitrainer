CREATE TABLE IF NOT EXISTS mf_access_token (
  id SERIAL PRIMARY KEY AUTO INCREMENT,
  teacher_id FOREIGN KEY REFERENCES mf_teacher(id),
  student_id FOREIGN KEY REFERENCES mf_student(id),
  token VARCHAR(64) NOT NULL,
  created_at INT NOT NULL
);