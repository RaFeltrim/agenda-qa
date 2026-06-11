import os

# Fix 001_complete_v1_features.sql
sql_file = r'C:\Users\RafaelFeltrim\Desktop\Projetos\Agenda-QA\supabase\migrations\001_complete_v1_features.sql'
if os.path.exists(sql_file):
    with open(sql_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace("start_date", "data_inicio")
    content = content.replace("end_date", "data_fim")
    
    with open(sql_file, 'w', encoding='utf-8') as f:
        f.write(content)

# Fix useSprints.ts
ts_file = r'C:\Users\RafaelFeltrim\Desktop\Projetos\Agenda-QA\src\hooks\useSprints.ts'
if os.path.exists(ts_file):
    with open(ts_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace("'start_date'", "'data_inicio'")
    
    with open(ts_file, 'w', encoding='utf-8') as f:
        f.write(content)
