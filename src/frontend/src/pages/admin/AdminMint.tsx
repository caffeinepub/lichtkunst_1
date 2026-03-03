import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../../backend";
import {
  useBurnNFT,
  useCollections,
  useMintNFT,
  useNFTs,
} from "../../hooks/useQueries";
import { AdminLayout } from "./AdminLayout";

interface MintForm {
  title: string;
  description: string;
  edition: string;
  collectionId: string;
  imageFile: File | null;
  imagePreview: string | null;
  uploadProgress: number;
}

const emptyForm: MintForm = {
  title: "",
  description: "",
  edition: "",
  collectionId: "",
  imageFile: null,
  imagePreview: null,
  uploadProgress: 0,
};

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

export function AdminMint() {
  const { data: nfts, isLoading: nftsLoading } = useNFTs();
  const { data: collections } = useCollections();
  const mintMutation = useMintNFT();
  const burnMutation = useBurnNFT();

  const [showForm, setShowForm] = useState(true);
  const [form, setForm] = useState<MintForm>(emptyForm);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  }

  async function handleMint(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.imageFile) {
      toast.error("Image is required");
      return;
    }
    if (!form.collectionId) {
      toast.error("Please select a collection");
      return;
    }

    try {
      const bytes = await readFileAsUint8Array(form.imageFile);
      const imageId = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
        setForm((prev) => ({ ...prev, uploadProgress: pct })),
      );

      await mintMutation.mutateAsync({
        id: crypto.randomUUID(),
        title: form.title,
        description: form.description,
        imageId,
        collectionId: form.collectionId,
        edition: form.edition,
      });

      toast.success("NFT minted successfully!");
      setForm(emptyForm);
    } catch (err) {
      toast.error("Failed to mint NFT");
      console.error(err);
    }
  }

  async function handleBurn(id: string, title: string) {
    try {
      await burnMutation.mutateAsync(id);
      toast.success(`"${title}" has been burned`);
    } catch {
      toast.error("Failed to burn NFT");
    }
  }

  const collectionName = (id: string) =>
    collections?.find((c) => c.id === id)?.name ?? "—";

  return (
    <AdminLayout title="Mint NFT" description="Upload and mint new NFTs">
      {/* Mint form toggle */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="heading-serif text-base text-muted-foreground">
          New NFT
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowForm((v) => !v)}
          className="text-muted-foreground hover:text-foreground"
          data-ocid="admin.mint_button"
        >
          {showForm ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Mint form */}
      <AnimatePresence initial={false}>
        {showForm && (
          <motion.div
            className="bg-card border border-border/60 rounded p-6 mb-10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <form onSubmit={handleMint} className="space-y-4">
              {/* Image upload */}
              <div className="space-y-2">
                <Label>Image *</Label>
                <button
                  type="button"
                  className="w-full border-2 border-dashed border-border/50 rounded p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-accent/50 transition-colors bg-transparent"
                  onClick={() => fileRef.current?.click()}
                  data-ocid="admin.nft.image_upload_button"
                >
                  {form.imagePreview ? (
                    <img
                      src={form.imagePreview}
                      alt="Preview"
                      className="w-full max-h-48 object-contain rounded"
                    />
                  ) : (
                    <>
                      <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload image
                      </p>
                    </>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border/70 rounded hover:border-accent/60 hover:text-accent transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    {form.imageFile ? "Change Image" : "Choose Image"}
                  </span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nft-title">Title *</Label>
                  <Input
                    id="nft-title"
                    value={form.title}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="Light Painting No. 42"
                    required
                    data-ocid="admin.nft.title_input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nft-edition">Edition</Label>
                  <Input
                    id="nft-edition"
                    value={form.edition}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, edition: e.target.value }))
                    }
                    placeholder="1/10"
                    data-ocid="admin.nft.edition_input"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nft-desc">Description</Label>
                <Textarea
                  id="nft-desc"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="A long-exposure light painting captured at dusk..."
                  rows={3}
                  data-ocid="admin.nft.description_input"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Collection *</Label>
                <Select
                  value={form.collectionId}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, collectionId: v }))
                  }
                >
                  <SelectTrigger
                    className="border-border/70"
                    data-ocid="admin.nft.collection_select"
                  >
                    <SelectValue placeholder="Select a collection" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {!collections || collections.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No collections — create one first
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

              {mintMutation.isPending && form.uploadProgress > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Uploading... {Math.round(form.uploadProgress)}%
                  </p>
                  <Progress value={form.uploadProgress} className="h-1.5" />
                </div>
              )}

              <Button
                type="submit"
                disabled={mintMutation.isPending}
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow-sm"
                data-ocid="admin.nft.submit_button"
              >
                {mintMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {mintMutation.isPending ? "Minting..." : "Mint NFT"}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NFT list */}
      <div>
        <h2 className="heading-serif text-base text-muted-foreground mb-4">
          Minted NFTs ({nfts?.length ?? 0})
        </h2>

        {nftsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => `skeleton-${i}`).map((key) => (
              <Skeleton key={key} className="h-20 bg-secondary rounded" />
            ))}
          </div>
        ) : !nfts || nfts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Sparkles className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">No NFTs minted yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {nfts.map((nft, i) => (
              <motion.div
                key={nft.id}
                className="bg-card border border-border/40 rounded p-4 flex items-center gap-4"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                data-ocid={`gallery.item.${i + 1}`}
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded overflow-hidden bg-muted/20 shrink-0">
                  <img
                    src={nft.imageId.getDirectURL()}
                    alt={nft.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-sm text-foreground truncate">
                    {nft.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground truncate">
                      {collectionName(nft.collectionId)}
                    </span>
                    {nft.edition && (
                      <Badge
                        variant="outline"
                        className="text-[0.6rem] border-accent/30 text-accent px-1.5 py-0"
                      >
                        {nft.edition}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Burn */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-destructive shrink-0"
                      data-ocid={`admin.nft.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent
                    className="bg-card border-border"
                    data-ocid="admin.nft.dialog"
                  >
                    <AlertDialogHeader>
                      <AlertDialogTitle className="heading-serif">
                        Burn NFT?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        This will permanently destroy "{nft.title}". This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        className="border-border/70"
                        data-ocid="admin.nft.cancel_button"
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleBurn(nft.id, nft.title)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-ocid="admin.nft.confirm_button"
                      >
                        Burn
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
