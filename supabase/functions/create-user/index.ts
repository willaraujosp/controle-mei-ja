
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, nome, plano } = await req.json();

    if (!email || !password || !nome || !plano) {
      throw new Error('Dados obrigatórios não fornecidos');
    }

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create user in auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nome: nome
      }
    });

    if (authError) {
      throw new Error(`Erro ao criar usuário: ${authError.message}`);
    }

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        nome_empresa: nome
      });

    if (profileError) {
      console.log('Erro ao criar perfil (pode ser ignorado se tabela não existir):', profileError);
    }

    // Create subscription
    const { error: subscriptionError } = await supabaseAdmin
      .from('assinaturas')
      .insert({
        user_id: authData.user.id,
        status: plano,
        plano: plano
      });

    if (subscriptionError) {
      throw new Error(`Erro ao criar assinatura: ${subscriptionError.message}`);
    }

    // If plan is 'liberado', add to usuarios_liberados
    if (plano === 'liberado') {
      const { error: liberadoError } = await supabaseAdmin
        .from('usuarios_liberados')
        .insert({
          user_id: authData.user.id,
          liberado: true,
          motivo: 'Criado manualmente pelo administrador'
        });

      if (liberadoError) {
        throw new Error(`Erro ao liberar usuário: ${liberadoError.message}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuário criado com sucesso',
        user_id: authData.user.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro na função create-user:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor' 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
