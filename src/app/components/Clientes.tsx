import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Edit2, Car } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Cliente, Veiculo } from '../types';

interface ClientesProps {
  onNavigate: (page: string) => void;
}

export function Clientes({ onNavigate }: ClientesProps) {
  const { clientes, addCliente, updateCliente, deleteCliente, veiculos, addVeiculo, deleteVeiculo, getVeiculosByClienteId } = useData();
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isClienteDialogOpen, setIsClienteDialogOpen] = useState(false);
  const [isVeiculoDialogOpen, setIsVeiculoDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  const [clienteForm, setClienteForm] = useState({ nome: '', telefone: '' });
  const [veiculoForm, setVeiculoForm] = useState({ marca: '', modelo: '', placa: '', ano: '' });

  const handleAddCliente = () => {
    if (!clienteForm.nome || !clienteForm.telefone) return;

    if (editingCliente) {
      updateCliente(editingCliente.id, clienteForm);
      setEditingCliente(null);
    } else {
      const newCliente: Cliente = {
        id: Date.now().toString(),
        nome: clienteForm.nome,
        telefone: clienteForm.telefone,
      };
      addCliente(newCliente);
    }

    setClienteForm({ nome: '', telefone: '' });
    setIsClienteDialogOpen(false);
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
    if (!selectedCliente || !veiculoForm.marca || !veiculoForm.modelo || !veiculoForm.placa) return;

    const newVeiculo: Veiculo = {
      id: Date.now().toString(),
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" onClick={() => onNavigate('dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl">Gerenciar Clientes</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Clientes</CardTitle>
              <Dialog open={isClienteDialogOpen} onOpenChange={(open) => {
                setIsClienteDialogOpen(open);
                if (!open) {
                  setEditingCliente(null);
                  setClienteForm({ nome: '', telefone: '' });
                }
              }}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Cliente
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCliente ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome</Label>
                      <Input
                        id="nome"
                        value={clienteForm.nome}
                        onChange={(e) => setClienteForm({ ...clienteForm, nome: e.target.value })}
                        placeholder="Nome do cliente"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={clienteForm.telefone}
                        onChange={(e) => setClienteForm({ ...clienteForm, telefone: e.target.value })}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddCliente}>
                      {editingCliente ? 'Salvar' : 'Adicionar'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {clientes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum cliente cadastrado</p>
              ) : (
                <div className="space-y-2">
                  {clientes.map((cliente) => (
                    <div
                      key={cliente.id}
                      className={`p-4 border rounded-lg cursor-pointer transition ${
                        selectedCliente?.id === cliente.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedCliente(cliente)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p>{cliente.nome}</p>
                          <p className="text-sm text-gray-600">{cliente.telefone}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {getVeiculosByClienteId(cliente.id).length} veículo(s)
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCliente(cliente.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {selectedCliente ? `Veículos de ${selectedCliente.nome}` : 'Veículos'}
              </CardTitle>
              {selectedCliente && (
                <Dialog open={isVeiculoDialogOpen} onOpenChange={setIsVeiculoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Veículo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Veículo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="marca">Marca</Label>
                        <Input
                          id="marca"
                          value={veiculoForm.marca}
                          onChange={(e) => setVeiculoForm({ ...veiculoForm, marca: e.target.value })}
                          placeholder="Ex: Volkswagen"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="modelo">Modelo</Label>
                        <Input
                          id="modelo"
                          value={veiculoForm.modelo}
                          onChange={(e) => setVeiculoForm({ ...veiculoForm, modelo: e.target.value })}
                          placeholder="Ex: Gol"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="placa">Placa</Label>
                        <Input
                          id="placa"
                          value={veiculoForm.placa}
                          onChange={(e) => setVeiculoForm({ ...veiculoForm, placa: e.target.value.toUpperCase() })}
                          placeholder="ABC-1234"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ano">Ano (opcional)</Label>
                        <Input
                          id="ano"
                          value={veiculoForm.ano}
                          onChange={(e) => setVeiculoForm({ ...veiculoForm, ano: e.target.value })}
                          placeholder="2020"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddVeiculo}>Adicionar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {!selectedCliente ? (
                <p className="text-gray-500 text-center py-8">Selecione um cliente para ver seus veículos</p>
              ) : clienteVeiculos.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum veículo cadastrado</p>
              ) : (
                <div className="space-y-2">
                  {clienteVeiculos.map((veiculo) => (
                    <div
                      key={veiculo.id}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Car className="h-8 w-8 text-gray-400" />
                          <div>
                            <p>{veiculo.marca} {veiculo.modelo}</p>
                            <p className="text-sm text-gray-600">
                              {veiculo.placa} {veiculo.ano && `• ${veiculo.ano}`}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este veículo?')) {
                              deleteVeiculo(veiculo.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
