import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Mail, Trash2, Eye, MessageSquare, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export default function MessagesContact() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const loadMessages = () => {
    apiFetch<{
      id: number | string;
      name: string;
      email: string;
      subject: string;
      message: string;
      created_at: string;
      read_at?: string | null;
    }[]>('/api/contact-messages')
      .then((data) => {
        setMessages(
          data.map((message) => ({
            id: String(message.id),
            name: message.name,
            email: message.email,
            subject: message.subject,
            message: message.message,
            createdAt: message.created_at,
            read: Boolean(message.read_at),
          }))
        );
      })
      .catch(() => {
        setMessages([]);
      });
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setShowViewDialog(true);
    if (!message.read) {
      apiFetch(`/api/contact-messages/${message.id}/read`, { method: 'PATCH' })
        .then(loadMessages)
        .catch(() => undefined);
    }
  };

  const handleDeleteMessage = (id: string) => {
    apiFetch(`/api/contact-messages/${id}`, { method: 'DELETE' })
      .then(() => {
        loadMessages();
        toast({
          title: "Message supprimé",
          description: "Le message a été supprimé avec succès.",
        });
      })
      .catch(() => {
        toast({
          title: "Suppression impossible",
          description: "Veuillez réessayer.",
          variant: "destructive",
        });
      });
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Messages de contact
            </h1>
            <p className="text-muted-foreground">
              Messages reçus via le formulaire de contact de la landing page
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} non lu{unreadCount > 1 ? 's' : ''}</Badge>
            )}
            <Button variant="outline" onClick={loadMessages}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tous les messages</CardTitle>
            <CardDescription>
              {messages.length} message{messages.length > 1 ? 's' : ''} au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun message pour le moment</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Sujet</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id} className={!message.read ? 'bg-muted/50' : ''}>
                      <TableCell>
                        <Badge variant={message.read ? 'secondary' : 'default'}>
                          {message.read ? 'Lu' : 'Nouveau'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(message.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                      </TableCell>
                      <TableCell className="font-medium">{message.name}</TableCell>
                      <TableCell>{message.email}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{message.subject}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewMessage(message)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteMessage(message.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View Message Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedMessage?.subject}</DialogTitle>
              <DialogDescription>
                De {selectedMessage?.name} ({selectedMessage?.email}) - {selectedMessage && format(new Date(selectedMessage.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="whitespace-pre-wrap">{selectedMessage?.message}</p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                Fermer
              </Button>
              <Button asChild>
                <a href={`mailto:${selectedMessage?.email}?subject=Re: ${selectedMessage?.subject}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Répondre par email
                </a>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
