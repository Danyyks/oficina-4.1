import { useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useData } from "../context/DataContext";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "sonner";
import { gerarNotaPDFBlob } from "../utils/gerarPDF";
import logoImage from "../../assets/7188601ef5c7fc783e87deb6439d04e88e0319a4.png";

interface NotaViewProps {
  notaId: string;
  onNavigate: (page: string) => void;
}

export function NotaView({ notaId, onNavigate }: NotaViewProps) {
  const { notas, getClienteById, getVeiculoById } = useData();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const nota = notas.find((n) => n.id === notaId);
  const cliente = nota ? getClienteById(nota.clienteId) : undefined;
  const veiculo = nota ? getVeiculoById(nota.veiculoId) : undefined;

  if (!nota) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="outline" onClick={() => onNavigate("dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <p className="text-center mt-8">Nota não encontrada</p>
        </div>
      </div>
    );
  }

  const handleBaixarEEnviar = async () => {
    if (!cliente) return;

    const mensagem = `Olá ${cliente.nome}! Segue a nota de serviço #${nota.numero} da Oficina mecânica 4.1.`;
    const telefone = cliente.telefone.replace(/\D/g, "");
    const nomeArquivo = `nota-servico-${nota.numero}.pdf`;

    setIsGeneratingPdf(true);
    try {
      const pdfBlob = await gerarNotaPDFBlob({
        numero: nota.numero,
        data: nota.data,
        clienteNome: cliente.nome,
        clienteTelefone: cliente.telefone,
        veiculoMarca: veiculo?.marca ?? "",
        veiculoModelo: veiculo?.modelo ?? "",
        veiculoPlaca: veiculo?.placa ?? "",
        veiculoAno: veiculo?.ano,
        servicos: nota.servicos,
        total: nota.total,
        observacoes: nota.observacoes,
      });

      const pdfFile = new File([pdfBlob], nomeArquivo, { type: "application/pdf" });

      // Tenta compartilhar com o arquivo via Web Share API (funciona no celular e Windows)
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          text: mensagem,
        });
        toast.success("Compartilhamento aberto com o PDF anexado!");
      } else {
        // Fallback: abre o WhatsApp direto na conversa do cliente e baixa o PDF
        window.open(
          `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`,
          "_blank"
        );

        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = nomeArquivo;
        link.click();
        URL.revokeObjectURL(url);

        toast.success("WhatsApp aberto e PDF baixado! Só anexar o arquivo na conversa.");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Erro ao gerar PDF:", error);
        toast.error("Erro ao gerar PDF. Tente novamente.");
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => onNavigate("dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-2xl">Nota de Serviço #{nota.numero}</h1>
          </div>
          <Button onClick={handleBaixarEEnviar} disabled={isGeneratingPdf}>
            <MessageCircle className="mr-2 h-4 w-4" />
            {isGeneratingPdf ? "Gerando..." : "Baixar e Enviar"}
          </Button>
        </div>

        <Card>
          <div className="bg-white p-8">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b">
              <div className="flex items-center gap-4">
                <img src={logoImage} alt="Logo" className="h-14" />
                <div>
                  <h1 className="text-2xl">Oficina mecânica 4.1</h1>
                  <p className="text-sm text-gray-600">Telefone: (11) 99733-0664</p>
                  <p className="text-sm text-gray-600">
                    Rua Carlos Drummond de Andrade n30, Jardim Santa Maria
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Nota de Serviço</p>
                <p className="text-xl font-semibold">#{nota.numero}</p>
                <p className="text-sm text-gray-600">
                  {new Date(nota.data).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>

            {/* Cliente / Veículo */}
            <div className="grid grid-cols-2 gap-8 mb-8 pb-6 border-b">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Cliente</p>
                <p className="text-lg font-medium">{cliente?.nome}</p>
                <p className="text-sm text-gray-600">{cliente?.telefone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Veículo</p>
                <p className="text-lg font-medium">
                  {veiculo?.marca} {veiculo?.modelo}
                </p>
                <p className="text-sm text-gray-600">Placa: {veiculo?.placa}</p>
                {veiculo?.ano && (
                  <p className="text-sm text-gray-600">Ano: {veiculo.ano}</p>
                )}
              </div>
            </div>

            {/* Serviços */}
            <div className="mb-8">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
                Serviços Realizados
              </p>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-xs text-gray-500 uppercase tracking-wide">
                      Serviço
                    </th>
                    <th className="text-right py-2 text-xs text-gray-500 uppercase tracking-wide">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {nota.servicos.map((servico) => (
                    <tr key={servico.id} className="border-b">
                      <td className="py-3">{servico.nome}</td>
                      <td className="text-right py-3">
                        R$ {servico.valor.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mb-8 pb-6 border-b">
              <span className="text-lg">Total</span>
              <span className="text-3xl font-bold">
                R$ {nota.total.toFixed(2)}
              </span>
            </div>

            {/* Observações */}
            {nota.observacoes && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                  Observações
                </p>
                <p className="text-sm text-gray-700">{nota.observacoes}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
