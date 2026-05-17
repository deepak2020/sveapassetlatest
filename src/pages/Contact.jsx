import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const CONTACT_EMAIL = "hello@sveapasset.app";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Sveapasset feedback from ${name || "a learner"}`);
    const body = encodeURIComponent(`From: ${name} <${email}>\n\n${message}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" /> Tillbaka · <em>Back</em>
      </Link>

      <header className="mb-10">
        <h1 className="font-display text-4xl font-bold text-foreground mb-3">
          Kontakta oss · <em className="text-muted-foreground font-normal">Contact us</em>
        </h1>
        <p className="text-lg text-muted-foreground">
          Vi läser varje meddelande — feedback, fel, idéer eller frågor är välkomna.
          <br />
          <em>We read every message — feedback, errors, ideas or questions are welcome.</em>
        </p>
      </header>

      {/* Email card */}
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="flex items-center gap-4 rounded-xl border border-border/50 bg-card p-5 hover:border-primary/50 transition-colors mb-8"
      >
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-display font-semibold text-foreground">E-post · <em className="text-muted-foreground font-normal">Email</em></p>
          <p className="text-sm text-primary">{CONTACT_EMAIL}</p>
        </div>
      </a>

      {/* Contact form */}
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-lg text-foreground">
            Skicka ett meddelande · <em className="text-muted-foreground font-normal">Send a message</em>
          </h2>
        </div>

        {sent ? (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Tack! Din e-postklient har öppnats.</p>
              <p className="text-muted-foreground italic">Thanks! Your email client has opened.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Namn · <em className="text-muted-foreground font-normal">Name</em></Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ditt namn"
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="email">E-post · <em className="text-muted-foreground font-normal">Email</em></Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@email.com"
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="message">Meddelande · <em className="text-muted-foreground font-normal">Message</em></Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Skriv ditt meddelande här..."
                required
                rows={5}
                className="mt-1.5"
              />
            </div>
            <Button type="submit" className="gap-2 w-full sm:w-auto">
              <Send className="w-4 h-4" /> Skicka · <em className="font-normal">Send</em>
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}