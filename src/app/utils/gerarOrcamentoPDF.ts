import jsPDF from 'jspdf';
import { carregarLogo } from './pdfUtils';

export interface OrcamentoPDFParams {
  numero: string;
  data: string;
  clienteNome: string;
  clienteTelefone: string;
  veiculoMarca: string;
  veiculoModelo: string;
  veiculoPlaca?: string;
  veiculoAno?: string;
  servicos: { nome: string; valor: number }[];
  total: number;
  observacoes?: string;
}

async function montarOrcamentoPDF(params: OrcamentoPDFParams): Promise<jsPDF> {
  const logo = await carregarLogo();

  const pdf = new jsPDF('p', 'mm', 'a4');
  const PW = 210;
  const ML = 15;
  const MR = PW - 15;
  const CW = MR - ML;
  const GRAY: [number, number, number] = [107, 114, 128];
  const DARK: [number, number, number] = [17, 24, 39];
  const LIGHT_GRAY: [number, number, number] = [229, 231, 235];
  // Pastel âmbar — badge Orçamento
  const BADGE_BG: [number, number, number] = [254, 243, 199];   // amber-100
  const BADGE_BORDER: [number, number, number] = [252, 211, 77]; // amber-300
  const BADGE_TEXT: [number, number, number] = [180, 83, 9];     // amber-700

  let y = 15;

  // ── CABEÇALHO ────────────────────────────────────────────
  if (logo) {
    pdf.addImage(logo, 'PNG', ML, y, 18, 18);
  }

  const infoX = logo ? ML + 22 : ML;

  pdf.setFontSize(15);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...DARK);
  pdf.text('Oficina mecânica 4.1', infoX, y + 6);

  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...GRAY);
  pdf.text('Telefone: (11) 99733-0664', infoX, y + 12);
  pdf.text('Rua Carlos Drummond de Andrade n30, Jardim Santa Maria', infoX, y + 17);

  // ── BADGE TIPO DO DOCUMENTO ───────────────────────────────
  const badgeLabel = 'ORÇAMENTO';
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  const labelW = pdf.getTextWidth(badgeLabel);
  const bPadX = 4;
  const bH = 8;
  const bW = labelW + bPadX * 2;
  const bX = MR - bW;
  const bY = y;

  pdf.setFillColor(...BADGE_BG);
  pdf.roundedRect(bX, bY, bW, bH, 2, 2, 'F');
  pdf.setDrawColor(...BADGE_BORDER);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(bX, bY, bW, bH, 2, 2, 'S');
  pdf.setTextColor(...BADGE_TEXT);
  pdf.text(badgeLabel, MR - bPadX, bY + 5.5, { align: 'right' });

  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...DARK);
  pdf.text(`#${params.numero}`, MR, y + 17, { align: 'right' });

  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...GRAY);
  const dataFormatada = new Date(params.data).toLocaleDateString('pt-BR');
  pdf.text(dataFormatada, MR, y + 23, { align: 'right' });

  y += 30;
  pdf.setDrawColor(...LIGHT_GRAY);
  pdf.setLineWidth(0.4);
  pdf.line(ML, y, MR, y);
  y += 8;

  // ── CLIENTE / VEÍCULO ─────────────────────────────────────
  const midX = ML + CW / 2 + 4;

  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...GRAY);
  pdf.text('CLIENTE', ML, y);
  pdf.text('VEÍCULO', midX, y);
  y += 5;

  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...DARK);
  pdf.text(params.clienteNome, ML, y);
  pdf.text(`${params.veiculoMarca} ${params.veiculoModelo}`, midX, y);
  y += 5;

  pdf.setFontSize(9.5);
  pdf.setTextColor(...GRAY);
  pdf.text(params.clienteTelefone, ML, y);

  // Placa e Ano na mesma linha (igual à tela)
  const veiculoInfo = [
    params.veiculoPlaca ?? null,
    params.veiculoAno ? `Ano: ${params.veiculoAno}` : null,
  ].filter(Boolean).join(' · ');
  if (veiculoInfo) {
    pdf.text(veiculoInfo, midX, y);
  }

  y += 8;
  pdf.setDrawColor(...LIGHT_GRAY);
  pdf.line(ML, y, MR, y);
  y += 8;

  // ── ITENS DO ORÇAMENTO ────────────────────────────────────
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...GRAY);
  pdf.text('ITENS DO ORÇAMENTO', ML, y);
  y += 5;

  pdf.text('DESCRIÇÃO', ML, y);
  pdf.text('VALOR', MR, y, { align: 'right' });
  y += 2.5;

  pdf.setDrawColor(...LIGHT_GRAY);
  pdf.setLineWidth(0.4);
  pdf.line(ML, y, MR, y);
  y += 6;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(...DARK);

  for (const servico of params.servicos) {
    pdf.text(servico.nome, ML, y);
    pdf.text(`R$ ${servico.valor.toFixed(2)}`, MR, y, { align: 'right' });
    y += 3;
    pdf.setDrawColor(243, 244, 246);
    pdf.line(ML, y, MR, y);
    y += 6;
  }

  y += 2;
  pdf.setDrawColor(...LIGHT_GRAY);
  pdf.line(ML, y, MR, y);
  y += 10;

  // ── TOTAL ─────────────────────────────────────────────────
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...DARK);
  pdf.text('Total', ML, y);

  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`R$ ${params.total.toFixed(2)}`, MR, y, { align: 'right' });
  y += 12;

  // ── OBSERVAÇÕES ───────────────────────────────────────────
  if (params.observacoes) {
    pdf.setDrawColor(...LIGHT_GRAY);
    pdf.setLineWidth(0.4);
    pdf.line(ML, y, MR, y);
    y += 6;

    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...GRAY);
    pdf.text('OBSERVAÇÕES', ML, y);
    y += 5;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(55, 65, 81);
    const linhas = pdf.splitTextToSize(params.observacoes, CW);
    pdf.text(linhas, ML, y);
  }

  return pdf;
}

export async function gerarOrcamentoPDFBlob(params: OrcamentoPDFParams): Promise<Blob> {
  const pdf = await montarOrcamentoPDF(params);
  return pdf.output('blob');
}
