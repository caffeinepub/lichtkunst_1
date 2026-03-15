import { Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Collection } from "../backend";
import { NFTCard } from "../components/NFTCard";
import { NFTGridSkeleton } from "../components/NFTSkeleton";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  useCollections,
  useNFTs,
  useSubscribeEmail,
} from "../hooks/useQueries";

const QUOTES = [
  // Walter Russell – Das Geheimnis des Lichtes
  {
    text: "Licht ist alles, was es gibt. Es gibt nichts anderes.",
    author: "Walter Russell",
    source: "Das Geheimnis des Lichtes",
  },
  {
    text: "Gott ist Licht, und Licht ist Gott. Es gibt kein anderes Licht als das Licht Gottes.",
    author: "Walter Russell",
    source: "Das Geheimnis des Lichtes",
  },
  {
    text: "Das Universum ist ein geistiges Universum, das durch Gedanken erschaffen wurde und durch Gedanken erhalten wird.",
    author: "Walter Russell",
    source: "Das Geheimnis des Lichtes",
  },
  {
    text: "Jeder Gedanke, den du denkst, ist ein Lichtstrahl, der die Dunkelheit des Unwissens durchdringt.",
    author: "Walter Russell",
    source: "Das Geheimnis des Lichtes",
  },
  {
    text: "Die ganze Schöpfung besteht aus Licht in verschiedenen Schwingungs-zuständen.",
    author: "Walter Russell",
    source: "Das Geheimnis des Lichtes",
  },
  // Goethe – Zur Farbenlehre
  {
    text: "Die Farben sind Taten des Lichts, Taten und Leiden.",
    author: "Johann Wolfgang von Goethe",
    source: "Zur Farbenlehre",
  },
  {
    text: "Das Auge hat sein Dasein dem Licht zu danken. Aus gleichgültigen tierischen Hilfsorganen ruft sich das Licht ein Organ hervor, das seinesgleichen werde.",
    author: "Johann Wolfgang von Goethe",
    source: "Zur Farbenlehre",
  },
  {
    text: "Licht und Finsternis, Helligkeit und Dunkel, werden mit den Farben in einer allgemeinen Weise in Verbindung stehen.",
    author: "Johann Wolfgang von Goethe",
    source: "Zur Farbenlehre",
  },
  {
    text: "Gelb ist die nächste Farbe dem Licht. Sie erscheint in ihrer höchsten Reinheit stets dem Licht zugewendet.",
    author: "Johann Wolfgang von Goethe",
    source: "Zur Farbenlehre",
  },
  {
    text: "Jede Farbe wirkt auf die Seele; sie kann Gefühle erwecken, Empfindungen auslösen.",
    author: "Johann Wolfgang von Goethe",
    source: "Zur Farbenlehre",
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
} as const;

export function GalleryPage() {
  const { data: nfts, isLoading: nftsLoading } = useNFTs();
  const { data: collections } = useCollections();
  const subscribeEmailMutation = useSubscribeEmail();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<
    "idle" | "subscribed" | "already_subscribed"
  >("idle");

  const collectionMap = new Map<string, Collection>(
    (collections ?? []).map((c) => [c.id, c]),
  );

  const randomQuote = useMemo(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)],
    [],
  );

  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent("Anfrage – Lichtkunst / NFT");
    const body = encodeURIComponent(
      `Name: ${name}\nE-Mail: ${email}\n\n${message}`,
    );
    window.location.href = `mailto:lichtkunst@proton.me?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  async function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    try {
      const result = await subscribeEmailMutation.mutateAsync(
        newsletterEmail.trim(),
      );
      setNewsletterStatus(
        result === "already_subscribed" ? "already_subscribed" : "subscribed",
      );
    } catch {
      // silently fail
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12">
      {/* Hero Banner */}
      <motion.div
        className="mb-6 overflow-hidden rounded relative"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <img
          src="/assets/generated/hero-lichtkunst.dim_1400x600.jpg"
          alt="Light Art by Istvan Seidel"
          className="w-full h-48 sm:h-72 lg:h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 sm:p-6">
          <motion.h1
            className="text-base sm:text-2xl lg:text-3xl text-foreground text-glow-amber mb-1 uppercase"
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 25,
              letterSpacing: "0.25em",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Light Art Gallery
          </motion.h1>
          <motion.p
            className="text-muted-foreground text-xs sm:text-sm max-w-lg"
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 100,
              letterSpacing: "0.18em",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            light artworks by Istvan Seidel — minted on the Internet Computer
          </motion.p>
        </div>
      </motion.div>

      {/* Random Quote */}
      <motion.blockquote
        className="mb-8 mt-3 text-center px-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.7 }}
      >
        <p className="text-muted-foreground font-body italic text-sm sm:text-base leading-relaxed">
          &ldquo;{randomQuote.text}&rdquo;
        </p>
        <footer className="mt-1 text-xs text-muted-foreground/60">
          — {randomQuote.author},{" "}
          <cite className="not-italic">{randomQuote.source}</cite>
        </footer>
      </motion.blockquote>

      {/* Grid */}
      {nftsLoading ? (
        <NFTGridSkeleton count={8} />
      ) : !nfts || nfts.length === 0 ? (
        <motion.div
          className="flex flex-col items-center gap-4 py-24 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          data-ocid="gallery.empty_state"
        >
          <Sparkles className="w-10 h-10 text-accent opacity-60 animate-pulse-glow" />
          <h2 className="heading-serif text-xl text-foreground">
            The gallery is empty
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            NFTs will appear here once they are minted by the artist.
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {nfts.map((nft, i) => (
            <motion.div
              key={nft.id}
              variants={itemVariants}
              data-ocid={`gallery.item.${i + 1}`}
            >
              <NFTCard
                nft={nft}
                collection={collectionMap.get(nft.collectionId)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Contact Section */}
      <motion.section
        className="mt-20"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="border-t border-border/30 pt-12">
          <div className="max-w-lg mx-auto">
            <h2
              className="text-xl sm:text-2xl text-foreground uppercase mb-2 text-center"
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 25,
                letterSpacing: "0.3em",
              }}
            >
              Kontakt
            </h2>
            <p className="text-muted-foreground text-sm text-center mb-8 leading-relaxed">
              Sind Sie an meinen Kunstprojekten oder daran interessiert, ein NFT
              zu erwerben? Ich freue mich auf Ihre Nachricht.
            </p>

            {submitted ? (
              <motion.div
                className="text-center py-8 text-accent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                data-ocid="homepage_contact.success_state"
              >
                <p className="text-base font-light tracking-wide">
                  Vielen Dank! Ihr E-Mail-Programm sollte sich geöffnet haben.
                </p>
                <button
                  type="button"
                  className="mt-4 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
                  onClick={() => setSubmitted(false)}
                >
                  Weitere Nachricht senden
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="contact-name"
                    className="text-xs tracking-widest uppercase text-muted-foreground"
                  >
                    Name
                  </Label>
                  <Input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ihr Name"
                    className="bg-card/50 border-border/40 focus:border-accent/60"
                    data-ocid="homepage_contact.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="contact-email"
                    className="text-xs tracking-widest uppercase text-muted-foreground"
                  >
                    E-Mail
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ihre@email.de"
                    className="bg-card/50 border-border/40 focus:border-accent/60"
                    data-ocid="homepage_contact.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="contact-message"
                    className="text-xs tracking-widest uppercase text-muted-foreground"
                  >
                    Nachricht
                  </Label>
                  <Textarea
                    id="contact-message"
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ihre Nachricht…"
                    rows={5}
                    className="bg-card/50 border-border/40 focus:border-accent/60 resize-none"
                    data-ocid="homepage_contact.textarea"
                  />
                </div>
                <div className="flex flex-col items-center gap-3 pt-1">
                  <Button
                    type="submit"
                    className="w-full sm:w-auto px-10"
                    data-ocid="homepage_contact.submit_button"
                  >
                    Nachricht senden
                  </Button>
                  <p className="text-xs text-muted-foreground/50">
                    Nachricht geht an lichtkunst@proton.me
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </motion.section>

      {/* Newsletter Section */}
      <motion.section
        className="mt-16"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="border-t border-border/30 pt-12">
          <div className="max-w-lg mx-auto">
            <h2
              className="text-xl sm:text-2xl text-foreground uppercase mb-2 text-center"
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 25,
                letterSpacing: "0.3em",
              }}
            >
              Newsletter
            </h2>
            <p className="text-muted-foreground text-sm text-center mb-8 leading-relaxed">
              Bleiben Sie auf dem Laufenden – erhalten Sie Neuigkeiten zu neuen
              Kunstwerken und NFTs.
            </p>

            {newsletterStatus === "subscribed" ? (
              <motion.div
                className="text-center py-8 text-accent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                data-ocid="newsletter.success_state"
              >
                <p className="text-base font-light tracking-wide">
                  ✦ Herzlich willkommen! Sie erhalten ab jetzt unsere
                  Neuigkeiten.
                </p>
                <button
                  type="button"
                  className="mt-4 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
                  onClick={() => {
                    setNewsletterStatus("idle");
                    setNewsletterEmail("");
                  }}
                >
                  Weitere E-Mail anmelden
                </button>
              </motion.div>
            ) : newsletterStatus === "already_subscribed" ? (
              <motion.div
                className="text-center py-8 text-muted-foreground"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                data-ocid="newsletter.success_state"
              >
                <p className="text-base font-light tracking-wide">
                  Diese E-Mail-Adresse ist bereits angemeldet.
                </p>
                <button
                  type="button"
                  className="mt-4 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
                  onClick={() => {
                    setNewsletterStatus("idle");
                    setNewsletterEmail("");
                  }}
                >
                  Andere Adresse verwenden
                </button>
              </motion.div>
            ) : (
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="ihre@email.de"
                  className="flex-1 bg-card/50 border-border/40 focus:border-accent/60"
                  data-ocid="newsletter.input"
                />
                <Button
                  type="submit"
                  disabled={subscribeEmailMutation.isPending}
                  className="shrink-0"
                  data-ocid="newsletter.submit_button"
                >
                  {subscribeEmailMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Anmelden
                </Button>
              </form>
            )}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
