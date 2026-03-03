import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import type { Collection, NFT } from "../backend";

interface NFTCardProps {
  nft: NFT;
  collection?: Collection;
  ocid?: string;
}

export function NFTCard({ nft, collection, ocid }: NFTCardProps) {
  return (
    <Link to="/nft/$id" params={{ id: nft.id }} data-ocid={ocid}>
      <article className="nft-card bg-card rounded cursor-pointer shadow-card group">
        <div className="aspect-square overflow-hidden bg-muted/20">
          <img
            src={nft.imageId.getDirectURL()}
            alt={nft.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10 p-3 pt-8">
          <h3 className="font-body font-semibold text-sm text-foreground line-clamp-1 leading-snug">
            {nft.title}
          </h3>
          <div className="flex items-center justify-between mt-1 gap-2">
            {collection && (
              <span className="text-xs text-muted-foreground truncate">
                {collection.name}
              </span>
            )}
            {nft.edition && (
              <Badge
                variant="outline"
                className="text-[0.6rem] border-accent/40 text-accent shrink-0 px-1.5 py-0"
              >
                {nft.edition}
              </Badge>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
