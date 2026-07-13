# Sistem Gacha Event

Technical assessment Megaxus Infotech posisi Fullstack Engineer — Galih Raka Gustiawan.

## Cara Menjalankan (Local Development)

Dibangun pakai Next.js, Prisma, PostgreSQL, dan MinIO buat object storage.

**Yang perlu disiapkan dulu:**
- Node.js v18 ke atas
- Docker & Docker Compose (buat jalanin Postgres dan MinIO)
- npm/yarn/pnpm, pilih salah satu

**Langkahnya:**

1. Clone repo-nya dulu:
   ```bash
   git clone <repository_url>
   cd legends-of-nusantara
   ```

2. Jalankan service pendukung (Postgres, Redis, MinIO) via Docker:
   ```bash
   docker-compose up -d --build
   ```
   Ini akan otomatis build image dan jalankan semua service termasuk seeding database, jadi tinggal tunggu saja.

3. Setelah semua service up, aplikasi bisa diakses di `http://localhost:3000`. Postgres jalan di port 5432, MinIO API di port 9000.

---

## Dokumentasi API

Dokumentasi API interaktif menggunakan Swagger bisa diakses pada endpoint `/api-docs`.

Sebagian besar operasi tulis (mutation) pakai Server Actions bawaan Next.js. Tapi ada juga beberapa API Routes standar di `/api/...` untuk kebutuhan tertentu seperti trading, SSE, dan histori. Semua endpoint di bawah butuh cookie auth.

```http
Cookie: user_id=<uuid>; auth_role=<user_role>
```

### `GET /api/users/search`
Cari user berdasarkan username/email, dipakai untuk fitur trading.

Query param: `q` (wajib) — username atau email yang dicari.

```json
{
  "users": [
    { "id": "uuid", "username": "player2", "email": "player2@awanbox.biz.id" }
  ]
}
```

### `POST /api/trades`
Ajukan tawaran barter item ke user lain.

```json
{
  "receiverId": "uuid-penerima",
  "offeredItems": ["uuid-user-item-1", "uuid-user-item-2"],
  "requestedItems": ["uuid-user-item-3"]
}
```

Response:
```json
{ "success": true, "tradeId": "uuid-trade" }
```

### `POST /api/trades/[id]/respond`
Terima atau tolak tawaran trade. `id` adalah trade ID di URL.

```json
{ "action": "accept" }
```

Response:
```json
{ "success": true, "message": "Trade accepted successfully" }
```

### `GET /api/trades/incoming/stream`
Endpoint SSE untuk notifikasi trade real-time.

```text
data: {"id":"trade-uuid","type":"incoming_trade","message":"Tawaran trade baru masuk..."}
```

### `GET /api/profile/topups`
Riwayat top-up/bonus saldo user. Query param opsional: `page` (default 1), `limit` (default 10).

```json
{
  "data": [
    {
      "id": "tx-uuid",
      "amount": 500,
      "type": "REGISTRATION_BONUS",
      "createdAt": "2026-07-12T07:40:05.35Z",
      "balanceAfter": 500
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 1 }
}
```

### `GET /api/profile/gacha-history`
Log hasil pull gacha milik user yang sedang login. Query param opsional: `page` (default 1).

```json
{
  "data": [
    {
      "id": "pull-uuid",
      "eventName": "Gacha Legenda Nusantara V1",
      "itemName": "Gajah Mada",
      "rarity": "legendary",
      "coinCost": 10,
      "createdAt": "2026-07-12T08:00:00Z"
    }
  ]
}
```

### `GET /api/admin/dashboard`
Butuh cookie `auth_role=admin`. Statistik total user, revenue, dan jumlah pull.

```json
{ "totalUsers": 150, "totalPulls": 4530, "totalRevenue": 45300, "activeEvents": 2 }
```

### `GET /api/admin/history/pulls`
Butuh cookie `auth_role=admin`. Seluruh histori gacha di platform. Query param opsional: `page` (default 1).

```json
{
  "data": [
    {
      "id": "pull-uuid",
      "username": "player1",
      "eventName": "Gacha Legenda Nusantara",
      "itemName": "Keris Empu Gandring",
      "createdAt": "2026-07-12T08:05:00Z"
    }
  ],
  "total": 4530
}
```