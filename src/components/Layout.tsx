
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  FileText, 
  Settings,
  Menu,
  X,
  LogOut,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Lançamentos', href: '/lancamentos', icon: TrendingUp },
    { name: 'Relatórios', href: '/relatorios', icon: FileText },
    { name: 'Configurações', href: '/configuracoes', icon: Settings }
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  // Simular expiração do teste (3 dias)
  const isTrialExpired = false; // Mude para true para testar

  if (isTrialExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mei-gray to-white flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <CreditCard className="h-16 w-16 text-mei-red mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-mei-text mb-4">
              Teste Gratuito Expirado
            </h2>
            <p className="text-gray-600 mb-6">
              Seu período de teste de 3 dias expirou. Para continuar usando o MEI Finance, 
              assine nosso plano por apenas R$ 29,90/mês.
            </p>
            <Button
              onClick={() => window.open('https://pay.cakto.com.br/3f9sct4_464768', '_blank')}
              className="w-full mei-button text-lg py-6 mb-4"
            >
              Assinar por R$ 29,90/mês
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full"
            >
              Fazer Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-mei-gray">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold">
            <span className="text-mei-red">MEI</span> Finance
          </h1>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-mei-red text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full justify-start text-gray-600 hover:text-mei-red"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sair
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden lg:block" />
          
          <div className="text-sm text-gray-600">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              Teste Gratuito Ativo
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
