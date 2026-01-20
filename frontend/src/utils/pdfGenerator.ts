import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Invoice, PaymentMethod } from '@/types/sales';
import { Client } from '@/types/client';
import { getStoreSettings, hexToRgb } from '@/types/settings';

const getPaymentMethodLabel = (method: PaymentMethod): string => {
  const labels: Record<PaymentMethod, string> = {
    cash: 'Espèces',
    card: 'Carte bancaire',
    transfer: 'Virement',
    mixed: 'Mixte',
  };
  return labels[method] || method;
};

// Darken a color by percentage
const darkenRgb = (rgb: [number, number, number], percent: number): [number, number, number] => {
  const factor = 1 - percent / 100;
  return [
    Math.round(rgb[0] * factor),
    Math.round(rgb[1] * factor),
    Math.round(rgb[2] * factor),
  ];
};

// Lighten a color
const lightenRgb = (rgb: [number, number, number], percent: number): [number, number, number] => {
  return [
    Math.min(255, Math.round(rgb[0] + (255 - rgb[0]) * (percent / 100))),
    Math.min(255, Math.round(rgb[1] + (255 - rgb[1]) * (percent / 100))),
    Math.min(255, Math.round(rgb[2] + (255 - rgb[2]) * (percent / 100))),
  ];
};

