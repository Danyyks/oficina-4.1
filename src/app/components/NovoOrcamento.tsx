import { useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Orcamento, Servico } from '../types';
import { toast } from 'sonner';

interface NovoOrcamentoProps {
  onNavigate: (page: string) => void;
  orcamentoParaEditar?: Orcamento;
}

export function NovoOrcamento({ onNavigate, orcamentoParaEditar }: NovoOrcamentoProps) {
  const { clientes, addOrcamento, updateOrcamento, nextNumeroOrcamento, getVeiculosByClienteId } = useData();

  const isEditing = !!orcamentoParaEditar;

  const [selectedClienteId, setSelectedClienteId] = useState(orcamentoParaEditar?.clienteId ?? '');
  const [selectedVeiculoId, setSelectedVeiculoId] = useState(orcamentoParaEditar?.veiculoId ?? '');
  const [servicos, setServicos] = useState<Servico[]>(orcamentoParaEditar?.servicos ?? []);
  const [observacoes, setObservacoes] = useState(orcamentoParaEditar?.observacoes ?? '');
  const [servicoForm, setServicoForm] = useState({ nome: '', valor: '' });

  const clienteVeiculos = selectedClienteId ? getVeiculosByClienteId(selectedClienteId) : [];
  const total = servicos.reduce((sum, s) => sum + s.valor, 0);

  const handleAddServico = () => {
    if (!servicoForm.nome || !servicoForm.valor) {
      toast.error('Preencha nome e valor do item');
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
    toast.success('Item adicionado');
  };

  const handleRemoveServico = (id: string) => {
    setServicos(servicos.filter(s => s.id !== id));
  };

  const handleSalvarOrcamento = () => {
    if (!selectedClienteId || !selectedVeiculoId || servicos.length === 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (isEditing && orcamentoParaEditar) {
      updateOrcamento(orcamentoParaEditar.id, {
        clienteId: selectedClienteId,
        veiculoId: selectedVeiculoId,
        servicos,
        observacoes,
        total,
      });
      toast.success('Orçamento atualizado com sucesso!');
      setTimeout(() => onNavigate(`orcamento-${orcamentoParaEditar.id}`), 500);
    } else {
      const orcamento: Orcamento = {
        id: crypto.randomUUID(),
        numero: nextNumeroOrcamento(),
        data: new Date().toISOString(),
        clienteId: selectedClienteId,
        veiculoId: selectedVeiculoId,
        servicos,
        observacoes,
        total,
        status: 'pendente',
      };
      addOrcamento(orcamento);
      toast.success('Orçamento criado com sucesso!');
      setTimeout(() => onNavigate(`orcamento-${orcamento.id}`), 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() =>
              isEditing && orcamentoParaEditar
                ? onNavigate(`orcamento-${orcamentoParaEditar.id}`)
                : onNavigate('dashboard')
            }
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="flex-1 text-base font-semibold text-gray-900">
            {isEditing ? `Editando Orçamento #${orcamentoParaEditar?.numero}` : 'Novo Orçamento'}
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
              <Select
                value={selectedClienteId}
                onValueChange={(value) => {
                  setSelectedClienteId(value);
                  setSelectedVeiculoId('');
                }}
              >
                <SelectTrigger className="rounded-xl bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

        {/* Adicionar Item */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 pt-4 pb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Adicionar Item</p>
          </div>
          <div className="px-4 pb-4 space-y-3 pt-3">
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-700">Descrição do Serviço / Peça</Label>
              <Input
                value={servicoForm.nome}
                onChange={(e) => setServicoForm({ ...servicoForm, nome: e.target.value })}
                placeholder="Ex: Troca de óleo, Pastilha de freio..."
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
              Adicionar Item
            </Button>
          </div>
        </div>

        {/* Itens adicionados */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 pt-4 pb-1 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Itens do Orçamento</p>
            {servicos.length > 0 && (
              <span className="text-xs text-gray-400">{servicos.length} item(s)</span>
            )}
          </div>
          <div className="px-4 pb-4 pt-3">
            {servicos.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum item adicionado</p>
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
          <Button onClick={handleSalvarOrcamento} size="lg" className="w-full rounded-2xl h-12 text-base font-semibold bg-amber-600 hover:bg-amber-700">
            {isEditing ? 'Salvar Alterações' : 'Salvar Orçamento'}
          </Button>
        </div>
      </div>
    </div>
  );
}
