import glob
import backend.connection as connection
import os

migration_progress_file = 'sql/migrations/.progress'
migration_files = sorted(glob.glob('sql/migrations/*.sql'))

migration_progress = 0
if os.path.exists(migration_progress_file):
  with open(migration_progress_file) as f:
    migration_progress = int(f.read())

  for i, migration_file in enumerate(migration_files):
    if i < migration_progress:
      print(f'Skipping {migration_file}')
      continue

    with open(migration_file) as f:
      sql_script = f.read()
      statements = [stmt.strip() for stmt in sql_script.split(';') if stmt.strip()]
      
      with connection.open() as (conn, cursor):
        for statement in statements:
          cursor.execute(statement)
        conn.commit()

    with open(migration_progress_file, 'w') as f:
      f.write(str(i + 1))
    
    print(f'Executed {migration_file}')
    
print('Done')
