# DECISIONS.md — Mangaholic

Log keputusan teknis: apa yang diputuskan, kenapa, alternatif apa yang
dipertimbangkan, dan trade-off yang diterima. Entry baru ditambah tiap kali
ada keputusan dengan trade-off nyata (bukan sekadar pilihan trivial) —
ditulis di sini, bukan cuma di commit message. Urutan kronologis, entry
terbaru di bawah.

---

## 001 — Proxy Cloudflare Worker untuk MangaDex API (bukan direct fetch)

**Tanggal:** 2026-09-11
**Status:** Diterapkan (proxy sudah live)

**Konteks:** MangaDex diblokir oleh ISP di Indonesia lewat DNS blocking sejak
November 2024. Direct fetch dari device pengguna di Indonesia ke
`api.mangadex.org` akan gagal resolve DNS-nya, membuat fitur browse/baca
manga tidak bisa dipakai oleh target user utama app ini.

**Keputusan:** Semua request ke MangaDex API dari app di-route lewat
Cloudflare Worker (`mangadex-proxy`, repo terpisah di
`../mangadex-proxy`), live di
`https://mangadex-proxy.mangaholic.workers.dev`. Worker forward request ke
MangaDex API asli dan meneruskan response balik ke app.

**Alternatif yang dipertimbangkan:**
- *DNS-over-HTTPS custom di app* — tidak menyelesaikan masalah kalau
  blocking di level lebih dari DNS (deep packet inspection/IP block), dan
  menambah kompleksitas di client untuk masalah yang lebih tepat diselesaikan
  di server.
- *VPN/proxy pihak ketiga* — di luar kendali, tidak reliable untuk app
  publik, ketergantungan pada layanan yang bisa berubah/mati kapan saja.

**Trade-off yang diterima:** app sekarang punya dependency ke infrastruktur
tambahan (Cloudflare Worker) yang perlu di-maintain terpisah dari app —
kalau worker down, seluruh fitur manga ikut down. Diterima karena
alternatifnya (direct fetch) sudah pasti gagal total untuk user di
Indonesia, jadi bukan trade-off opsional.

---

## 002 — React Native CLI (bare) dipilih daripada Expo

**Tanggal:** 2026-09-11
**Status:** Diterapkan (project sudah di-scaffold dengan RN CLI)

**Konteks:** Perlu pilih base tooling React Native untuk project portofolio.
Developer belum comfortable klaim Expo sebagai skill, jadi pemilihan tidak
boleh berdasar kebiasaan/default tanpa alasan konkret.

