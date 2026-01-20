import { useState } from "react";
import { CreditCard, Banknote, Building2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PaymentMethod } from "@/types/sales";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  amountDue: number;
  onConfirmPayment: (payment: {
    amount: number;
    method: PaymentMethod;
    reference?: string;
    notes?: string;
  }) => void;
}

const paymentMethods = [
  { value: 'cash' as PaymentMethod, label: 'Espèces', icon: Banknote },
  { value: 'card' as PaymentMethod, label: 'Carte bancaire', icon: CreditCard },
  { value: 'transfer' as PaymentMethod, label: 'Virement', icon: Building2 },
  { value: 'mixed' as PaymentMethod, label: 'Mixte', icon: Layers },
];

export function PaymentDialog({
  isOpen,
  onClose,
  total,
  amountDue,
  onConfirmPayment,
}: PaymentDialogProps) {
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [paymentAmount, setPaymentAmount] = useState(amountDue);
  const [customTotal, setCustomTotal] = useState(amountDue);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isPartial, setIsPartial] = useState(false);
  const [isEditingTotal, setIsEditingTotal] = useState(false);

  // Reset when dialog opens with new values
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    } else {
      setCustomTotal(amountDue);
      setPaymentAmount(amountDue);
      setIsEditingTotal(false);
      setIsPartial(false);
    }
  };

  const handleSubmit = () => {
    const finalAmount = isPartial ? paymentAmount : customTotal;
    onConfirmPayment({
      amount: finalAmount,
      method,
      reference: reference || undefined,
      notes: notes || undefined,
    });
    
    // Reset form
    setMethod('cash');
    setPaymentAmount(amountDue);
    setCustomTotal(amountDue);
    setReference("");
    setNotes("");
    setIsPartial(false);
    setIsEditingTotal(false);
  };

  const effectiveAmount = isPartial ? paymentAmount : customTotal;
  const change = !isPartial && method === 'cash' && paymentAmount > customTotal ? paymentAmount - customTotal : 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Encaissement</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Total display - editable */}
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-muted-foreground">Montant à encaisser</p>
            {isEditingTotal ? (
              <div className="flex items-center justify-center gap-2 mt-2">
                <Input
                  type="number"
                  value={customTotal}
                  onChange={(e) => setCustomTotal(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-32 text-center text-xl font-bold"
                  min={0}
                  autoFocus
                />
                <span className="text-xl font-bold">DH</span>
              </div>
            ) : (
              <p 
                className="text-3xl font-bold text-primary cursor-pointer hover:underline"
                onClick={() => setIsEditingTotal(true)}
                title="Cliquer pour modifier"
              >
                {customTotal.toLocaleString('fr-MA')} DH
              </p>
            )}
            {total !== customTotal && (
              <p className="text-xs text-muted-foreground mt-1">
                Total initial: {total.toLocaleString('fr-MA')} DH
              </p>
            )}
            {!isEditingTotal && (
              <button 
                className="text-xs text-primary hover:underline mt-1"
                onClick={() => setIsEditingTotal(true)}
              >
                Modifier le montant
              </button>
            )}
            {isEditingTotal && (
              <button 
                className="text-xs text-primary hover:underline mt-1"
                onClick={() => setIsEditingTotal(false)}
              >
                Valider
              </button>
            )}
          </div>

          {/* Partial payment toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="partial">Paiement partiel (acompte)</Label>
            <Switch
              id="partial"
              checked={isPartial}
              onCheckedChange={(checked) => {
                setIsPartial(checked);
                if (checked) {
                  setPaymentAmount(customTotal);
                }
              }}
            />
          </div>

          {isPartial && (
            <div className="space-y-2">
              <Label>Montant de cet acompte</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                max={customTotal}
                min={0}
              />
              <p className="text-xs text-muted-foreground">
                Reste à payer après cet acompte: {Math.max(0, customTotal - paymentAmount).toLocaleString('fr-MA')} DH
              </p>
            </div>
          )}

          {/* Payment method */}
          <div className="space-y-3">
            <Label>Mode de paiement</Label>
            <RadioGroup
              value={method}
              onValueChange={(value) => setMethod(value as PaymentMethod)}
              className="grid grid-cols-2 gap-2"
            >
              {paymentMethods.map((pm) => (
                <div key={pm.value}>
                  <RadioGroupItem
                    value={pm.value}
                    id={pm.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={pm.value}
                    className="flex items-center gap-2 rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                  >
                    <pm.icon className="h-4 w-4" />
                    <span className="text-sm">{pm.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Cash amount for change calculation */}
          {method === 'cash' && !isPartial && (
            <div className="space-y-2">
              <Label>Montant reçu</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                min={customTotal}
              />
              {change > 0 && (
                <p className="text-sm text-green-600 font-medium">
                  Monnaie à rendre: {change.toLocaleString('fr-MA')} DH
                </p>
              )}
            </div>
          )}

          {/* Reference for card/transfer */}
          {(method === 'card' || method === 'transfer') && (
            <div className="space-y-2">
              <Label>Référence {method === 'card' ? 'transaction' : 'virement'}</Label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={method === 'card' ? 'N° transaction' : 'N° virement'}
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optionnel)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes sur le paiement..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isPartial && (paymentAmount <= 0 || paymentAmount > customTotal)}
          >
            Confirmer le paiement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
