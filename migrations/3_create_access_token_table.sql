CREATE TABLE IF NOT EXISTS access_token (
  id SERIAL PRIMARY KEY AUTO INCREMENT,
  teacher_id FOREIGN KEY REFERENCES teacher(id),
  student_id FOREIGN KEY REFERENCES student(id),
  token VARCHAR(64) NOT NULL,
  created_at INT NOT NULL
);