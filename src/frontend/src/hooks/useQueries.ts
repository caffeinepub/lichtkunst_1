import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

const ADMIN_PRINCIPAL =
  "uorkh-nazas-r5n3p-kj44w-gwm4i-liaj3-jqjll-ws44w-7dlve-3mshw-sae";

export function useIsAdmin() {
  const { identity, loginStatus } = useInternetIdentity();

  const principalStr = identity?.getPrincipal().toString() ?? null;

  // If we already have a non-anonymous identity, we can decide immediately.
  // This avoids the "initializing" bounce that occurs when authClient state
  // changes cause the effect in useInternetIdentity to re-run.
  const hasIdentity = !!principalStr && principalStr !== "2vxsx-fae";

  if (hasIdentity) {
    return {
      data: principalStr === ADMIN_PRINCIPAL,
      isLoading: false,
    };
  }

  // No identity yet — wait until loginStatus has settled before deciding.
  // "initializing" = loading from storage; "logging-in" = popup open.
  const isSettled =
    loginStatus !== "initializing" && loginStatus !== "logging-in";

  return {
    data: false,
    isLoading: !isSettled,
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
