CREATE TABLE IF NOT EXISTS mf_vocabulary_set_access (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  vocabulary_set_id INT NOT NULL,
  department_id INT NOT NULL,

  FOREIGN KEY (vocabulary_set_id) REFERENCES mf_vocabulary_set(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES mf_department(id) ON DELETE CASCADE
);