import os

files = [
    r'C:\Users\RafaelFeltrim\Desktop\Projetos\Agenda-QA\database\000_create_all_tables.sql',
    r'C:\Users\RafaelFeltrim\Desktop\Projetos\Agenda-QA\supabase\migrations\001_complete_v1_features.sql'
]

for file in files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace CREATE POLICY IF NOT EXISTS with just CREATE POLICY
        content = content.replace("CREATE POLICY IF NOT EXISTS", "CREATE POLICY")
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
