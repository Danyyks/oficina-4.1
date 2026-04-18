// Serviço pronto para uso com Firestore.
// Quando quiser migrar do localStorage para Firebase:
//   1. Preencha src/lib/firebase.ts com suas credenciais
//   2. No DataContext, substitua os useState + localStorage pelas funções abaixo
//
// Exemplo de migração no DataContext para clientes:
//   const [clientes, setClientes] = useState<Cliente[]>([]);
//   useEffect(() => { fetchClientes().then(setClientes); }, []);
//   addCliente: async (c) => { await saveCliente(c); setClientes(prev => [...prev, c]); }

import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { Cliente, Veiculo, NotaServico, Orcamento } from '../types';

// ── Clientes ─────────────────────────────────────────────────────────────────

export async function fetchClientes(): Promise<Cliente[]> {
  const snap = await getDocs(collection(getDb(), 'clientes'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Cliente));
}

export async function saveCliente(cliente: Cliente): Promise<void> {
  await setDoc(doc(getDb(), 'clientes', cliente.id), cliente);
}

export async function patchCliente(id: string, data: Partial<Cliente>): Promise<void> {
  await updateDoc(doc(getDb(), 'clientes', id), data as Record<string, unknown>);
}

export async function removeCliente(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), 'clientes', id));
}

// ── Veículos ──────────────────────────────────────────────────────────────────

export async function fetchVeiculos(): Promise<Veiculo[]> {
  const snap = await getDocs(collection(getDb(), 'veiculos'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Veiculo));
}

export async function saveVeiculo(veiculo: Veiculo): Promise<void> {
  await setDoc(doc(getDb(), 'veiculos', veiculo.id), veiculo);
}

export async function removeVeiculo(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), 'veiculos', id));
}

// ── Notas de Serviço ──────────────────────────────────────────────────────────

export async function fetchNotas(): Promise<NotaServico[]> {
  const snap = await getDocs(collection(getDb(), 'notas'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as NotaServico));
}

export async function saveNota(nota: NotaServico): Promise<void> {
  await setDoc(doc(getDb(), 'notas', nota.id), nota);
}

export async function patchNota(id: string, data: Partial<NotaServico>): Promise<void> {
  await updateDoc(doc(getDb(), 'notas', id), data as Record<string, unknown>);
}

export async function removeNota(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), 'notas', id));
}

// ── Orçamentos ────────────────────────────────────────────────────────────────

export async function fetchOrcamentos(): Promise<Orcamento[]> {
  const snap = await getDocs(collection(getDb(), 'orcamentos'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Orcamento));
}

export async function saveOrcamento(orcamento: Orcamento): Promise<void> {
  await setDoc(doc(getDb(), 'orcamentos', orcamento.id), orcamento);
}

export async function patchOrcamento(id: string, data: Partial<Orcamento>): Promise<void> {
  await updateDoc(doc(getDb(), 'orcamentos', id), data as Record<string, unknown>);
}

export async function removeOrcamento(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), 'orcamentos', id));
}
