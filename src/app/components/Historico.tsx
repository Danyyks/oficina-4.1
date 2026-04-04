import { ArrowLeft, FileText, Download } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface HistoricoProps {
  onNavigate: (page: string) => void;
}

export function Historico({ onNavigate }: HistoricoProps) {
  const { notas, getClienteById, getVeiculoById } = useData();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" onClick={() => onNavigate('dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl">Histórico de Notas</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todas as Notas de Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            {notas.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhuma nota criada ainda</p>
            ) : (
              <div className="space-y-2">
                {notas.map((nota) => {
                  const cliente = getClienteById(nota.clienteId);
                  const veiculo = getVeiculoById(nota.veiculoId);

                  return (
                    <div
                      key={nota.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => onNavigate(`nota-${nota.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <FileText className="h-8 w-8 text-gray-400" />
                          <div>
                            <p>
                              <span>Nota #{nota.numero}</span>
                              <span className="text-gray-500 mx-2">•</span>
                              <span className="text-gray-600">{cliente?.nome}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              {veiculo?.marca} {veiculo?.modelo} - {veiculo?.placa}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(nota.data).toLocaleDateString('pt-BR')} às {new Date(nota.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl">R$ {nota.total.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">{nota.servicos.length} serviço(s)</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
