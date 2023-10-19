import os
import sys
import re
from gitignore_parser import parse_gitignore

# Parse .gitignore
matches = parse_gitignore('.gitignore')

# Get the argv[1] and argv[2]
old_version = sys.argv[1]
new_version = sys.argv[2]

# Prepare the regular expression pattern
pattern = re.compile(r'\b' + re.escape(old_version) + r'\b')

# Walk through the directory
for root, dirs, files in os.walk("."):
    for file in files:
        if (file == "package.json" or file == "Cargo.toml") and not matches(os.path.join(root, file)):
            with open(os.path.join(root, file), 'r+') as f:
                data = f.read()
                data = pattern.sub(new_version, data)
                f.seek(0)
                f.write(data)
                f.truncate()