import { ArrowLeft, FileText, Clock, CheckCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Badge } from './ui/badge';

interface HistoricoProps {
  onNavigate: (page: string) => void;
}

export function Historico({ onNavigate }: HistoricoProps) {
  const { notas, getClienteById, getVeiculoById } = useData();

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
            <h1 className="text-base font-semibold text-gray-900">Histórico de Notas</h1>
            {notas.length > 0 && (
              <p className="text-xs text-gray-500">{notas.length} nota(s) no total</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {notas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-14 flex flex-col items-center gap-2 text-gray-400">
            <FileText className="h-10 w-10 opacity-30" />
            <p className="text-sm">Nenhuma nota criada ainda</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {notas.map((nota) => {
              const cliente = getClienteById(nota.clienteId);
              const veiculo = getVeiculoById(nota.veiculoId);

              return (
                <button
                  key={nota.id}
                  className="w-full flex items-start justify-between px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                  onClick={() => onNavigate(`nota-${nota.id}`)}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`rounded-xl p-2 shrink-0 mt-0.5 ${nota.status === 'pago' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                      {nota.status === 'pago'
                        ? <CheckCircle className="h-4 w-4 text-emerald-600" />
                        : <Clock className="h-4 w-4 text-amber-600" />
                      }
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">#{nota.numero}</span>
                        <span className="text-sm text-gray-700 truncate">{cliente?.nome ?? '—'}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {veiculo?.marca} {veiculo?.modelo}{veiculo?.placa ? ` · ${veiculo.placa}` : ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(nota.data).toLocaleDateString('pt-BR')} às {new Date(nota.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
                    <span className="text-sm font-bold text-gray-900">R$ {nota.total.toFixed(2)}</span>
                    <span className="text-xs text-gray-400">{nota.servicos.length} serviço(s)</span>
                    {nota.status === 'pago' ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] px-1.5 py-0 h-auto">Pago</Badge>
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
