import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(
      `Anfrage von ${name} – Lichtkunst / NFT`,
    );
    const body = encodeURIComponent(
      `Hallo Istvan,\n\n${message}\n\n---\nAbsender: ${name}\nE-Mail: ${email}`,
    );
    window.location.href = `mailto:lichtkunst@proton.me?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-16 max-w-2xl">
      {/* Heading */}
      <div className="text-center mb-10">
        <h1
          className="text-3xl tracking-widest text-foreground/90 mb-4"
          style={{ fontWeight: 100 }}
        >
          Kontakt
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Schön, dass Sie sich für meine Arbeit interessieren.
        </p>
        <p className="text-muted-foreground leading-relaxed mt-2">
          Ob Sie an einem meiner laufenden Kunstprojekte interessiert sind, ein
          Werk erwerben möchten oder einfach mehr über meine Lichtkunst erfahren
          wollen – ich freue mich auf Ihre Nachricht.
        </p>
      </div>

      {/* Form */}
      {sent ? (
        <div
          data-ocid="contact.success_state"
          className="text-center py-12 text-muted-foreground"
        >
          <p className="text-lg" style={{ fontWeight: 100 }}>
            Vielen Dank für Ihre Nachricht.
          </p>
          <p className="mt-2 text-sm">
            Ihr E-Mail-Programm sollte sich geöffnet haben. Bitte senden Sie die
            vorbereitete Nachricht ab.
          </p>
          <Button
            variant="ghost"
            className="mt-6"
            onClick={() => setSent(false)}
            data-ocid="contact.secondary_button"
          >
            Neue Nachricht schreiben
          </Button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          data-ocid="contact.panel"
        >
          <div className="space-y-2">
            <Label htmlFor="contact-name">Ihr Name</Label>
            <Input
              id="contact-name"
              data-ocid="contact.input"
              placeholder="Vorname Nachname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email">Ihre E-Mail-Adresse</Label>
            <Input
              id="contact-email"
              data-ocid="contact.input"
              type="email"
              placeholder="ihre@email.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-message">Ihre Nachricht</Label>
            <Textarea
              id="contact-message"
              data-ocid="contact.textarea"
              placeholder="Ich bin interessiert an …"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            data-ocid="contact.submit_button"
          >
            Nachricht senden
          </Button>

          <p className="text-xs text-center text-muted-foreground/60">
            Ihr E-Mail-Programm wird geöffnet, um die Nachricht an{" "}
            <span className="text-muted-foreground">lichtkunst@proton.me</span>{" "}
            zu senden.
          </p>
        </form>
      )}
    </div>
  );
}
