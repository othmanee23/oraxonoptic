import { useState, useMemo } from "react";
import { Search, UserPlus, User, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Client } from "@/types/client";

interface ClientSelectorProps {
  clients: Client[];
  selectedClient: Client | null;
  onSelectClient: (client: Client | null) => void;
  onCreateClient?: () => void;
}

export function ClientSelector({ 
  clients, 
  selectedClient, 
  onSelectClient,
  onCreateClient 
}: ClientSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredClients = useMemo(() => {
    if (!search) return clients;
    const searchLower = search.toLowerCase();
    return clients.filter(
      (client) =>
        client.firstName.toLowerCase().includes(searchLower) ||
        client.lastName.toLowerCase().includes(searchLower) ||
        client.phone.includes(search) ||
        client.email?.toLowerCase().includes(searchLower)
    );
  }, [clients, search]);

  const handleSelect = (client: Client) => {
    onSelectClient(client);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <>
      {/* Selected client display */}
      <div 
        className="p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        {selectedClient ? (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {selectedClient.firstName.charAt(0)}{selectedClient.lastName.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">
                {selectedClient.firstName} {selectedClient.lastName}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {selectedClient.phone}
                </span>
                {selectedClient.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {selectedClient.email}
                  </span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={(e) => {
              e.stopPropagation();
              onSelectClient(null);
            }}>
              Changer
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <span className="text-sm">Sélectionner un client...</span>
          </div>
        )}
      </div>

      {/* Client selection dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Sélectionner un client</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, téléphone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {onCreateClient && (
                <Button variant="outline" onClick={() => {
                  setIsOpen(false);
                  onCreateClient();
                }}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Nouveau
                </Button>
              )}
            </div>

            {/* Client list */}
            <ScrollArea className="h-[300px]">
              <div className="space-y-1">
                {filteredClients.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    Aucun client trouvé
                  </div>
                ) : (
                  filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleSelect(client)}
                    >
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {client.firstName} {client.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{client.phone}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
