import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Cliente, Veiculo, NotaServico } from '../types';

interface DataContextType {
  clientes: Cliente[];
  veiculos: Veiculo[];
  notas: NotaServico[];
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
  getClienteById: (id: string) => Cliente | undefined;
  getVeiculoById: (id: string) => Veiculo | undefined;
  getVeiculosByClienteId: (clienteId: string) => Veiculo[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const saved = localStorage.getItem('clientes');
    return saved ? JSON.parse(saved) : [];
  });

  const [veiculos, setVeiculos] = useState<Veiculo[]>(() => {
    const saved = localStorage.getItem('veiculos');
    return saved ? JSON.parse(saved) : [];
  });

  const [notas, setNotas] = useState<NotaServico[]>(() => {
    const saved = localStorage.getItem('notas');
    return saved ? JSON.parse(saved) : [];
  });

  const [notaCounter, setNotaCounter] = useState<number>(() => {
    const saved = localStorage.getItem('notaCounter');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('clientes', JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    localStorage.setItem('veiculos', JSON.stringify(veiculos));
  }, [veiculos]);

  useEffect(() => {
    localStorage.setItem('notas', JSON.stringify(notas));
  }, [notas]);

  useEffect(() => {
    localStorage.setItem('notaCounter', notaCounter.toString());
  }, [notaCounter]);

  const nextNumeroNota = (): string => {
    const next = notaCounter + 1;
    setNotaCounter(next);
    return next.toString().padStart(4, '0');
  };

  const addCliente = (cliente: Cliente) => {
    setClientes(prev => [...prev, cliente]);
  };

  const updateCliente = (id: string, clienteUpdate: Partial<Cliente>) => {
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...clienteUpdate } : c));
  };

  const deleteCliente = (id: string) => {
    const veiculosDoCliente = veiculos.filter(v => v.clienteId === id).map(v => v.id);
    setClientes(prev => prev.filter(c => c.id !== id));
    setVeiculos(prev => prev.filter(v => v.clienteId !== id));
    setNotas(prev => prev.filter(n => n.clienteId !== id && !veiculosDoCliente.includes(n.veiculoId)));
  };

  const addVeiculo = (veiculo: Veiculo) => {
    setVeiculos(prev => [...prev, veiculo]);
  };

  const updateVeiculo = (id: string, veiculoUpdate: Partial<Veiculo>) => {
    setVeiculos(prev => prev.map(v => v.id === id ? { ...v, ...veiculoUpdate } : v));
  };

  const deleteVeiculo = (id: string) => {
    setVeiculos(prev => prev.filter(v => v.id !== id));
    setNotas(prev => prev.filter(n => n.veiculoId !== id));
  };

  const addNota = (nota: NotaServico) => {
    setNotas(prev => [nota, ...prev]);
  };

  const updateNota = (id: string, notaUpdate: Partial<NotaServico>) => {
    setNotas(prev => prev.map(n => n.id === id ? { ...n, ...notaUpdate } : n));
  };

  const deleteNota = (id: string) => {
    setNotas(prev => prev.filter(n => n.id !== id));
  };

  const getClienteById = (id: string) => {
    return clientes.find(c => c.id === id);
  };

  const getVeiculoById = (id: string) => {
    return veiculos.find(v => v.id === id);
  };

  const getVeiculosByClienteId = (clienteId: string) => {
    return veiculos.filter(v => v.clienteId === clienteId);
  };

  return (
    <DataContext.Provider
      value={{
        clientes,
        veiculos,
        notas,
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
