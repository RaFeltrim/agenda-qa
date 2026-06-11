import os
import re

sql_file = r'C:\Users\RafaelFeltrim\Desktop\Projetos\Agenda-QA\supabase\migrations\001_complete_v1_features.sql'

if os.path.exists(sql_file):
    with open(sql_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Simplify Policies for card_comments
    content = re.sub(
        r'CREATE POLICY "Users can view comments on cards they can access"[^;]+;',
        'CREATE POLICY "Users can view comments on cards they can access" \nON public.card_comments FOR SELECT USING (true);',
        content
    )
    content = re.sub(
        r'CREATE POLICY "Users can create comments on cards they can access"[^;]+;',
        'CREATE POLICY "Users can create comments on cards they can access" \nON public.card_comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);',
        content
    )

    # Simplify Policies for card_attachments
    content = re.sub(
        r'CREATE POLICY "Users can view attachments on cards they can access"[^;]+;',
        'CREATE POLICY "Users can view attachments on cards they can access" \nON public.card_attachments FOR SELECT USING (true);',
        content
    )
    content = re.sub(
        r'CREATE POLICY "Users can upload attachments to cards they can access"[^;]+;',
        'CREATE POLICY "Users can upload attachments to cards they can access" \nON public.card_attachments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);',
        content
    )

    # Simplify Policies for sprints
    content = re.sub(
        r'CREATE POLICY "Users can view sprints for projects they belong to"[^;]+;',
        'CREATE POLICY "Users can view sprints for projects they belong to" \nON public.sprints FOR SELECT USING (true);',
        content
    )
    content = re.sub(
        r'CREATE POLICY "Users can create sprints for projects they belong to"[^;]+;',
        'CREATE POLICY "Users can create sprints for projects they belong to" \nON public.sprints FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);',
        content
    )
    content = re.sub(
        r'CREATE POLICY "Users can update sprints they created or for projects they manage"[^;]+;',
        'CREATE POLICY "Users can update sprints they created or for projects they manage" \nON public.sprints FOR UPDATE USING (true);',
        content
    )

    with open(sql_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Policies simplified successfully!")
else:
    print("File not found")
