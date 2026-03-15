import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { AdminGuard } from "./components/AdminGuard";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { CollectionDetailPage } from "./pages/CollectionDetailPage";
import { CollectionsPage } from "./pages/CollectionsPage";
import { ContactPage } from "./pages/ContactPage";
import { GalleryPage } from "./pages/GalleryPage";
import { NFTDetailPage } from "./pages/NFTDetailPage";
import { AdminCollections } from "./pages/admin/AdminCollections";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminMint } from "./pages/admin/AdminMint";

// ─── Root layout ──────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => (
    <div className="grain-overlay min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster
        theme="dark"
        toastOptions={{
          classNames: {
            toast: "bg-card border-border text-foreground font-body",
            success: "border-accent/40",
            error: "border-destructive/40",
          },
        }}
      />
    </div>
  ),
});

// ─── Public routes ─────────────────────────────────────────────
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: GalleryPage,
});

const collectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/collections",
  component: CollectionsPage,
});

const collectionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/collection/$id",
  component: CollectionDetailPage,
});

const nftDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nft/$id",
  component: NFTDetailPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: ContactPage,
});

// ─── Admin routes ──────────────────────────────────────────────
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <AdminGuard>
      <Outlet />
    </AdminGuard>
  ),
});

const adminIndexRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/",
  component: AdminDashboard,
});

const adminCollectionsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/collections",
  component: AdminCollections,
});

const adminMintRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/mint",
  component: AdminMint,
});

// ─── 404 redirect ──────────────────────────────────────────────
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});

// ─── Router ────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  indexRoute,
  collectionsRoute,
  collectionDetailRoute,
  nftDetailRoute,
  contactRoute,
  adminRoute.addChildren([
    adminIndexRoute,
    adminCollectionsRoute,
    adminMintRoute,
  ]),
  notFoundRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
