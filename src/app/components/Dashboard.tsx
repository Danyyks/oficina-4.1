import { Car, FileText, Users, Plus, ChevronRight, Clock } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import logoImage from '../../assets/7188601ef5c7fc783e87deb6439d04e88e0319a4.png';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { clientes, veiculos, notas } = useData();

  const recentNotas = notas.slice(0, 5);


  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <img src={logoImage} alt="Oficina Logo" className="h-10 w-auto" />
          <div>
            <h1 className="text-base font-semibold text-gray-900 leading-tight">Oficina mecânica 4.1</h1>
            <p className="text-xs text-gray-500">Sistema de Gestão</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center gap-1">
            <div className="bg-[#e6eff5] rounded-xl p-2 mb-1">
              <Users className="h-5 w-5 text-[#6b9ab8]" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{clientes.length}</span>
            <span className="text-xs text-gray-500">Clientes</span>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center gap-1">
            <div className="bg-[#e6eff5] rounded-xl p-2 mb-1">
              <Car className="h-5 w-5 text-[#6b9ab8]" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{veiculos.length}</span>
            <span className="text-xs text-gray-500">Veículos</span>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center gap-1">
            <div className="bg-[#e6eff5] rounded-xl p-2 mb-1">
              <FileText className="h-5 w-5 text-[#6b9ab8]" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{notas.length}</span>
            <span className="text-xs text-gray-500">Notas</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('clientes')}
            className="bg-[#6b9ab8] hover:bg-[#5a87a3] active:bg-[#4d7690] text-white rounded-2xl p-5 flex flex-col items-start gap-3 shadow-sm transition-colors"
          >
            <div className="bg-white/20 rounded-xl p-2">
              <Users className="h-5 w-5" />
            </div>
            <span className="font-semibold text-sm">Clientes</span>
          </button>

          <button
            onClick={() => onNavigate('nova-nota')}
            className="bg-gray-900 hover:bg-gray-800 active:bg-black text-white rounded-2xl p-5 flex flex-col items-start gap-3 shadow-sm transition-colors"
          >
            <div className="bg-white/20 rounded-xl p-2">
              <Plus className="h-5 w-5" />
            </div>
            <span className="font-semibold text-sm">Nova Nota</span>
          </button>
        </div>

        {/* Recent Notes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">Notas Recentes</h2>
            <button
              onClick={() => onNavigate('historico')}
              className="text-[#6b9ab8] text-xs font-medium flex items-center gap-0.5 hover:underline"
            >
              Ver todas
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {recentNotas.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-2 text-gray-400">
              <FileText className="h-8 w-8 opacity-40" />
              <p className="text-sm">Nenhuma nota criada ainda</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentNotas.map((nota) => {
                const cliente = clientes.find(c => c.id === nota.clienteId);
                return (
                  <button
                    key={nota.id}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                    onClick={() => onNavigate(`nota-${nota.id}`)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="bg-gray-100 rounded-xl p-2 shrink-0">
                        <FileText className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {cliente?.nome ?? '—'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3 w-3 text-gray-400 shrink-0" />
                          <p className="text-xs text-gray-500">
                            {new Date(nota.data).toLocaleDateString('pt-BR')} · Nota #{nota.numero}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                      <span className="text-sm font-semibold text-gray-900">
                        R$ {nota.total.toFixed(2)}
                      </span>
                      {nota.status === 'pago' ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] px-1.5 py-0 h-auto">
                          Pago
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-100 text-[10px] px-1.5 py-0 h-auto">
                          Pendente
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Histórico button */}
        <Button
          variant="outline"
          className="w-full rounded-2xl border-gray-200 text-gray-700 h-12"
          onClick={() => onNavigate('historico')}
        >
          <FileText className="mr-2 h-4 w-4" />
          Histórico completo de Notas
        </Button>
      </div>
    </div>
  );
}
