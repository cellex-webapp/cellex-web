# Cellex Web Project Overview

## Purpose

Cellex Web is a multi-role e-commerce frontend built as a single-page application. It serves three primary user roles:

- Client users who browse products, search, manage cart, place orders, pay via VNPay, and view recommendations.
- Vendors who manage their shop, products, categories, orders, notifications, reviews, and chat.
- Admins who operate the marketplace through dashboards, user/shop/product governance, marketing, analytics, reviews, recommendations, and chat.

This repo is best understood as a role-based marketplace control surface rather than a generic storefront.

## Tech Stack

- React 19
- TypeScript
- Vite 7
- Redux Toolkit for state management
- React Router for route composition
- Ant Design for UI components
- Tailwind CSS v4 for utility styling
- Axios for HTTP calls
- Firebase Cloud Messaging for push notifications
- STOMP + SockJS for realtime chat
- Recharts for analytics dashboards

## App Entry And Shell

Core startup flow:

- `src/main.tsx` mounts the React app, wraps it with Redux `Provider`, imports Ant Design reset styles, and registers the Firebase service worker.
- `src/App.tsx` creates a global Ant Design message instance and renders the route tree.
- `src/routes/AppRoute.tsx` defines the full router using role-protected route groups.

Layout model:

- `src/components/layouts/MainLayout.tsx` is a light shell wrapper.
- Client pages render through `MainLayout` + `ClientLayout`.
- Admin and vendor areas use dedicated feature-level layouts.
- Public auth pages use `PublicLayout`.

## Product Domain Summary

This is a marketplace application with the following main business areas:

- Authentication and role-aware access control
- Product catalog and category/attribute management
- Shop onboarding and shop administration
- Cart and checkout
- Order lifecycle management
- Marketing campaigns and segment coupons
- Notifications and device token registration
- Customer, product, and shop analytics
- Admin and vendor review handling
- Recommendation management and recommendation browsing
- Realtime chat between marketplace actors

## Route Map By Role

### Public

- `/login`
- `/signup`
- `/otp`

### Client (`USER`)

- `/`
- `/search`
- `/categories/:slug`
- `/shops/:id`
- `/products`
- `/products/:id`
- `/recommendations`
- `/account`
- `/cart`
- `/order/confirm/:orderId`
- `/payment/vnpay/return`
- `/payment/failure`
- `/payment/success`

### Vendor (`VENDOR`)

- `/vendor`
- `/vendor/products`
- `/vendor/categories`
- `/vendor/categories/:slug/attributes`
- `/vendor/orders`
- `/vendor/orders/shipping`
- `/vendor/shop`
- `/vendor/notifications`
- `/vendor/chat`
- `/vendor/reviews`
- `/vendor/rating`

### Admin (`ADMIN`)

- `/admin`
- `/admin/dashboard/product`
- `/admin/dashboard/shop`
- `/admin/dashboard/customer`
- `/admin/categories`
- `/admin/categories/attributes`
- `/admin/categories/:slug/attributes`
- `/admin/products`
- `/admin/users`
- `/admin/users/create`
- `/admin/orders`
- `/admin/shops`
- `/admin/shops/pending`
- `/admin/marketing/system`
- `/admin/marketing/system/:id`
- `/admin/marketing/segment`
- `/admin/customer-segments`
- `/admin/notifications`
- `/admin/customers/messages`
- `/admin/reviews`
- `/admin/recommendations`

## Architecture Pattern

The repo follows a fairly consistent frontend flow:

`Page/Component -> Custom Hook -> Redux Slice Async Thunk -> Service -> Axios Instance -> Backend API`

Practical meaning:

- UI logic usually lives in feature pages and components.
- Screen-facing behavior is often wrapped by custom hooks in `src/hooks`.
- Async business actions are typically implemented in Redux slices with `createAsyncThunk`.
- API calls are isolated in `src/services`.
- Shared transport concerns live in `src/utils/axiosInstance.ts`.

If you prompt an AI assistant to add or change behavior, asking it to preserve this flow will usually produce the most compatible result.

## State Management Model

Redux store is configured in:

- `src/stores/store.ts`
- `src/stores/RootReducer.ts`

Current root slices include:

