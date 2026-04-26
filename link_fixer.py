import os

replacements = [
    ('href="#"', 'href="/authority"'), 
    # That could be too generic, let's target more specifically over HTML strings
]

def refine_links(content):
    # Fix the generic links using regex around the text
    content = content.replace('href="#"', 'href="/authority"')
    # More specific overrides based on tab text:
    content = content.replace('href="/authority">Zones<', 'href="/zone">Zones<')
    content = content.replace('href="/authority">Tourists<', 'href="/tourist">Tourists<')
    content = content.replace('href="/authority">Alerts<', 'href="/alert">Alerts<')
    content = content.replace('href="/authority">Personnel<', 'href="/tourist">Personnel<')
    content = content.replace('href="/authority">Operations<', 'href="/zone">Operations<')
    
    # Let's fix the login page sign-in button
    # Usually it's a button or link with "Login", "Sign In", "Access", or "Authenticate"
    content = content.replace('>Auth', ' onClick={() => window.location.href="/authority"}>Auth')
    content = content.replace('>Login', ' onClick={() => window.location.href="/authority"}>Login')
    content = content.replace('>Sign In', ' onClick={() => window.location.href="/authority"}>Sign In')
    
    return content

src_dir = 'src/app'
for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.tsx') and f != 'layout.tsx':
            path = os.path.join(root, f)
            with open(path, 'r') as file:
                content = file.read()
            content = refine_links(content)
            
            # Additional "fine UI" enhancements for the login page specifically:
            if f == 'page.tsx' and 'login' in path:
                # Let's make it look pristine.
                content = content.replace('min-h-screen', 'min-h-screen bg-slate-900 flex justify-center items-center')
                # If there's a main structural box, elevate it
                content = content.replace('bg-white', 'bg-white shadow-[0_0_80px_rgba(0,0,128,0.1)]')
            
            with open(path, 'w') as file:
                file.write(content)

print("Linked complete.")
