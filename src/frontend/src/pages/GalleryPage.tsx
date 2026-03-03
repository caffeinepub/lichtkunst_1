import { Sparkles } from "lucide-react";
import { motion } from "motion/react";
import type { Collection } from "../backend";
import { NFTCard } from "../components/NFTCard";
import { NFTGridSkeleton } from "../components/NFTSkeleton";
import { useCollections, useNFTs } from "../hooks/useQueries";

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

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <motion.div
        className="mb-12 overflow-hidden rounded relative"
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
        <div className="absolute bottom-0 left-0 p-6 sm:p-10">
          <motion.h1
            className="heading-display text-3xl sm:text-5xl lg:text-6xl text-foreground text-glow-amber mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Light Art Gallery
          </motion.h1>
          <motion.p
            className="text-muted-foreground font-body text-sm sm:text-base max-w-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            NFT collection by Istvan Seidel — light paintings minted on the
            Internet Computer
          </motion.p>
        </div>
      </motion.div>

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