- `auth`
- `user`
- `category`
- `cart`
- `coupon`
- `shop`
- `attribute`
- `product`
- `segment`
- `segmentCoupon`
- `order`
- `notification`
- `vnpay`
- `analytics`
- `chat`
- `recommendation`

Typical slice responsibilities:

- Store API-backed entities and loading/error state.
- Expose async thunks for CRUD or workflow actions.
- Normalize UI state enough for screens to bind through selectors.

Supporting conventions:

- Hooks such as `useAuth`, `useProduct`, and `useChat` wrap selectors and dispatchers.
- Selectors live in `src/stores/selectors`.
- Global domain types live in `src/types/index.ts` via `declare global`.

## Important Integrations

### API And Authentication

- Base API URL comes from `VITE_API_BASE_URL`.
- `src/utils/axiosInstance.ts` injects bearer tokens for non-auth routes.
- 401 responses trigger refresh-token logic and queued request replay.
- Auth state persists in local storage.

Local storage is part of the runtime contract. Prompts that touch auth, bootstrapping, or redirect behavior should account for persisted keys like access token, refresh token, user, shop, role, and FCM token.

### Push Notifications

- Firebase is initialized in `src/config/firebase.ts`.
- Foreground notification handling lives in `src/hooks/useFCMNotification.ts`.
- Background notifications are handled by `public/firebase-messaging-sw.js`.

Important note:

- The service worker contains hardcoded Firebase config values because it cannot read `import.meta.env`.
- Prompting for notification work should explicitly include both app-side config and service-worker behavior.

### Realtime Chat

- WebSocket/STOMP logic lives in `src/services/websocket.ts`.
- Chat state and async actions live in `src/stores/slices/chat.slice.ts`.
- Screen-facing chat actions are wrapped by `src/hooks/useChat.ts`.

Behavioral pattern:

- Initial room and unread-count fetch happens through Redux thunks.
- WebSocket subscription handles live events.
- Active room selection drives room subscription and read-state updates.

### Payments

- VNPay integration lives in `src/services/vnpay.service.ts`.
- The payment service already supports flexible response shapes from the backend.
- Client routes include return, success, and failure flows.

### Search And Recommendations

- Product search uses service/hook/slice patterns.
- Voice search exists through `src/hooks/useVoiceSearch.ts` using the Web Speech API with Vietnamese-focused transcript cleanup.
- Recommendation APIs are wrapped in `src/services/recommendation.service.ts` and support personal, admin-for-user, and compute operations.

## Feature Map

### Auth

Located under `src/features/auth`.

Main responsibilities:

- Login
- Signup
- OTP verification
- Public-only routing

### Client Features

Located under `src/features/clients`.

Main areas:

- Home
- Search
- Product listing/detail
- Cart
- Checkout and payment
- Order confirmation
- Account management
- Recommendations

### Vendor Features

Located under `src/features/vendors`.

Main areas:

- Dashboard
- Product management
- Category and attribute assignment
- Orders
- Shop management
- Notifications
- Chat
- Reviews

### Admin Features

Located under `src/features/admin`.

Main areas:

- Dashboard analytics
- Categories and attributes
- Product governance
- User management
- Shop approval and management
- Orders
- Marketing system campaigns
- Segment coupons
- Customer segments
- Notifications
- Chat with customers
- Reviews
- Recommendations

## Folder-Level Mental Model

- `src/features`: screen-level code grouped by business domain and role.
- `src/components`: shared layout and header components.
- `src/hooks`: reusable orchestration hooks, usually tied to Redux slices.
- `src/services`: API and realtime service layer.
- `src/stores/slices`: domain state and async thunks.
- `src/stores/selectors`: selector layer for slice consumption.
- `src/utils`: transport and helper utilities such as axios, form data, local storage, and navigation helpers.
- `src/config`: external client SDK configuration.
- `public`: browser assets including the Firebase messaging service worker.

## Coding Conventions That Matter For Prompting

When asking an AI assistant to modify this repo, these assumptions are usually correct:

- Use the `@/` path alias instead of long relative imports.
- Keep business logic out of presentational components when possible.
- Prefer extending existing hooks, slices, services, and selectors instead of bypassing them.
- Preserve Ant Design as the main component system and Tailwind as utility styling support.
- Reuse global interfaces from `src/types/index.ts` before inventing local types.
- Follow the existing thunk pattern for async requests rather than calling services directly from pages.
- Maintain role-based routing and layout separation.

