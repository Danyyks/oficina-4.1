import { ArrowLeft, ClipboardList, CheckCircle, Clock, XCircle, Plus } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface HistoricoOrcamentosProps {
  onNavigate: (page: string) => void;
}

export function HistoricoOrcamentos({ onNavigate }: HistoricoOrcamentosProps) {
  const { orcamentos, getClienteById, getVeiculoById } = useData();

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
          <div className="flex-1">
            <h1 className="text-base font-semibold text-gray-900">Orçamentos</h1>
            {orcamentos.length > 0 && (
              <p className="text-xs text-gray-500">{orcamentos.length} orçamento(s) no total</p>
            )}
          </div>
          <Button
            size="sm"
            className="rounded-xl bg-amber-600 hover:bg-amber-700 shrink-0"
            onClick={() => onNavigate('novo-orcamento')}
          >
            <Plus className="h-4 w-4 mr-1" />
            Novo
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {orcamentos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-14 flex flex-col items-center gap-3 text-gray-400">
            <ClipboardList className="h-10 w-10 opacity-30" />
            <p className="text-sm">Nenhum orçamento criado ainda</p>
            <Button
              size="sm"
              className="rounded-xl bg-amber-600 hover:bg-amber-700 mt-1"
              onClick={() => onNavigate('novo-orcamento')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Criar primeiro orçamento
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {orcamentos.map((orcamento) => {
              const cliente = getClienteById(orcamento.clienteId);
              const veiculo = getVeiculoById(orcamento.veiculoId);

              const iconBg =
                orcamento.status === 'aprovado' ? 'bg-emerald-50' :
                orcamento.status === 'recusado' ? 'bg-red-50' :
                'bg-amber-50';

              const statusIcon =
                orcamento.status === 'aprovado' ? <CheckCircle className="h-4 w-4 text-emerald-600" /> :
                orcamento.status === 'recusado' ? <XCircle className="h-4 w-4 text-red-600" /> :
                <Clock className="h-4 w-4 text-amber-600" />;

              const veiculoStr = [veiculo?.marca, veiculo?.modelo].filter(Boolean).join(' ');
              const veiculoInfo = veiculoStr + (veiculo?.placa ? ` · ${veiculo.placa}` : '');

              return (
                <button
                  key={orcamento.id}
                  className="w-full flex items-start justify-between px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                  onClick={() => onNavigate(`orcamento-${orcamento.id}`)}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`rounded-xl p-2 shrink-0 mt-0.5 ${iconBg}`}>
                      {statusIcon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">#{orcamento.numero}</span>
                        <span className="text-sm text-gray-700 truncate">{cliente?.nome ?? '—'}</span>
                      </div>
                      {veiculoInfo && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{veiculoInfo}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(orcamento.data).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(orcamento.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
                    <span className="text-sm font-bold text-gray-900">R$ {orcamento.total.toFixed(2)}</span>
                    <span className="text-xs text-gray-400">{orcamento.servicos.length} item(s)</span>
                    {orcamento.status === 'aprovado' ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] px-1.5 py-0 h-auto">Aprovado</Badge>
                    ) : orcamento.status === 'recusado' ? (
                      <Badge className="bg-red-50 text-red-700 border-red-100 text-[10px] px-1.5 py-0 h-auto">Recusado</Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-700 border-amber-100 text-[10px] px-1.5 py-0 h-auto">Pendente</Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
