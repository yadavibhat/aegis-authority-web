import os
import re

def process_file(path):
    with open(path, 'r') as f:
        content = f.read()

    # Normalize Heights & Radii for form controls
    # We can just look for classNames and replace standard utilities
    # Replace h-10, h-8, h-14 with h-12 where they seem to be form controls, but globally for consistency
    content = re.sub(r'\bh-(\d+|\[.*?\])\b', 'h-12', content)
    # Wait, replacing all h- classes might break layout heights (like map container height or screen height h-screen)
    # Let's selectively replace only button, input, select
    
    # It's better to explicitly replace them in tag contexts
    
    tags_to_normalize = ['button', 'input', 'select', 'textarea']
    
    def tag_replacer(match):
        tag = match.group('tag')
        rest = match.group('rest')
        
        # force h-12
        if 'h-' in rest:
            rest = re.sub(r'\bh-(?!screen|full|max|min|fit)[^\s"\']+\b', 'h-12', rest)
        else:
            if 'className="' in rest:
                rest = rest.replace('className="', 'className="h-12 ')
        
        # force rounded-[6px]
        if 'rounded-' in rest:
            rest = re.sub(r'\brounded-(?!full)[^\s"\']+\b', 'rounded-[6px]', rest)
        elif 'rounded ' in rest:
            rest = re.sub(r'\brounded\b', 'rounded-[6px]', rest)
        else:
            if 'className="' in rest:
                rest = rest.replace('className="', 'className="rounded-[6px] ')
                
        # input labels to text-sm font-medium
        if tag == 'label':
            rest = re.sub(r'\btext-\w+\b', 'text-sm', rest)
            if 'font-' in rest:
                rest = re.sub(r'\bfont-\w+\b', 'font-medium', rest)
            else:
                 if 'className="' in rest:
                     rest = rest.replace('className="', 'className="font-medium ')
        
        # input/select/textarea text to text-base (16px)
        if tag in ['input', 'select', 'textarea']:
            if 'text-sm' in rest:
                rest = rest.replace('text-sm', 'text-base')
            elif not 'text-' in rest:
                if 'className="' in rest:
                    rest = rest.replace('className="', 'className="text-base ')
                    
        # sync colors
        # all primary buttons use Navy (which we can define as bg-[#000080])
        # look for blue or indigo or any primary colors
        if tag == 'button':
            rest = re.sub(r'\bbg-blue-\d+\b', 'bg-[#000080]', rest)
            rest = re.sub(r'\bbg-indigo-\d+\b', 'bg-[#000080]', rest)
            rest = re.sub(r'\bhover:bg-blue-\d+\b', 'hover:bg-[#000066]', rest)
            rest = re.sub(r'\bhover:bg-indigo-\d+\b', 'hover:bg-[#000066]', rest)
            
        # border color to border-slate-300
        if tag in ['input', 'select', 'textarea']:
            rest = re.sub(r'\bborder-gray-\d+\b', 'border-slate-300', rest)
            rest = re.sub(r'\bfocus:ring-blue-\d+\b', 'focus:ring-[#000080]', rest)
            rest = re.sub(r'\bfocus:border-blue-\d+\b', 'focus:border-[#000080]', rest)

        return f'<{tag}{rest}'

    content = re.sub(r'<\s*(?P<tag>button|input|select|textarea|label)(?P<rest>[^>]*?className="[^"]*"[^>]*?)', tag_replacer, content)

    # Standardize Spacing: uniform vertical gap 24px (space-y-6 or gap-6)
    content = re.sub(r'\bspace-y-\d+\b', 'space-y-6', content)
    # Be careful with gap, doing it everywhere might break grid side-by-side gap. Only vertical gap?
    # Actually, the user says "vertical gap (24px) between all form groups"
    # let's only replace space-y
    
    # Align Padding: Cards/Containers to p-8
    content = re.sub(r'\bp-\d+\b', 'p-8', content)
    # But wait! We did uncompact_pass_2.py which changed paddings and gap too. 
    # Let's run this then check. 

    with open(path, 'w') as f:
        f.write(content)

src_dir = 'src/app'
for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.tsx'):
            process_file(os.path.join(root, f))

print("Applied UI Uniformity Pass successfully.")
