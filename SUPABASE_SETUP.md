# Supabase Integration — Setup Guide

## Environment Variables

File `.env.local` sudah dikonfigurasi otomatis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kvapcykpscswsqsylzly.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Install Dependencies

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

## Jalankan Project

```bash
pnpm dev
```

---

## Arsitektur Baru

### 1. Authentication (`@supabase/auth`)
- **Sign Up** → email + password + username + displayName
- **Sign In** → email + password
- **Auto session** → middleware refresh di setiap request
- **Profile otomatis dibuat** via database trigger `on_auth_user_created`

### 2. Database (PostgreSQL via Supabase)

| Tabel | Keterangan |
|---|---|
| `profiles` | Data pengguna (extend `auth.users`) |
| `videos` | Metadata video (URL dari Vercel Blob) |
| `likes` | Relasi user ↔ video likes |
| `saved_videos` | Video tersimpan per user |
| `follows` | Relasi follower ↔ following |
| `conversations` | Header percakapan |
| `conversation_participants` | Anggota percakapan |
| `messages` | Isi pesan |

Semua tabel dilindungi **Row Level Security (RLS)**.

### 3. Realtime
- **Messages** → `subscribeToMessages(conversationId, callback)` — pesan baru muncul otomatis tanpa refresh
- **Conversations list** → update otomatis saat ada pesan baru
- **Likes & Follows** → aktif di Supabase Realtime publication

### 4. Storage
Video/audio tetap di **Vercel Blob** (sudah ada). Supabase hanya menyimpan metadata (URL, caption, user_id).

---

## File Baru yang Ditambahkan

```
lib/
  supabase/
    client.ts        ← Browser client (singleton)
    server.ts        ← Server Component / Route Handler client
    middleware.ts    ← Session refresh middleware
    types.ts         ← TypeScript types database
middleware.ts        ← Next.js middleware (root)
.env.local           ← Env vars (sudah diisi)
```

## File yang Diubah

Semua `lib/store/*.ts` — dari localStorage sync → Supabase async.
Semua komponen — dari sync calls → `async/await`.
`components/auth/auth-modal.tsx` — tambah mode Sign In + Sign Up dengan email/password.
`components/providers/app-provider.tsx` — auth state dari Supabase session.
