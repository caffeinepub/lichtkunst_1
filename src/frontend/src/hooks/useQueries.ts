import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import type { Collection, ExternalBlob, NFT } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// ─── Collections ──────────────────────────────────────────────

export function useCollections() {
  const { actor, isFetching } = useActor();
  return useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCollections();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCollection(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Collection>({
    queryKey: ["collection", id],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getCollectionById(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

// ─── NFTs ──────────────────────────────────────────────────────

export function useNFTs() {
  const { actor, isFetching } = useActor();
  return useQuery<NFT[]>({
    queryKey: ["nfts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllNFTs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useNFT(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<NFT>({
    queryKey: ["nft", id],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getNFTById(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useNFTsByCollection(collectionId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<NFT[]>({
    queryKey: ["nfts", "collection", collectionId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNFTsByCollection(collectionId);
    },
    enabled: !!actor && !isFetching && !!collectionId,
  });
}

// ─── Admin check ───────────────────────────────────────────────

// Accept both the live principal and the draft principal so admin works on both environments
const ADMIN_PRINCIPALS = new Set([
  "uorkh-nazas-r5n3p-kj44w-gwm4i-liaj3-jqjll-ws44w-7dlve-3mshw-sae",
  "kcznz-vfjcj-xmtzc-aw23m-th6f7-43fd3-ytu3i-ot3ig-nuwnj-oba6h-fqe",
  "d5t6k-adjdl-ak3tk-xi2mp-lpwl2-wx2mt-35n2k-xy7nd-l5kbv-cyb6v-mqe",
]);

export function useIsAdmin() {
  const { identity, loginStatus } = useInternetIdentity();

  // Persist the last known admin decision so that transient status
  // bounces never flip a confirmed admin back to "denied".
  const lastKnownAdmin = useRef<boolean | null>(null);
  // Track whether we've ever completed initialization at least once.
  const hasInitialized = useRef<boolean>(false);

  if (loginStatus !== "initializing" && loginStatus !== "logging-in") {
    hasInitialized.current = true;
  }

  const principalStr = identity?.getPrincipal().toString() ?? null;
  const isRealIdentity = !!principalStr && principalStr !== "2vxsx-fae";

  if (isRealIdentity) {
    // Compute and cache the decision while we have a real identity.
    lastKnownAdmin.current = ADMIN_PRINCIPALS.has(principalStr);
    return {
      data: lastKnownAdmin.current,
      isLoading: false,
    };
  }

  // No real identity right now.
  // If we previously confirmed admin access, keep it — don't revoke on transient bounces.
  if (lastKnownAdmin.current === true) {
    return { data: true, isLoading: false };
  }

  // Still loading if auth system hasn't settled yet.
  const isStillLoading =
    loginStatus === "initializing" ||
    loginStatus === "logging-in" ||
    !hasInitialized.current;

  return {
    data: false,
    isLoading: isStillLoading,
  };
}

// ─── Mutations ─────────────────────────────────────────────────

export function useCreateCollection() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
      coverImageId,
    }: {
      id: string;
      name: string;
      description: string;
      coverImageId: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createCollection(id, name, description, coverImageId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useUpdateCollection() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
      coverImageId,
    }: {
      id: string;
      name: string;
      description: string;
      coverImageId: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateCollection(id, name, description, coverImageId);
    },
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: ["collections"] });
      void qc.invalidateQueries({ queryKey: ["collection", id] });
    },
  });
}

export function useDeleteCollection() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteCollection(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useMintNFT() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      imageId,
      collectionId,
      edition,
    }: {
      id: string;
      title: string;
      description: string;
      imageId: ExternalBlob;
      collectionId: string;
      edition: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.mintNFT(
        id,
        title,
        description,
        imageId,
        collectionId,
        edition,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["nfts"] });
    },
  });
}

export function useUpdateNFT() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      imageId,
      edition,
    }: {
      id: string;
      title: string;
      description: string;
      imageId: ExternalBlob;
      edition: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateNFT(id, title, description, imageId, edition);
    },
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: ["nfts"] });
      void qc.invalidateQueries({ queryKey: ["nft", id] });
    },
  });
}

export function useBurnNFT() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.burnNFT(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["nfts"] });
    },
  });
}

// ─── NFT Owner / Transfer ──────────────────────────────────────

export function useNFTOwner(nftId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ["nftOwner", nftId],
    queryFn: async () => {
      if (!actor) return null;
      // Cast to any since getNFTOwner is a new backend function not yet in generated types
      const result = (await (actor as any).getNFTOwner(nftId)) as string[];
      // Motoko optional returns [] or [value]
      return result.length > 0 ? result[0] : null;
    },
    enabled: !!actor && !isFetching && !!nftId,
  });
}

export function useTransferNFT() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      nftId,
      toOwner,
    }: { nftId: string; toOwner: string }) => {
      if (!actor) throw new Error("Not authenticated");
      // Cast to any since transferNFT is a new backend function not yet in generated types
      return (actor as any).transferNFT(nftId, toOwner);
    },
    onSuccess: (
      _data: unknown,
      { nftId }: { nftId: string; toOwner: string },
    ) => {
      void qc.invalidateQueries({ queryKey: ["nftOwner", nftId] });
    },
  });
}