## Notable Quirks And Risks

These are worth knowing before prompting large changes:

- Auth persistence is local-storage driven, so changes to login/logout/bootstrap behavior can have cross-cutting effects.
- `src/utils/axiosInstance.ts` clears `userInfo` during forced logout, while the auth slice persists `user`; prompts touching auth cleanup should normalize that inconsistency rather than copy it.
- Firebase notification behavior spans both normal app code and the service worker.
- WebSocket auth currently depends on token availability at connect time.
- Some service methods already tolerate multiple backend response shapes, especially payment flows.
- The app mixes English code with Vietnamese user-facing text, so prompts should say whether new UX copy should stay Vietnamese or switch language.

## Best Prompting Strategy For This Repo

The highest quality prompts for this project usually include:

1. The user role or route area being changed.
2. The business goal.
3. The expected data flow.
4. Whether the change should extend service, slice, selector, hook, and page layers.
5. UI constraints such as Ant Design, Tailwind, or existing layout reuse.
6. Whether API contracts already exist or need to be inferred.

Good prompt shape:

```md
Update the vendor product management flow in this repo.

Context:
- React + TypeScript + Vite app
- Redux Toolkit with service -> slice -> hook -> page pattern
- Vendor pages live under src/features/vendors
- Product APIs go through src/services/product.service.ts

Task:
- Add a product status filter to the vendor products page
- Keep Ant Design UI patterns
- Reuse existing product slice and selectors if possible
- If new API params are needed, thread them through service, slice, hook, and page
- Do not refactor unrelated admin or client product pages

Deliver:
- Minimal code changes
- Keep naming and folder conventions consistent
- Explain any backend assumptions
```

## Prompt Templates

### Add A Feature

```md
Implement [feature] for the [admin/vendor/client] area of Cellex Web.

Use the existing architecture:
- page/component -> hook -> Redux slice thunk -> service -> axios
- shared types in src/types/index.ts
- Ant Design for components
- Tailwind only for utility styling

Touch only the files needed for this feature.
List any backend assumptions.
```

### Fix A Bug

```md
Debug and fix a bug in Cellex Web.

Area:
- [route or feature]

Symptoms:
- [describe bug]

Constraints:
- preserve current architecture
- avoid unrelated refactors
- check whether the issue involves route guards, Redux state, service response shape, or localStorage persistence
```

### Add An API-Backed Screen Change

```md
Add a new UI behavior to Cellex Web in [feature path].

Please:
- inspect the existing slice, selector, hook, and service for that domain
- extend the current async thunk flow instead of adding ad hoc fetch logic in the component
- keep user-facing copy in [Vietnamese or English]
- preserve existing role-based route structure
```

### Work On Notifications Or Chat

```md
Modify the [notification/chat] system in Cellex Web.

Check all related layers:
- config
- service
- Redux slice
- custom hook
- page/component
- service worker too if notifications are affected

Keep existing realtime and token assumptions unless a root-cause fix requires changing them.
```

## Good First Files To Read Before Any Change

- `src/routes/AppRoute.tsx`
- `src/utils/axiosInstance.ts`
- `src/stores/RootReducer.ts`
- The relevant `src/stores/slices/*.slice.ts` file for the target domain
- The matching `src/hooks/useX.ts` hook
- The matching `src/services/*.service.ts` service
- The target feature page under `src/features/**/pages`

## Short Repo Summary For Reuse

Use this when you want to paste a compact repo description into a prompt:

```md
Cellex Web is a React 19 + TypeScript + Vite marketplace frontend with three roles: admin, vendor, and client. It uses Redux Toolkit for state, React Router for role-based routing, Ant Design for UI, Tailwind utilities, Axios with refresh-token handling, Firebase Cloud Messaging for notifications, STOMP/SockJS for chat, and a service -> slice -> hook -> page architecture. Admin, vendor, and client features are separated under src/features by role. Global types are declared in src/types/index.ts, shared API access is in src/services, and route/layout logic is centralized in src/routes and feature layouts.
```