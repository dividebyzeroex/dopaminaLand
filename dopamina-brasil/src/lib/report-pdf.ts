type Offer = { name: string; price: number; link: string };
type Report = { query: string; checkedAt: string; offers: Offer[] };

const ascii = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7e]/g, ' ');
const escaped = (value: string) => ascii(value).replace(/[\\()]/g, '\\$&');
const money = (price: number) => `R$ ${price.toFixed(2).replace('.', ',')}`;

/** A small self-contained PDF export. All numbers and links originate from the current API response. */
export function buildPriceReportPdf({ query, checkedAt, offers }: Report): Uint8Array {
  const objects: string[] = [];
  const add = (value: string) => { objects.push(value); return objects.length; };
  const catalog = add('');
  const pagesRoot = add('');
  const font = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const bold = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  const pages: number[] = [];
  const checked = Number.isNaN(new Date(checkedAt).getTime()) ? checkedAt : new Date(checkedAt).toLocaleString('pt-BR');
  const groups = Math.max(1, Math.ceil(offers.length / 4));

  for (let pageIndex = 0; pageIndex < groups; pageIndex++) {
    const subset = offers.slice(pageIndex * 4, pageIndex * 4 + 4);
    const commands: string[] = [];
    const text = (value: string, x: number, y: number, size: number, strong = false) => {
      commands.push(`BT /${strong ? 'B' : 'F'} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escaped(value)}) Tj ET`);
    };
    commands.push('0.047 0.051 0.11 rg 0 0 595 842 re f');
    commands.push('0.43 0.34 0.98 rg 40 763 52 4 re f');
    commands.push('1 1 1 rg');
    text('dopamina.', 40, 789, 19, true);
    text('RELATORIO DE PRECOS', 40, 730, 27, true);
    commands.push('0.7 0.73 0.85 rg');
    text(`Busca: ${query.slice(0, 75)}`, 40, 702, 11);
    text(`Consulta: ${checked}  |  Fonte: Buscape`, 40, 683, 10);
    text(`Resultados observados: ${offers.length}  |  Pagina ${pageIndex + 1} de ${groups}`, 40, 667, 10);
    commands.push('1 1 1 rg');
    text('RESULTADOS ENCONTRADOS', 40, 620, 14, true);

    const annotations: number[] = [];
    subset.forEach((offer, i) => {
      const top = 590 - i * 132;
      commands.push('0.095 0.105 0.19 rg');
      commands.push(`40 ${top - 108} 515 115 re f`);
      commands.push('0.76 0.69 1 rg');
      text(`RESULTADO ${pageIndex * 4 + i + 1}`, 55, top - 15, 9, true);
      commands.push('1 1 1 rg');
      const title = offer.name.slice(0, 105);
      text(title.slice(0, 68), 55, top - 36, 11, true);
      if (title.length > 68) text(title.slice(68), 55, top - 51, 10);
      text(money(offer.price), 55, top - 72, 17, true);
      commands.push('0.53 0.84 1 rg');
      text('ABRIR RESULTADO NA FONTE', 310, top - 87, 9, true);
      if (/^https:\/\//i.test(offer.link)) {
        const safeUrl = offer.link.replace(/[^\x20-\x7e]/g, value => encodeURIComponent(value));
        annotations.push(add(`<< /Type /Annot /Subtype /Link /Rect [304 ${top - 101} 540 ${top - 76}] /Border [0 0 0] /A << /S /URI /URI (${escaped(safeUrl)}) >> >>`));
      }
    });
    commands.push('0.7 0.73 0.85 rg');
    text('Valores de uma consulta pontual. Modelos e vendedores podem ser diferentes.', 40, 39, 9);
    text('Confirme especificacoes, frete, disponibilidade e pagamento na fonte.', 40, 25, 9);
    const stream = commands.join('\n') + '\n';
    const content = add(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);
    pages.push(add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F ${font} 0 R /B ${bold} 0 R >> >> /Contents ${content} 0 R /Annots [${annotations.map(id => `${id} 0 R`).join(' ')}] >>`));
  }
  objects[catalog - 1] = `<< /Type /Catalog /Pages ${pagesRoot} 0 R >>`;
  objects[pagesRoot - 1] = `<< /Type /Pages /Kids [${pages.map(id => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`;
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(offset => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}
