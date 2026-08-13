import os
import zipfile

def zipdir(path, ziph):
    # ziph is zipfile handle
    for root, dirs, files in os.walk(path):
        # Exclude directories
        dirs[:] = [d for d in dirs if d not in ['node_modules', 'venv', '__pycache__', '.git', 'dist', 'staticfiles', '.pytest_cache']]
        for file in files:
            if not file.endswith('.pyc') and not file.endswith('.sqlite3'):
                file_path = os.path.join(root, file)
                ziph.write(file_path, os.path.relpath(file_path, os.path.join(path, '..')))

if __name__ == '__main__':
    with zipfile.ZipFile('deploy.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
        zipdir('backend', zipf)
        zipdir('frontend', zipf)
        # Add root files if necessary, like README
        if os.path.exists('README.md'):
            zipf.write('README.md')
    print("Created deploy.zip successfully!")
