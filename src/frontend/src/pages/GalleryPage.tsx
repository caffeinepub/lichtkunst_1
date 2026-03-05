import { Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import type { Collection } from "../backend";
import { NFTCard } from "../components/NFTCard";
import { NFTGridSkeleton } from "../components/NFTSkeleton";
import { useCollections, useNFTs } from "../hooks/useQueries";

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

  const collectionMap = new Map<string, Collection>(
    (collections ?? []).map((c) => [c.id, c]),
  );

  const randomQuote = useMemo(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)],
    [],
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <motion.div
        className="mb-6 overflow-hidden rounded relative"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <img
          src="/assets/generated/hero-lichtkunst.dim_1400x600.jpg"
          alt="Light Art by Istvan Seidel"
          className="w-full h-24 sm:h-36 lg:h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 sm:p-6">
          <motion.h1
            className="text-2xl sm:text-4xl lg:text-5xl text-foreground text-glow-amber mb-1 uppercase"
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 100,
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
            light artworks · light paintings by Istvan Seidel — minted on the
            Internet Computer
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
    </div>
  );
}
