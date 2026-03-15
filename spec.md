# lichtkunst

## Current State
Stable NFT gallery app with collections, NFT minting, admin area, SEO, contact form on homepage and contact page. Backend uses stable vars for persistence.

## Requested Changes (Diff)

### Add
- Email subscription: visitors can enter their email to subscribe to updates
- Backend: stable var to store subscriber emails, public functions to subscribe and (admin-only) list/delete subscribers
- Frontend: newsletter signup widget on homepage (below contact form) and in the admin dashboard to view/manage subscribers

### Modify
- GalleryPage: add newsletter signup section below contact form
- AdminDashboard: add subscriber list tab/section

### Remove
- Nothing

## Implementation Plan
1. Add subscriber storage + subscribe/getSubscribers/deleteSubscriber functions to main.mo
2. Add newsletter signup UI to GalleryPage
3. Add subscriber management to AdminDashboard
