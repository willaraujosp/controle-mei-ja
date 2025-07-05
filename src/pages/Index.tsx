
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  PieChart, 
  Users, 
  FileText, 
  Smartphone, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular login
    setTimeout(() => {
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
      });
      navigate('/dashboard');
      setIsLoading(false);
    }, 1000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    // Simular cadastro
    setTimeout(() => {
      toast({
        title: "Conta criada com sucesso!",
        description: "Seu teste gratuito de 3 dias foi ativado!",
      });
      navigate('/dashboard');
      setIsLoading(false);
    }, 1000);
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: "Controle de entradas e saídas",
      description: "Registre todas suas movimentações financeiras"
    },
    {
      icon: PieChart,
      title: "Visualização do saldo atualizado",
      description: "Veja seu saldo em tempo real"
    },
    {
      icon: PieChart,
      title: "Gráficos de movimentações mensais",
      description: "Analise suas finanças com gráficos intuitivos"
    },
    {
      icon: Users,
      title: "Cadastro de clientes e fornecedores",
      description: "Organize seus contatos comerciais"
    },
    {
      icon: FileText,
      title: "Relatórios financeiros exportáveis em PDF",
      description: "Gere relatórios profissionais"
    },
    {
      icon: Smartphone,
      title: "Acesso rápido e 100% online",
      description: "Use no celular ou computador"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-mei-gray to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-mei-text mb-4">
            <span className="text-mei-red">MEI</span> Finance
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A solução completa para microempreendedores individuais organizarem suas finanças
          </p>
        </header>

        {/* Main Content - Two Columns */}
        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
          
          {/* Left Side - Benefits */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-mei-text">
                Organize suas finanças com facilidade
              </h2>
              <p className="text-lg text-gray-600">
                Tudo que você precisa para controlar as finanças do seu negócio em uma única plataforma.
              </p>
            </div>

            <div className="grid gap-4">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-start space-x-4 p-4 rounded-lg hover:bg-white/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <benefit.icon className="h-6 w-6 text-mei-red" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-mei-text mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-mei-text">Teste grátis por 3 dias</span>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-mei-red mb-2">
                  R$ 29,90<span className="text-lg text-gray-500">/mês</span>
                </div>
                <p className="text-gray-600">
                  Depois do período de teste
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Login/Register Form */}
          <div className="lg:sticky lg:top-8">
            <Card className="p-8 shadow-lg border-0 bg-white/95 backdrop-blur">
              <Tabs defaultValue="register" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="register">Criar Conta</TabsTrigger>
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                </TabsList>

                <TabsContent value="register" className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-mei-text mb-2">
                      Começar Teste Grátis
                    </h3>
                    <p className="text-gray-600">
                      3 dias grátis, depois apenas R$ 29,90/mês
                    </p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        className="mei-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Sua senha"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                        className="mei-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirme sua senha"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        required
                        className="mei-input"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full mei-button text-lg py-6"
                      disabled={isLoading}
                    >
                      {isLoading ? "Criando conta..." : "Criar Conta e Começar o Teste Grátis"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="login" className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-mei-text mb-2">
                      Bem-vindo de volta!
                    </h3>
                    <p className="text-gray-600">
                      Entre na sua conta
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="loginEmail">E-mail</Label>
                      <Input
                        id="loginEmail"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        className="mei-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="loginPassword">Senha</Label>
                      <Input
                        id="loginPassword"
                        type="password"
                        placeholder="Sua senha"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                        className="mei-input"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full mei-button text-lg py-6"
                      disabled={isLoading}
                    >
                      {isLoading ? "Entrando..." : "Entrar"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
