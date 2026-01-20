import { useMemo } from "react";
import { Invoice } from "@/types/sales";
import { Client } from "@/types/client";
import { StoreSettings, defaultStoreSettings, getStoreSettings } from "@/types/settings";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface InvoiceThumbnailProps {
  invoice: Invoice;
  client?: Client | null;
}

export const InvoiceThumbnail = ({ invoice, client }: InvoiceThumbnailProps) => {
  const settings = useMemo(() => {
    const cached = getStoreSettings();
    return cached || defaultStoreSettings;
  }, []);

  const primaryColor = settings.primaryColor || "#3B82F6";
  
  const statusColors: Record<string, string> = {
    draft: "#6B7280",
    pending: "#F59E0B",
    partial: "#3B82F6",
    paid: "#10B981",
    cancelled: "#EF4444",
  };

  const statusLabels: Record<string, string> = {
    draft: "Brouillon",
    pending: "En attente",
    partial: "Partiel",
    paid: "Payée",
    cancelled: "Annulée",
  };

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div 
          className="w-12 h-16 rounded border bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow flex-shrink-0 overflow-hidden"
          style={{ fontSize: '3px' }}
        >
          {/* Mini header */}
          <div 
            className="h-3 w-full flex items-center justify-between px-0.5"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
          >
            <div className="text-white font-bold truncate" style={{ fontSize: '2.5px' }}>
              {settings.name || "Optique"}
            </div>
          </div>
          
          {/* Mini content */}
          <div className="p-0.5 space-y-0.5">
            {/* Invoice number */}
            <div className="text-center font-bold text-gray-800" style={{ fontSize: '2px' }}>
              {invoice.invoiceNumber}
            </div>
            
            {/* Status badge */}
            <div className="flex justify-center">
              <div 
                className="px-0.5 rounded text-white"
                style={{ 
                  backgroundColor: statusColors[invoice.status],
                  fontSize: '1.5px',
                  padding: '0.3px 1px'
                }}
              >
                {statusLabels[invoice.status]}
              </div>
            </div>
            
            {/* Mini table simulation */}
            <div className="bg-gray-50 rounded" style={{ padding: '0.5px' }}>
              {invoice.items.slice(0, 2).map((item, i) => (
                <div key={i} className="flex justify-between text-gray-600" style={{ fontSize: '1.5px' }}>
                  <span className="truncate" style={{ maxWidth: '20px' }}>{item.productName}</span>
                  <span>{item.total.toFixed(0)}</span>
                </div>
              ))}
              {invoice.items.length > 2 && (
                <div className="text-center text-gray-400" style={{ fontSize: '1.5px' }}>...</div>
              )}
            </div>
            
            {/* Total */}
            <div 
              className="text-center font-bold text-white rounded"
              style={{ 
                backgroundColor: primaryColor,
                fontSize: '2px',
                padding: '0.5px'
              }}
            >
              {invoice.total.toFixed(0)} DH
            </div>
          </div>
        </div>
      </HoverCardTrigger>
      
      <HoverCardContent className="w-80 p-0 overflow-hidden" side="right">
        {/* Large preview */}
        <div className="bg-white">
          {/* Header */}
          <div 
            className="p-4 text-white"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{settings.name || "OptiCenter Pro"}</h3>
                <p className="text-xs opacity-80">{settings.subtitle || "Centre Optique"}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{invoice.invoiceNumber}</p>
                <p className="text-xs opacity-80">
                  {format(new Date(invoice.createdAt), 'dd/MM/yyyy', { locale: fr })}
                </p>
              </div>
            </div>
          </div>
          
          {/* Status */}
          <div className="px-4 py-2 flex justify-between items-center border-b">
            <span className="text-sm text-muted-foreground">Statut</span>
            <span 
              className="px-2 py-0.5 rounded-full text-white text-xs font-medium"
              style={{ backgroundColor: statusColors[invoice.status] }}
            >
              {statusLabels[invoice.status]}
            </span>
          </div>
          
          {/* Client */}
          <div className="px-4 py-2 border-b bg-muted/30">
            <p className="text-xs text-muted-foreground">Client</p>
            <p className="font-medium">{invoice.clientName}</p>
            {client?.phone && <p className="text-xs text-muted-foreground">{client.phone}</p>}
          </div>
          
          {/* Items */}
          <div className="px-4 py-2 border-b">
            <p className="text-xs text-muted-foreground mb-2">Articles ({invoice.items.length})</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {invoice.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="truncate flex-1 mr-2">
                    {item.quantity}x {item.productName}
                  </span>
                  <span className="font-medium">{item.total.toLocaleString('fr-MA')} DH</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Totals */}
          <div className="px-4 py-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Sous-total</span>
              <span>{invoice.subtotal.toLocaleString('fr-MA')} DH</span>
            </div>
            {invoice.discountTotal > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Remise</span>
                <span>-{invoice.discountTotal.toLocaleString('fr-MA')} DH</span>
              </div>
            )}
            <div 
              className="flex justify-between font-bold text-lg pt-1 border-t mt-2"
              style={{ color: primaryColor }}
            >
              <span>Total</span>
              <span>{invoice.total.toLocaleString('fr-MA')} DH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Payé</span>
              <span className="text-green-600">{invoice.amountPaid.toLocaleString('fr-MA')} DH</span>
            </div>
            {invoice.amountDue > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-amber-600">Reste</span>
                <span className="text-amber-600">{invoice.amountDue.toLocaleString('fr-MA')} DH</span>
              </div>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
