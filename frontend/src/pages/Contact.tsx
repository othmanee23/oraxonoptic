import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Scan, Mail, Phone, MapPin, Send, Clock, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';

const WHATSAPP_NUMBER = '0622787541';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await apiFetch('/api/contact-messages', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      });
      toast.success('Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error("Impossible d'envoyer le message pour le moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent('Bonjour, je souhaite en savoir plus sur OpticAxon.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/landing" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                <Scan className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">OpticAxon</span>
            </Link>
            <Link to="/landing">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">Contactez-nous</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Une question, une demande de démonstration ou besoin d'assistance ? 
            Notre équipe est là pour vous aider.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">contact@optigest.com</p>
                <p className="text-muted-foreground">support@optigest.com</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Téléphone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">+212 5XX-XXXXXX</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Horaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Lundi - Vendredi</p>
                <p className="text-muted-foreground">9h00 - 18h00</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Adresse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Casablanca, Maroc</p>
              </CardContent>
            </Card>

            {/* WhatsApp Button */}
            <Button 
              onClick={openWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
              size="lg"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Contactez-nous sur WhatsApp
            </Button>
          </div>

          {/* Contact Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Envoyez-nous un message</CardTitle>
              <CardDescription>
                Remplissez le formulaire ci-dessous et nous vous répondrons dans les 24 heures.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Votre nom"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Sujet *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Objet de votre message"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Décrivez votre demande en détail..."
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                  {isSubmitting ? (
                    'Envoi en cours...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer le message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