**Keputusan:** React Native CLI (bare workflow). Detail trade-off lengkap
ada di [AGENTS.md §1](./AGENTS.md#1-react-native-cli-vs-expo--keputusan).

**Ringkasan alasan:** signal portofolio untuk kapabilitas native-level
(gradle, CocoaPods, linking manual) lebih relevan untuk role mid-senior RN;
menghindari klaim skill Expo yang belum solid; kontrol penuh untuk
optimasi native di reader manga (image-heavy).

**Trade-off yang diterima:** setup awal lebih berat (Xcode & Android
Studio harus terkonfigurasi), upgrade versi RN manual (tidak ada
`expo upgrade`).

---

## 003 — AniList dipilih daripada Jikan untuk metadata anime & jadwal tayang

**Tanggal:** 2026-09-11
**Status:** Diterapkan di rencana (implementasi di Milestone 1, TODO.md)

**Konteks:** Butuh sumber data anime metadata + jadwal tayang untuk fitur
browse anime & tracking. Dua kandidat utama: AniList API (GraphQL, resmi)
dan Jikan (REST, unofficial wrapper di atas data MyAnimeList).

**Keputusan:** AniList GraphQL API.

**Alasan:**
- **Reliabilitas & rate limit** — AniList adalah API resmi milik AniList
  dengan rate limit yang jelas didokumentasikan (~90 req/menit) dan uptime
  yang predictable. Jikan adalah proyek open-source pihak ketiga yang
  scraping/wrap data MyAnimeList — historically punya isu downtime dan rate
  limit lebih ketat (~1 req/detik), berisiko untuk UX browse/search yang
  perlu banyak request singkat.
- **Endpoint jadwal tayang** — AniList punya query `AiringSchedule` yang
  didesain spesifik untuk kebutuhan "kapan episode berikutnya tayang",
  cocok langsung untuk fitur jadwal tayang MVP. Jikan tidak punya endpoint
  setara yang sekuat ini.
- **Portofolio signal** — AniList pakai GraphQL, jadi implementasi ini
  sekaligus menunjukkan kemampuan kerja dengan GraphQL client di RN
  (query design, fragment, variables) — skill tambahan yang tidak didapat
  kalau pakai REST API biasa.
- **Tidak butuh auth** untuk query publik (search, detail, schedule), jadi
  tidak menambah kompleksitas auth ke MVP yang memang belum butuh backend.

**Trade-off yang diterima:** basis data AniList berbeda dari MyAnimeList
(rating, genre tagging, community score bisa sedikit berbeda) — user
Indonesia yang lebih familiar dengan MAL mungkin merasa data "kurang
familiar" dibanding kalau pakai Jikan/MAL. Diterima karena reliabilitas API
lebih penting untuk MVP yang perlu jalan stabil, dan datanya tetap
anime yang sama (hanya sumber metadata beda platform).

---

## 004 — NativeWind, lucide-react-native, RTK Query sebagai basis
styling/icon/data-fetching

**Tanggal:** 2026-09-11
**Status:** Diterapkan di rencana (instalasi di Milestone 0, TODO.md)

**Konteks:** Perlu basis styling, icon set, dan data-fetching/caching layer
yang konsisten sebelum mulai kerja UI, ditentukan developer secara langsung.

**Keputusan:**
- **Styling:** NativeWind (Tailwind CSS untuk React Native). Design tokens
  dari sintesis DESIGN.md didefinisikan di `tailwind.config.js`, component
  styling pakai `className` — bukan `StyleSheet.create` manual.
- **Icon:** lucide-react-native (+ `react-native-svg` sebagai peer
  dependency).
- **Data fetching & caching:** Redux Toolkit Query (RTK Query). `api/`
  layer diimplementasi sebagai `createApi` slices (`mangadexApi`,
  `animeApi`) dengan `transformResponse` untuk memetakan response mentah ke
  domain type.

**Implikasi arsitektur:** RTK Query butuh Redux store, jadi state
management project ini otomatis jadi Redux Toolkit (bukan Zustand/Context
API/library lain) — bukan pilihan terpisah, melainkan konsekuensi langsung
dari memilih RTK Query. Local persisted state (bookmark manga, tracking
status anime) jadi Redux slice biasa (`librarySlice`) yang hidup di store
yang sama, lihat entry 005 untuk storage adapter-nya. Detail folder &
ownership: lihat [AGENTS.md §2–4](./AGENTS.md#2-arsitektur--gambaran-umum).

**Trade-off yang diterima:** NativeWind menambah langkah konfigurasi build
(babel plugin, metro config) yang bisa jadi sumber error saat upgrade RN
versi baru — diterima karena utility-first styling jauh mempercepat
iterasi UI dibanding `StyleSheet.create` manual per component. RTK Query
menambah boilerplate awal (setup store, provider) dibanding
`fetch`+`useState` sederhana — diterima karena auto-caching, loading/error
state otomatis, dan cache invalidation sangat mengurangi state management
manual yang berulang di tiap screen.

---

## 005 — react-native-mmkv + redux-persist untuk local persisted state

**Tanggal:** 2026-09-11
**Status:** Diterapkan di rencana (instalasi di Milestone 0, TODO.md)

**Konteks:** Bookmark manga & tracking status anime (entry 004) perlu
persist di local storage. Dua kandidat storage adapter untuk
`redux-persist`: `react-native-mmkv` vs
`@react-native-async-storage/async-storage`.

**Keputusan:** react-native-mmkv.

**Alasan:** native module synchronous, jauh lebih cepat dibanding
AsyncStorage yang async dan berbasis file I/O. Project sudah bare React
Native CLI (lihat entry 002), jadi linking native module bukan hambatan
tambahan — justru selaras dengan alasan memilih RN CLI (kontrol native
penuh).

**Trade-off yang diterima:** AsyncStorage lebih umum dipakai & lebih banyak
contoh/tutorial di ekosistem RN, jadi MMKV sedikit menambah kurva belajar
di awal. Diterima karena data yang disimpan kecil dan sederhana (list
bookmark/tracking), jadi risiko kompleksitas MMKV rendah, sementara
keuntungan performa & signal familiaritas dengan native storage module
tetap didapat.

---

## 006 — Fitur anime ditunda, fokus MVP awal hanya manga

**Tanggal:** 2026-09-11
**Status:** Diterapkan (scope MVP dipersempit — lihat TODO.md bagian
Deferred)

**Konteks:** Setelah AniList dipilih sebagai sumber data anime (entry 003),
developer menilai beban implementasi + risiko rate limit untuk fitur anime
(browse, jadwal tayang, tracking) terlalu berat untuk dikerjakan bersamaan
dengan fitur manga di tahap awal. Manga adalah fitur inti (baca chapter
lewat proxy MangaDex, entry 001) dan lebih kompleks dari sisi teknis
(reader page-by-page/continuous scroll) — lebih baik solid dulu sebelum
menambah domain data kedua.

**Keputusan:** Semua pekerjaan terkait anime (`animeApi`, tab navigasi
Anime, screen browse/detail/jadwal, tracking status) dipindah ke bagian
"Deferred" di TODO.md, di luar urutan milestone utama. Milestone 0–5 fokus
100% ke manga: setup, data layer manga, navigasi (tab Manga + Library
saja), UI manga, personal library (bookmark manga saja).

**Ini bukan pembatalan keputusan entry 003** — AniList tetap pilihan yang
akan dipakai kalau/ketika fitur anime dilanjutkan. Yang berubah hanya
urutan pengerjaan, bukan pilihan teknis.

**Kondisi untuk dilanjutkan:** setelah fitur manga (Milestone 0–5 di
TODO.md) selesai dan stabil, re-evaluasi apakah fitur anime dikerjakan
sebagai lanjutan langsung atau tetap backlog — catat keputusan lanjutan
itu sebagai entry baru di sini, jangan diam-diam dikerjakan tanpa update
dokumen.

**Trade-off yang diterima:** scope MVP yang bisa didemokan lebih sempit
(hanya manga) dalam jangka pendek — diterima karena portofolio yang
menunjukkan satu fitur (reader manga) benar-benar solid lebih kuat
daripada dua fitur setengah jadi.

---

## 007 — Navigasi 3 tab (Browse, Search, Library) tanpa header global

**Tanggal:** 2026-09-13
**Status:** Diterapkan di rencana (implementasi di Milestone 3, TODO.md)

**Konteks:** Rencana awal (entry sebelumnya) menempatkan search sebagai
bagian dari Browse screen, dengan 2 tab (Manga, Library). Diputuskan untuk
memisahkan Search jadi tab tersendiri, dan menegaskan aturan navigasi:
tidak ada header global/tradisional di seluruh app.

**Keputusan:**
- Bottom tab: **Browse, Search, Library** (3 tab, bukan 2) — Search
  dapat ruang penuh untuk fokus-nya sendiri (input auto-focus, hasil full
  screen) alih-alih berbagi ruang dengan grid Browse.
- **Tidak ada top nav-bar seragam** di semua screen (pola React
  Navigation default: `headerShown: false` di seluruh stack). Setiap
  screen mendefinisikan header kontekstualnya sendiri — detail lengkap
  di [DESIGN.md § Navigasi](./DESIGN.md).
- MangaDetail & Reader diakses via push dari stack tab masing-masing,
  bukan tab tersendiri (kontennya full-screen, sementara).

**Alasan:** konten manga/anime (cover, halaman chapter) paling diuntungkan
dari ruang layar maksimal. Header generik React Navigation (title tengah +
back kiri, tinggi tetap di semua screen) adalah chrome yang tidak perlu di
Browse (judul cukup inline), tidak perlu di Search (search bar sendiri
sudah jadi "header"), dan aktif merusak pengalaman di Reader (harus
minimal/hilang saat membaca) serta MangaDetail (butuh hero cover besar,
bukan title bar kecil).

**Trade-off yang diterima:** setiap screen butuh implementasi header
sendiri (lebih banyak kode dibanding pakai `Stack.Screen options={{title}}`
bawaan), dan konsistensi visual antar-header harus dijaga manual lewat
DESIGN.md, bukan otomatis dari satu komponen header React Navigation.
Diterima karena kontrol visual penuh ini yang memungkinkan pola
collapsible header di MangaDetail dan chrome-less Reader — keduanya tidak
bisa dicapai dengan header bawaan.

---

## 008 — Reactotron untuk debugging API & state (dev-only)

**Tanggal:** 2026-09-14
**Status:** Diterapkan

**Konteks:** Sebelum mulai Milestone 4, dibutuhkan cara inspeksi request
`mangadexApi` (RTK Query) dan perubahan Redux state (termasuk MMKV-persisted
`library`) tanpa `console.log` manual — terutama karena data layer sudah
lumayan kompleks (title-fallback, externalUrl, at-home/server token) dan
akan makin banyak dipakai di Milestone 5–9.

**Keputusan:** pasang `reactotron-react-native` + `reactotron-redux`
sebagai **devDependencies** saja:
- `src/config/ReactotronConfig.ts` — konfigurasi Reactotron (`.useReactNative()`
  untuk network monitoring otomatis atas `fetch`/XHR yang dipakai
  `fetchBaseQuery`, plus plugin `reactotronRedux()`).
- Diimpor lewat `require()` yang dibungkus `if (__DEV__)` di `index.js`
  (inisialisasi sedini mungkin) — bukan `import` statis, supaya bundler
  tidak menariknya ke build release sama sekali.
- `src/store/index.ts` menambahkan `reactotronRedux().createEnhancer()`
  ke `enhancers` Redux store, juga di-guard `__DEV__ && NODE_ENV !== 'test'`
  (Jest tidak punya `XMLHttpRequest` global yang dibutuhkan interceptor
  networking Reactotron).

**Alasan:** dibanding Flipper (lebih berat setup-nya untuk RN versi baru,
New Architecture masih belum semua plugin kompatibel) atau
`console.log`/React Native DevTools manual, Reactotron memberi: log network
request/response RTK Query otomatis (tanpa ubah kode api layer sama
sekali), timeline Redux action + state diff, dan tidak nempel ke bundle
produksi karena ada di `devDependencies` dan di-guard `__DEV__`.

**Trade-off yang diterima:** butuh Reactotron desktop app terpisah untuk
benar-benar melihat log (kalau app-nya tidak jalan, RN cuma retry koneksi
websocket diam-diam di background — tidak crash, sudah diverifikasi jalan
normal di emulator tanpa Reactotron app terbuka). Juga menambah sedikit
percabangan `__DEV__`/`NODE_ENV` di `store/index.ts` yang harus tetap
dijaga saat refactor store nanti.

---

## 009 — Font custom per-weight sebagai family terpisah (bukan satu family + fontWeight)

**Tanggal:** 2026-09-14
**Status:** Diterapkan (Milestone 4)

**Konteks:** Saat bundling Fraunces & Inter sebagai font native (follow-up
Milestone 1), pola web biasa — satu `fontFamily: 'Inter'` lalu switch
tebal-tipis lewat CSS `font-weight` — **tidak berlaku** di React Native.
Font custom yang di-embed cuma merender pada weight aslinya; style
`fontWeight` di `<Text>` tidak mengubah rendering font custom (beda
dengan font sistem yang punya varian bold otomatis).

**Keputusan:** setiap weight Inter yang dipakai di DESIGN.md (400
Regular, 500 Medium, 600 SemiBold) di-bundle sebagai **file & nama
family terpisah** (`Inter-Regular.ttf`, `Inter-Medium.ttf`,
`Inter-SemiBold.ttf`), begitu juga Fraunces (cuma butuh 600 SemiBold
untuk heading). `tailwind.config.js` memetakan tiap file ke utility
sendiri: `font-sans` (Regular/400), `font-sans-medium` (500),
`font-sans-semibold` (600), `font-heading` (Fraunces SemiBold).

**Alasan:** ini satu-satunya cara embed-font custom render weight yang
benar secara konsisten di Android **dan** iOS tanpa bold sintetis yang
tidak akurat (beda hasil render antar platform kalau dipaksa pakai
`fontWeight` di atas satu family).

**Trade-off yang diterima:** kalau nanti ada tambahan weight baru
(mis. Inter Bold 700 untuk kebutuhan tertentu), harus fetch font file
baru + tambah entry `fontFamily` baru — bukan sekadar ubah
`fontWeight`. Konvensi ini harus diikuti developer berikutnya: **jangan**
pakai `font-semibold`/`font-bold` Tailwind bawaan di atas `font-sans`
untuk teks yang butuh tebal — selalu pakai `font-sans-medium` /
`font-sans-semibold` sesuai typography token yang dituju di DESIGN.md.
