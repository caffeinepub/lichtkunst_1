import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ImageIcon,
  Layers,
  Loader2,
  Mail,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../../backend";
import {
  useCollections,
  useCreateCollection,
  useDeleteSubscriber,
  useMintNFT,
  useNFTs,
  useSubscribers,
} from "../../hooks/useQueries";
import { AdminLayout } from "./AdminLayout";

// ─── Helpers ───────────────────────────────────────────────────

async function readFileAsUint8Array(
  file: File,
): Promise<Uint8Array<ArrayBuffer>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(
        new Uint8Array(reader.result as ArrayBuffer) as Uint8Array<ArrayBuffer>,
      );
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ─── Collection form state ─────────────────────────────────────

interface CollectionForm {
  name: string;
  description: string;
  imageFile: File | null;
  imagePreview: string | null;
  uploadProgress: number;
}

const emptyCollectionForm: CollectionForm = {
  name: "",
  description: "",
  imageFile: null,
  imagePreview: null,
  uploadProgress: 0,
};

// ─── Mint form state ───────────────────────────────────────────

interface MintForm {
  title: string;
  description: string;
  edition: string;
  collectionId: string;
  imageFile: File | null;
  imagePreview: string | null;
  uploadProgress: number;
}

const emptyMintForm: MintForm = {
  title: "",
  description: "",
  edition: "",
  collectionId: "",
  imageFile: null,
  imagePreview: null,
  uploadProgress: 0,
};

// ─── Component ─────────────────────────────────────────────────

