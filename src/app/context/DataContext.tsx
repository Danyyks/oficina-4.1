import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Cliente, Veiculo, NotaServico, Orcamento } from '../types';
import {
  fetchClientes, saveCliente, patchCliente, removeCliente as deleteClienteDb,
  fetchVeiculos, saveVeiculo, patchVeiculo, removeVeiculo as deleteVeiculoDb,
  fetchNotas, saveNota, patchNota, removeNota as deleteNotaDb,
  fetchOrcamentos, saveOrcamento, patchOrcamento, removeOrcamento as deleteOrcamentoDb,
  subscribeClientes, subscribeVeiculos, subscribeNotas, subscribeOrcamentos,
} from '../services/dbService';

interface DataContextType {
  clientes: Cliente[];
  veiculos: Veiculo[];
  notas: NotaServico[];
  orcamentos: Orcamento[];
  addCliente: (cliente: Cliente) => void;
  updateCliente: (id: string, cliente: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  addVeiculo: (veiculo: Veiculo) => void;
  updateVeiculo: (id: string, veiculo: Partial<Veiculo>) => void;
  deleteVeiculo: (id: string) => void;
  addNota: (nota: NotaServico) => void;
  updateNota: (id: string, nota: Partial<NotaServico>) => void;
  deleteNota: (id: string) => void;
  nextNumeroNota: () => string;
  addOrcamento: (orcamento: Orcamento) => void;
  updateOrcamento: (id: string, orcamento: Partial<Orcamento>) => void;
  deleteOrcamento: (id: string) => void;
  nextNumeroOrcamento: () => string;
  getClienteById: (id: string) => Cliente | undefined;
  getVeiculoById: (id: string) => Veiculo | undefined;
  getVeiculosByClienteId: (clienteId: string) => Veiculo[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Migra dados do localStorage para o Firestore na primeira vez que o Firestore estiver vazio
async function migrateLocalStorageToFirestore(
  firestoreClientes: Cliente[],
  firestoreVeiculos: Veiculo[],
  firestoreNotas: NotaServico[],
  firestoreOrcamentos: Orcamento[],
): Promise<{ clientes: Cliente[]; veiculos: Veiculo[]; notas: NotaServico[]; orcamentos: Orcamento[] }> {
  const firestoreVazio =
    firestoreClientes.length === 0 &&
    firestoreVeiculos.length === 0 &&
    firestoreNotas.length === 0 &&
    firestoreOrcamentos.length === 0;

  if (!firestoreVazio) {
    return { clientes: firestoreClientes, veiculos: firestoreVeiculos, notas: firestoreNotas, orcamentos: firestoreOrcamentos };
  }

  const localClientes: Cliente[] = JSON.parse(localStorage.getItem('clientes') || '[]');
  const localVeiculos: Veiculo[] = JSON.parse(localStorage.getItem('veiculos') || '[]');
  const localNotas: NotaServico[] = JSON.parse(localStorage.getItem('notas') || '[]');
  const localOrcamentos: Orcamento[] = JSON.parse(localStorage.getItem('orcamentos') || '[]');

  const temDadosLocais =
    localClientes.length > 0 ||
    localVeiculos.length > 0 ||
    localNotas.length > 0 ||
    localOrcamentos.length > 0;

  if (!temDadosLocais) {
    return { clientes: [], veiculos: [], notas: [], orcamentos: [] };
  }

  // Migra tudo para o Firestore em paralelo
  await Promise.all([
    ...localClientes.map(c => saveCliente(c)),
    ...localVeiculos.map(v => saveVeiculo(v)),
    ...localNotas.map(n => saveNota(n)),
    ...localOrcamentos.map(o => saveOrcamento(o)),
  ]);

  console.info(`[Migração] ${localClientes.length} clientes, ${localVeiculos.length} veículos, ${localNotas.length} notas, ${localOrcamentos.length} orçamentos enviados ao Firestore.`);

  return { clientes: localClientes, veiculos: localVeiculos, notas: localNotas, orcamentos: localOrcamentos };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [notas, setNotas] = useState<NotaServico[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);

  // Carrega dados, migra localStorage se necessário e mantém sync em tempo real
  useEffect(() => {
    const unsubs: (() => void)[] = [];
    let initializedCount = 0;

    const checkAllInitialized = () => {
      initializedCount++;
      if (initializedCount === 4) setLoading(false);
    };

    const setupListeners = () => {
      unsubs.push(
        subscribeClientes(data => {
          setClientes(data);
          checkAllInitialized();
        }),
        subscribeVeiculos(data => {
          setVeiculos(data);
          checkAllInitialized();
        }),
        subscribeNotas(data => {
          setNotas([...data].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()));
          checkAllInitialized();
        }),
        subscribeOrcamentos(data => {
          setOrcamentos([...data].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()));
          checkAllInitialized();
        }),
      );
    };

    Promise.all([fetchClientes(), fetchVeiculos(), fetchNotas(), fetchOrcamentos()])
      .then(([c, v, n, o]) => migrateLocalStorageToFirestore(c, v, n, o))
      .then(setupListeners)
      .catch(err => {
        console.error('[DataContext] Erro ao carregar dados:', err);
        setLoading(false);
      });

    return () => unsubs.forEach(u => u());
  }, []);

  // Números derivados do maior número já existente (sem contador separado)
  const nextNumeroNota = (): string => {
    const max = notas.reduce((m, n) => Math.max(m, parseInt(n.numero, 10) || 0), 0);
    return (max + 1).toString().padStart(4, '0');
  };

  const nextNumeroOrcamento = (): string => {
    const max = orcamentos.reduce((m, o) => Math.max(m, parseInt(o.numero, 10) || 0), 0);
    return (max + 1).toString().padStart(4, '0');
  };

  // ── Clientes ─────────────────────────────────────────────────────────────────

  const addCliente = (cliente: Cliente) => {
    setClientes(prev => [...prev, cliente]);
    saveCliente(cliente).catch(err => console.error('[addCliente]', err));
  };

  const updateCliente = (id: string, clienteUpdate: Partial<Cliente>) => {
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...clienteUpdate } : c));
    patchCliente(id, clienteUpdate).catch(err => console.error('[updateCliente]', err));
  };

  const deleteCliente = (id: string) => {
    const veiculosDoCliente = veiculos.filter(v => v.clienteId === id).map(v => v.id);
    setClientes(prev => prev.filter(c => c.id !== id));
    setVeiculos(prev => prev.filter(v => v.clienteId !== id));
    setNotas(prev => prev.filter(n => n.clienteId !== id && !veiculosDoCliente.includes(n.veiculoId)));
    setOrcamentos(prev => prev.filter(o => o.clienteId !== id && !veiculosDoCliente.includes(o.veiculoId)));

    // Deleta em cascata no Firestore
    deleteClienteDb(id).catch(err => console.error('[deleteCliente]', err));
    veiculosDoCliente.forEach(vid => deleteVeiculoDb(vid).catch(err => console.error('[deleteVeiculo cascata]', err)));
    notas
      .filter(n => n.clienteId === id || veiculosDoCliente.includes(n.veiculoId))
      .forEach(n => deleteNotaDb(n.id).catch(err => console.error('[deleteNota cascata]', err)));
    orcamentos
      .filter(o => o.clienteId === id || veiculosDoCliente.includes(o.veiculoId))
      .forEach(o => deleteOrcamentoDb(o.id).catch(err => console.error('[deleteOrcamento cascata]', err)));
  };

  // ── Veículos ──────────────────────────────────────────────────────────────────

  const addVeiculo = (veiculo: Veiculo) => {
    setVeiculos(prev => [...prev, veiculo]);
    saveVeiculo(veiculo).catch(err => console.error('[addVeiculo]', err));
  };

  const updateVeiculo = (id: string, veiculoUpdate: Partial<Veiculo>) => {
    setVeiculos(prev => prev.map(v => v.id === id ? { ...v, ...veiculoUpdate } : v));
    patchVeiculo(id, veiculoUpdate).catch(err => console.error('[updateVeiculo]', err));
  };

  const deleteVeiculo = (id: string) => {
    setVeiculos(prev => prev.filter(v => v.id !== id));
    setNotas(prev => prev.filter(n => n.veiculoId !== id));
    setOrcamentos(prev => prev.filter(o => o.veiculoId !== id));
    deleteVeiculoDb(id).catch(err => console.error('[deleteVeiculo]', err));
    notas
      .filter(n => n.veiculoId === id)
      .forEach(n => deleteNotaDb(n.id).catch(err => console.error('[deleteNota cascata]', err)));
    orcamentos
      .filter(o => o.veiculoId === id)
      .forEach(o => deleteOrcamentoDb(o.id).catch(err => console.error('[deleteOrcamento cascata]', err)));
  };

  // ── Notas de Serviço ──────────────────────────────────────────────────────────

  const addNota = (nota: NotaServico) => {
    setNotas(prev => [nota, ...prev]);
    saveNota(nota).catch(err => console.error('[addNota]', err));
  };

  const updateNota = (id: string, notaUpdate: Partial<NotaServico>) => {
    setNotas(prev => prev.map(n => n.id === id ? { ...n, ...notaUpdate } : n));
    patchNota(id, notaUpdate).catch(err => console.error('[updateNota]', err));
  };

  const deleteNota = (id: string) => {
    setNotas(prev => prev.filter(n => n.id !== id));
    deleteNotaDb(id).catch(err => console.error('[deleteNota]', err));
  };

  // ── Orçamentos ────────────────────────────────────────────────────────────────

  const addOrcamento = (orcamento: Orcamento) => {
    setOrcamentos(prev => [orcamento, ...prev]);
    saveOrcamento(orcamento).catch(err => console.error('[addOrcamento]', err));
  };

  const updateOrcamento = (id: string, orcamentoUpdate: Partial<Orcamento>) => {
    setOrcamentos(prev => prev.map(o => o.id === id ? { ...o, ...orcamentoUpdate } : o));
    patchOrcamento(id, orcamentoUpdate).catch(err => console.error('[updateOrcamento]', err));
  };

  const deleteOrcamento = (id: string) => {
    setOrcamentos(prev => prev.filter(o => o.id !== id));
    deleteOrcamentoDb(id).catch(err => console.error('[deleteOrcamento]', err));
  };

  // ── Helpers ───────────────────────────────────────────────────────────────────

  const getClienteById = (id: string) => clientes.find(c => c.id === id);
  const getVeiculoById = (id: string) => veiculos.find(v => v.id === id);
  const getVeiculosByClienteId = (clienteId: string) => veiculos.filter(v => v.clienteId === clienteId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <DataContext.Provider
      value={{
        clientes,
        veiculos,
        notas,
        orcamentos,
        addCliente,
        updateCliente,
        deleteCliente,
        addVeiculo,
        updateVeiculo,
        deleteVeiculo,
        addNota,
        updateNota,
        deleteNota,
        nextNumeroNota,
        addOrcamento,
        updateOrcamento,
        deleteOrcamento,
        nextNumeroOrcamento,
        getClienteById,
        getVeiculoById,
        getVeiculosByClienteId,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
