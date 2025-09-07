import jsPDF from 'jspdf';
import logoPngUrl from '../assets/logo.png';
import type { RelatorioTecnico } from '../types/relatorio';
import { NOME_EMPRESA, CNPJ_EMPRESA } from '../constants/empresa.ts';
import whatsappPng from '../assets/whatsapp.png';
import callPng from '../assets/call.png';
import emailPng from '../assets/email.png';
import instagramPng from '../assets/instagram.png';
import papelTimbradoJpg from '../assets/papel-timbrado.jpg';

// Carrega o logo (PNG) e retorna elemento de imagem pronto para uso no jsPDF
const loadLogoImage = async (): Promise<HTMLImageElement> => {
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = logoPngUrl as unknown as string;
  });
};

const loadAssetImage = async (src: string): Promise<HTMLImageElement> => {
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src as unknown as string;
  });
};

// Renderiza TODO o conteúdo do relatório em um jsPDF
const renderRelatorio = async (
  pdf: jsPDF,
  relatorio: RelatorioTecnico,
  logoImage: HTMLImageElement,
  bgImage: HTMLImageElement | null
) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginLeft = 20;
  const marginRight = 20;
  const marginTop = 20;
  const marginBottom = 12; // margem inferior menor para descer o rodapé
  const contentWidth = pageWidth - marginLeft - marginRight;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const splitText = (text: string, maxWidth: number) => pdf.splitTextToSize(text || '', maxWidth);

  const ensureSpace = (currentY: number, neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - marginBottom) {
      pdf.addPage();
      if (bgImage) {
        // desenhar plano de fundo na nova página
        pdf.addImage(bgImage, 'JPEG', 0, 0, pageWidth, pageHeight);
      }
      return marginTop;
    }
    return currentY;
  };

  const drawSectionBox = (x: number, y: number, w: number, h: number) => {
    // jsPDF 2.x: usar API interna de GState se disponível para opacidade
    const anyPdf = pdf as unknown as { GState?: new (cfg: { opacity?: number; fillOpacity?: number }) => unknown; setGState?: (gs: unknown) => void };
    const GStateCtor = anyPdf && anyPdf.GState ? anyPdf.GState : undefined;
    if (GStateCtor && anyPdf.setGState) {
      anyPdf.setGState(new GStateCtor({ opacity: 0.2, fillOpacity: 0.2 }));
    }
    pdf.roundedRect(x, y, w, h, 2, 2, 'DF');
    if (GStateCtor && anyPdf.setGState) {
      anyPdf.setGState(new GStateCtor({ opacity: 1, fillOpacity: 1 }));
    }
  };

  let y = marginTop;

  // Plano de fundo página 1
  if (bgImage) {
    pdf.addImage(bgImage, 'JPEG', 0, 0, pageWidth, pageHeight);
  }

  // Título
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  const titulo = 'RELATÓRIO TÉCNICO DE SERVIÇO';
  const tituloWidth = pdf.getTextWidth(titulo);
  pdf.text(titulo, (pageWidth - tituloWidth) / 2, y);
  y += 18; // mais espaço entre o título e o bloco de logo+empresa

  // Cabeçalho com logo.png à esquerda (mesmas dimensões do carimbo)
  const empresa = NOME_EMPRESA;
  const cnpj = CNPJ_EMPRESA;
  pdf.setFont('helvetica', 'bold');
  const nomePt = 13;
  pdf.setFontSize(nomePt);
  const empresaWidth = pdf.getTextWidth(empresa);
  pdf.setFont('helvetica', 'normal');
  const cnpjPt = 11;
  pdf.setFontSize(cnpjPt);
  const cnpjWidth = pdf.getTextWidth(cnpj);
  const logoGap = 4;
  const ptToMm = (pt: number) => (pt / 72) * 25.4;
  // usar a mesma escala de largura do carimbo para garantir consistência visual
  const logoAspect = (logoImage.width || 1) / (logoImage.height || 1);
  const baseLogoTargetWidth = Math.min(70, contentWidth * 0.7) * 0.8 * 0.7; // mesma regra do carimbo (com reduções)
  const logoTargetWidth = baseLogoTargetWidth;
  const logoTargetHeight = logoTargetWidth / logoAspect;
  const textBlockWidth = Math.max(empresaWidth, cnpjWidth);
  const totalWidth = logoTargetWidth + logoGap + textBlockWidth;
  const startX = (pageWidth - totalWidth) / 2;
  const logoX = startX;
  const logoY = y - (logoTargetHeight - 6);
  pdf.addImage(logoImage, 'PNG', logoX, logoY, logoTargetWidth, logoTargetHeight);
  const textX = logoX + logoTargetWidth + logoGap;
  const mmNome = ptToMm(nomePt);
  const mmCnpj = ptToMm(cnpjPt);
  const textBlockH = mmNome + 2 + mmCnpj;
  const baselineOffset = -0.5; // ajuste fino visual (mm)
  const empresaBaseline = logoY + (logoTargetHeight - textBlockH) / 2 + mmNome * 0.7 + baselineOffset;
  const cnpjBaseline = empresaBaseline + 2 + mmCnpj * 0.7 + baselineOffset;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text(empresa, textX, empresaBaseline);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text(cnpj, textX, cnpjBaseline);
  // posicionar y após o bloco
  y = Math.max(logoY + logoTargetHeight, cnpjBaseline + 2) + 12;

  // Seção: Dados do Contrato
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Dados do Contrato', marginLeft, y);
  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  const boxPadding = 4;
  const contratoLinhaAltura = 5;
  const contratoGapEntreCampos = 1;
  const boxInnerTop = 3;
  const contratoCampos: Array<[string, string]> = [
    ['Contrato', relatorio.contrato.contrato || '_________________'],
    ['Valor Inicial', relatorio.contrato.valorInicial != null ? formatCurrency(relatorio.contrato.valorInicial) : '_________________'],
    ['RQ', relatorio.contrato.rq || '_________________'],
    ['OS', relatorio.contrato.os || '_________________'],
    ['Pedido', relatorio.contrato.pedido || '_________________']
  ];

  type ContratoItemLayout = { labelText: string; labelWidth: number; valueLines: string[] };
  const contratoDetalhado: ContratoItemLayout[] = contratoCampos.map(([label, value]) => {
    const labelText = `${label}: `;
    pdf.setFont('helvetica', 'bold');
    const labelWidth = pdf.getTextWidth(labelText);
    pdf.setFont('helvetica', 'normal');
    const availableWidth = contentWidth - boxPadding * 2 - labelWidth;
    const valueLines = splitText(value, availableWidth > 10 ? availableWidth : contentWidth - boxPadding * 2);
    return { labelText, labelWidth, valueLines };
  });

  const contratoAltura = contratoDetalhado.reduce((acc, item, idx) => {
    const blocAltura = item.valueLines.length * contratoLinhaAltura;
    const gap = idx < contratoDetalhado.length - 1 ? contratoGapEntreCampos : 0;
    return acc + blocAltura + gap;
  }, 0) + boxPadding * 2 + boxInnerTop;

  y = ensureSpace(y, contratoAltura);
  pdf.setLineWidth(0.4);
  pdf.setFillColor(240, 244, 255);
  pdf.setDrawColor(200, 210, 235);
  drawSectionBox(marginLeft, y, contentWidth, contratoAltura);
  let innerY = y + boxPadding + boxInnerTop;
  const innerX = marginLeft + boxPadding;
  contratoDetalhado.forEach((item, idx) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(item.labelText, innerX, innerY);
    pdf.setFont('helvetica', 'normal');
    const valueStartX = innerX + item.labelWidth;
    item.valueLines.forEach((vLine: string) => {
      pdf.text(vLine, valueStartX, innerY);
      innerY += contratoLinhaAltura;
    });
    if (idx < contratoDetalhado.length - 1) {
      innerY += contratoGapEntreCampos;
    }
  });
  y = y + contratoAltura + 14;

  // Seção: 1. ESCOPO
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('1. ESCOPO', marginLeft, y);
  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  const escopoTexto = relatorio.escopo.descricao || '________________________________________________';
  const escopoLinhas = splitText(escopoTexto, contentWidth - boxPadding * 2);
  const escopoAltura = escopoLinhas.length * 6 + boxPadding * 2 + boxInnerTop;
  y = ensureSpace(y, escopoAltura);
  pdf.setLineWidth(0.4);
  pdf.setFillColor(240, 244, 255);
  pdf.setDrawColor(200, 210, 235);
  drawSectionBox(marginLeft, y, contentWidth, escopoAltura);
  innerY = y + boxPadding + boxInnerTop;
  escopoLinhas.forEach((line: string) => {
    pdf.text(line, marginLeft + boxPadding, innerY);
    innerY += 6;
  });
  y = y + escopoAltura + 14;

  // Seção: 2. DESCRIÇÃO TÉCNICA
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('2. DESCRIÇÃO TÉCNICA', marginLeft, y);
  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  const itens = relatorio.descricaoTecnica.itens || [];
  const descricaoLinhas: string[] = [];
  if (itens.length === 0 || itens.every((i) => !i)) {
    descricaoLinhas.push('________________________________________________');
  } else {
    itens.forEach((item) => {
      if (!item) return;
      const texto = `• ${item}`;
      const linhas = splitText(texto, contentWidth - boxPadding * 2);
      descricaoLinhas.push(...linhas, '');
    });
    if (descricaoLinhas.length && descricaoLinhas[descricaoLinhas.length - 1] === '') {
      descricaoLinhas.pop();
    }
  }
  const descricaoAltura = descricaoLinhas.reduce((acc, l) => acc + (l === '' ? 2 : 6), 0) + boxPadding * 2 + boxInnerTop;
  y = ensureSpace(y, descricaoAltura);
  pdf.setLineWidth(0.4);
  pdf.setFillColor(240, 244, 255);
  pdf.setDrawColor(200, 210, 235);
  drawSectionBox(marginLeft, y, contentWidth, descricaoAltura);
  innerY = y + boxPadding + boxInnerTop;
  descricaoLinhas.forEach((line: string) => {
    if (line === '') {
      innerY += 2;
    } else {
      pdf.text(line, marginLeft + boxPadding, innerY);
      innerY += 6;
    }
  });
  y = y + descricaoAltura + 14;

  // Seção: 3. ELABORADO POR (página 1)
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('3. ELABORADO POR', marginLeft, y);
  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  const elaboradoLinhas = [
    'JOSÉ GERALDO ALEIXO',
    'Responsável Comercial',
    'Diretor Executivo',
    '',
    `Data: ${new Date(relatorio.data as unknown as string).toLocaleDateString('pt-BR')}`
  ];
  const elaboradoAltura = elaboradoLinhas.reduce((acc, l) => acc + (l === '' ? 10 : 6), 0) + boxPadding * 2 + boxInnerTop;
  y = ensureSpace(y, elaboradoAltura);
  pdf.setLineWidth(0.4);
  pdf.setFillColor(240, 244, 255);
  pdf.setDrawColor(200, 210, 235);
  drawSectionBox(marginLeft, y, contentWidth, elaboradoAltura);
  innerY = y + boxPadding + boxInnerTop;
  elaboradoLinhas.forEach((line: string) => {
    if (line === '') {
      innerY += 10; // espaçamento extra
    } else {
      pdf.text(line, marginLeft + boxPadding, innerY);
      innerY += 6;
    }
  });
  y = y + elaboradoAltura + 14;

  // Seção: 4. FOTOS DO SERVIÇO (nova página)
  pdf.addPage();
  if (bgImage) {
    pdf.addImage(bgImage, 'JPEG', 0, 0, pageWidth, pageHeight);
  }
  y = marginTop;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('4. FOTOS DO SERVIÇO', marginLeft, y);
  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  const fotos = relatorio.fotos || [];
  if (fotos.length === 0) {
    const fotosPlaceholder = 'Espaço reservado para fotos do serviço.';
    const fotosLinhas = pdf.splitTextToSize(fotosPlaceholder, contentWidth);
    fotosLinhas.forEach((line: string) => {
      pdf.text(line, marginLeft, y);
      y += 6;
    });
  } else {
    // grade dinâmica mantendo proporção, ajustando para até 5 fotos
    const gap = 4; // mm entre células

    // ==== Medição e ajuste do rodapé para caber em UMA linha ====
    let footerIconSize = 5; // mm (maior)
    const iconGap = 1.5;
    const segGap = 7; // separador um pouco maior
    let footerFontPt = 13; // fonte maior

    const contentMaxW = contentWidth;
    const blocksSpec = [
      { label: 'Contato: ', value: '(31) 99465-0007', icons: 2 },
      { label: 'E-mail: ', value: 'geraldinhomanutencoes2020@gmail.com', icons: 1 },
      { label: 'Instagram: ', value: '@geraldinho_manutencoes', icons: 1 }
    ];

    const measureTotalWidth = (fontPt: number, iconSz: number) => {
      pdf.setFont('helvetica', 'normal');
      const sepWidth = pdf.getTextWidth('|') + segGap / 2;
      let total = 0;
      blocksSpec.forEach((b, i) => {
        // label normal, valor em negrito
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(fontPt);
        const wLabel = pdf.getTextWidth(b.label);
        pdf.setFont('helvetica', 'bold');
        const wValue = pdf.getTextWidth(b.value);
        const wIcons = b.icons > 0 ? b.icons * iconSz + iconGap : 0;
        total += wIcons + wLabel + 1 + wValue;
        if (i < blocksSpec.length - 1) total += sepWidth;
      });
      return total;
    };

    // reduzir até caber em 1 linha
    let totalW = measureTotalWidth(footerFontPt, footerIconSize);
    while (totalW > contentMaxW && footerFontPt > 7.2) {
      footerFontPt -= 0.4;
      footerIconSize -= 0.2;
      totalW = measureTotalWidth(footerFontPt, footerIconSize);
    }
    const lineHeight = Math.max(footerIconSize, ptToMm(footerFontPt)) + 0.6;
    // ===== Carimbo (logo + CNPJ) reservado acima do rodapé =====
    const carimboGap = 2; // mm de respiro acima do rodapé
    // calcular altura do carimbo (logo.png + CNPJ)
    let carimboImgTargetWidth = Math.min(70, contentWidth * 0.7); // mm
    carimboImgTargetWidth *= 0.8; // reduzir 20%
    carimboImgTargetWidth *= 0.7; // reduzir mais 30%
    const carimboImg = await loadAssetImage(logoPngUrl as unknown as string);
    const carimboAspect = (carimboImg.width || 1) / (carimboImg.height || 1);
    const carimboImgHeight = carimboImgTargetWidth / carimboAspect;
    const cnpjDigits = CNPJ_EMPRESA.replace(/^CNPJ:\s*/i, '');
    const cnpjPt = 12 * 0.7; // reduzir 30%
    const cnpjLineHeight = ptToMm(cnpjPt);
    const carimboReserved = carimboImgHeight + 1 + cnpjLineHeight + carimboGap; // mm

    const footerReserved = lineHeight + 1; // reserva para 1 linha
    const availableBottom = pageHeight - marginBottom - footerReserved - carimboReserved;
    const availableHeight = availableBottom - y;
    const maxFotos = Math.min(fotos.length, 5);
    const chooseCols = (n: number) => {
      if (n <= 1) return 1;
      if (n === 2) return 2;
      if (n === 3) return 3;
      if (n === 4) return 2;
      return 3; // 5 fotos → 3 colunas (3+2)
    };
    const colunas = chooseCols(maxFotos);
    const rows = Math.max(1, Math.ceil(maxFotos / colunas));
    const wCell = (contentWidth - gap * (colunas - 1)) / colunas;
    const hCell = Math.max(10, (availableHeight - gap * (rows - 1)) / rows);

    const displayed = fotos.slice(0, maxFotos);
    for (let i = 0; i < displayed.length; i++) {
      const src = displayed[i];
      const col = i % colunas;
      const row = Math.floor(i / colunas);
      const baseX = marginLeft + col * (wCell + gap);
      const baseY = y + row * (hCell + gap);
      if (baseY >= availableBottom) break;
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = src;
        });
        const aspect = (img.width || 1) / (img.height || 1);
        let h = wCell / aspect;
        if (h > hCell) {
          h = hCell;
        }
        let w = h * aspect;
        if (w > wCell) {
          w = wCell;
          h = w / aspect;
        }
        if (baseY + h > availableBottom) break;
        const offsetX = baseX + (wCell - w) / 2;
        const offsetY = baseY + (hCell - h) / 2;
        const format: 'PNG' | 'JPEG' = (src.includes('image/png') || src.endsWith('.png')) ? 'PNG' : 'JPEG';
        // imagem
        pdf.addImage(img, format, offsetX, offsetY, w, h);
        // moldura para aparência de galeria
        const framePadding = 1; // mm
        // azul mais escuro combinando com o papel timbrado
        pdf.setDrawColor(60, 90, 160);
        pdf.setLineWidth(0.4);
        pdf.roundedRect(
          Math.max(marginLeft, offsetX - framePadding),
          Math.max(marginTop, offsetY - framePadding),
          Math.min(w + framePadding * 2, contentWidth),
          h + framePadding * 2,
          1,
          1,
          'S'
        );
      } catch {
        // ignora imagens inválidas
      }
    }

    // ==== Desenho do carimbo (logo + CNPJ) ====
    {
      const carimboX = marginLeft + (contentWidth - carimboImgTargetWidth) / 2;
      const carimboY = availableBottom + (carimboGap / 2) + (3 / 3.78); // +3px ~ 0.79mm gap extra
      pdf.addImage(carimboImg, 'PNG', carimboX, carimboY, carimboImgTargetWidth, carimboImgHeight);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(cnpjPt);
      const cnpjWidth = pdf.getTextWidth(cnpjDigits);
      const cnpjX = marginLeft + (contentWidth - cnpjWidth) / 2;
      const cnpjY = carimboY + carimboImgHeight + 1 + (cnpjLineHeight * 0.75);
      pdf.text(cnpjDigits, cnpjX, cnpjY);
    }

    // ==== Desenho do rodapé (fixado ao rodapé, 1 linha) ====
    const targetPageIndex = 2;
    if (pdf.getNumberOfPages() >= targetPageIndex) {
      pdf.setPage(targetPageIndex);
      const baseY = pageHeight - marginBottom - 0.6;
      let cx = marginLeft;
      const cy = baseY;

      const whImg = await loadAssetImage(whatsappPng as unknown as string);
      const callImg = await loadAssetImage(callPng as unknown as string);
      const mailImg = await loadAssetImage(emailPng as unknown as string);
      const instaImg = await loadAssetImage(instagramPng as unknown as string);

      const blocks = [
        { icons: [whImg, callImg], label: 'Contato: ', value: '(31) 99465-0007' },
        { icons: [mailImg], label: 'E-mail: ', value: 'geraldinhomanutencoes2020@gmail.com' },
        { icons: [instaImg], label: 'Instagram: ', value: '@geraldinho_manutencoes' }
      ];

      const drawBlock = (icons: HTMLImageElement[], label: string, value: string) => {
        icons.forEach((ic) => {
          // alinhar base do ícone com a linha de base do texto
          pdf.addImage(ic, 'PNG', cx, cy - footerIconSize + 0.5, footerIconSize, footerIconSize);
          cx += footerIconSize + iconGap;
        });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(footerFontPt);
        pdf.text(label, cx, cy);
        cx += pdf.getTextWidth(label) + 1;
        pdf.setFont('helvetica', 'bold');
        if (label.toLowerCase().includes('e-mail')) {
          pdf.setTextColor(35, 99, 210);
        }
        // Instagram como link clicável
        if (label.toLowerCase().includes('instagram')) {
          const url = 'https://www.instagram.com/geraldinho_manutencoes/';
          pdf.textWithLink(value, cx, cy, { url });
        } else {
          pdf.text(value, cx, cy);
        }
        pdf.setTextColor(0, 0, 0);
        cx += pdf.getTextWidth(value);
      };

      for (let i = 0; i < blocks.length; i++) {
        drawBlock(blocks[i].icons, blocks[i].label, blocks[i].value);
        // separador se couber e não for último
        if (i < blocks.length - 1) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(footerFontPt);
          pdf.text('|', cx + segGap / 2, cy);
          cx += segGap;
        }
      }
    }
    // Remover páginas extras além da página 2, se criadas por engano
    while (pdf.getNumberOfPages() > 2) {
      pdf.deletePage(pdf.getNumberOfPages());
    }
  }
};

export const gerarPDF = async (relatorio: RelatorioTecnico) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const logoImage = await loadLogoImage();
  const bgImage = await loadAssetImage(papelTimbradoJpg as unknown as string).catch(() => null);
  await renderRelatorio(pdf, relatorio, logoImage, bgImage);
  const fileName = `relatorio-tecnico-${relatorio.data || 'sem-data'}.pdf`;
  pdf.save(fileName);
};

// Gera um Blob do PDF (para preview em tempo real)
export const gerarPDFBlob = async (relatorio: RelatorioTecnico): Promise<Blob> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const logoImage = await loadLogoImage();
  const bgImage = await loadAssetImage(papelTimbradoJpg as unknown as string).catch(() => null);
  await renderRelatorio(pdf, relatorio, logoImage, bgImage);
  return pdf.output('blob');
};

// Removido: geração via HTML/canvas para garantir texto selecionável no PDF
