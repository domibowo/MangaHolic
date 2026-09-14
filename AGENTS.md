# AGENTS.md — Mangaholic (React Native App)

Steering document untuk arsitektur, struktur folder, dan batasan ownership tiap
layer di aplikasi Mangaholic. Baca ini sebelum menambah file atau dependency baru.

Dokumen terkait: [TODO.md](./TODO.md) (roadmap fitur) · [DECISIONS.md](./DECISIONS.md)
(log keputusan teknis) · [DESIGN.md](./DESIGN.md) (design language).

---

## 1. React Native CLI vs Expo — keputusan

**Dipilih: React Native CLI (bare workflow).** Project ini sudah di-scaffold
dengan `@react-native-community/cli` (folder `android/` dan `ios/` native
sudah ada).

### Kenapa bukan Expo, secara konkret untuk project ini

| Faktor | React Native CLI (dipilih) | Expo |
|---|---|---|
| Portofolio signal | Menunjukkan bisa handle native project langsung: gradle, CocoaPods, linking manual, native module setup — skill yang lebih dicari untuk role mid-senior RN | Menunjukkan familiaritas dengan Expo SDK & EAS, bukan native tooling |
| Skill klaim | Anda belum comfortable klaim Expo sebagai skill — CLI menghindari klaim skill yang belum solid | Akan butuh belajar EAS Build, config plugins, prebuild — overhead belajar tool baru di tengah project |
| Kontrol native | Penuh — bisa custom native module kapan pun tanpa "eject" | Managed workflow membatasi sampai perlu prebuild/dev client untuk native module custom |
| Reader manga (page-by-page/continuous scroll) | Bisa optimasi native image handling & memory langsung kalau nanti perlu (mis. `react-native-fast-image`, custom native view) tanpa friksi | Sebagian besar library image-heavy tetap jalan, tapi debugging native-level issue lebih berlapis |
| Build & run lokal | `react-native run-android` / `run-ios` langsung ke device/emulator, tidak butuh akun cloud service | Expo Go cepat untuk prototyping, tapi custom native module butuh EAS Build (butuh akun, quota, waktu build di cloud) |
| Kompleksitas setup awal | Lebih tinggi (Xcode, Android Studio, CocoaPods harus present) | Lebih rendah di awal, tapi menunda kompleksitas ke titik ketika butuh native module |

Trade-off yang disadari: setup awal lebih berat (harus punya Xcode & Android
Studio terkonfigurasi, handle native dependency linking manual), dan upgrade
versi RN lebih manual dibanding `expo upgrade`. Ini diterima karena tujuan
project adalah portofolio yang membuktikan kapabilitas native-level, bukan
kecepatan prototyping semata.

**Kapan re-evaluasi:** kalau di tengah jalan kompleksitas native build
jadi bottleneck signifikan terhadap progres (bukan sekadar tidak nyaman),
catat re-evaluasi ini sebagai entry baru di DECISIONS.md — jangan diam-diam
pindah.

---

## 2. Arsitektur — gambaran umum

