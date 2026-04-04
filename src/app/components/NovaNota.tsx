import { useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { NotaServico, Servico } from '../types';
import { toast } from 'sonner';
import { gerarNotaPDF } from '../utils/gerarPDF';

interface NovaNotaProps {
  onNavigate: (page: string) => void;
}

export function NovaNota({ onNavigate }: NovaNotaProps) {
  const { clientes, notas, addNota, getClienteById, getVeiculoById, getVeiculosByClienteId } = useData();

  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [selectedVeiculoId, setSelectedVeiculoId] = useState('');
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [observacoes, setObservacoes] = useState('');
  const [servicoForm, setServicoForm] = useState({ nome: '', valor: '' });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const clienteVeiculos = selectedClienteId ? getVeiculosByClienteId(selectedClienteId) : [];
  const total = servicos.reduce((sum, s) => sum + s.valor, 0);
  const cliente = selectedClienteId ? getClienteById(selectedClienteId) : undefined;
  const veiculo = selectedVeiculoId ? getVeiculoById(selectedVeiculoId) : undefined;

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
      id: Date.now().toString(),
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

  const criarNota = (): NotaServico => ({
    id: Date.now().toString(),
    numero: (notas.length + 1).toString().padStart(4, '0'),
    data: new Date().toISOString(),
    clienteId: selectedClienteId,
    veiculoId: selectedVeiculoId,
    servicos,
    observacoes,
    total,
  });

  const handleSalvarNota = () => {
    if (!selectedClienteId || !selectedVeiculoId || servicos.length === 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    const nota = criarNota();
    addNota(nota);
    toast.success('Nota de serviço criada com sucesso!');
    setTimeout(() => onNavigate(`nota-${nota.id}`), 500);
  };

  const handleBaixarEEnviar = async () => {
    if (!selectedClienteId || !selectedVeiculoId || servicos.length === 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    if (!cliente) return;

    const nota = criarNota();
    addNota(nota);

    // Abre o WhatsApp de forma síncrona (antes de qualquer await)
    const mensagem = `Olá ${cliente.nome}! Segue a nota de serviço #${nota.numero} da Oficina mecânica 4.1.\n\nTotal: R$ ${total.toFixed(2)}`;
    const telefone = cliente.telefone.replace(/\D/g, '');
    window.open(
      `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`,
      '_blank'
    );

    // Gera e baixa o PDF
    setIsGeneratingPdf(true);
    try {
      await gerarNotaPDF({
        numero: nota.numero,
        data: nota.data,
        clienteNome: cliente.nome,
        clienteTelefone: cliente.telefone,
        veiculoMarca: veiculo?.marca ?? '',
        veiculoModelo: veiculo?.modelo ?? '',
        veiculoPlaca: veiculo?.placa ?? '',
        veiculoAno: veiculo?.ano,
        servicos,
        total,
        observacoes,
      });
      toast.success(`Nota #${nota.numero} salva, PDF baixado e WhatsApp aberto!`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" onClick={() => onNavigate('dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl">Nova Nota de Serviço</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Cliente e Veículo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select
                  value={selectedClienteId}
                  onValueChange={(value) => {
                    setSelectedClienteId(value);
                    setSelectedVeiculoId('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Veículo</Label>
                <Select
                  value={selectedVeiculoId}
                  onValueChange={setSelectedVeiculoId}
                  disabled={!selectedClienteId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {clienteVeiculos.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.marca} {v.modelo} - {v.placa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Adicionar Serviço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Serviço</Label>
                <Input
                  value={servicoForm.nome}
                  onChange={(e) => setServicoForm({ ...servicoForm, nome: e.target.value })}
                  placeholder="Ex: Troca de óleo"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddServico()}
                />
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={servicoForm.valor}
                  onChange={(e) => setServicoForm({ ...servicoForm, valor: e.target.value })}
                  placeholder="0.00"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddServico()}
                />
              </div>
              <Button onClick={handleAddServico} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Serviço
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Serviços Adicionados</CardTitle>
          </CardHeader>
          <CardContent>
            {servicos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum serviço adicionado</p>
            ) : (
              <div className="space-y-2">
                {servicos.map((servico) => (
                  <div
                    key={servico.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <span>{servico.nome}</span>
                    <div className="flex items-center gap-4">
                      <span>R$ {servico.valor.toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveServico(servico.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 border-t font-medium">
                  <span>Total</span>
                  <span className="text-xl">R$ {total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais (opcional)"
              rows={3}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={handleSalvarNota} size="lg" className="flex-1">
            Salvar Nota
          </Button>
          <Button
            onClick={handleBaixarEEnviar}
            variant="outline"
            size="lg"
            disabled={servicos.length === 0 || !cliente || isGeneratingPdf}
          >
            {isGeneratingPdf ? 'Gerando PDF...' : 'Baixar e Enviar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
