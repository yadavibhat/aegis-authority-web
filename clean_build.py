import urllib.request
import re
import os

urls = {
    'zone': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzFhNTUzNGJhYWM4MjQzNGI5MzJkYmIyYWJlYjZkMzY1EgsSBxCr1-nzigcYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQ1NjI0OTU3ODk4NjE5MTQzNw&filename=&opi=89354086',
    'authority': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzI0ZDY3OGI3N2ZkMjRlNjNiM2M3ZDM5NzY4NThiZTgxEgsSBxCr1-nzigcYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQ1NjI0OTU3ODk4NjE5MTQzNw&filename=&opi=89354086',
    'alert': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2E4OTJkMzY2YjJmNzRjZDY5OGJlNGUxNmRmYjZmYTZhEgsSBxCr1-nzigcYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQ1NjI0OTU3ODk4NjE5MTQzNw&filename=&opi=89354086',
    'login': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2ZiNTFmZDVlNzM2NTQzOWJhZDE5ZjI3NzU1NGQwM2QyEgsSBxCr1-nzigcYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQ1NjI0OTU3ODk4NjE5MTQzNw&filename=&opi=89354086',
    'tourist': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzUzYTg1YjM5ODlhMDRjYmJhZjBhMDk5YTZhYjhhNmQ3EgsSBxCr1-nzigcYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQ1NjI0OTU3ODk4NjE5MTQzNw&filename=&opi=89354086'
}

def to_jsx(html, page_name):
    jsx = html.replace('class=', 'className=')
    jsx = jsx.replace('for=', 'htmlFor=')
    # Use accurate regex for self closing tags
    jsx = re.sub(r'style="([^"]*)"', '', jsx)
    jsx = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', jsx, flags=re.DOTALL)
    
    # Very safe specific link mapping for routing
    jsx = jsx.replace('href="#"', 'href="/authority"')
    jsx = jsx.replace('href="/authority">Zones<', 'href="/zone">Zones<')
    jsx = jsx.replace('href="/authority">Tourists<', 'href="/tourist">Tourists<')
    jsx = jsx.replace('href="/authority">Alerts<', 'href="/alert">Alerts<')
    jsx = jsx.replace('href="/authority">Personnel<', 'href="/tourist">Personnel<')
    jsx = jsx.replace('href="/authority">Operations<', 'href="/zone">Operations<')
    
    # We will wrap it in a client component so we can add interactivity hooks
    comp = f"""'use client';
import React, {{ useEffect, useState }} from 'react';
import {{ useRouter }} from 'next/navigation';

export default function {page_name.capitalize()}Screen() {{
   const router = useRouter();
   const [data, setData] = useState<any>(null);
   const [loading, setLoading] = useState(false);

   // Simple interactive wrapper handler
   const handleAction = async (endpoint: string, method: string = 'GET') => {{
       setLoading(true);
       try {{
           const res = await fetch(endpoint, {{ method }});
           const result = await res.json();
           setData(result);
           alert("Fetched Data! Total records: " + (Array.isArray(result) ? result.length : "N/A"));
       }} catch (e) {{
           alert("Error communicating with server.");
       }}
       setLoading(false);
   }};

  return (
    <>
      <div onClick={{(e) => {{
          // Generic interceptor for untouched buttons
          const target = e.target as HTMLElement;
          if (target.tagName === 'BUTTON' && !target.hasAttribute('data-action-wired')) {{
               alert("Simulated Button Click Request. Route logic active.");
               handleAction('/api/admin/live'); // Force a fetch on generic buttons
          }}
      }}}}>
      {jsx}
      </div>
    </>
  );
}}
"""
    return comp


for name, url in urls.items():
    print(f"Fetching pristine {name}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL | re.IGNORECASE)
    if match:
        raw_body = match.group(1)
        # Fix missing closing slashes dynamically across elements Stitch uses
        raw_body = re.sub(r'(<(img|input|hr|br)[^>]*?)(?<!/)>', r'\1 />', raw_body)
        
        # Specific rewrites to wire buttons directly dynamically!
        if name == 'login':
            raw_body = raw_body.replace('<a ', '<a data-action-wired onClick={() => router.push("/authority")} ')
            raw_body = raw_body.replace('<button', '<button data-action-wired onClick={() => router.push("/authority")} ')
        
        # In Alert screen, find resolve button and wire it
        if name == 'alert':
            raw_body = raw_body.replace('Accept Case', 'Accept Case</button><button data-action-wired onClick={() => handleAction("/api/admin/alerts/1/resolve", "POST")}')

        jsx_output = to_jsx(raw_body, name)
        
        os.makedirs(f"src/app/{name}", exist_ok=True)
        with open(f"src/app/{name}/page.tsx", "w") as f:
            f.write(jsx_output)

print("Clean restoration complete.")
