import { useRef } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Printer, Download, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Invoice, PaymentStatus } from "@/types/sales";
import { Client } from "@/types/client";
import { toast } from "sonner";

interface InvoicePreviewProps {
  invoice: Invoice | null;
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onValidate?: () => void;
  storeName?: string;
  storeSubtitle?: string;
}

const statusConfig: Record<PaymentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: 'Brouillon', variant: 'secondary' },
  pending: { label: 'En attente', variant: 'outline' },
  partial: { label: 'Partiel', variant: 'default' },
  paid: { label: 'Payée', variant: 'default' },
  cancelled: { label: 'Annulée', variant: 'destructive' },
};

export function InvoicePreview({
  invoice,
  client,
  isOpen,
  onClose,
  onValidate,
  storeName,
  storeSubtitle,
}: InvoicePreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;
  const companyName = storeName?.trim() ? storeName : "OpticAxon";
  const companySub = storeSubtitle?.trim() ? storeSubtitle : "optic";

  const handlePrint = () => {
    // Create iframe for printing to avoid popup blockers
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.left = '-9999px';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      toast.error("Impossible de préparer l'impression");
      document.body.removeChild(iframe);
      return;
    }

    const styles = `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
        .invoice-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
        .company-sub { font-size: 12px; color: #666; }
        .invoice-number { font-weight: 600; }
        .invoice-date { font-size: 12px; color: #666; }
        .separator { border-top: 1px solid #e5e7eb; margin: 15px 0; }
        .client-section { margin-bottom: 20px; }
        .section-label { font-size: 12px; color: #666; margin-bottom: 5px; }
        .client-name { font-weight: 500; }
        .client-detail { font-size: 12px; color: #666; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items-table th { background: #f3f4f6; text-align: left; padding: 10px; font-size: 12px; }
        .items-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
        .items-table .text-center { text-align: center; }
        .items-table .text-right { text-align: right; }
        .product-name { font-weight: 500; }
        .product-ref { font-size: 10px; color: #666; }
        .totals-section { display: flex; justify-content: flex-end; }
        .totals-box { width: 250px; }
        .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; }
        .total-row.main { font-size: 16px; font-weight: bold; border-top: 1px solid #333; padding-top: 10px; margin-top: 5px; }
        .total-row.main .amount { color: #2563eb; }
        .text-green { color: #16a34a; }
        .payments-section { margin-top: 20px; }
        .payment-item { display: flex; justify-content: space-between; padding: 8px; background: #f9fafb; margin-bottom: 5px; border-radius: 4px; font-size: 12px; }
        .payment-method { background: #e5e7eb; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-left: 10px; }
        .notes-section { margin-top: 20px; padding: 10px; background: #f9fafb; border-radius: 4px; }
        .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #666; }
      </style>
    `;

    const getPaymentMethodLabel = (method: string) => {
      switch (method) {
        case 'cash': return 'Espèces';
        case 'card': return 'Carte';
        case 'transfer': return 'Virement';
        default: return 'Mixte';
      }
    };

    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture ${invoice.invoiceNumber}</title>
          ${styles}
        </head>
        <body>
          <div class="invoice-header">
            <div>
              <div class="company-name">${companyName}</div>
              <div class="company-sub">${companySub}</div>
            </div>
            <div style="text-align: right;">
              <div class="invoice-number">${invoice.invoiceNumber}</div>
              <div class="invoice-date">${format(new Date(invoice.createdAt), 'dd MMMM yyyy', { locale: fr })}</div>
            </div>
          </div>

          <div class="separator"></div>

          ${client ? `
            <div class="client-section">
              <div class="section-label">Client</div>
              <div class="client-name">${client.firstName} ${client.lastName}</div>
              <div class="client-detail">${client.phone}</div>
              ${client.email ? `<div class="client-detail">${client.email}</div>` : ''}
              ${client.address ? `<div class="client-detail">${client.address}</div>` : ''}
            </div>
          ` : ''}

          <table class="items-table">
            <thead>
              <tr>
                <th>Article</th>
                <th class="text-center">Qté</th>
                <th class="text-right">Prix unit.</th>
                <th class="text-right">Remise</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>
                    <div class="product-name">${item.productName}</div>
                    <div class="product-ref">${item.productReference}</div>
                  </td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">${item.unitPrice.toLocaleString('fr-MA')} DH</td>
                  <td class="text-right">${item.discount > 0 ? item.discount + '%' : '-'}</td>
                  <td class="text-right" style="font-weight: 500;">${item.total.toLocaleString('fr-MA')} DH</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals-section">
            <div class="totals-box">
              <div class="total-row">
                <span>Sous-total</span>
                <span>${invoice.subtotal.toLocaleString('fr-MA')} DH</span>
              </div>
              ${invoice.discountTotal > 0 ? `
                <div class="total-row text-green">
                  <span>Remises</span>
                  <span>-${invoice.discountTotal.toLocaleString('fr-MA')} DH</span>
                </div>
              ` : ''}
              ${invoice.taxRate > 0 ? `
                <div class="total-row">
                  <span>TVA (${invoice.taxRate}%)</span>
                  <span>${invoice.taxAmount.toLocaleString('fr-MA')} DH</span>
                </div>
              ` : ''}
              <div class="total-row main">
                <span>Total</span>
                <span class="amount">${invoice.total.toLocaleString('fr-MA')} DH</span>
              </div>
              ${invoice.amountPaid > 0 ? `
                <div class="total-row text-green">
                  <span>Payé</span>
                  <span>${invoice.amountPaid.toLocaleString('fr-MA')} DH</span>
                </div>
                <div class="total-row" style="font-weight: 600;">
                  <span>Reste à payer</span>
                  <span>${invoice.amountDue.toLocaleString('fr-MA')} DH</span>
                </div>
              ` : ''}
            </div>
          </div>

          ${invoice.payments.length > 0 ? `
            <div class="payments-section">
              <div class="section-label">Historique des paiements</div>
              ${invoice.payments.map(payment => `
                <div class="payment-item">
                  <div>
                    <span>✓ ${format(new Date(payment.date), 'dd/MM/yyyy HH:mm')}</span>
                    <span class="payment-method">${getPaymentMethodLabel(payment.method)}</span>
                  </div>
                  <span style="font-weight: 500;">${payment.amount.toLocaleString('fr-MA')} DH</span>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${invoice.notes ? `
            <div class="notes-section">
              <div class="section-label">Notes</div>
              <div style="font-size: 12px;">${invoice.notes}</div>
            </div>
          ` : ''}

          <div class="footer">
            <p>Merci pour votre confiance</p>
            <p>${companyName} - Votre spécialiste en optique</p>
          </div>
        </body>
      </html>
    `);

    iframeDoc.close();
    
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.error('Print error:', e);
        toast.error("Erreur lors de l'impression");
      }
      // Remove iframe after a delay to allow print dialog
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
    
    toast.success("Préparation de l'impression...");
  };

  const handleDownloadHTML = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    // Create a similar HTML structure for download
    const getPaymentMethodLabel = (method: string) => {
      switch (method) {
        case 'cash': return 'Espèces';
        case 'card': return 'Carte';
        case 'transfer': return 'Virement';
        default: return 'Mixte';
      }
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Facture ${invoice.invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
            .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .company-name { font-size: 28px; font-weight: bold; color: #2563eb; }
            .company-sub { font-size: 14px; color: #666; }
            .invoice-number { font-weight: 600; font-size: 16px; }
            .invoice-date { font-size: 14px; color: #666; }
            .separator { border-top: 2px solid #e5e7eb; margin: 20px 0; }
            .client-section { margin-bottom: 25px; }
            .section-label { font-size: 12px; color: #666; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
            .client-name { font-weight: 600; font-size: 16px; }
            .client-detail { font-size: 14px; color: #666; margin-top: 3px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
            .items-table th { background: #f3f4f6; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            .items-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
            .items-table .text-center { text-align: center; }
            .items-table .text-right { text-align: right; }
            .product-name { font-weight: 500; }
            .product-ref { font-size: 12px; color: #666; }
            .totals-section { display: flex; justify-content: flex-end; margin-bottom: 30px; }
            .totals-box { width: 280px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
            .total-row.main { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 15px; margin-top: 10px; }
            .total-row.main .amount { color: #2563eb; }
            .text-green { color: #16a34a; }
            .payments-section { margin-top: 25px; }
            .payment-item { display: flex; justify-content: space-between; padding: 10px 12px; background: #f9fafb; margin-bottom: 8px; border-radius: 6px; font-size: 14px; }
            .payment-method { background: #e5e7eb; padding: 3px 8px; border-radius: 4px; font-size: 11px; margin-left: 12px; }
            .notes-section { margin-top: 25px; padding: 15px; background: #f9fafb; border-radius: 6px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <div>
              <div class="company-name">${companyName}</div>
              <div class="company-sub">${companySub}</div>
            </div>
            <div style="text-align: right;">
              <div class="invoice-number">${invoice.invoiceNumber}</div>
              <div class="invoice-date">${format(new Date(invoice.createdAt), 'dd MMMM yyyy', { locale: fr })}</div>
            </div>
          </div>

          <div class="separator"></div>

          ${client ? `
            <div class="client-section">
              <div class="section-label">Client</div>
              <div class="client-name">${client.firstName} ${client.lastName}</div>
              <div class="client-detail">${client.phone}</div>
              ${client.email ? `<div class="client-detail">${client.email}</div>` : ''}
              ${client.address ? `<div class="client-detail">${client.address}</div>` : ''}
            </div>
          ` : ''}

          <table class="items-table">
            <thead>
              <tr>
                <th>Article</th>
                <th class="text-center">Qté</th>
                <th class="text-right">Prix unit.</th>
                <th class="text-right">Remise</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>
                    <div class="product-name">${item.productName}</div>
                    <div class="product-ref">${item.productReference}</div>
                  </td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">${item.unitPrice.toLocaleString('fr-MA')} DH</td>
                  <td class="text-right">${item.discount > 0 ? item.discount + '%' : '-'}</td>
                  <td class="text-right" style="font-weight: 500;">${item.total.toLocaleString('fr-MA')} DH</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals-section">
            <div class="totals-box">
              <div class="total-row">
                <span>Sous-total</span>
                <span>${invoice.subtotal.toLocaleString('fr-MA')} DH</span>
              </div>
              ${invoice.discountTotal > 0 ? `
                <div class="total-row text-green">
                  <span>Remises</span>
                  <span>-${invoice.discountTotal.toLocaleString('fr-MA')} DH</span>
                </div>
              ` : ''}
              ${invoice.taxRate > 0 ? `
                <div class="total-row">
                  <span>TVA (${invoice.taxRate}%)</span>
                  <span>${invoice.taxAmount.toLocaleString('fr-MA')} DH</span>
                </div>
              ` : ''}
              <div class="total-row main">
                <span>Total</span>
                <span class="amount">${invoice.total.toLocaleString('fr-MA')} DH</span>
              </div>
              ${invoice.amountPaid > 0 ? `
                <div class="total-row text-green">
                  <span>Payé</span>
                  <span>${invoice.amountPaid.toLocaleString('fr-MA')} DH</span>
                </div>
                <div class="total-row" style="font-weight: 600;">
                  <span>Reste à payer</span>
                  <span>${invoice.amountDue.toLocaleString('fr-MA')} DH</span>
                </div>
              ` : ''}
            </div>
          </div>

          ${invoice.payments.length > 0 ? `
            <div class="payments-section">
              <div class="section-label">Historique des paiements</div>
              ${invoice.payments.map(payment => `
                <div class="payment-item">
                  <div>
                    <span>✓ ${format(new Date(payment.date), 'dd/MM/yyyy HH:mm')}</span>
                    <span class="payment-method">${getPaymentMethodLabel(payment.method)}</span>
                  </div>
                  <span style="font-weight: 500;">${payment.amount.toLocaleString('fr-MA')} DH</span>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${invoice.notes ? `
            <div class="notes-section">
              <div class="section-label">Notes</div>
              <div style="font-size: 14px;">${invoice.notes}</div>
            </div>
          ` : ''}

          <div class="footer">
            <p>Merci pour votre confiance</p>
            <p>${companyName} - Votre spécialiste en optique</p>
          </div>
        </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Facture_${invoice.invoiceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Facture téléchargée");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Facture {invoice.invoiceNumber}
          </DialogTitle>
          <Badge variant={statusConfig[invoice.status].variant}>
            {statusConfig[invoice.status].label}
          </Badge>
        </DialogHeader>

        {/* Invoice content */}
        <div className="space-y-6 py-4" id="invoice-content" ref={printRef}>
          {/* Header */}
          <div className="flex justify-between">
            <div>
              <h2 className="text-xl font-bold text-primary">{companyName}</h2>
              <p className="text-sm text-muted-foreground">{companySub}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{invoice.invoiceNumber}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(invoice.createdAt), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
          </div>

          <Separator />

          {/* Client info */}
          {client && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Client</p>
              <p className="font-medium">{client.firstName} {client.lastName}</p>
              <p className="text-sm text-muted-foreground">{client.phone}</p>
              {client.email && <p className="text-sm text-muted-foreground">{client.email}</p>}
              {client.address && <p className="text-sm text-muted-foreground">{client.address}</p>}
            </div>
          )}

          {/* Items table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3">Article</th>
                  <th className="text-center p-3">Qté</th>
                  <th className="text-right p-3">Prix unit.</th>
                  <th className="text-right p-3">Remise</th>
                  <th className="text-right p-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-3">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">{item.productReference}</p>
                    </td>
                    <td className="text-center p-3">{item.quantity}</td>
                    <td className="text-right p-3">{item.unitPrice.toLocaleString('fr-MA')} DH</td>
                    <td className="text-right p-3">
                      {item.discount > 0 ? `${item.discount}%` : '-'}
                    </td>
                    <td className="text-right p-3 font-medium">{item.total.toLocaleString('fr-MA')} DH</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{invoice.subtotal.toLocaleString('fr-MA')} DH</span>
              </div>
              {invoice.discountTotal > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Remises</span>
                  <span>-{invoice.discountTotal.toLocaleString('fr-MA')} DH</span>
                </div>
              )}
              {invoice.taxRate > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TVA ({invoice.taxRate}%)</span>
                  <span>{invoice.taxAmount.toLocaleString('fr-MA')} DH</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{invoice.total.toLocaleString('fr-MA')} DH</span>
              </div>
              {invoice.amountPaid > 0 && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Payé</span>
                    <span>{invoice.amountPaid.toLocaleString('fr-MA')} DH</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Reste à payer</span>
                    <span>{invoice.amountDue.toLocaleString('fr-MA')} DH</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payments history */}
          {invoice.payments.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Historique des paiements</p>
              <div className="space-y-2">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{format(new Date(payment.date), 'dd/MM/yyyy HH:mm')}</span>
                      <Badge variant="outline" className="text-xs">
                        {payment.method === 'cash' ? 'Espèces' : 
                         payment.method === 'card' ? 'Carte' : 
                         payment.method === 'transfer' ? 'Virement' : 'Mixte'}
                      </Badge>
                    </div>
                    <span className="font-medium">{payment.amount.toLocaleString('fr-MA')} DH</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
              <p className="text-sm">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadHTML}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </div>
          {invoice.status === 'draft' && onValidate && (
            <Button onClick={onValidate}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Valider la facture
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
