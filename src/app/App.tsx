import { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { Dashboard } from './components/Dashboard';
import { Clientes } from './components/Clientes';
import { NovaNota } from './components/NovaNota';
import { NotaView } from './components/NotaView';
import { Historico } from './components/Historico';
import { HistoricoOrcamentos } from './components/HistoricoOrcamentos';
import { NovoOrcamento } from './components/NovoOrcamento';
import { OrcamentoView } from './components/OrcamentoView';
import { Toaster } from './components/ui/sonner';
import { Footer } from './components/Footer';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [previousPage, setPreviousPage] = useState('dashboard');
  const { notas, orcamentos } = useData();

  const navigate = (page: string) => {
    setPreviousPage(currentPage);
    setCurrentPage(page);
  };

  const renderPage = () => {
    if (currentPage === 'dashboard') {
      return <Dashboard onNavigate={navigate} />;
    }
    if (currentPage === 'clientes') {
      return <Clientes onNavigate={navigate} />;
    }
    if (currentPage === 'nova-nota') {
      return <NovaNota onNavigate={navigate} />;
    }
    if (currentPage === 'historico') {
      return <Historico onNavigate={navigate} />;
    }
    if (currentPage === 'historico-orcamentos') {
      return <HistoricoOrcamentos onNavigate={navigate} />;
    }
    if (currentPage === 'novo-orcamento') {
      return <NovoOrcamento onNavigate={navigate} />;
    }
    if (currentPage.startsWith('editar-nota-')) {
      const notaId = currentPage.replace('editar-nota-', '');
      const nota = notas.find(n => n.id === notaId);
      return <NovaNota onNavigate={navigate} notaParaEditar={nota} />;
    }
    if (currentPage.startsWith('nota-')) {
      const notaId = currentPage.replace('nota-', '');
      const backTo = previousPage === 'dashboard' ? 'dashboard' : 'historico';
      return <NotaView notaId={notaId} onNavigate={navigate} backTo={backTo} />;
    }
    if (currentPage.startsWith('editar-orcamento-')) {
      const orcamentoId = currentPage.replace('editar-orcamento-', '');
      const orcamento = orcamentos.find(o => o.id === orcamentoId);
      return <NovoOrcamento onNavigate={navigate} orcamentoParaEditar={orcamento} />;
    }
    if (currentPage.startsWith('orcamento-')) {
      const orcamentoId = currentPage.replace('orcamento-', '');
      const backTo = previousPage === 'historico-orcamentos' ? 'historico-orcamentos' : 'dashboard';
      return <OrcamentoView orcamentoId={orcamentoId} onNavigate={navigate} backTo={backTo} />;
    }
    return <Dashboard onNavigate={navigate} />;
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto">
        {renderPage()}
      </div>
      <Footer />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
