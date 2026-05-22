-- =====================================================
-- EXECUTE NO SUPABASE SQL EDITOR
-- Força a troca da senha para "123456" e confirma e-mail
-- =====================================================

UPDATE auth.users 
SET encrypted_password = crypt('123456', gen_salt('bf')),
    email_confirmed_at = now()
WHERE email ILIKE 'adrianoscandido93@gmail.com' 
   OR email ILIKE 'Psicoanapaulacandido@hotmail.com';
