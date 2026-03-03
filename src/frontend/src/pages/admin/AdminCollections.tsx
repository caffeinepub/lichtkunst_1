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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  ImageIcon,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../../backend";
import type { Collection } from "../../backend";
import {
  useCollections,
  useCreateCollection,
  useDeleteCollection,
  useUpdateCollection,
} from "../../hooks/useQueries";
import { AdminLayout } from "./AdminLayout";

interface CollectionForm {
  name: string;
  description: string;
  imageFile: File | null;
  imagePreview: string | null;
  uploadProgress: number;
}

const emptyForm: CollectionForm = {
  name: "",
  description: "",
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

export function AdminCollections() {
  const { data: collections, isLoading } = useCollections();
  const createMutation = useCreateCollection();
  const updateMutation = useUpdateCollection();
  const deleteMutation = useDeleteCollection();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editCollection, setEditCollection] = useState<Collection | null>(null);
  const [form, setForm] = useState<CollectionForm>(emptyForm);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Collection name is required");
      return;
    }

    try {
      let coverImageId: ExternalBlob | null = null;
      if (form.imageFile) {
        const bytes = await readFileAsUint8Array(form.imageFile);
        coverImageId = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setForm((prev) => ({ ...prev, uploadProgress: pct })),
        );
      }

      if (editCollection) {
        await updateMutation.mutateAsync({
          id: editCollection.id,
          name: form.name,
          description: form.description,
          coverImageId,
        });
        toast.success("Collection updated");
        setEditCollection(null);
      } else {
        await createMutation.mutateAsync({
          id: crypto.randomUUID(),
          name: form.name,
          description: form.description,
          coverImageId,
        });
        toast.success("Collection created");
        setShowCreateForm(false);
      }
      setForm(emptyForm);
    } catch (err) {
      toast.error("Failed to save collection");
      console.error(err);
    }
  }

  function openEdit(collection: Collection) {
    setEditCollection(collection);
    setForm({
      name: collection.name,
      description: collection.description,
      imageFile: null,
      imagePreview: collection.coverImageId?.getDirectURL() ?? null,
      uploadProgress: 0,
    });
  }

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Collection deleted");
    } catch {
      toast.error("Failed to delete collection");
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout
      title="Collections"
      description="Create and manage NFT collections"
    >
      {/* Create button */}
      <div className="flex justify-end mb-6">
        <Button
          onClick={() => {
            setShowCreateForm(true);
            setForm(emptyForm);
          }}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
          data-ocid="admin.create_collection_button"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Collection
        </Button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            className="bg-card border border-border/60 rounded p-6 mb-8"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h2 className="heading-serif text-lg text-foreground mb-5">
              New Collection
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="col-name">Name *</Label>
                <Input
                  id="col-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Collection name"
                  required
                  data-ocid="admin.collection.name_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="col-desc">Description</Label>
                <Textarea
                  id="col-desc"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Describe this collection..."
                  rows={3}
                  data-ocid="admin.collection.description_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Cover Image</Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                    className="border-border/70 hover:border-accent/60 hover:text-accent"
                    data-ocid="admin.collection.cover_upload_button"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Choose Image
                  </Button>
                  {form.imageFile && (
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {form.imageFile.name}
                    </span>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </div>
                {form.imagePreview && (
                  <img
                    src={form.imagePreview}
                    alt="Preview"
                    className="w-40 h-24 object-cover rounded mt-2 border border-border/40"
                  />
                )}
              </div>
              {isPending && form.uploadProgress > 0 && (
                <Progress value={form.uploadProgress} className="h-1" />
              )}
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  data-ocid="admin.collection.submit_button"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {isPending ? "Creating..." : "Create Collection"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowCreateForm(false);
                    setForm(emptyForm);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collections list */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="admin.collections_list">
          {Array.from({ length: 3 }, (_, i) => `skeleton-${i}`).map((key) => (
            <Skeleton key={key} className="h-20 bg-secondary rounded" />
          ))}
        </div>
      ) : !collections || collections.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 py-16 text-center"
          data-ocid="admin.collections_list"
        >
          <Layers className="w-8 h-8 text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm">
            No collections yet. Create one to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="admin.collections_list">
          {collections.map((collection, i) => (
            <motion.div
              key={collection.id}
              className="bg-card border border-border/40 rounded p-4 flex items-start gap-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              data-ocid={`collections.item.${i + 1}`}
            >
              {/* Cover */}
              <div className="w-14 h-14 rounded overflow-hidden bg-muted/20 shrink-0">
                {collection.coverImageId ? (
                  <img
                    src={collection.coverImageId.getDirectURL()}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-body font-semibold text-foreground truncate">
                  {collection.name}
                </h3>
                {collection.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {collection.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(collection)}
                  className="h-8 w-8 hover:text-accent"
                  data-ocid="admin.collection.edit_button"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-destructive"
                      data-ocid={`admin.collection.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent
                    className="bg-card border-border"
                    data-ocid="admin.collection.dialog"
                  >
                    <AlertDialogHeader>
                      <AlertDialogTitle className="heading-serif">
                        Delete Collection?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        This will permanently delete "{collection.name}". This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        className="border-border/70"
                        data-ocid="admin.collection.cancel_button"
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(collection.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-ocid="admin.collection.confirm_button"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog
        open={!!editCollection}
        onOpenChange={(open) => {
          if (!open) {
            setEditCollection(null);
            setForm(emptyForm);
          }
        }}
      >
        <DialogContent
          className="bg-card border-border"
          data-ocid="admin.collection.dialog"
        >
          <DialogHeader>
            <DialogTitle className="heading-serif">Edit Collection</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-col-name">Name *</Label>
              <Input
                id="edit-col-name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                required
                data-ocid="admin.collection.name_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-col-desc">Description</Label>
              <Textarea
                id="edit-col-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                data-ocid="admin.collection.description_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                Cover Image (optional — leave blank to keep existing)
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                className="border-border/70 hover:border-accent/60 hover:text-accent"
                data-ocid="admin.collection.cover_upload_button"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Choose Image
              </Button>
              {form.imagePreview && (
                <img
                  src={form.imagePreview}
                  alt="Preview"
                  className="w-40 h-24 object-cover rounded mt-2 border border-border/40"
                />
              )}
            </div>
            {isPending && form.uploadProgress > 0 && (
              <Progress value={form.uploadProgress} className="h-1" />
            )}
            <DialogFooter>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                data-ocid="admin.collection.submit_button"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
