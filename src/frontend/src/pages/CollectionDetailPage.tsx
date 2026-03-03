import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Layers, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { NFTCard } from "../components/NFTCard";
import { NFTGridSkeleton } from "../components/NFTSkeleton";
import { useCollection, useNFTsByCollection } from "../hooks/useQueries";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
} as const;
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
} as const;

export function CollectionDetailPage() {
  const { id } = useParams({ from: "/collection/$id" });
  const { data: collection, isLoading: collectionLoading } = useCollection(id);
  const { data: nfts, isLoading: nftsLoading } = useNFTsByCollection(id);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12">
      <Link
        to="/collections"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors mb-8"
        data-ocid="nav.collections_link"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All Collections
      </Link>

      {/* Collection header */}
      {collectionLoading ? (
        <div className="mb-10">
          <Skeleton className="h-8 w-64 bg-secondary mb-3" />
          <Skeleton className="h-4 w-96 bg-secondary" />
        </div>
      ) : collection ? (
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {collection.coverImageId && (
            <div className="aspect-video sm:aspect-[3/1] overflow-hidden rounded mb-6 relative">
              <img
                src={collection.coverImageId.getDirectURL()}
                alt={collection.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            </div>
          )}
          <div className="flex items-center gap-3 mb-2">
            <Layers className="w-5 h-5 text-accent" />
            <h1 className="heading-display text-3xl sm:text-4xl text-foreground text-glow-amber">
              {collection.name}
            </h1>
          </div>
          {collection.description && (
            <p className="text-muted-foreground font-body text-sm sm:text-base max-w-2xl">
              {collection.description}
            </p>
          )}
        </motion.div>
      ) : null}

      {/* NFT grid */}
      {nftsLoading ? (
        <NFTGridSkeleton count={6} />
      ) : !nfts || nfts.length === 0 ? (
        <div
          className="flex flex-col items-center gap-4 py-20 text-center"
          data-ocid="collections.empty_state"
        >
          <Sparkles className="w-8 h-8 text-accent opacity-60 animate-pulse-glow" />
          <p className="text-muted-foreground text-sm">
            No NFTs in this collection yet.
          </p>
        </div>
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
              <NFTCard nft={nft} collection={collection} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
