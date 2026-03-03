import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Layers } from "lucide-react";
import { motion } from "motion/react";
import { useCollections } from "../hooks/useQueries";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
} as const;
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
} as const;

export function CollectionsPage() {
  const { data: collections, isLoading } = useCollections();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12">
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="heading-display text-4xl sm:text-5xl text-foreground text-glow-amber mb-3">
          Collections
        </h1>
        <p className="text-muted-foreground font-body text-sm sm:text-base max-w-md">
          Curated series of light art works grouped by theme and technique.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((key) => (
            <div
              key={key}
              className="bg-card rounded overflow-hidden shadow-card"
            >
              <Skeleton className="aspect-video w-full bg-secondary" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-2/3 bg-secondary" />
                <Skeleton className="h-3 w-full bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      ) : !collections || collections.length === 0 ? (
        <motion.div
          className="flex flex-col items-center gap-4 py-24 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          data-ocid="collections.empty_state"
        >
          <Layers className="w-10 h-10 text-accent opacity-60 animate-pulse-glow" />
          <h2 className="heading-serif text-xl text-foreground">
            No collections yet
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Collections will appear here once the artist creates them.
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {collections.map((collection, i) => (
            <motion.div
              key={collection.id}
              variants={itemVariants}
              data-ocid={`collections.item.${i + 1}`}
            >
              <Link
                to="/collection/$id"
                params={{ id: collection.id }}
                className="group block bg-card rounded overflow-hidden shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-video overflow-hidden bg-muted/20 relative">
                  {collection.coverImageId ? (
                    <img
                      src={collection.coverImageId.getDirectURL()}
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted/50">
                      <Layers className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="heading-serif text-lg text-foreground group-hover:text-accent transition-colors line-clamp-1">
                      {collection.name}
                    </h2>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </div>
                  {collection.description && (
                    <p className="text-muted-foreground text-xs mt-1.5 line-clamp-2 font-body">
                      {collection.description}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
