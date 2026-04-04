import { Car, FileText, Users, Plus } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import logoImage from '../../assets/7188601ef5c7fc783e87deb6439d04e88e0319a4.png';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { clientes, veiculos, notas } = useData();

  const recentNotas = notas.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <img src={logoImage} alt="Oficina Logo" className="h-16 w-auto" />
          <div>
            <h1 className="text-3xl">Oficina mecânica 4.1</h1>
            <p className="text-gray-600">Sistema de Gestão</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Clientes</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{clientes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Veículos</CardTitle>
              <Car className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{veiculos.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Notas de Serviço</CardTitle>
              <FileText className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{notas.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Button
            size="lg"
            className="h-24 text-lg"
            onClick={() => onNavigate('clientes')}
          >
            <Users className="mr-2 h-6 w-6" />
            Clientes
          </Button>

          <Button
            size="lg"
            className="h-24 text-lg"
            onClick={() => onNavigate('nova-nota')}
          >
            <Plus className="mr-2 h-6 w-6" />
            Nova Nota de Serviço
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentNotas.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhuma nota criada ainda</p>
            ) : (
              <div className="space-y-2">
                {recentNotas.map((nota) => {
                  const cliente = clientes.find(c => c.id === nota.clienteId);
                  return (
                    <div
                      key={nota.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => onNavigate(`nota-${nota.id}`)}
                    >
                      <div>
                        <p><span className="text-gray-600">Nota #{nota.numero}</span></p>
                        <p className="text-sm text-gray-600">
                          {cliente?.nome} - {new Date(nota.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p>R$ {nota.total.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => onNavigate('historico')}>
            <FileText className="mr-2 h-4 w-4" />
            Histórico de Notas
          </Button>
        </div>
      </div>
    </div>
  );
}
