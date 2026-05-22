-- =====================================================
-- EXECUTE NO SUPABASE SQL EDITOR
-- Força a confirmação do e-mail para permitir o login
-- =====================================================

UPDATE auth.users 
SET email_confirmed_at = now(),
    confirmed_at = now()
WHERE email ILIKE 'adrianoscandido93@gmail.com' 
   OR email ILIKE 'Psicoanapaulacandido@hotmail.com';
