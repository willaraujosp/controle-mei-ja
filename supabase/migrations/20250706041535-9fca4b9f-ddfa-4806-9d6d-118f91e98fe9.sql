
-- Criar tabela para usuários liberados manualmente
CREATE TABLE public.usuarios_liberados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  liberado BOOLEAN NOT NULL DEFAULT false,
  liberado_por UUID REFERENCES auth.users(id),
  motivo TEXT,
  data_liberacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para códigos de parceria
CREATE TABLE public.codigos_parceria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  uso_maximo INTEGER,
  uso_atual INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para parcerias ativas (usuários que usaram códigos)
CREATE TABLE public.parcerias_ativas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  codigo_id UUID REFERENCES public.codigos_parceria(id),
  codigo_usado TEXT NOT NULL,
  data_ativacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para controle de assinaturas
CREATE TABLE public.assinaturas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('teste_gratuito', 'premium', 'expirado', 'liberado')),
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_fim TIMESTAMP WITH TIME ZONE,
  plano TEXT DEFAULT 'teste_gratuito',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para rastrear exportações de PDF
CREATE TABLE public.exportacoes_pdf (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_relatorio TEXT NOT NULL,
  data_exportacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.usuarios_liberados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.codigos_parceria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcerias_ativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exportacoes_pdf ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários_liberados (apenas admins podem acessar)
CREATE POLICY "Apenas admins podem gerenciar liberações" 
  ON public.usuarios_liberados 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'wiaslan1999@gmail.com'
  ));

-- Políticas para códigos_parceria (apenas admins)
CREATE POLICY "Apenas admins podem gerenciar códigos" 
  ON public.codigos_parceria 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'wiaslan1999@gmail.com'
  ));

-- Políticas para parcerias_ativas (usuários podem ver suas próprias, admins veem todas)
CREATE POLICY "Usuários veem suas parcerias, admins veem todas" 
  ON public.parcerias_ativas 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'wiaslan1999@gmail.com'
    )
  );

-- Políticas para assinaturas (usuários veem suas próprias, admins veem todas)
CREATE POLICY "Usuários veem suas assinaturas, admins veem todas" 
  ON public.assinaturas 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'wiaslan1999@gmail.com'
    )
  );

CREATE POLICY "Usuários podem inserir suas assinaturas" 
  ON public.assinaturas 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Políticas para exportacoes_pdf
CREATE POLICY "Usuários veem suas exportações, admins veem todas" 
  ON public.exportacoes_pdf 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'wiaslan1999@gmail.com'
    )
  );

CREATE POLICY "Usuários podem registrar suas exportações" 
  ON public.exportacoes_pdf 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Inserir assinatura de teste para todos os usuários existentes
INSERT INTO public.assinaturas (user_id, status, plano)
SELECT id, 'teste_gratuito', 'teste_gratuito' 
FROM auth.users 
WHERE NOT EXISTS (
  SELECT 1 FROM public.assinaturas WHERE assinaturas.user_id = auth.users.id
);
