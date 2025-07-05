
-- Criar tabela de movimentações
CREATE TABLE public.movimentacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  valor DECIMAL(10,2) NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT,
  status TEXT NOT NULL CHECK (status IN ('pago', 'pendente', 'recebido')),
  data DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de clientes
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  contato TEXT,
  observacoes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de fornecedores
CREATE TABLE public.fornecedores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  contato TEXT,
  observacoes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para movimentações
CREATE POLICY "Usuários podem ver suas próprias movimentações" 
  ON public.movimentacoes 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Usuários podem criar movimentações" 
  ON public.movimentacoes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Usuários podem atualizar suas movimentações" 
  ON public.movimentacoes 
  FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Usuários podem deletar suas movimentações" 
  ON public.movimentacoes 
  FOR DELETE 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Políticas RLS para clientes
CREATE POLICY "Usuários podem ver seus próprios clientes" 
  ON public.clientes 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Usuários podem criar clientes" 
  ON public.clientes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Usuários podem atualizar seus clientes" 
  ON public.clientes 
  FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Usuários podem deletar seus clientes" 
  ON public.clientes 
  FOR DELETE 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Políticas RLS para fornecedores
CREATE POLICY "Usuários podem ver seus próprios fornecedores" 
  ON public.fornecedores 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Usuários podem criar fornecedores" 
  ON public.fornecedores 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Usuários podem atualizar seus fornecedores" 
  ON public.fornecedores 
  FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Usuários podem deletar seus fornecedores" 
  ON public.fornecedores 
  FOR DELETE 
  USING (auth.uid() = user_id OR user_id IS NULL);
