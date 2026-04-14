import { useState } from "react";
import { ArrowLeft, MessageCircle, Trash2, Pencil, CheckCircle, Clock } from "lucide-react";
import { useData } from "../context/DataContext";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { toast } from "sonner";
import { gerarNotaPDFBlob } from "../utils/gerarPDF";
import logoImage from "../../assets/logo nova.jpeg";

interface NotaViewProps {
  notaId: string;
  onNavigate: (page: string) => void;
  backTo?: string;
}

export function NotaView({ notaId, onNavigate, backTo = 'historico' }: NotaViewProps) {
  const { notas, getClienteById, getVeiculoById, deleteNota, updateNota } = useData();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const nota = notas.find((n) => n.id === notaId);
  const cliente = nota ? getClienteById(nota.clienteId) : undefined;
  const veiculo = nota ? getVeiculoById(nota.veiculoId) : undefined;

  if (!nota) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] p-4">
        <Button variant="outline" onClick={() => onNavigate("dashboard")} className="rounded-xl">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <p className="text-center mt-8 text-gray-500">Nota não encontrada</p>
      </div>
    );
  }

  const handleDeletarNota = () => {
    deleteNota(notaId);
    toast.success("Nota deletada com sucesso!");
    onNavigate("historico");
  };

  const handleToggleStatus = () => {
    const novoStatus = nota.status === 'pago' ? 'pendente' : 'pago';
    updateNota(notaId, { status: novoStatus });
    toast.success(novoStatus === 'pago' ? 'Nota marcada como paga!' : 'Nota marcada como pendente.');
  };

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
        veiculoPlaca: veiculo?.placa,
        veiculoAno: veiculo?.ano,
        servicos: nota.servicos,
        total: nota.total,
        observacoes: nota.observacoes,
      });

      const pdfFile = new File([pdfBlob], nomeArquivo, { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          text: mensagem,
        });
        toast.success("Compartilhamento aberto com o PDF anexado!");
      } else {
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
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => onNavigate(backTo)}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <h1 className="text-base font-semibold text-gray-900 shrink-0">Nota #{nota.numero}</h1>
            {nota.status === 'pago' ? (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 shrink-0">
                <CheckCircle className="mr-1 h-3 w-3" />
                Pago
              </Badge>
            ) : (
              <Badge className="bg-amber-50 text-amber-700 border-amber-100 shrink-0">
                <Clock className="mr-1 h-3 w-3" />
                Pendente
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4 pb-4">
        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleBaixarEEnviar}
            disabled={isGeneratingPdf}
            className="rounded-2xl h-12 bg-[#6b9ab8] hover:bg-[#5a87a3] text-white font-medium"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {isGeneratingPdf ? "Gerando..." : "Enviar WhatsApp"}
          </Button>

          <Button
            variant="outline"
            onClick={handleToggleStatus}
            className={`rounded-2xl h-12 font-medium ${
              nota.status === 'pago'
                ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            {nota.status === 'pago' ? (
              <><Clock className="mr-2 h-4 w-4" />Pendente</>
            ) : (
              <><CheckCircle className="mr-2 h-4 w-4" />Marcar Pago</>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => onNavigate(`editar-nota-${nota.id}`)}
            className="rounded-2xl h-12 border-gray-200 text-gray-700 font-medium"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="rounded-2xl h-12 border-red-200 text-red-600 hover:bg-red-50 font-medium">
                <Trash2 className="mr-2 h-4 w-4" />
                Deletar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deletar nota #{nota.numero}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. A nota será removida permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeletarNota}>Sim, deletar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Nota document */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5">
            {/* Cabeçalho */}
            <div className="flex items-start justify-between mb-6 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img src={logoImage} alt="Logo" className="h-12 w-auto" />
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Oficina mecânica 4.1</h2>
                  <p className="text-xs text-gray-500 mt-0.5">(11) 99733-0664</p>
                  <p className="text-xs text-gray-500">R. Carlos Drummond de Andrade, 30</p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2 flex flex-col items-end gap-1">
                <span className="inline-block bg-blue-100 text-blue-700 border border-blue-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Nota de Serviço
                </span>
                <p className="text-lg font-bold text-gray-900">#{nota.numero}</p>
                <p className="text-xs text-gray-500">
                  {new Date(nota.data).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>

            {/* Cliente / Veículo */}
            <div className="grid grid-cols-2 gap-4 mb-6 pb-5 border-b border-gray-100">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Cliente</p>
                <p className="text-sm font-semibold text-gray-900">{cliente?.nome}</p>
                <p className="text-xs text-gray-500 mt-0.5">{cliente?.telefone}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Veículo</p>
                <p className="text-sm font-semibold text-gray-900">{veiculo?.marca} {veiculo?.modelo}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {[veiculo?.placa, veiculo?.ano].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>

            {/* Serviços */}
            <div className="mb-6">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Serviços Realizados</p>
              <div className="space-y-2">
                {nota.servicos.map((servico) => (
                  <div key={servico.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-700">{servico.nome}</span>
                    <span className="text-sm font-medium text-gray-900">R$ {servico.valor.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mb-5 pb-5 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Total</span>
              <span className="text-2xl font-bold text-gray-900">R$ {nota.total.toFixed(2)}</span>
            </div>

            {/* Observações */}
            {nota.observacoes && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Observações</p>
                <p className="text-sm text-gray-600">{nota.observacoes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
