import { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { Dashboard } from './components/Dashboard';
import { Clientes } from './components/Clientes';
import { NovaNota } from './components/NovaNota';
import { NotaView } from './components/NotaView';
import { Historico } from './components/Historico';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [previousPage, setPreviousPage] = useState('dashboard');
  const { notas } = useData();

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
    return <Dashboard onNavigate={navigate} />;
  };

  return (
    <div className="size-full">
      {renderPage()}
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