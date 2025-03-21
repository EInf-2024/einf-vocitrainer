import glob
import backend.connection as connection
import os

migration_progress_file = 'migrations/.progress'
migration_files = sorted(glob.glob('migrations/*.sql'))

migration_progress = 0
if os.path.exists(migration_progress_file):
  with open(migration_progress_file) as f:
    migration_progress = int(f.read())

with connection.open() as (_conn, cursor):
  for i, migration_file in enumerate(migration_files):
    if i < migration_progress:
      print(f'Skipping {migration_file}')
      continue

    with open(migration_file) as f:
      cursor.execute(f.read())

    with open(migration_progress_file, 'w') as f:
      f.write(str(i + 1))
    
    print(f'Executed {migration_file}')
    
print('Done')