> Catatan scope: struktur di bawah menggambarkan arsitektur target penuh
> (manga + anime). Fitur anime saat ini **ditunda** — lihat
> [DECISIONS.md #006](./DECISIONS.md#006-fitur-anime-ditunda-fokus-mvp-awal-hanya-manga)
> dan [TODO.md](./TODO.md#deferred--anime). `animeApi`, `AnimeEntry`, dan
> bagian tracking anime di `librarySlice` belum dikerjakan — jangan mulai
> implementasinya sebelum milestone manga selesai.

```
UI (screens, components — styling via NativeWind, icon via lucide-react-native)
   │  membaca/menulis via hooks (RTK Query hooks & useSelector/useDispatch)
   ▼
Redux store (store/)
   ├─ api slices (RTK Query, createApi)  ── satu-satunya layer yang fetch ke network
   │     ├─ MangaDex via Cloudflare Worker proxy (mangadex-proxy)
   │     └─ AniList/Jikan (anime metadata & jadwal) — lihat DECISIONS.md
   │
   └─ local slices (bookmark manga, tracking status anime) ── persist lokal
```

Alur data satu arah: Screen memanggil hook (RTK Query `useXQuery`/`useXMutation`
untuk data network, atau `useSelector`/`useDispatch` untuk state lokal) →
hasil mengalir balik sebagai state/props. Screen dan component **tidak
pernah** memanggil `fetch`/`axios` langsung, dan tidak pernah membentuk Redux
action/selector logic sendiri di luar `store/`.

### Stack layer

| Concern | Library | Catatan |
|---|---|---|
| Styling | NativeWind (Tailwind untuk RN) | Design tokens dari DESIGN.md didefinisikan di `tailwind.config.js`, bukan file `theme/` custom |
| Icon | lucide-react-native | Butuh `react-native-svg` sebagai peer dependency |
| Data fetching & caching | Redux Toolkit Query (RTK Query) | Endpoint = `api/` layer; auto-caching menggantikan kebutuhan manual loading/error state di screen |
| Local persisted state | Redux Toolkit slice + redux-persist + react-native-mmkv | MMKV dipilih daripada AsyncStorage: native module synchronous, jauh lebih cepat, dan project sudah bare RN CLI jadi linking native module bukan hambatan |

Ketiganya adalah dependency baru → dicatat sebagai entry di
[DECISIONS.md](./DECISIONS.md), instalasi dieksekusi di milestone Setup
(TODO.md), bukan sekarang.

---

## 3. Struktur folder

```
MangaHolic/
├── src/
│   ├── api/                    # RTK Query slices, satu createApi per sumber data
│   │   ├── mangadexApi.ts      # endpoints ke Cloudflare Worker proxy + transformResponse ke domain types
│   │   └── animeApi.ts         # endpoints AniList/Jikan + transformResponse ke domain types
│   │
│   ├── screens/                # satu folder per screen
│   │   └── <ScreenName>/
│   │       ├── index.tsx
│   │       └── <ScreenName>.hooks.ts   # komposisi RTK Query hooks khusus screen ini
│   │
│   ├── components/             # presentational, reusable, tanpa network/navigation
│   │   └── <ComponentName>/
│   │       └── index.tsx       # styling via NativeWind className, bukan StyleSheet
│   │
│   ├── navigation/              # stack/tab navigator + route param types
│   │   ├── RootNavigator.tsx
│   │   └── types.ts
│   │
│   ├── store/                    # Redux store: gabung api slices + local slices
│   │   ├── index.ts               # configureStore, gabungkan reducer api/ + librarySlice
│   │   ├── librarySlice.ts        # bookmark manga & tracking status anime (persisted)
│   │   └── persist.ts             # setup redux-persist + react-native-mmkv storage adapter
│   │
│   ├── hooks/                  # hook lintas-screen (bukan spesifik satu screen)
│   ├── types/                  # domain model bersama (Manga, Chapter, AnimeEntry, ...)
│   └── utils/
│
├── App.tsx
├── index.js
├── tailwind.config.js          # design tokens dari DESIGN.md (color, font, spacing)
├── AGENTS.md
├── TODO.md
├── DECISIONS.md
└── DESIGN.md
```

Folder ini **belum dibuat** — dibuat bertahap mengikuti milestone di TODO.md,
bukan sekaligus di awal.

---

## 4. Batasan ownership tiap layer

### `screens/`
- Boleh: compose components, panggil RTK Query hooks (`useXQuery`/
  `useXMutation` dari `api/`) baik langsung maupun lewat lokal
  `<Screen>.hooks.ts`, baca/tulis `navigation` params, baca/tulis
  `librarySlice` via `useSelector`/`useDispatch`.
- Tidak boleh: memanggil `fetch`/network langsung, membuat `createApi`
  endpoint baru di luar `api/`, tahu bentuk response mentah dari
  MangaDex/AniList/Jikan (RTK Query `transformResponse` sudah memetakannya
  ke domain type), menyimpan className/style besar berulang inline
  (pindahkan ke `components/` kalau dipakai >1 tempat).

### `components/`
- Boleh: menerima data via props, styling via NativeWind `className`, icon
  dari `lucide-react-native`, animasi lokal, callback ke parent.
- Tidak boleh: memanggil RTK Query hooks atau `useSelector`/`useDispatch`
  langsung, memanggil `navigation.navigate` langsung (terima sebagai prop
  `onPress` dari screen) — ini menjaga component tetap portable & testable
  tanpa context data/navigasi.

### `api/`
- Satu-satunya layer yang boleh melakukan network call — diimplementasi
  sebagai RTK Query `createApi` per sumber data (`mangadexApi`, `animeApi`).
- Wajib memetakan response mentah ke domain type di `types/` lewat
  `transformResponse` — screen/component/store tidak boleh bergantung pada
  bentuk response API asli.
- Error dari network dinormalisasi lewat `transformErrorResponse` (jangan
  biarkan raw fetch error bocor ke UI layer).
- Tidak boleh mengimpor dari `store/librarySlice` (arah dependency satu
  arah: api tidak tahu soal local state).
- Kuirk spesifik MangaDex yang wajib ditangani di `mangadexApi`, bukan
  bocor ke screen/component (daftar endpoint lengkap ada di
  [TODO.md Milestone 2](./TODO.md)):
  - URL cover manga **tidak** datang langsung dari API — hanya `fileName`
    lewat relationship `cover_art`. `transformResponse` yang merakit jadi
    `https://uploads.mangadex.org/covers/{mangaId}/{fileName}`, domain
    type `Manga`/`MangaListItem` sudah punya field `coverUrl` siap pakai.
  - Response `/at-home/server/{chapterId}` (base URL + token halaman
    chapter) **tidak boleh di-cache lama** oleh RTK Query — token sesi
    sementara. Set `keepUnusedDataFor` pendek atau `providesTags` yang
    di-invalidate saat re-entry ke Reader, jangan pakai default cache RTK
    Query yang persist lama.
  - `/manga/{id}/aggregate` (ringan) dipakai untuk ringkasan volume/chapter
    di MangaDetail; `/manga/{id}/feed` (lebih berat, per-chapter detail)
    hanya dipanggil saat benar-benar butuh detail per-chapter.

### `store/`
- Satu Redux store (`configureStore`) yang menggabungkan reducer dari
  `api/` (RTK Query) dan `librarySlice` (bookmark manga, status tracking
  anime — persisted lewat redux-persist + react-native-mmkv).
- `librarySlice` boleh membaca hasil `api/` (mis. menyimpan `mangaId` +
  metadata ringkas saat bookmark), tapi tidak melakukan fetch sendiri.

### `navigation/`
- Owns definisi route & param types.
- Tidak boleh berisi business logic atau data-fetching — navigator hanya
  merakit screen.

---

## 5. Konvensi kerja

- Package manager: **yarn v1** (bukan npm/pnpm) — konsisten dengan
  `yarn.lock` yang sudah ada.
- Perubahan struktur folder baru, dependency baru, atau migrasi harus
  di-propose dulu (lihat instruksi kerja di percakapan) sebelum dieksekusi.
- Setiap milestone selesai → update [TODO.md](./TODO.md), jangan biarkan
  drift dari rencana.
- Keputusan teknis dengan trade-off (pemilihan library, arsitektur data,
  dll.) dicatat di [DECISIONS.md](./DECISIONS.md), bukan cuma di commit
  message.
