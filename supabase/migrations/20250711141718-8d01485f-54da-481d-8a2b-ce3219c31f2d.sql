-- Corrigir as datas do trial baseadas na data de criação do usuário
-- Usuários criados há mais de 3 dias devem ter trial expirado

-- Primeiro, vamos corrigir as datas de trial baseadas na data de criação dos perfis
UPDATE public.assinaturas 
SET 
  trial_start_date = p.created_at,
  trial_end_date = p.created_at + interval '3 days',
  is_trial_active = CASE 
    WHEN p.created_at + interval '3 days' > now() THEN true 
    ELSE false 
  END,
  subscription_active = CASE 
    WHEN status = 'liberado' OR status = 'premium' OR status = 'parceiro' THEN true
    ELSE false
  END
FROM public.profiles p 
WHERE assinaturas.user_id = p.user_id;

-- Para usuários sem perfil (não deveria acontecer, mas por segurança)
-- Vamos definir datas baseadas na data de criação da própria assinatura
UPDATE public.assinaturas 
SET 
  trial_start_date = created_at,
  trial_end_date = created_at + interval '3 days',
  is_trial_active = CASE 
    WHEN created_at + interval '3 days' > now() THEN true 
    ELSE false 
  END,
  subscription_active = CASE 
    WHEN status = 'liberado' OR status = 'premium' OR status = 'parceiro' THEN true
    ELSE false
  END
WHERE trial_start_date IS NULL OR trial_start_date = '2025-07-10 18:18:25.248087+00';