import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Hash,
  Layers,
  Loader2,
  Send,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCollection,
  useIsAdmin,
  useNFT,
  useNFTOwner,
  useTransferNFT,
} from "../hooks/useQueries";

function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / BigInt(1_000_000));
  return new Intl.DateTimeFormat("de-AT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(ms));
}

function truncatePrincipal(principal: string): string {
  if (principal.length <= 20) return principal;
  return `${principal.slice(0, 10)}...${principal.slice(-8)}`;
}

export function NFTDetailPage() {
  const { id } = useParams({ from: "/nft/$id" });
  const { data: nft, isLoading } = useNFT(id);
  const { data: collection } = useCollection(nft?.collectionId ?? "");
  const { data: isAdmin } = useIsAdmin();
  const { data: owner } = useNFTOwner(id);
  const transferMutation = useTransferNFT();
  const [recipientInput, setRecipientInput] = useState("");

  const handleTransfer = async () => {
    const toOwner = recipientInput.trim();
    if (!toOwner) return;
    try {
      await transferMutation.mutateAsync({ nftId: id, toOwner });
      toast.success("NFT erfolgreich übertragen!");
      setRecipientInput("");
    } catch {
      toast.error("Fehler beim Übertragen");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <Skeleton className="h-4 w-24 bg-secondary mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Skeleton className="aspect-square w-full bg-secondary rounded" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 bg-secondary" />
            <Skeleton className="h-4 w-full bg-secondary" />
            <Skeleton className="h-4 w-2/3 bg-secondary" />
          </div>
        </div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="container mx-auto px-4 py-24 text-center text-muted-foreground">
        NFT not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors mb-8"
        data-ocid="nav.gallery_link"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Gallery
      </Link>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        data-ocid="nft.detail_panel"
      >
        {/* Image */}
        <motion.div
          className="relative rounded overflow-hidden bg-muted/10 shadow-card glow-amber"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <img
            src={nft.imageId.getDirectURL()}
            alt={nft.title}
            className="w-full h-auto object-contain max-h-[70vh]"
          />
        </motion.div>

        {/* Details */}
        <motion.div
          className="flex flex-col gap-6 py-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <div>
            <h1 className="heading-display text-3xl sm:text-4xl text-foreground text-glow-amber mb-3 leading-tight">
              {nft.title}
            </h1>
            {nft.edition && (
              <Badge
                variant="outline"
                className="border-accent/50 text-accent text-xs"
              >
                Edition {nft.edition}
              </Badge>
            )}
          </div>

          {nft.description && (
            <p className="font-body text-muted-foreground text-sm sm:text-base leading-relaxed">
              {nft.description}
            </p>
          )}

          <div className="space-y-3 pt-2 border-t border-border/40">
            {collection && (
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-accent shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Collection
                  </p>
                  <Link
                    to="/collection/$id"
                    params={{ id: collection.id }}
                    className="text-sm text-foreground hover:text-accent transition-colors"
                    data-ocid="nav.collections_link"
                  >
                    {collection.name}
                  </Link>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-accent shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Minted
                </p>
                <p className="text-sm text-foreground">
                  {formatDate(nft.mintedAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Hash className="w-4 h-4 text-accent shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Token ID
                </p>
                <p className="text-xs text-muted-foreground font-mono break-all">
                  {nft.id}
                </p>
              </div>
            </div>
          </div>

          {/* Admin: NFT Transfer Section */}
          {isAdmin && (
            <div className="pt-4 border-t border-border/40 space-y-4">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-accent shrink-0" />
                <h3 className="text-sm font-medium text-foreground tracking-wide uppercase">
                  NFT übertragen
                </h3>
              </div>

              {/* Current Owner */}
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Aktueller Besitzer
                  </p>
                  {owner ? (
                    <p
                      className="text-xs font-mono text-foreground/80 break-all"
                      title={owner}
                    >
                      {truncatePrincipal(owner)}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Galerie (kein Besitzer)
                    </p>
                  )}
                </div>
              </div>

              {/* Transfer Input + Button */}
              <div className="flex gap-2">
                <Input
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  placeholder="Empfänger Principal ID"
                  className="text-sm font-mono flex-1"
                  data-ocid="nft.transfer_input"
                  disabled={transferMutation.isPending}
                />
                <Button
                  onClick={handleTransfer}
                  disabled={
                    !recipientInput.trim() || transferMutation.isPending
                  }
                  size="sm"
                  className="shrink-0"
                  data-ocid="nft.transfer_button"
                >
                  {transferMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span className="ml-1.5">Übertragen</span>
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
