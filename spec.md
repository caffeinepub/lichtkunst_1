# lichtkunst

## Current State
NFT gallery app for Istvan Seidel with collections, NFT minting, admin area, and SEO optimization. Routing via TanStack Router with Header/Footer layout.

## Requested Changes (Diff)

### Add
- New `/contact` page with a friendly contact form
- Navigation link to contact page in Header
- Form opens a pre-filled mailto: link to lichtkunst@proton.me with subject and message body

### Modify
- Header: add "Kontakt" navigation link
- App.tsx: register the new contact route

### Remove
- Nothing

## Implementation Plan
1. Create `ContactPage.tsx` with welcoming intro text and a form (name, email, message). On submit, construct a mailto: URL and open it.
2. Register `/contact` route in App.tsx
3. Add "Kontakt" link to Header navigation