export const generateInvoicePDF = (invoice: Invoice, client: Client | null): void => {
  const settings = getStoreSettings();
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = 0;

  // Colors
  const primaryColor = hexToRgb(settings.primaryColor || '#2563eb');
  const primaryDark = darkenRgb(primaryColor, 20);
  const primaryLight = lightenRgb(primaryColor, 90);
  const darkColor: [number, number, number] = [31, 41, 55];
  const grayColor: [number, number, number] = [107, 114, 128];
  const lightGray: [number, number, number] = [249, 250, 251];
  const borderGray: [number, number, number] = [229, 231, 235];
  const greenColor: [number, number, number] = [22, 163, 74];
  const white: [number, number, number] = [255, 255, 255];

  // ===== HEADER WITH GRADIENT EFFECT =====
  // Main header band
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Decorative darker strip at bottom of header
  doc.setFillColor(...primaryDark);
  doc.rect(0, 42, pageWidth, 3, 'F');

  // Logo or Company name
  let contentStartX = margin;
  if (settings.logo) {
    try {
      doc.addImage(settings.logo, 'AUTO', margin, 8, 28, 28);
      contentStartX = margin + 33;
    } catch {
      // Fallback if logo fails
    }
  }
  
  // Company name
  doc.setTextColor(...white);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.name, contentStartX, 22);
  
  if (settings.subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(settings.subtitle, contentStartX, 30);
  }

  // Invoice label & number on right
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', pageWidth - margin, 15, { align: 'right' });
  
  doc.setFontSize(16);
  doc.text(invoice.invoiceNumber, pageWidth - margin, 25, { align: 'right' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(invoice.createdAt), 'dd MMMM yyyy', { locale: fr }), pageWidth - margin, 33, { align: 'right' });

  y = 55;

  // ===== STATUS BADGE =====
  const statusConfig: Record<string, { label: string; color: [number, number, number] }> = {
    draft: { label: 'Brouillon', color: [156, 163, 175] },
    pending: { label: 'En attente', color: [234, 179, 8] },
    partial: { label: 'Partiel', color: [59, 130, 246] },
    paid: { label: 'Payée', color: [22, 163, 74] },
    cancelled: { label: 'Annulée', color: [239, 68, 68] },
  };

  const status = statusConfig[invoice.status] || { label: invoice.status, color: grayColor };
  const badgeWidth = doc.getTextWidth(status.label) + 12;
  
  doc.setFillColor(...status.color);
  doc.roundedRect(margin, y - 5, badgeWidth, 8, 2, 2, 'F');
  doc.setTextColor(...white);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(status.label, margin + badgeWidth / 2, y, { align: 'center' });

  y += 12;

  // ===== INFO CARDS: EMITTER & CLIENT =====
  const cardWidth = (pageWidth - margin * 2 - 10) / 2;
  const cardHeight = 38;
  
  // Emitter card
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, y, cardWidth, cardHeight, 3, 3, 'F');
  
  doc.setTextColor(...grayColor);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('ÉMETTEUR', margin + 6, y + 8);
  
  doc.setTextColor(...darkColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.name, margin + 6, y + 16);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  let infoY = y + 22;
  if (settings.address) {
    doc.text(settings.address, margin + 6, infoY);
    infoY += 4;
  }
  if (settings.city) {
    doc.text(settings.city, margin + 6, infoY);
    infoY += 4;
  }
  if (settings.phone) {
    doc.text(settings.phone, margin + 6, infoY);
  }

  // Client card
  const clientCardX = margin + cardWidth + 10;
  doc.setFillColor(...lightGray);
  doc.roundedRect(clientCardX, y, cardWidth, cardHeight, 3, 3, 'F');
  
  doc.setTextColor(...grayColor);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURÉ À', clientCardX + 6, y + 8);
  
  if (client) {
    doc.setTextColor(...darkColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${client.firstName} ${client.lastName}`, clientCardX + 6, y + 16);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    let clientInfoY = y + 22;
    doc.text(client.phone, clientCardX + 6, clientInfoY);
    if (client.email) {
      clientInfoY += 4;
      doc.text(client.email, clientCardX + 6, clientInfoY);
    }
    if (client.address) {
      clientInfoY += 4;
      doc.text(client.address, clientCardX + 6, clientInfoY);
    }
  }

  y += cardHeight + 12;

  // ===== ITEMS TABLE =====
  const tableX = margin;
  const tableWidth = pageWidth - margin * 2;
  const colWidths = {
    article: tableWidth * 0.40,
    qty: tableWidth * 0.10,
    price: tableWidth * 0.18,
    discount: tableWidth * 0.12,
    total: tableWidth * 0.20,
  };

  // Table header
  doc.setFillColor(...primaryColor);
  doc.roundedRect(tableX, y, tableWidth, 10, 2, 2, 'F');
  
  doc.setTextColor(...white);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  
  let colX = tableX + 4;
  doc.text('ARTICLE', colX, y + 7);
  colX += colWidths.article;
  doc.text('QTÉ', colX + colWidths.qty / 2, y + 7, { align: 'center' });
  colX += colWidths.qty;
  doc.text('PRIX UNIT.', colX + colWidths.price / 2, y + 7, { align: 'center' });
  colX += colWidths.price;
  doc.text('REMISE', colX + colWidths.discount / 2, y + 7, { align: 'center' });
  colX += colWidths.discount;
  doc.text('TOTAL', tableX + tableWidth - 4, y + 7, { align: 'right' });

  y += 12;

  // Table rows
  invoice.items.forEach((item, index) => {
    const rowHeight = 14;
    
    // Alternate row background
    if (index % 2 === 0) {
      doc.setFillColor(...lightGray);
      doc.rect(tableX, y, tableWidth, rowHeight, 'F');
    }
    
    const rowY = y + 6;
    
    // Article
    doc.setTextColor(...darkColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(item.productName.substring(0, 35), tableX + 4, rowY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...grayColor);
    doc.text(item.productReference, tableX + 4, rowY + 5);
    
    // Quantity
    doc.setTextColor(...darkColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(item.quantity.toString(), tableX + colWidths.article + colWidths.qty / 2, rowY, { align: 'center' });
    
    // Unit price
    doc.text(`${item.unitPrice.toLocaleString('fr-MA')} DH`, tableX + colWidths.article + colWidths.qty + colWidths.price / 2, rowY, { align: 'center' });
    
    // Discount
    if (item.discount > 0) {
      doc.setTextColor(...greenColor);
      doc.text(`-${item.discount}%`, tableX + colWidths.article + colWidths.qty + colWidths.price + colWidths.discount / 2, rowY, { align: 'center' });
    } else {
      doc.setTextColor(...grayColor);
      doc.text('-', tableX + colWidths.article + colWidths.qty + colWidths.price + colWidths.discount / 2, rowY, { align: 'center' });
    }
    
    // Total
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`${item.total.toLocaleString('fr-MA')} DH`, tableX + tableWidth - 4, rowY, { align: 'right' });
    
    y += rowHeight;
  });

  // Table bottom border
  doc.setDrawColor(...borderGray);
  doc.setLineWidth(0.5);
  doc.line(tableX, y, tableX + tableWidth, y);

  y += 10;

  // ===== TOTALS SECTION =====
  const totalsWidth = 85;
  const totalsX = pageWidth - margin - totalsWidth;
  
  // Totals box
  doc.setFillColor(...lightGray);
  doc.roundedRect(totalsX, y, totalsWidth, 50, 3, 3, 'F');
  
  let totalsY = y + 10;
  const labelX = totalsX + 6;
  const valueX = totalsX + totalsWidth - 6;
  
  // Subtotal
  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Sous-total', labelX, totalsY);
  doc.setTextColor(...darkColor);
  doc.text(`${invoice.subtotal.toLocaleString('fr-MA')} DH`, valueX, totalsY, { align: 'right' });
  
  // Discounts
  if (invoice.discountTotal > 0) {
    totalsY += 8;
    doc.setTextColor(...greenColor);
    doc.text('Remises', labelX, totalsY);
    doc.text(`-${invoice.discountTotal.toLocaleString('fr-MA')} DH`, valueX, totalsY, { align: 'right' });
  }
  
  // Tax
  if (invoice.taxRate > 0) {
    totalsY += 8;
    doc.setTextColor(...grayColor);
    doc.text(`TVA (${invoice.taxRate}%)`, labelX, totalsY);
    doc.setTextColor(...darkColor);
    doc.text(`${invoice.taxAmount.toLocaleString('fr-MA')} DH`, valueX, totalsY, { align: 'right' });
  }
  
  // Total highlight
  totalsY += 4;
  doc.setFillColor(...primaryColor);
  doc.roundedRect(totalsX + 3, totalsY, totalsWidth - 6, 14, 2, 2, 'F');
  
  doc.setTextColor(...white);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL TTC', labelX, totalsY + 10);
  doc.setFontSize(12);
  doc.text(`${invoice.total.toLocaleString('fr-MA')} DH`, valueX - 3, totalsY + 10, { align: 'right' });

  y += 55;

  // Amount paid & due
  if (invoice.amountPaid > 0) {
    doc.setTextColor(...greenColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Montant payé:', totalsX + 6, y);
    doc.text(`${invoice.amountPaid.toLocaleString('fr-MA')} DH`, valueX, y, { align: 'right' });
    
    y += 7;
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Reste à payer:', totalsX + 6, y);
    doc.setTextColor(invoice.amountDue > 0 ? 220 : 22, invoice.amountDue > 0 ? 38 : 163, invoice.amountDue > 0 ? 38 : 74);
    doc.text(`${invoice.amountDue.toLocaleString('fr-MA')} DH`, valueX, y, { align: 'right' });
    
    y += 10;
  }

  // ===== PAYMENT HISTORY =====
  if (invoice.payments.length > 0) {
    y += 5;
    
    doc.setTextColor(...grayColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('PAIEMENTS', margin, y);
    
    y += 6;
    
    invoice.payments.forEach((payment) => {
      // Payment row with green left border effect
      doc.setFillColor(...lightGray);
      doc.rect(margin, y, tableWidth, 10, 'F');
      doc.setFillColor(...greenColor);
      doc.rect(margin, y, 2, 10, 'F');
      
      doc.setTextColor(...greenColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('✓', margin + 6, y + 7);
      
      doc.setTextColor(...darkColor);
      doc.text(format(new Date(payment.date), 'dd/MM/yyyy HH:mm'), margin + 14, y + 7);
      
      // Method badge
      const methodLabel = getPaymentMethodLabel(payment.method);
      doc.setFillColor(...borderGray);
      const methodWidth = doc.getTextWidth(methodLabel) + 6;
      doc.roundedRect(margin + 55, y + 2, methodWidth, 6, 1, 1, 'F');
      doc.setTextColor(...grayColor);
      doc.setFontSize(7);
      doc.text(methodLabel, margin + 58, y + 6);
      
      doc.setTextColor(...darkColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${payment.amount.toLocaleString('fr-MA')} DH`, margin + tableWidth - 4, y + 7, { align: 'right' });
      
      y += 12;
    });
  }

  // ===== FOOTER =====
  const footerY = pageHeight - 28;
  
  // Decorative line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1);
  doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
  
  // Footer text
  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.footerText || 'Merci pour votre confiance !', pageWidth / 2, footerY, { align: 'center' });
  
  doc.setFontSize(8);
  const footerCompany = `${settings.name}${settings.subtitle ? ' • ' + settings.subtitle : ''}${settings.phone ? ' • ' + settings.phone : ''}`;
  doc.text(footerCompany, pageWidth / 2, footerY + 6, { align: 'center' });
  
  // Legal info
  if (settings.ice || settings.rc) {
    doc.setFontSize(7);
    const legalParts = [
      settings.ice ? `ICE: ${settings.ice}` : '',
      settings.rc ? `RC: ${settings.rc}` : '',
      settings.patente ? `Patente: ${settings.patente}` : '',
    ].filter(Boolean);
    doc.text(legalParts.join(' • '), pageWidth / 2, footerY + 12, { align: 'center' });
  }
  
  // Website with primary color
  if (settings.website) {
    doc.setTextColor(...primaryColor);
    doc.setFontSize(8);
    doc.text(settings.website, pageWidth / 2, footerY + 18, { align: 'center' });
  }

  // Save
  doc.save(`Facture_${invoice.invoiceNumber}.pdf`);
};

