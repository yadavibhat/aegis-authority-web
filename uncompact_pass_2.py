import os

def process_file(path):
    with open(path, 'r') as f:
        content = f.read()

    # Structural Dimensions
    content = content.replace('w-64', 'w-[320px]')
    content = content.replace('ml-64', 'ml-[320px]')
    
    # Negative Space Escalations
    content = content.replace('p-3', 'p-6')
    content = content.replace('p-4', 'p-8')
    content = content.replace('p-6', 'p-10')
    content = content.replace('p-8', 'p-12')
    
    content = content.replace('gap-4', 'gap-8')
    content = content.replace('gap-6', 'gap-10')
    content = content.replace('gap-8', 'gap-12')
    
    content = content.replace('py-4', 'py-6')
    content = content.replace('py-6', 'py-8')
    content = content.replace('px-6', 'px-8')
    
    content = content.replace('mb-2', 'mb-6')
    content = content.replace('mb-6', 'mb-10')

    with open(path, 'w') as f:
        f.write(content)

src_dir = 'src/app'
for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.tsx'):
            process_file(os.path.join(root, f))

print("Applied Design Engineer Expansion successfully.")
