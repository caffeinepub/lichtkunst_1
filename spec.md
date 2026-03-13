# Lichtkunst NFT Gallery

## Current State
Empty workspace -- rebuilding from scratch.

## Requested Changes (Diff)

### Add
- Public gallery: collections overview and NFT detail views
- Admin area at `/admin` restricted to 3 hardcoded Principal IDs
- Create Collection modal (name, description)
- Mint NFT modal (title, description, image upload, assign to collection)
- Transfer NFT function: admin can send any NFT to an ICP principal address
- Artist header: "Istvan Seidel / Lichtkünstler Light Artist"
- Random quote (Walter Russell or Goethe) displayed below banner, centered, filigree style
- Login/logout button in header
- Admin button in header visible when logged in

### Modify
- N/A (new build)

### Remove
- N/A (new build)

## Implementation Plan
1. Backend: stable var storage for collections and NFTs, admin check by Principal ID, CRUD + transfer functions
2. Frontend: public gallery routes, admin dashboard with modals, Internet Identity login
3. Admin Principal IDs hardcoded:
   - uorkh-nazas-r5n3p-kj44w-gwm4i-liaj3-jqjll-ws44w-7dlve-3mshw-sae
   - kcznz-vfjcj-xmtzc-aw23m-th6f7-43fd3-ytu3i-ot3ig-nuwnj-oba6h-fqe
   - d5t6k-adjdl-ak3tk-xi2mp-lpwl2-wx2mt-35n2k-xy7nd-l5kbv-cyb6v-mqe