// ===== PRINT HTML GENERATOR =====
export const generatePrintHTML = (invoice: Invoice, client: Client | null): string => {
  const settings = getStoreSettings();
  const primaryColor = settings.primaryColor || '#2563eb';
  
  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = { cash: 'Espèces', card: 'Carte', transfer: 'Virement', mixed: 'Mixte' };
    return labels[method] || method;
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    draft: { label: 'Brouillon', color: '#9ca3af' },
    pending: { label: 'En attente', color: '#eab308' },
    partial: { label: 'Partiel', color: '#3b82f6' },
    paid: { label: 'Payée', color: '#16a34a' },
    cancelled: { label: 'Annulée', color: '#ef4444' },
  };

  const status = statusConfig[invoice.status] || { label: invoice.status, color: '#6b7280' };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Facture ${invoice.invoiceNumber}</title>
  <style>
    @page { margin: 0; size: A4; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; color: #1f2937; background: #fff; font-size: 11px; }
    .page { width: 210mm; min-height: 297mm; margin: 0 auto; position: relative; padding-bottom: 30mm; }
    
    .header { background: ${primaryColor}; color: #fff; padding: 20px 25px; display: flex; justify-content: space-between; align-items: center; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .header-logo { height: 40px; width: auto; }
    .company-name { font-size: 22px; font-weight: 700; }
    .company-sub { font-size: 10px; opacity: 0.9; }
    .invoice-meta { text-align: right; }
    .invoice-label { font-size: 9px; opacity: 0.8; }
    .invoice-number { font-size: 16px; font-weight: 600; margin-top: 2px; }
    .invoice-date { font-size: 9px; opacity: 0.9; margin-top: 2px; }
    
    .content { padding: 20px 25px; }
    
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 9px; font-weight: 600; color: #fff; background: ${status.color}; }
    
    .info-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }
    .info-card { background: #f9fafb; border-radius: 8px; padding: 14px; }
    .info-label { font-size: 8px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .info-name { font-size: 13px; font-weight: 600; color: #1f2937; }
    .info-detail { font-size: 10px; color: #6b7280; margin-top: 3px; }
    
    .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .items-table thead { background: ${primaryColor}; color: #fff; }
    .items-table th { padding: 10px 8px; font-size: 8px; font-weight: 600; text-transform: uppercase; text-align: left; }
    .items-table th.center { text-align: center; }
    .items-table th.right { text-align: right; }
    .items-table tbody tr:nth-child(even) { background: #f9fafb; }
    .items-table td { padding: 10px 8px; vertical-align: top; border-bottom: 1px solid #f3f4f6; }
    .item-name { font-weight: 600; font-size: 10px; }
    .item-ref { font-size: 8px; color: #9ca3af; margin-top: 2px; }
    .center { text-align: center; }
    .right { text-align: right; }
    .discount-text { color: #16a34a; }
    .item-total { font-weight: 600; }
    
    .totals-section { display: flex; justify-content: flex-end; margin-top: 20px; }
    .totals-box { width: 200px; background: #f9fafb; border-radius: 8px; padding: 12px; }
    .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 10px; }
    .total-row.discount { color: #16a34a; }
    .total-row.main { background: ${primaryColor}; color: #fff; margin: 8px -12px -12px; padding: 10px 12px; border-radius: 0 0 8px 8px; font-size: 12px; font-weight: 700; }
    .total-row.paid { color: #16a34a; }
    .total-row.due { font-weight: 600; }
    
    .payments { margin-top: 20px; }
    .payments-title { font-size: 9px; color: #6b7280; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
    .payment-row { display: flex; justify-content: space-between; align-items: center; background: #f9fafb; padding: 8px 12px; margin-bottom: 4px; border-radius: 6px; border-left: 3px solid #16a34a; }
    .payment-info { display: flex; align-items: center; gap: 8px; }
    .payment-check { color: #16a34a; font-weight: bold; }
    .payment-method { background: #e5e7eb; padding: 2px 6px; border-radius: 8px; font-size: 8px; color: #6b7280; }
    .payment-amount { font-weight: 600; }
    
    .footer { position: absolute; bottom: 0; left: 0; right: 0; padding: 15px 25px; border-top: 2px solid ${primaryColor}; text-align: center; background: #fafafa; }
    .footer-thanks { font-size: 11px; color: #374151; font-weight: 500; }
    .footer-info { font-size: 9px; color: #6b7280; margin-top: 4px; }
    .footer-legal { font-size: 8px; color: #9ca3af; margin-top: 4px; }
    .footer-website { font-size: 9px; color: ${primaryColor}; margin-top: 4px; }
    
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-left">
        ${settings.logo ? `<img src="${settings.logo}" class="header-logo" alt="Logo">` : ''}
        <div>
          <div class="company-name">${settings.name}</div>
          ${settings.subtitle ? `<div class="company-sub">${settings.subtitle}</div>` : ''}
        </div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-label">FACTURE</div>
        <div class="invoice-number">${invoice.invoiceNumber}</div>
        <div class="invoice-date">${format(new Date(invoice.createdAt), 'dd MMMM yyyy', { locale: fr })}</div>
      </div>
    </div>
    
    <div class="content">
      <span class="status-badge">${status.label}</span>
      
      <div class="info-cards">
        <div class="info-card">
          <div class="info-label">Émetteur</div>
          <div class="info-name">${settings.name}</div>
          ${settings.address ? `<div class="info-detail">${settings.address}</div>` : ''}
          ${settings.city ? `<div class="info-detail">${settings.city}</div>` : ''}
          ${settings.phone ? `<div class="info-detail">${settings.phone}</div>` : ''}
        </div>
        <div class="info-card">
          <div class="info-label">Facturé à</div>
          ${client ? `
            <div class="info-name">${client.firstName} ${client.lastName}</div>
            <div class="info-detail">${client.phone}</div>
            ${client.email ? `<div class="info-detail">${client.email}</div>` : ''}
            ${client.address ? `<div class="info-detail">${client.address}</div>` : ''}
          ` : '<div class="info-detail">Client anonyme</div>'}
        </div>
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th style="width:40%">Article</th>
            <th class="center" style="width:10%">Qté</th>
            <th class="center" style="width:18%">Prix unit.</th>
            <th class="center" style="width:12%">Remise</th>
            <th class="right" style="width:20%">Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(item => `
            <tr>
              <td><div class="item-name">${item.productName}</div><div class="item-ref">${item.productReference}</div></td>
              <td class="center">${item.quantity}</td>
              <td class="center">${item.unitPrice.toLocaleString('fr-MA')} DH</td>
              <td class="center">${item.discount > 0 ? `<span class="discount-text">-${item.discount}%</span>` : '-'}</td>
              <td class="right item-total">${item.total.toLocaleString('fr-MA')} DH</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="totals-section">
        <div class="totals-box">
          <div class="total-row"><span>Sous-total</span><span>${invoice.subtotal.toLocaleString('fr-MA')} DH</span></div>
          ${invoice.discountTotal > 0 ? `<div class="total-row discount"><span>Remises</span><span>-${invoice.discountTotal.toLocaleString('fr-MA')} DH</span></div>` : ''}
          ${invoice.taxRate > 0 ? `<div class="total-row"><span>TVA (${invoice.taxRate}%)</span><span>${invoice.taxAmount.toLocaleString('fr-MA')} DH</span></div>` : ''}
          ${invoice.amountPaid > 0 ? `
            <div class="total-row paid"><span>Payé</span><span>${invoice.amountPaid.toLocaleString('fr-MA')} DH</span></div>
            <div class="total-row due"><span>Reste</span><span>${invoice.amountDue.toLocaleString('fr-MA')} DH</span></div>
          ` : ''}
          <div class="total-row main"><span>Total TTC</span><span>${invoice.total.toLocaleString('fr-MA')} DH</span></div>
        </div>
      </div>
      
      ${invoice.payments.length > 0 ? `
        <div class="payments">
          <div class="payments-title">Historique des paiements</div>
          ${invoice.payments.map(p => `
            <div class="payment-row">
              <div class="payment-info">
                <span class="payment-check">✓</span>
                <span>${format(new Date(p.date), 'dd/MM/yyyy HH:mm')}</span>
                <span class="payment-method">${getMethodLabel(p.method)}</span>
              </div>
              <span class="payment-amount">${p.amount.toLocaleString('fr-MA')} DH</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
    
    <div class="footer">
      <div class="footer-thanks">${settings.footerText || 'Merci pour votre confiance !'}</div>
      <div class="footer-info">${settings.name}${settings.subtitle ? ' • ' + settings.subtitle : ''}${settings.phone ? ' • ' + settings.phone : ''}</div>
      ${settings.ice || settings.rc ? `<div class="footer-legal">${[settings.ice ? 'ICE: ' + settings.ice : '', settings.rc ? 'RC: ' + settings.rc : ''].filter(Boolean).join(' • ')}</div>` : ''}
      ${settings.website ? `<div class="footer-website">${settings.website}</div>` : ''}
    </div>
  </div>
</body>
</html>`;
};