export function AdminDashboard() {
  const { data: nfts, isLoading: nftsLoading } = useNFTs();
  const { data: collections, isLoading: collectionsLoading } = useCollections();
  const { data: subscribers, isLoading: subscribersLoading } = useSubscribers();
  const createCollectionMutation = useCreateCollection();
  const mintNFTMutation = useMintNFT();
  const deleteSubscriberMutation = useDeleteSubscriber();

  // Dialog states
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [mintDialogOpen, setMintDialogOpen] = useState(false);

  // Form states
  const [collectionForm, setCollectionForm] =
    useState<CollectionForm>(emptyCollectionForm);
  const [mintForm, setMintForm] = useState<MintForm>(emptyMintForm);

  // File refs
  const coverFileRef = useRef<HTMLInputElement>(null);
  const nftFileRef = useRef<HTMLInputElement>(null);

  // ── Collection form handlers ──

  function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCollectionForm((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  }

  async function handleCreateCollection(e: React.FormEvent) {
    e.preventDefault();
    if (!collectionForm.name.trim()) {
      toast.error("Kollektionsname ist erforderlich");
      return;
    }

    try {
      let coverImageId: ExternalBlob | null = null;
      if (collectionForm.imageFile) {
        const bytes = await readFileAsUint8Array(collectionForm.imageFile);
        coverImageId = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setCollectionForm((prev) => ({ ...prev, uploadProgress: pct })),
        );
      }

      await createCollectionMutation.mutateAsync({
        id: crypto.randomUUID(),
        name: collectionForm.name,
        description: collectionForm.description,
        coverImageId,
      });

      toast.success("Kollektion erfolgreich erstellt!");
      setCollectionDialogOpen(false);
      setCollectionForm(emptyCollectionForm);
    } catch (err) {
      toast.error("Fehler beim Erstellen der Kollektion");
      console.error(err);
    }
  }

  // ── NFT mint form handlers ──

  function handleNFTFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMintForm((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  }

  async function handleMintNFT(e: React.FormEvent) {
    e.preventDefault();
    if (!mintForm.title.trim()) {
      toast.error("Titel ist erforderlich");
      return;
    }
    if (!mintForm.imageFile) {
      toast.error("Bild ist erforderlich");
      return;
    }
    if (!mintForm.collectionId) {
      toast.error("Bitte wähle eine Kollektion aus");
      return;
    }

    try {
      const bytes = await readFileAsUint8Array(mintForm.imageFile);
      const imageId = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
        setMintForm((prev) => ({ ...prev, uploadProgress: pct })),
      );

      await mintNFTMutation.mutateAsync({
        id: crypto.randomUUID(),
        title: mintForm.title,
        description: mintForm.description,
        imageId,
        collectionId: mintForm.collectionId,
        edition: mintForm.edition,
      });

      toast.success("NFT erfolgreich geminted!");
      setMintDialogOpen(false);
      setMintForm(emptyMintForm);
    } catch (err) {
      toast.error("Fehler beim Minten des NFTs");
      console.error(err);
    }
  }

  async function handleDeleteSubscriber(email: string) {
    try {
      await deleteSubscriberMutation.mutateAsync(email);
      toast.success("Abonnent entfernt");
    } catch {
      toast.error("Fehler beim Entfernen");
    }
  }

  return (
    <AdminLayout title="Admin" description="Manage your NFT gallery">
      {/* Stats */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-card rounded p-6 shadow-card border border-border/40">
          <div className="flex items-center justify-between mb-4">
            <Layers className="w-5 h-5 text-accent" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Collections
            </span>
          </div>
          {collectionsLoading ? (
            <Skeleton className="h-10 w-16 bg-secondary" />
          ) : (
            <p className="heading-display text-5xl text-foreground text-glow-amber">
              {collections?.length ?? 0}
            </p>
          )}
        </div>

        <div className="bg-card rounded p-6 shadow-card border border-border/40">
          <div className="flex items-center justify-between mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              NFTs Minted
            </span>
          </div>
          {nftsLoading ? (
            <Skeleton className="h-10 w-16 bg-secondary" />
          ) : (
            <p className="heading-display text-5xl text-foreground text-glow-amber">
              {nfts?.length ?? 0}
            </p>
          )}
        </div>

        <div className="bg-card rounded p-6 shadow-card border border-border/40">
          <div className="flex items-center justify-between mb-4">
            <Mail className="w-5 h-5 text-accent" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Abonnenten
            </span>
          </div>
          {subscribersLoading ? (
            <Skeleton className="h-10 w-16 bg-secondary" />
          ) : (
            <p className="heading-display text-5xl text-foreground text-glow-amber">
              {subscribers?.length ?? 0}
            </p>
          )}
        </div>
      </motion.div>

      {/* Primary quick-action buttons */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        {/* Kollektion erstellen */}
        <button
          type="button"
          onClick={() => {
            setCollectionForm(emptyCollectionForm);
            setCollectionDialogOpen(true);
          }}
          className="group relative flex flex-col items-start gap-3 rounded border border-border/50 bg-card p-6 text-left transition-all hover:border-accent/50 hover:shadow-glow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          data-ocid="admin.create_collection_button"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
          </div>
          <div>
            <p className="heading-serif text-base text-foreground mb-0.5">
              Kollektion erstellen
            </p>
            <p className="text-xs text-muted-foreground">
              Neue NFT-Sammlung anlegen
            </p>
          </div>
        </button>

        {/* NFT minten */}
        <button
          type="button"
          onClick={() => {
            setMintForm(emptyMintForm);
            setMintDialogOpen(true);
          }}
          className="group relative flex flex-col items-start gap-3 rounded border border-accent/30 bg-accent/5 p-6 text-left transition-all hover:border-accent/70 hover:bg-accent/10 hover:shadow-glow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          data-ocid="admin.mint_nft_button"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-accent/20 text-accent group-hover:bg-accent/30 transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-accent/50 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
          </div>
          <div>
            <p className="heading-serif text-base text-foreground mb-0.5">
              NFT minten
            </p>
            <p className="text-xs text-muted-foreground">
              Bild als NFT auf ICP prägen
            </p>
          </div>
        </button>
      </motion.div>

      {/* Secondary navigation buttons */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Button
          asChild
          variant="outline"
          className="border-border/70 hover:border-accent/60 hover:text-accent"
          data-ocid="admin.collections_list"
        >
          <Link to="/admin/collections">
            <Layers className="w-4 h-4 mr-2" />
            Kollektionen verwalten
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-border/70 hover:border-accent/60 hover:text-accent"
          data-ocid="admin.mint_button"
        >
          <Link to="/admin/mint">
            <Sparkles className="w-4 h-4 mr-2" />
            NFTs verwalten
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Link>
        </Button>
      </motion.div>

      {/* Subscribers List */}
      <motion.section
        className="mt-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <div className="bg-card rounded border border-border/40 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4 text-accent" />
            <h2 className="heading-serif text-base text-foreground">
              Newsletter-Abonnenten
            </h2>
            {!subscribersLoading && (
              <span className="ml-auto text-xs text-muted-foreground">
                {subscribers?.length ?? 0} Einträge
              </span>
            )}
          </div>

          {subscribersLoading ? (
            <div
              className="space-y-2"
              data-ocid="admin.subscribers.loading_state"
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-9 w-full bg-secondary" />
              ))}
            </div>
          ) : !subscribers || subscribers.length === 0 ? (
            <div
              className="py-10 text-center text-muted-foreground text-sm"
              data-ocid="admin.subscribers.empty_state"
            >
              Noch keine Abonnenten.
            </div>
          ) : (
            <ul
              className="divide-y divide-border/30"
              data-ocid="admin.subscribers.list"
            >
              {subscribers.map((email, i) => (
                <li
                  key={email}
                  className="flex items-center justify-between py-2.5 gap-3"
                  data-ocid={`admin.subscribers.item.${i + 1}`}
                >
                  <span className="text-sm text-foreground truncate">
                    {email}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubscriber(email)}
                    disabled={deleteSubscriberMutation.isPending}
                    className="shrink-0 p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                    aria-label={`Abonnent ${email} entfernen`}
                    data-ocid={`admin.subscribers.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.section>

      {/* ── Dialog: Kollektion erstellen ── */}
      <Dialog
        open={collectionDialogOpen}
        onOpenChange={(open) => {
          if (!open) setCollectionForm(emptyCollectionForm);
          setCollectionDialogOpen(open);
        }}
      >
        <DialogContent
          className="bg-card border-border max-w-md"
          data-ocid="admin.collection.dialog"
        >
          <DialogHeader>
            <DialogTitle className="heading-serif text-lg">
              Kollektion erstellen
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateCollection} className="space-y-4 pt-1">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="dash-col-name">Name *</Label>
              <Input
                id="dash-col-name"
                value={collectionForm.name}
                onChange={(e) =>
                  setCollectionForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="z.B. Lichtmalerei 2024"
                required
                data-ocid="admin.collection.name_input"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="dash-col-desc">Beschreibung</Label>
              <Textarea
                id="dash-col-desc"
                value={collectionForm.description}
                onChange={(e) =>
                  setCollectionForm((p) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
                placeholder="Beschreibe diese Kollektion..."
                rows={3}
                data-ocid="admin.collection.description_input"
              />
            </div>

            {/* Cover image */}
            <div className="space-y-2">
              <Label>Coverbild (optional)</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => coverFileRef.current?.click()}
                  className="border-border/70 hover:border-accent/60 hover:text-accent"
                  data-ocid="admin.collection.cover_upload_button"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Bild auswählen
                </Button>
                {collectionForm.imageFile && (
                  <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                    {collectionForm.imageFile.name}
                  </span>
                )}
              </div>
              <input
                ref={coverFileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleCoverFileChange}
              />
              {collectionForm.imagePreview && (
                <img
                  src={collectionForm.imagePreview}
                  alt="Vorschau"
                  className="w-40 h-24 object-cover rounded mt-2 border border-border/40"
                />
              )}
            </div>

            {/* Upload progress */}
            {createCollectionMutation.isPending &&
              collectionForm.uploadProgress > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Hochladen... {Math.round(collectionForm.uploadProgress)}%
                  </p>
                  <Progress
                    value={collectionForm.uploadProgress}
                    className="h-1.5"
                  />
                </div>
              )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setCollectionDialogOpen(false);
                  setCollectionForm(emptyCollectionForm);
                }}
                data-ocid="admin.collection.cancel_button"
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={createCollectionMutation.isPending}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                data-ocid="admin.collection.submit_button"
              >
                {createCollectionMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {createCollectionMutation.isPending
                  ? "Erstelle..."
                  : "Kollektion erstellen"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: NFT minten ── */}
      <Dialog
        open={mintDialogOpen}
        onOpenChange={(open) => {
          if (!open) setMintForm(emptyMintForm);
          setMintDialogOpen(open);
        }}
      >
        <DialogContent
          className="bg-card border-border max-w-lg"
          data-ocid="admin.nft.dialog"
        >
          <DialogHeader>
            <DialogTitle className="heading-serif text-lg">
              NFT minten
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleMintNFT} className="space-y-4 pt-1">
            {/* Image upload area */}
            <div className="space-y-2">
              <Label>Bild *</Label>
              <button
                type="button"
                className="w-full border-2 border-dashed border-border/50 rounded p-5 flex flex-col items-center gap-3 cursor-pointer hover:border-accent/50 transition-colors bg-transparent"
                onClick={() => nftFileRef.current?.click()}
                data-ocid="admin.nft.image_upload_button"
              >
                {mintForm.imagePreview ? (
                  <img
                    src={mintForm.imagePreview}
                    alt="Vorschau"
                    className="w-full max-h-40 object-contain rounded"
                  />
                ) : (
                  <>
                    <ImageIcon className="w-9 h-9 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      Klicken zum Hochladen
                    </p>
                  </>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border/70 rounded hover:border-accent/60 hover:text-accent transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  {mintForm.imageFile ? "Bild ändern" : "Bild auswählen"}
                </span>
              </button>
              <input
                ref={nftFileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleNFTFileChange}
              />
            </div>

            {/* Title + Edition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dash-nft-title">Titel *</Label>
                <Input
                  id="dash-nft-title"
                  value={mintForm.title}
                  onChange={(e) =>
                    setMintForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="Lichtmalerei Nr. 42"
                  required
                  data-ocid="admin.nft.title_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dash-nft-edition">Edition</Label>
                <Input
                  id="dash-nft-edition"
                  value={mintForm.edition}
                  onChange={(e) =>
                    setMintForm((p) => ({ ...p, edition: e.target.value }))
                  }
                  placeholder="1/10"
                  data-ocid="admin.nft.edition_input"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="dash-nft-desc">Beschreibung</Label>
              <Textarea
                id="dash-nft-desc"
                value={mintForm.description}
                onChange={(e) =>
                  setMintForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Eine Langzeitbelichtung bei Abenddämmerung..."
                rows={2}
                data-ocid="admin.nft.description_input"
              />
            </div>

            {/* Collection selector */}
            <div className="space-y-1.5">
              <Label>Kollektion *</Label>
              <Select
                value={mintForm.collectionId}
                onValueChange={(v) =>
                  setMintForm((p) => ({ ...p, collectionId: v }))
                }
              >
                <SelectTrigger
                  className="border-border/70"
                  data-ocid="admin.nft.collection_select"
                >
                  <SelectValue placeholder="Kollektion auswählen" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {!collections || collections.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Keine Kollektionen — erst eine erstellen
                    </SelectItem>
                  ) : (
                    collections.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Upload progress */}
            {mintNFTMutation.isPending && mintForm.uploadProgress > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Hochladen... {Math.round(mintForm.uploadProgress)}%
                </p>
                <Progress value={mintForm.uploadProgress} className="h-1.5" />
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setMintDialogOpen(false);
                  setMintForm(emptyMintForm);
                }}
                data-ocid="admin.nft.cancel_button"
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={mintNFTMutation.isPending}
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow-sm"
                data-ocid="admin.nft.submit_button"
              >
                {mintNFTMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {mintNFTMutation.isPending ? "Minting..." : "NFT minten"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
