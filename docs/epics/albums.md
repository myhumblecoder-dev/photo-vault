# Epic: Photo Albums

Add photo albums to photo-vault — signed-in users create named albums and browse their own.

## Story 1 — Add Album model to Prisma schema

**Files to modify:**
- `prisma/schema.prisma`

**Acceptance Criteria:**
- `prisma/schema.prisma` gains an `Album` model with fields: `id String @id @default(cuid())`, `name String`, `userId String`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`, and a relation `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`.
- The `User` model gains the back-relation field `albums Album[]`.
- `Album` has a compound unique constraint `@@unique([userId, name])` so a user cannot have two albums with the same name.
- Running `prisma db push` (or `prisma migrate dev`) succeeds against a Postgres database.

**Testing:** not applicable — schema file; there is no unit under test.

---

## Story 2 — createAlbum server action

**Depends on:** #1

**Files to create:**
- `src/app/actions/createAlbum.ts`
- `src/app/actions/createAlbum.test.ts`

**Acceptance Criteria:**
- `createAlbum` is the SOLE export of `src/app/actions/createAlbum.ts` — `async function createAlbum(name: string): Promise<{ id: string; name: string }>` (named export, NOT default-export). Declares `'use server'` at the top.
- Imports `{ prisma } from '@/lib/db'`, `{ auth } from '@/auth'`, and `{ z } from 'zod'`.
- The action validates `name` with `z.string().trim().min(1)` (trim BEFORE min). If validation fails, throws an `Error` whose message starts with `'Invalid album name'`.
- Calls `await auth()` to get the session; if `!session?.user?.id`, throws `new Error('Unauthorized')`.
- On success calls `prisma.album.create({ data: { name: parsed, userId: session.user.id } })` and returns `{ id, name }` from the created row.
- On Prisma unique-constraint violation (error code `'P2002'`), throws `new Error('Album name already exists')`.
- `createAlbum.test.ts` mocks `'@/lib/db'` with `vi.mock('@/lib/db')` and mocks `'@/auth'` with `vi.mock('@/auth')`. Tests import `{ createAlbum }` from `./createAlbum`.
- Implement `createAlbum` exactly once; do NOT emit an alternate variant or re-export.

**Testing:**
- Test whitespace-only name is rejected before db call
- Test unauthenticated session throws Unauthorized
- Test valid name calls prisma.album.create with correct data and returns id and name

---

## Story 3 — listAlbums server action

**Depends on:** #1

**Files to create:**
- `src/app/actions/listAlbums.ts`
- `src/app/actions/listAlbums.test.ts`

**Acceptance Criteria:**
- `listAlbums` is the SOLE export of `src/app/actions/listAlbums.ts` — `async function listAlbums(): Promise<Array<{ id: string; name: string; createdAt: Date }>>` (named export). Declares `'use server'` at the top.
- Imports `{ prisma } from '@/lib/db'` and `{ auth } from '@/auth'`.
- Calls `await auth()`; if `!session?.user?.id`, throws `new Error('Unauthorized')`.
- Returns `prisma.album.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, createdAt: true } })`.
- `listAlbums.test.ts` mocks `'@/lib/db'` with `vi.mock('@/lib/db')` and mocks `'@/auth'` with `vi.mock('@/auth')`. Tests import `{ listAlbums }` from `./listAlbums`.
- Implement `listAlbums` exactly once; do NOT emit an alternate variant or re-export.

**Testing:**
- Test unauthenticated session throws Unauthorized
- Test authenticated call queries with correct userId filter and orderBy
- Test empty result returns empty array

---

## Story 4 — AlbumCard presentational component

**Files to create:**
- `src/components/AlbumCard.tsx`
- `src/components/AlbumCard.test.tsx`

**Acceptance Criteria:**
- `AlbumCard.tsx` default-exports a component named `AlbumCard` (`export default function AlbumCard`).
- Props type (inline): `{ id: string; name: string; createdAt: Date; href: string }`. Purely presentational — receives all values as props; does NOT call server actions or fetch data.
- Imports `{ Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'`, `Link from 'next/link'`, and `{ format } from 'date-fns'`.
- Renders a `<Card>` wrapping a `<Link href={href} data-testid="album-link">`. Inside, renders a `<CardHeader>` with `<CardTitle>` showing `name`, and a `<CardContent>` showing `format(createdAt, 'MMM d, yyyy')`.
- The card title text equals the `name` prop exactly.
- `AlbumCard.test.tsx` imports `AlbumCard` as a default import from `./AlbumCard`. Tests use `@testing-library/react`.
- `AlbumCard.tsx` imports no modules whose transitive dependencies include `@/lib/db`; use `import type` for any Prisma-derived type if needed.

**Testing:**
- Test renders album name
- Test renders formatted date as MMM d yyyy
- Test album-link href matches href prop

---

## Story 5 — CreateAlbumForm client component — render and pending state

**Depends on:** #2

**Files to create:**
- `src/components/CreateAlbumForm.tsx`
- `src/components/CreateAlbumForm.test.tsx`

**Acceptance Criteria:**
- `CreateAlbumForm.tsx` default-exports a component named `CreateAlbumForm` (`export default function CreateAlbumForm`). Marks `'use client'` at the top.
- Props type (inline): `{ onCreated?: (album: { id: string; name: string }) => void }`.
- Imports `{ createAlbum } from '@/app/actions/createAlbum'` and `{ Input } from '@/components/ui/input'` and `{ Button } from '@/components/ui/button'`.
- Renders a `<form>` with: an `<Input>` with `name="albumName"` and `placeholder="Album name"`, and a `<Button>` of `type="submit"` with text `"Create"`.
- Uses `useState` for `pending` (boolean, initial `false`), `error` (string, initial `''`), and a controlled input value (initial `''`). Initializes each directly — never uses `useEffect`.
- While `pending` is true, the submit `<Button>` is `disabled` and shows text `"Creating…"`.
- `CreateAlbumForm.test.tsx` mocks `'@/app/actions/createAlbum'` with `vi.mock('@/app/actions/createAlbum')`. Tests import `CreateAlbumForm` as a default import from `./CreateAlbumForm`.

**Testing:**
- Test renders album name input with placeholder Album name
- Test renders Create button
- Test submit button shows Creating and is disabled while action is pending

---

## Story 6 — CreateAlbumForm success and error handling

**Depends on:** #5

**Files to modify:**
- `src/components/CreateAlbumForm.tsx`
- `src/components/CreateAlbumForm.test.tsx`

**Acceptance Criteria:**
- `CreateAlbumForm` is the default export of `src/components/CreateAlbumForm.tsx` (export style: `export default function CreateAlbumForm`).
- On successful submit: reads `albumName` from `FormData`, calls `createAlbum(albumName)`, clears the input field, and calls `onCreated(album)` if provided.
- On error from `createAlbum`: displays the error message in a `<p data-testid="album-error">` below the form.
- `CreateAlbumForm.test.tsx` tests import `CreateAlbumForm` as a default import from `./CreateAlbumForm`.

**Testing:**
- Test successful submit clears the input field and calls onCreated with returned album
- Test error from action is displayed in album-error element

---

## Story 15 — Albums list page — unauthenticated and empty states

**Depends on:** #3, #4, #6

**Files to create:**
- `src/app/albums/page.tsx`
- `src/app/albums/page.test.tsx`

**Acceptance Criteria:**
- `src/app/albums/page.tsx` is a Next.js App Router server component (no `'use client'`). Default-exports a component named `AlbumsPage`.
- Declares `export const dynamic = 'force-dynamic'` at the top (required for a DB-reading page).
- Imports `{ auth } from '@/auth'`, `{ listAlbums } from '@/app/actions/listAlbums'`, `AlbumCard from '@/components/AlbumCard'`, and `CreateAlbumForm from '@/components/CreateAlbumForm'`.
- When `!session?.user`: renders ONLY `<p data-testid="sign-in-prompt">Sign in to see your albums</p>`.
- When authenticated and `albums.length === 0`: renders `<h1>My Albums</h1>`, `<CreateAlbumForm />`, and `<p data-testid="empty-state">No albums yet</p>`.
- `src/app/albums/page.test.tsx` mocks `'@/auth'`, `'@/app/actions/listAlbums'`, `'@/components/AlbumCard'`, and `'@/components/CreateAlbumForm'`. Tests use `@testing-library/react`.

**Testing:**
- Test unauthenticated user sees sign-in-prompt
- Test authenticated user with no albums sees empty-state and My Albums heading

---

## Story 16 — Albums list page — populated albums list

**Depends on:** #15

**Files to modify:**
- `src/app/albums/page.tsx`
- `src/app/albums/page.test.tsx`

**Acceptance Criteria:**
- When authenticated and albums is non-empty: renders `<h1>My Albums</h1>`, `<CreateAlbumForm />`, and one `<AlbumCard>` per album with props `id`, `name`, `createdAt`, and `href={'/albums/' + album.id}`.
- `src/app/albums/page.test.tsx` mocks `'@/auth'`, `'@/app/actions/listAlbums'`, `'@/components/AlbumCard'`, and `'@/components/CreateAlbumForm'`.

**Testing:**
- Test authenticated user with albums sees AlbumCard for each album
- Test CreateAlbumForm is rendered for authenticated user with albums

---

## Story 7 — deleteAlbum server action

**Depends on:** #1

**Files to create:**
- `src/app/actions/deleteAlbum.ts`
- `src/app/actions/deleteAlbum.test.ts`

**Acceptance Criteria:**
- `deleteAlbum` is the SOLE export of `src/app/actions/deleteAlbum.ts` — `async function deleteAlbum(albumId: string): Promise<void>` (named export). Declares `'use server'` at the top.
- Imports `{ prisma } from '@/lib/db'` and `{ auth } from '@/auth'`.
- Calls `await auth()`; if `!session?.user?.id`, throws `new Error('Unauthorized')`.
- Calls `prisma.album.delete({ where: { id: albumId, userId: session.user.id } })`. Scoping to `userId` prevents users from deleting albums they do not own.
- If Prisma throws an error with `.code === 'P2025'` (record not found), re-throws as `new Error('Album not found')`.
- Other Prisma errors are re-thrown unchanged.
- `deleteAlbum.test.ts` mocks `'@/lib/db'` with `vi.mock('@/lib/db')` and mocks `'@/auth'` with `vi.mock('@/auth')`. Tests import `{ deleteAlbum }` from `./deleteAlbum`.
- Implement `deleteAlbum` exactly once; do NOT emit an alternate variant or re-export.

**Testing:**
- Test unauthenticated session throws Unauthorized
- Test authenticated call deletes with correct id and userId
- Test P2025 error is re-thrown as Album not found

---

## Story 8 — NavBar component with sign-in and sign-out

**Files to create:**
- `src/components/NavBar.tsx`
- `src/components/NavBar.test.tsx`

**Acceptance Criteria:**
- `NavBar.tsx` default-exports a component named `NavBar` (`export default function NavBar`). Server component (no `'use client'`).
- Imports `{ auth, signIn, signOut } from '@/auth'` and `Link from 'next/link'` and `{ Button } from '@/components/ui/button'`.
- Renders a `<nav>` with: a `<Link href="/">Photo Vault</Link>` brand link and a `<Link href="/albums">My Albums</Link>` link (always visible).
- When `session?.user` is truthy: renders `<span data-testid="user-name">{session.user.name}</span>` and a sign-out form (`<form action={async () => { 'use server'; await signOut() }}><Button type="submit">Sign out</Button></form>`).
- When `session?.user` is falsy: renders a sign-in form (`<form action={async () => { 'use server'; await signIn('github') }}><Button type="submit">Sign in</Button></form>`).
- `NavBar.test.tsx` mocks `'@/auth'` with `vi.mock('@/auth')`. Tests import `NavBar` as a default import from `./NavBar`.

**Testing:**
- Test renders Photo Vault brand link and My Albums link
- Test unauthenticated state shows Sign in button
- Test authenticated state shows user name and Sign out button

---

## Story 9 — Wire NavBar into app layout

**Depends on:** #8

**Files to modify:**
- `src/app/layout.tsx`

**Acceptance Criteria:**
- `src/app/layout.tsx` imports `NavBar from '@/components/NavBar'` and renders `<NavBar />` inside `<body>` directly above `{children}`.
- The existing `Geist` / `GeistMono` font setup and `<html>` / `<body>` structure are preserved unchanged.
- `RootLayout` remains the default export.

**Testing:**
- Test NavBar is rendered inside body above children
