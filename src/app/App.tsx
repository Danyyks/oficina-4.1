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
  const { notas } = useData();

  const renderPage = () => {
    if (currentPage === 'dashboard') {
      return <Dashboard onNavigate={setCurrentPage} />;
    }
    if (currentPage === 'clientes') {
      return <Clientes onNavigate={setCurrentPage} />;
    }
    if (currentPage === 'nova-nota') {
      return <NovaNota onNavigate={setCurrentPage} />;
    }
    if (currentPage === 'historico') {
      return <Historico onNavigate={setCurrentPage} />;
    }
    if (currentPage.startsWith('editar-nota-')) {
      const notaId = currentPage.replace('editar-nota-', '');
      const nota = notas.find(n => n.id === notaId);
      return <NovaNota onNavigate={setCurrentPage} notaParaEditar={nota} />;
    }
    if (currentPage.startsWith('nota-')) {
      const notaId = currentPage.replace('nota-', '');
      return <NotaView notaId={notaId} onNavigate={setCurrentPage} />;
    }
    return <Dashboard onNavigate={setCurrentPage} />;
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