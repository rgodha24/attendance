import os
import sys
from gitignore_parser import parse_gitignore

# Parse .gitignore
matches = parse_gitignore('.gitignore')

# Get the argv[1] and argv[2]
old_version = sys.argv[1]
new_version = sys.argv[2]

# Walk through the directory
for root, dirs, files in os.walk("."):
    for file in files:
        if (file == "package.json" or file == "Cargo.toml") and not matches(os.path.join(root, file)):
            with open(os.path.join(root, file), 'r+') as f:
                data = f.read()
                data = data.replace(old_version, new_version)
                f.seek(0)
                f.write(data)
                f.truncate()


