import os, re

page_dir = '../temp-aegis/src/pages'
for f in os.listdir(page_dir):
    if not f.endswith('.tsx'): continue
    path = os.path.join(page_dir, f)
    with open(path, 'r') as file:
        content = file.read()
    
    # "dont make it compact" - spread padding/margins out
    content = content.replace('px-2', 'px-6')
    content = content.replace('py-1', 'py-4')
    content = content.replace('px-3', 'px-6')
    content = content.replace('py-2', 'py-4')
    content = content.replace('px-4', 'px-8')
    content = content.replace('py-3', 'py-6')
    content = content.replace('text-xs', 'text-sm')
    content = content.replace('text-[10px]', 'text-xs')
    content = content.replace('text-[11px]', 'text-sm')
    
    with open(path, 'w') as out:
        out.write(content)

print("Expanded layouts successfully.")
