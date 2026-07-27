import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Edit2, Car, Users, ChevronRight, Search } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Cliente, Veiculo } from '../types';

interface ClientesProps {
  onNavigate: (page: string) => void;
}

export function Clientes({ onNavigate }: ClientesProps) {
  const { clientes, addCliente, updateCliente, deleteCliente, addVeiculo, deleteVeiculo, getVeiculosByClienteId } = useData();
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isClienteDialogOpen, setIsClienteDialogOpen] = useState(false);
  const [isVeiculoDialogOpen, setIsVeiculoDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [clienteForm, setClienteForm] = useState({ nome: '', telefone: '' });
  const [veiculoForm, setVeiculoForm] = useState({ marca: '', modelo: '', placa: '', ano: '' });

  // Veículos adicionados inline durante criação de cliente
  const [dialogVeiculos, setDialogVeiculos] = useState<Array<{ marca: string; modelo: string; placa: string; ano: string }>>([]);
  const [veiculoDialogForm, setVeiculoDialogForm] = useState({ marca: '', modelo: '', placa: '', ano: '' });

  const handleAddCliente = () => {
    if (!clienteForm.nome) return;

    if (editingCliente) {
      updateCliente(editingCliente.id, clienteForm);
      setEditingCliente(null);
    } else {
      const newCliente: Cliente = {
        id: crypto.randomUUID(),
        nome: clienteForm.nome,
        telefone: clienteForm.telefone,
      };
      addCliente(newCliente);
      dialogVeiculos.forEach(v => {
        addVeiculo({
          id: crypto.randomUUID(),
          clienteId: newCliente.id,
          marca: v.marca,
          modelo: v.modelo,
          placa: v.placa.toUpperCase(),
          ano: v.ano || undefined,
        });
      });
    }

    setClienteForm({ nome: '', telefone: '' });
    setDialogVeiculos([]);
    setVeiculoDialogForm({ marca: '', modelo: '', placa: '', ano: '' });
    setIsClienteDialogOpen(false);
  };

  const handleAddVeiculoToDialog = () => {
    if (!veiculoDialogForm.marca || !veiculoDialogForm.modelo) return;
    setDialogVeiculos(prev => [...prev, veiculoDialogForm]);
    setVeiculoDialogForm({ marca: '', modelo: '', placa: '', ano: '' });
  };

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setClienteForm({ nome: cliente.nome, telefone: cliente.telefone });
    setIsClienteDialogOpen(true);
  };

  const handleDeleteCliente = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente? Todos os veículos associados também serão removidos.')) {
      deleteCliente(id);
      if (selectedCliente?.id === id) {
        setSelectedCliente(null);
      }
    }
  };

  const handleAddVeiculo = () => {
    if (!selectedCliente || !veiculoForm.marca || !veiculoForm.modelo) return;

    const newVeiculo: Veiculo = {
      id: crypto.randomUUID(),
      clienteId: selectedCliente.id,
      marca: veiculoForm.marca,
      modelo: veiculoForm.modelo,
      placa: veiculoForm.placa.toUpperCase(),
      ano: veiculoForm.ano || undefined,
    };

    addVeiculo(newVeiculo);
    setVeiculoForm({ marca: '', modelo: '', placa: '', ano: '' });
    setIsVeiculoDialogOpen(false);
  };

  const clienteVeiculos = selectedCliente ? getVeiculosByClienteId(selectedCliente.id) : [];

  const filteredClientes = searchQuery.trim()
    ? clientes.filter(c => c.nome.toLowerCase().includes(searchQuery.toLowerCase()))
    : clientes;

  // If a client is selected, show their vehicles (mobile drill-down)
  if (selectedCliente) {
    return (
      <div className="min-h-screen bg-[#f5f6f8]">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10 shadow-sm">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button
              onClick={() => setSelectedCliente(null)}
              className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-semibold text-gray-900 truncate">{selectedCliente.nome}</h1>
              {selectedCliente.telefone && <p className="text-xs text-gray-500">{selectedCliente.telefone}</p>}
            </div>
            <Dialog open={isVeiculoDialogOpen} onOpenChange={setIsVeiculoDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-xl shrink-0">
                  <Plus className="h-4 w-4 mr-1" />
                  Veículo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Veículo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="marca">Marca</Label>
                    <Input id="marca" value={veiculoForm.marca} onChange={(e) => setVeiculoForm({ ...veiculoForm, marca: e.target.value })} placeholder="Ex: Volkswagen" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modelo">Modelo</Label>
                    <Input id="modelo" value={veiculoForm.modelo} onChange={(e) => setVeiculoForm({ ...veiculoForm, modelo: e.target.value })} placeholder="Ex: Gol" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="placa">Placa (opcional)</Label>
                    <Input id="placa" value={veiculoForm.placa} onChange={(e) => setVeiculoForm({ ...veiculoForm, placa: e.target.value.toUpperCase() })} placeholder="ABC-1234" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ano">Ano (opcional)</Label>
                    <Input id="ano" value={veiculoForm.ano} onChange={(e) => setVeiculoForm({ ...veiculoForm, ano: e.target.value })} placeholder="2020" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddVeiculo}>Adicionar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-5">
          {clienteVeiculos.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-12 flex flex-col items-center gap-2 text-gray-400">
              <Car className="h-8 w-8 opacity-40" />
              <p className="text-sm">Nenhum veículo cadastrado</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {clienteVeiculos.map((veiculo) => (
                <div key={veiculo.id} className="flex items-center justify-between px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#e6eff5] rounded-xl p-2">
                      <Car className="h-5 w-5 text-[#6b9ab8]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{veiculo.marca} {veiculo.modelo}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {veiculo.placa ?? '—'}{veiculo.ano && ` · ${veiculo.ano}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja excluir este veículo?')) {
                        deleteVeiculo(veiculo.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="flex-1 text-base font-semibold text-gray-900">Clientes</h1>
          <Dialog open={isClienteDialogOpen} onOpenChange={(open) => {
            setIsClienteDialogOpen(open);
            if (!open) {
              setEditingCliente(null);
              setClienteForm({ nome: '', telefone: '' });
              setDialogVeiculos([]);
              setVeiculoDialogForm({ marca: '', modelo: '', placa: '', ano: '' });
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl">
                <Plus className="h-4 w-4 mr-1" />
                Novo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCliente ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" value={clienteForm.nome} onChange={(e) => setClienteForm({ ...clienteForm, nome: e.target.value })} placeholder="Nome do cliente" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone (opcional)</Label>
                  <Input id="telefone" value={clienteForm.telefone} onChange={(e) => setClienteForm({ ...clienteForm, telefone: e.target.value })} placeholder="(00) 00000-0000" />
                </div>

                {!editingCliente && (
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <Label className="text-sm font-medium text-gray-700">Veículos (opcional)</Label>

                    {dialogVeiculos.length > 0 && (
                      <div className="space-y-1">
                        {dialogVeiculos.map((v, i) => (
                          <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                            <span className="text-gray-800">{v.marca} {v.modelo}{v.placa && ` · ${v.placa}`}</span>
                            <button
                              type="button"
                              onClick={() => setDialogVeiculos(prev => prev.filter((_, idx) => idx !== i))}
                              className="text-red-400 hover:text-red-600 ml-2"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Marca"
                        value={veiculoDialogForm.marca}
                        onChange={(e) => setVeiculoDialogForm(f => ({ ...f, marca: e.target.value }))}
                      />
                      <Input
                        placeholder="Modelo"
                        value={veiculoDialogForm.modelo}
                        onChange={(e) => setVeiculoDialogForm(f => ({ ...f, modelo: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Placa (opcional)"
                        value={veiculoDialogForm.placa}
                        onChange={(e) => setVeiculoDialogForm(f => ({ ...f, placa: e.target.value.toUpperCase() }))}
                      />
                      <Input
                        placeholder="Ano (opcional)"
                        value={veiculoDialogForm.ano}
                        onChange={(e) => setVeiculoDialogForm(f => ({ ...f, ano: e.target.value }))}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full rounded-xl"
                      onClick={handleAddVeiculoToDialog}
                      disabled={!veiculoDialogForm.marca || !veiculoDialogForm.modelo}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Adicionar Veículo
                    </Button>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleAddCliente}>{editingCliente ? 'Salvar' : 'Adicionar'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {clientes.length > 0 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cliente pelo nome..."
              className="rounded-xl bg-gray-50 border-gray-200 pl-9"
            />
          </div>
        )}

        {clientes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-12 flex flex-col items-center gap-2 text-gray-400">
            <Users className="h-8 w-8 opacity-40" />
            <p className="text-sm">Nenhum cliente cadastrado</p>
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-12 flex flex-col items-center gap-2 text-gray-400">
            <Users className="h-8 w-8 opacity-40" />
            <p className="text-sm">Nenhum cliente encontrado</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {filteredClientes.map((cliente) => (
              <button
                key={cliente.id}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                onClick={() => setSelectedCliente(cliente)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-[#e6eff5] rounded-xl p-2 shrink-0">
                    <Users className="h-5 w-5 text-[#6b9ab8]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{cliente.nome}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {cliente.telefone ? `${cliente.telefone} · ` : ''}{getVeiculosByClienteId(cliente.id).length} veículo(s)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCliente(cliente);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:text-red-700 hover:bg-red-50 rounded-xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCliente(cliente.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <ChevronRight className="h-4 w-4 text-gray-300 ml-1" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
