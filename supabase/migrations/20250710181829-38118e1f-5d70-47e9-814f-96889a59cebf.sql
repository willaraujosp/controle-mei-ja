-- Verificar se a tabela assinaturas já tem os campos necessários e ajustar
-- Primeiro, vamos adicionar campos que podem estar faltando na tabela assinaturas
ALTER TABLE public.assinaturas 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ DEFAULT (now() + interval '3 days'),
ADD COLUMN IF NOT EXISTS is_trial_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS subscription_active BOOLEAN DEFAULT false;

-- Atualizar registros existentes para ter as datas de trial corretas
UPDATE public.assinaturas 
SET 
  trial_start_date = COALESCE(trial_start_date, created_at),
  trial_end_date = COALESCE(trial_end_date, created_at + interval '3 days'),
  is_trial_active = CASE 
    WHEN status = 'teste_gratuito' AND (created_at + interval '3 days') > now() THEN true
    ELSE false
  END,
  subscription_active = CASE 
    WHEN status = 'ativo' THEN true
    ELSE false
  END
WHERE trial_start_date IS NULL OR trial_end_date IS NULL;

-- Criar função para verificar status da assinatura
CREATE OR REPLACE FUNCTION public.check_subscription_status(user_uuid UUID)
RETURNS TABLE (
  has_active_trial BOOLEAN,
  has_active_subscription BOOLEAN,
  trial_days_remaining INTEGER,
  trial_expired BOOLEAN,
  should_block_access BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  assinatura_record RECORD;
BEGIN
  -- Buscar a assinatura do usuário
  SELECT * INTO assinatura_record
  FROM public.assinaturas 
  WHERE user_id = user_uuid 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Se não tem assinatura, criar uma nova com trial
  IF assinatura_record IS NULL THEN
    INSERT INTO public.assinaturas (user_id, status, plano, trial_start_date, trial_end_date, is_trial_active, subscription_active)
    VALUES (user_uuid, 'teste_gratuito', 'trial', now(), now() + interval '3 days', true, false);
    
    RETURN QUERY SELECT 
      true::BOOLEAN as has_active_trial,
      false::BOOLEAN as has_active_subscription,
      3::INTEGER as trial_days_remaining,
      false::BOOLEAN as trial_expired,
      false::BOOLEAN as should_block_access;
    RETURN;
  END IF;
  
  -- Verificar status atual
  RETURN QUERY SELECT 
    CASE 
      WHEN assinatura_record.is_trial_active AND assinatura_record.trial_end_date > now() THEN true
      ELSE false
    END as has_active_trial,
    assinatura_record.subscription_active as has_active_subscription,
    CASE 
      WHEN assinatura_record.trial_end_date > now() THEN 
        EXTRACT(days FROM (assinatura_record.trial_end_date - now()))::INTEGER
      ELSE 0
    END as trial_days_remaining,
    CASE 
      WHEN assinatura_record.trial_end_date <= now() AND NOT assinatura_record.subscription_active THEN true
      ELSE false
    END as trial_expired,
    CASE 
      WHEN assinatura_record.trial_end_date <= now() AND NOT assinatura_record.subscription_active THEN true
      ELSE false
    END as should_block_access;
END;
$$;

-- Atualizar políticas RLS para incluir as novas funções
DROP POLICY IF EXISTS "Usuários veem suas assinaturas, admins veem todas" ON public.assinaturas;

CREATE POLICY "Usuários veem suas assinaturas, admins veem todas" 
ON public.assinaturas 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  (EXISTS (SELECT 1 FROM auth.users WHERE users.id = auth.uid() AND users.email = 'wiaslan1999@gmail.com'))
);

-- Permitir atualização de assinaturas pelo próprio usuário e admins
CREATE POLICY "Usuários podem atualizar suas assinaturas" 
ON public.assinaturas 
FOR UPDATE 
USING (
  (auth.uid() = user_id) OR 
  (EXISTS (SELECT 1 FROM auth.users WHERE users.id = auth.uid() AND users.email = 'wiaslan1999@gmail.com'))
);