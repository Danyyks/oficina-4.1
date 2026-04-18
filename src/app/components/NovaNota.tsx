import { useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { ClienteSearch } from './ClienteSearch';
import { NotaServico, Servico } from '../types';
import { toast } from 'sonner';

interface NovaNotaProps {
  onNavigate: (page: string) => void;
  notaParaEditar?: NotaServico;
}

export function NovaNota({ onNavigate, notaParaEditar }: NovaNotaProps) {
  const { clientes, addNota, updateNota, nextNumeroNota, getVeiculosByClienteId } = useData();

  const isEditing = !!notaParaEditar;

  const [selectedClienteId, setSelectedClienteId] = useState(notaParaEditar?.clienteId ?? '');
  const [selectedVeiculoId, setSelectedVeiculoId] = useState(notaParaEditar?.veiculoId ?? '');
  const [servicos, setServicos] = useState<Servico[]>(notaParaEditar?.servicos ?? []);
  const [observacoes, setObservacoes] = useState(notaParaEditar?.observacoes ?? '');
  const [servicoForm, setServicoForm] = useState({ nome: '', valor: '' });

  const clienteVeiculos = selectedClienteId ? getVeiculosByClienteId(selectedClienteId) : [];
  const total = servicos.reduce((sum, s) => sum + s.valor, 0);

  const handleAddServico = () => {
    if (!servicoForm.nome || !servicoForm.valor) {
      toast.error('Preencha nome e valor do serviço');
      return;
    }
    const valor = parseFloat(servicoForm.valor);
    if (isNaN(valor) || valor <= 0) {
      toast.error('Valor inválido');
      return;
    }
    const newServico: Servico = {
      id: crypto.randomUUID(),
      nome: servicoForm.nome,
      valor,
    };
    setServicos([...servicos, newServico]);
    setServicoForm({ nome: '', valor: '' });
    toast.success('Serviço adicionado');
  };

  const handleRemoveServico = (id: string) => {
    setServicos(servicos.filter(s => s.id !== id));
  };

  const handleSalvarNota = () => {
    if (!selectedClienteId || !selectedVeiculoId || servicos.length === 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (isEditing && notaParaEditar) {
      updateNota(notaParaEditar.id, {
        clienteId: selectedClienteId,
        veiculoId: selectedVeiculoId,
        servicos,
        observacoes,
        total,
      });
      toast.success('Nota atualizada com sucesso!');
      setTimeout(() => onNavigate(`nota-${notaParaEditar.id}`), 500);
    } else {
      const nota: NotaServico = {
        id: crypto.randomUUID(),
        numero: nextNumeroNota(),
        data: new Date().toISOString(),
        clienteId: selectedClienteId,
        veiculoId: selectedVeiculoId,
        servicos,
        observacoes,
        total,
        status: 'pendente',
      };
      addNota(nota);
      toast.success('Nota de serviço criada com sucesso!');
      setTimeout(() => onNavigate(`nota-${nota.id}`), 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() =>
              isEditing && notaParaEditar
                ? onNavigate(`nota-${notaParaEditar.id}`)
                : onNavigate('dashboard')
            }
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="flex-1 text-base font-semibold text-gray-900">
            {isEditing ? `Editando Nota #${notaParaEditar?.numero}` : 'Nova Nota de Serviço'}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4 pb-28">
        {/* Cliente e Veículo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 pt-4 pb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente e Veículo</p>
          </div>
          <div className="px-4 pb-4 space-y-3 pt-3">
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-700">Cliente</Label>
              <ClienteSearch
                clientes={clientes}
                value={selectedClienteId}
                onChange={(value) => {
                  setSelectedClienteId(value);
                  setSelectedVeiculoId('');
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-gray-700">Veículo</Label>
              <Select
                value={selectedVeiculoId}
                onValueChange={setSelectedVeiculoId}
                disabled={!selectedClienteId}
              >
                <SelectTrigger className="rounded-xl bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Selecione um veículo" />
                </SelectTrigger>
                <SelectContent>
                  {clienteVeiculos.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.marca} {v.modelo}{v.placa ? ` - ${v.placa}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Adicionar Serviço */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 pt-4 pb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Adicionar Serviço</p>
          </div>
          <div className="px-4 pb-4 space-y-3 pt-3">
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-700">Nome do Serviço</Label>
              <Input
                value={servicoForm.nome}
                onChange={(e) => setServicoForm({ ...servicoForm, nome: e.target.value })}
                placeholder="Ex: Troca de óleo"
                className="rounded-xl bg-gray-50 border-gray-200"
                onKeyDown={(e) => e.key === 'Enter' && handleAddServico()}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-700">Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={servicoForm.valor}
                onChange={(e) => setServicoForm({ ...servicoForm, valor: e.target.value })}
                placeholder="0.00"
                className="rounded-xl bg-gray-50 border-gray-200"
                onKeyDown={(e) => e.key === 'Enter' && handleAddServico()}
              />
            </div>
            <Button onClick={handleAddServico} className="w-full rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Serviço
            </Button>
          </div>
        </div>

        {/* Serviços adicionados */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 pt-4 pb-1 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Serviços</p>
            {servicos.length > 0 && (
              <span className="text-xs text-gray-400">{servicos.length} item(s)</span>
            )}
          </div>
          <div className="px-4 pb-4 pt-3">
            {servicos.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum serviço adicionado</p>
            ) : (
              <div className="space-y-2">
                {servicos.map((servico) => (
                  <div
                    key={servico.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <span className="text-sm text-gray-800">{servico.nome}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">R$ {servico.valor.toFixed(2)}</span>
                      <button
                        onClick={() => handleRemoveServico(servico.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Total</span>
                  <span className="text-xl font-bold text-gray-900">R$ {total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Observações */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 pt-4 pb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Observações</p>
          </div>
          <div className="px-4 pb-4 pt-3">
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais (opcional)"
              rows={3}
              className="rounded-xl bg-gray-50 border-gray-200 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Sticky bottom save button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <Button onClick={handleSalvarNota} size="lg" className="w-full rounded-2xl h-12 text-base font-semibold">
            {isEditing ? 'Salvar Alterações' : 'Salvar Nota de Serviço'}
          </Button>
        </div>
      </div>
    </div>
  );
}
