import os
import re

def process_file(path):
    with open(path, 'r') as f:
        content = f.read()

    # 1. Remove 'no-radius' class
    content = re.sub(r'\bno-radius\b', '', content)
    
    # Clean up double spaces created by removal
    content = content.replace('  ', ' ')
    
    # 2. Fix labels to be text-sm font-medium
    def label_replacer(match):
        rest = match.group('rest')
        
        # remove existing explicit pixel texts like text-[11px]
        rest = re.sub(r'\btext-\[\d+px\]\b', 'text-sm', rest)
        
        # if not text-sm already
        if 'text-' in rest and 'text-sm' not in rest:
            rest = re.sub(r'\btext-[a-z0-9]+\b', 'text-sm', rest)
            
        return f'<label{rest}'
    
    content = re.sub(r'<\s*label(?P<rest>[^>]*?className="[^"]*"[^>]*?)', label_replacer, content)

    with open(path, 'w') as f:
        f.write(content)

src_dir = 'src/app'
for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.tsx'):
            process_file(os.path.join(root, f))

print("Applied UI Uniformity Pass Part 2 successfully.")
