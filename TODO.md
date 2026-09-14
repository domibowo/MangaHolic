# TODO.md — Mangaholic

Roadmap milestone, scope **manga-only** (anime ditunda — lihat
[bagian Deferred](#deferred--anime) dan [DECISIONS.md #006](./DECISIONS.md#006)).
Urutan: **Init → Data layer → Navigasi → Theme → Browse → Search →
MangaDetail → Reader → Library → Polish**. Update checklist ini tiap
milestone selesai — jangan biarkan drift dari rencana. Lihat
[AGENTS.md](./AGENTS.md) untuk struktur folder/ownership,
[DESIGN.md](./DESIGN.md) untuk design tokens & aturan navigasi, dan
[DECISIONS.md](./DECISIONS.md) untuk alasan tiap pilihan teknis.

Checklist item ditandai `[x]` hanya setelah diverifikasi jalan (build/run,
bukan cuma kode ditulis).

---

## Milestone 1 — Project Init & Setup

Stack: React Native CLI (bare) — keputusan & trade-off di
[AGENTS.md §1](./AGENTS.md#1-react-native-cli-vs-expo--keputusan) dan
[DECISIONS.md #002](./DECISIONS.md#002). Dependency yang diinstal:
NativeWind, lucide-react-native + react-native-svg, @reduxjs/toolkit +
react-redux, redux-persist + react-native-mmkv, React Navigation
(native-stack + bottom-tabs) + native deps.

> Ditemukan saat instalasi: `react-native-mmkv` v4 (Nitro-based) butuh
> `react-native-nitro-modules`; NativeWind v4 butuh `react-native-reanimated`
> (+ `react-native-worklets` sebagai peer-nya) — dicatat di
> [DECISIONS.md #004](./DECISIONS.md#004).

- [x] Init project React Native CLI, konfigurasi NativeWind
      (`tailwind.config.js`, babel plugin, metro config, `global.css`)
- [x] Install lucide-react-native + react-native-svg — **Android**
      terverifikasi render di emulator; **iOS** belum (lihat catatan)
- [x] Install Redux Toolkit + react-redux, `src/store/index.ts`
      (configureStore + `librarySlice` minimal), wire `<Provider>` di
      `App.tsx`
- [x] Install redux-persist + react-native-mmkv, `src/store/persist.ts`
      (storage adapter untuk `librarySlice` — ini yang jadi basis Library
      screen di Milestone 9, setara "storage/library.js" tapi via Redux
      slice, bukan modul storage berdiri sendiri, konsisten dengan
      arsitektur RTK Query di AGENTS.md)
- [x] Install React Navigation (native-stack + bottom-tabs) + native deps,
      `RootNavigator` placeholder dengan 1 screen
- [x] Sanity check: `tsc --noEmit`, `eslint`, `jest` bersih. **Android**:
      `gradlew assembleDebug` sukses, APK jalan di emulator (`Android_17`)
      — styling NativeWind, icon lucide, toggle bookmark Redux+MMKV
      berfungsi & **persist setelah app di-`force-stop` total**. Warning
      non-blocking: `ImageBackground is deprecated` (dari internal React
      Navigation, bukan kode kita). **iOS**: `pod install` sukses (94 pods
      ter-link), tapi run & verifikasi visual **belum dilakukan** —
      environment kerja ini hanya punya Xcode Command Line Tools, bukan
      Xcode penuh. **Perlu dicoba manual di Mac dengan Xcode sebelum
      dianggap selesai di iOS.**

**Follow-up belum tercakup:** font Fraunces & Inter (DESIGN.md) belum
di-bundle sebagai asset native — saat ini fallback ke font sistem. Task
terpisah: unduh font files → `src/assets/fonts` → konfigurasi
`react-native.config.js` assets → link.

## Milestone 2 — Data Layer (`src/api/`, `src/types/`)

Semua request manga lewat proxy Cloudflare Worker
`https://mangadex-proxy.mangaholic.workers.dev` (lihat
[DECISIONS.md #001](./DECISIONS.md#001)) — **jangan** fetch langsung ke
`api.mangadex.org`. Kalau butuh endpoint baru atau perubahan caching di
proxy, catat kebutuhannya di sini sebagai note, jangan ubah kode proxy
dari repo ini (proxy = repo terpisah `mangadex-proxy`).

- [x] Definisikan domain types di `src/types/manga.ts`: `Manga`,
      `MangaListItem`, `Chapter`, `AggregateVolume`/`AggregateChapter`,
      `ChapterPages`, `Tag`, `Author` — dipetakan dari response asli
      MangaDex lewat `transformResponse` di `src/api/mangadexMappers.ts`
      (kuirk cover URL & token `/at-home/server` — lihat
      [AGENTS.md § api/](./AGENTS.md#api))
- [x] `src/api/mangadexApi.ts` (RTK Query `createApi`, `baseUrl` = proxy).
      8 endpoint (path sama persis dengan MangaDex API asli), **semua
      sudah di-smoke-test ke proxy sungguhan dan lolos**:
      - [x] `GET /manga?title=&limit=&offset=&includes[]=cover_art` —
            search/browse manga. **Catatan implementasi:** ditambah
            `includes[]=cover_art` (tidak ada di spec awal) — tanpa ini
            grid Browse tidak akan punya cover thumbnail sama sekali,
            karena relationship `cover_art` di response list tidak
            include `attributes.fileName` kecuali diminta eksplisit
      - [x] `GET /manga/{id}?includes[]=cover_art,author,artist` — detail
            manga (cover & author sekali fetch)
      - [x] `GET /manga/{id}/feed?translatedLanguage[]=en&order[chapter]=asc`
            — daftar chapter per-chapter detail (dipakai saat butuh detail
            lengkap, bukan default MangaDetail — lihat AGENTS.md)
      - [x] `GET /manga/{id}/aggregate` — ringkasan volume+chapter, lebih
            ringan; ini yang dipakai default di MangaDetail (Milestone 7)
      - [x] `GET /at-home/server/{chapterId}` — base URL + token halaman
            chapter untuk Reader, dirakit langsung jadi `pageUrls` penuh
            (bukan expose baseUrl/hash mentah). `keepUnusedDataFor: 0` di
            RTK Query (token sesi sementara, jangan di-cache) — lihat
            AGENTS.md
      - [x] `GET /cover/{id}` atau field `fileName` dari relationship
            `cover_art` — dirakit `transformResponse` jadi
            `https://uploads.mangadex.org/covers/{mangaId}/{fileName}`
      - [x] `GET /manga/tag` — list genre/tag, dipakai untuk sticky filter
            chip di Browse (Milestone 5)
      - [x] `GET /author/{id}` — detail author/artist
- [x] Error normalization (`transformErrorResponse`) konsisten di seluruh
      endpoint — memetakan `{errors[0].detail}` dari response error
      MangaDex (format terverifikasi lewat smoke test 404 sungguhan)
- [x] Smoke test **dieksekusi** (bukan cuma baca JSON manual) — script
      TS yang mengimpor langsung `mangadexMappers.ts` dan memanggil proxy
      sungguhan untuk 8 endpoint, assert bentuk output. Semua lolos.
      Temuan penting selama smoke test:
      - `attributes.title` sering **tidak punya key `en`** (mis. One
        Piece cuma punya `ja-ro`) — judul Inggris nyempil di salah satu
        `altTitles`. Fixed: cari `en` di `altTitles` dulu sebelum fallback
        ke romanisasi.
      - Banyak chapter (terutama manga yang di-simulpub resmi, mis. One
        Piece via MangaPlus) punya `externalUrl` terisi + `pages: 0` —
        **tidak bisa dibaca via `/at-home/server`** (akan 404). Domain
        type `Chapter` sekarang punya field `externalUrl`/`pageCount`
        eksplisit supaya Reader (Milestone 8) **wajib** cek ini sebelum
        fetch halaman — buka link eksternal alih-alih nge-reader-in.
      - Wire `mangadexApi.reducer`/`middleware` ke `store/index.ts`,
        di-blacklist dari `redux-persist` (cache RTK Query server-state
        tidak boleh ikut persist ke MMKV, cuma `library` slice).

## Milestone 3 — Navigasi

Aturan: **tanpa header global/tradisional** — lihat
[DESIGN.md § Navigasi](./DESIGN.md). Bottom tab bar adalah satu-satunya
chrome navigasi persisten; tiap screen atur header kontekstualnya sendiri.

- [x] `src/navigation/types.ts`: route map & param types (3 tab: Browse,
      Search, Library; `DetailStackParamList` generik untuk MangaDetail &
      Reader supaya bisa dipakai di ketiga stack tanpa duplikasi komponen)
- [x] `RootNavigator`: bottom tabs (Browse, Search, Library) — tab Anime
      **belum dibuat**, lihat [Deferred](#deferred--anime)
- [x] Konfigurasi native-stack per tab dengan `headerShown: false` default
      (header kontekstual dibuat manual per screen, bukan header bawaan
      React Navigation)
- [x] Placeholder screen untuk Browse/Search/MangaDetail/Reader/Library —
      navigasi end-to-end **diverifikasi jalan di emulator sungguhan**:
      switch antar tab, push Browse→MangaDetail→Reader, tab bar
      disembunyikan di MangaDetail & Reader lalu muncul lagi setelah back,
      Library screen baca `librarySlice` yang sama dengan yang dites di
      Milestone 1 (bookmark dummy dari sesi lalu masih ada — MMKV
      persistence konsisten).

**Bug ditemukan & diperbaiki selama verifikasi runtime:** dua screen
(`Browse`, `Search`, `Library`, `MangaDetail`) awalnya import
`SafeAreaView` dari `react-native` (bukan
`react-native-safe-area-context`) — di Android ini **no-op**, menyebabkan
konten (judul "Mangaholic") bertabrakan dengan status bar. Diperbaiki ke
import yang benar.

Bug kedua yang lebih signifikan: **icon di tab bar ter-clip nyaris 0px
tinggi** (baik icon lucide/SVG maupun `View` polos — dikonfirmasi lewat
eksperimen isolasi, jadi ini bug layout, bukan bug SVG). Root cause:
`tabBarStyle.height` dari token DESIGN.md awal (56px content + inset
bawah) tidak cukup untuk kalkulasi tinggi icon+label internal
`@react-navigation/bottom-tabs` v7 di setup edge-to-edge Android (RN 0.87
default `edgeToEdgeEnabled=true`). Fix: naikkan `TAB_BAR_CONTENT_HEIGHT`
ke 80px (dikonfirmasi lewat trial nilai 56 → masih clip, 64 → masih clip,
80 → render sempurna). Token `components.tab-bar.height` di DESIGN.md
sudah diupdate ke 80px supaya tidak drift dari implementasi nyata.

## Milestone 4 — Theme

- [x] Verifikasi token warna/tipografi/spacing/radius di
      `tailwind.config.js` sinkron dengan [DESIGN.md](./DESIGN.md) — tidak
      ada yang ketinggalan; hanya `rounded-full` yang tidak dipetakan
      eksplisit (dibiarkan pakai default Tailwind `9999px`, sudah sama
      persis dengan token `rounded.full`)
- [x] Bundle font Fraunces & Inter sebagai asset native (follow-up dari
      Milestone 1) — `assets/fonts/{Inter-Regular,Inter-Medium,
      Inter-SemiBold,Fraunces-SemiBold}.ttf`, di-link ke
      `android/app/src/main/assets/fonts/` dan ke
      `ios/MangaHolic.xcodeproj` (`UIAppFonts` di Info.plist +
      Resources build phase) lewat `npx react-native-asset` (dipanggil
      sekali via `npx`, bukan dependency permanen). **Diverifikasi jalan
      di emulator Android sungguhan** — screenshot menunjukkan judul
      "Mangaholic" render pakai Fraunces serif asli dan body/button teks
      pakai Inter asli, bukan fallback font sistem.
- [x] Komponen dasar reusable di `src/components/`: `Button` (primary/
      secondary/ghost), `Chip` (genre, dengan state `selected` untuk
      dipakai sebagai filter chip di Milestone 5), `Badge` (status manga +
      varian "new") — sudah dipakai langsung menggantikan `Pressable`
      manual di Browse/Search/MangaDetail, diverifikasi render benar di
      emulator (lihat catatan bug font-weight di bawah)

**Temuan saat implementasi:** font custom yang di-embed di RN **tidak
ikut `fontWeight` style** — beda dari CSS web `@font-face` yang bisa satu
family menampung banyak weight. Karena itu tiap weight Inter yang dipakai
DESIGN.md (400/500/600) di-bundle sebagai **file & nama family terpisah**
(`Inter-Regular`, `Inter-Medium`, `Inter-SemiBold`), dan
`tailwind.config.js` menambah utility `font-sans-medium` /
`font-sans-semibold` di samping `font-sans` default. Pola lama
`font-sans ... font-semibold` (tidak akan efektif menebalkan font custom)
sudah diganti ke `font-sans-semibold` di semua screen yang pakai gaya
`button` (weight 600).

## Milestone 5 — Screen Browse

- [ ] Grid manga (cover-forward, 2 kolom — lihat DESIGN.md §3 Layout)
      dari `mangadexApi` endpoint search/populer
- [ ] Sticky filter chip row (genre) yang nempel saat grid discroll
- [ ] Loading/error/empty state dari RTK Query
- [ ] Judul "Mangaholic" inline di atas (bukan header terpisah, sesuai
      DESIGN.md)

## Milestone 6 — Screen Search

- [ ] `search-input` sebagai "header" screen (nempel di atas, auto-focus
      saat tab dibuka)
- [ ] Debounced query ke `mangadexApi` search endpoint
- [ ] Hasil pencarian: reuse komponen grid/list dari Browse (jangan
      duplikat card manga)
- [ ] Empty state untuk query kosong & hasil kosong

## Milestone 7 — Screen MangaDetail

- [ ] Collapsible header: hero cover full-width → mengecil jadi compact
      bar (judul + back) saat discroll (lihat DESIGN.md)
- [ ] Tombol back & bookmark melayang di atas hero dengan scrim tipis
- [ ] Deskripsi/sinopsis + daftar chapter dari `mangadexApi`
- [ ] Aksi bookmark (tambah/hapus) terhubung ke `librarySlice`
- [ ] Tap chapter → push ke Reader

## Milestone 8 — Screen Reader

- [ ] **Cek `chapter.externalUrl` sebelum fetch halaman** — kalau terisi
      (chapter di-simulpub resmi, tidak di-host MangaDex), jangan panggil
      `getAtHomeServer` (akan 404). Tampilkan CTA "Baca di situs resmi"
      yang buka `externalUrl` (browser/WebView), bukan reader in-app.
      Ditemukan saat smoke test Milestone 2 — cukup umum (mis. semua
      chapter awal One Piece).
- [ ] Tanpa header default; `reader-toolbar` overlay muncul on-demand
      saat tap layar (page indicator + tombol kembali)
- [ ] Mode page-by-page (mode awal)
- [ ] Mode continuous scroll (tambahan setelah page-by-page stabil)
- [ ] Full-bleed image, tanpa padding horizontal (lihat DESIGN.md)

## Milestone 9 — Screen Library

- [ ] Judul inline (tanpa header terpisah, sama seperti Browse)
- [ ] List bookmark manga dari `librarySlice` (MMKV-persisted)
- [ ] Empty state untuk library kosong
- [ ] Verifikasi ulang persistence: bookmark bertahan setelah app
      di-kill total dan dibuka ulang (sudah pernah diuji dengan data
      dummy di Milestone 1 — ulangi dengan data manga asli)

## Milestone 10 — Polish & Fitur Lanjutan (backlog, belum diurutkan)

- [ ] Dark mode (NativeWind `dark:` variant)
- [ ] Offline cache untuk chapter yang sudah dibaca
- [ ] App icon & splash screen sesuai DESIGN.md
- [ ] Review aksesibilitas dasar (kontras warna, ukuran tap target)

---

## Deferred — Anime

Fitur anime (browse metadata, jadwal tayang, tracking status) **ditunda**,
bukan dibatalkan — alasan & kondisi untuk dilanjutkan ada di
[DECISIONS.md #006](./DECISIONS.md#006). Dikerjakan setelah Milestone
1–9 di atas solid.

- [ ] `animeApi` (RTK Query, base URL = AniList GraphQL — lihat
      DECISIONS.md #003): endpoint search anime, detail anime, jadwal
      tayang
- [ ] Domain types: `AnimeEntry`, `AiringScheduleEntry`
- [ ] Tab navigasi Anime + stack-nya
- [ ] Screen browse/detail/jadwal anime
- [ ] Aksi tracking status (belum nonton / nonton) terhubung ke
      `librarySlice`
- [ ] Section tracking anime di Library screen

---

## Kebutuhan proxy (dicatat, dikerjakan di repo `mangadex-proxy`)

Bagian ini untuk mencatat kebutuhan yang menyentuh proxy — endpoint baru,
perubahan caching, dll — supaya diurus terpisah, **bukan** dieksekusi dari
repo app ini.

_(belum ada catatan — diisi saat Milestone 2 berjalan kalau ditemukan
kebutuhan endpoint/caching baru)_

---

## Eksplisit di luar scope MVP

- Streaming/nonton anime — hanya metadata & tracking, saat fitur anime
  dilanjutkan (lihat konteks di DECISIONS.md)
- Auth/backend — library disimpan lokal dulu
