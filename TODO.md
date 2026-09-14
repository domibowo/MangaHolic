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
            `cover_art` — dirakit `transformResponse` jadi URL lewat proxy
            (`{MANGADEX_PROXY_BASE_URL}/covers/{mangaId}/{fileName}`, bukan
            `uploads.mangadex.org` langsung — lihat catatan Milestone 5)
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

**Bug ditemukan & diperbaiki saat mulai Milestone 5:** `buildMangaDexQuery`
di `queryString.ts` menambahkan `[]` lagi ke key array yang **sudah**
membawa `[]` sendiri di titik pemanggilan (mis. `'includes[]': [...]`) —
hasilnya jadi `includes[][]` yang ditolak MangaDex dengan
`400 validation_exception`. Ini artinya `searchManga` (dengan
`includes[]=cover_art`), `getMangaDetail`, `getMangaFeed`, dan
`getMangaAggregate` **sebenarnya rusak sejak Milestone 2** — lolos smoke
test sebelumnya kemungkinan karena smoke test test manual tidak menguji
kombinasi tepat ini. Diperbaiki dengan tidak menambah `[]` ekstra di
`queryString.ts`; sudah diverifikasi ulang via `curl` langsung ke proxy
untuk keempat endpoint tersebut — semua `"result":"ok"`.

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

- [x] Grid manga (cover-forward, 2 kolom — lihat DESIGN.md §3 Layout) dari
      `mangadexApi.searchManga` — mode "populer" (tanpa `title`, sorted
      `order[followedCount]=desc`). Card baru `src/components/MangaCard.tsx`
      (dipakai bersama lagi di Milestone 6). **Catatan penyimpangan dari
      DESIGN.md:** metadata di bawah judul harusnya "jumlah chapter", tapi
      search endpoint MangaDex tidak mengembalikan hitungan chapter per
      manga (butuh `/aggregate` terpisah per item, terlalu berat untuk
      grid) — diganti status manga (Ongoing/Completed/dst) sebagai metadata.
- [x] Sticky filter chip row (genre, dari `GET /manga/tag` difilter
      `group === 'genre'`) yang nempel saat grid discroll — filter
      terhubung ke `searchManga({ includedTags })`. **Diverifikasi jalan di
      emulator sungguhan**, termasuk scroll test yang membuktikan chip row
      benar-benar nempel di atas sementara judul & grid discroll di
      baliknya.
- [x] Loading/error/empty state dari RTK Query (`isLoading`/`isError`/
      grid kosong) — direalisasikan sebagai entri list, bukan
      `ListEmptyComponent` (supaya judul+filter chip tetap tampil di semua
      state, bukan cuma saat ada data)
- [x] Judul "Mangaholic" inline di atas (`ListHeaderComponent`, scroll
      bersama grid — sesuai DESIGN.md, beda dari filter chip yang sticky)

**Bug ditemukan & diperbaiki selama implementasi:**
1. `buildMangaDexQuery` men-double bracket key array yang sudah bawa `[]`
   sendiri (`includes[]` jadi `includes[][]`) — **merusak endpoint yang
   sudah "selesai" sejak Milestone 2** (`searchManga`, `getMangaDetail`,
   `getMangaFeed`, `getMangaAggregate`). Detail & verifikasi ulang di
   catatan Milestone 2 di atas.
2. `stickyHeaderIndices` FlatList awalnya diisi `[0]` (mengira index
   relatif ke `data`) — ternyata RN internal menghitung index itu
   **termasuk** offset `ListHeaderComponent` (`+1` kalau ada), jadi yang
   benar `[1]`. Salah nilai ini awalnya bikin judul "Mangaholic" yang malah
   nempel (bertabrakan aneh dengan card) dan filter chip ikut scroll
   hilang — kebalikan dari yang diinginkan. Ditemukan & diverifikasi lewat
   scroll test manual di emulator (screenshot before/after).

**Temuan infra — sudah diperbaiki:** cover manga awalnya tidak tampil sama
sekali di emulator (placeholder abu-abu terus) — diselidiki lewat
`curl -v` ke `uploads.mangadex.org` langsung dari mesin dev: TLS handshake
gagal dengan IP hasil resolve yang bukan IP Cloudflare asli (ciri DNS
hijack ISP). Domain CDN cover ternyata **ikut** diblokir ISP Indonesia,
bukan cuma `api.mangadex.org`. Ditambahkan route `/covers/*` di
`mangadex-proxy/src/index.ts` (passthrough biner ke `uploads.mangadex.org`,
cache 7 hari `immutable` karena filename cover content-addressed) — sudah
di-deploy ke produksi dan **diverifikasi jalan** lewat curl (JPEG utuh,
bisa dibuka) maupun di emulator sungguhan (grid Browse sekarang
menampilkan cover asli). `buildCoverUrl()` di `mangadexMappers.ts`
diupdate ke `MANGADEX_PROXY_BASE_URL` (konstanta baru di
`src/api/config.ts`, dipakai bersama oleh `mangadexApi.ts`). Lihat
[DECISIONS.md #001](./DECISIONS.md#001).

## Milestone 6 — Screen Search

- [x] `search-input` sebagai "header" screen (nempel di atas via
      `stickyContent` — sama seperti filter chip Browse, auto-focus saat
      tab dibuka via `autoFocus`)
- [x] Debounced query ke `mangadexApi.searchManga` (400ms, `skip` RTK
      Query kalau query kosong — tidak ada network call sebelum user ngetik)
- [x] Hasil pencarian: **diekstrak** `src/components/MangaGrid.tsx` dari
      logic Browse (chunking 2-kolom, loading/error/empty state,
      render `MangaCard`) supaya Search & Browse pakai komponen yang
      sama persis, bukan duplikat. `MangaGrid` juga meng-enkapsulasi kuirk
      `stickyHeaderIndices` yang ditemukan di Milestone 5 (konsumen tinggal
      pakai prop `stickyContent`, tidak perlu tahu offset internalnya).
- [x] Empty state untuk query kosong ("Ketik judul manga untuk mulai
      mencari.") & hasil kosong (`Tidak ada hasil untuk "<query>".`) — dua
      pesan berbeda, di-pass sebagai `emptyMessage` ke `MangaGrid` yang
      sama (bukan dua implementasi terpisah)

**Detail implementasi:** search-input sengaja selalu berada di posisi yang
sama di tree (selalu jadi `stickyContent` dari `MangaGrid` yang sama),
supaya tidak remount/kehilangan fokus keyboard saat transisi dari
"belum ada query" ke "ada hasil". Kalau tidak, `TextInput` akan pindah
parent antara render polos vs cell `FlatList`, yang bikin keyboard
sempat hilang-muncul tiap ketikan pertama.

**Diverifikasi jalan di emulator sungguhan:** ketik "solo" → hasil
pencarian relevan muncul (One-Punch Man, dst — MangaDex title-search pakai
relevance bukan substring literal, jadi hasil di luar dugaan itu perilaku
API yang benar, bukan bug), search bar tetap nempel di atas saat hasil
discroll, dan query tanpa hasil (`"solozzzzzzzzz"`) menampilkan empty
state yang benar. Browse juga diverifikasi ulang tetap jalan normal
setelah di-refactor pakai `MangaGrid` yang sama.

**Catatan tooling (bukan bug app):** `adb shell input text "..."` di
emulator sesi ini kadang memicu navigasi liar yang tidak berhubungan
(nyasar ke tab/screen lain) — root cause-nya IME/toolbar non-standar di
lingkungan sandbox ini, bukan bug React Navigation/app. Diverifikasi
ulang pakai `adb shell input keyevent KEYCODE_S KEYCODE_O ...` (satu
huruf per keyevent) dan hasilnya normal seperti disebut di atas.

## Milestone 7 — Screen MangaDetail

- [x] Collapsible header: hero cover full-width (`HERO_HEIGHT = 320`)
      discroll bersama konten; compact bar (judul + border bawah)
      **fade-in** lewat `Animated.Value` yang di-interpolate dari
      `onScroll` — bukan animasi tinggi hero literal (lebih murah secara
      performa, hasil visual yang sama: hero "hilang", compact bar
      "muncul"). `Animated.FlatList` dipakai (bukan ScrollView) supaya
      daftar chapter yang panjang tetap virtualized.
- [x] Tombol back & bookmark melayang di atas hero — **catatan
      penyimpangan dari DESIGN.md:** dipakai pattern `icon-button-circular`
      (bg `surface` solid, sudah established sejak Milestone 3/4) alih-alih
      scrim gradient gelap seperti disebut DESIGN.md, supaya tidak perlu
      dependency baru (`react-native-linear-gradient`) untuk manfaat visual
      yang relatif kecil. Kedua tombol selalu terlihat (tidak ikut fade),
      cuma compact bar di baliknya yang fade in/out.
- [x] Deskripsi/sinopsis (dari `getMangaDetail`) + daftar chapter (dari
      `getMangaAggregate`, bukan `getMangaFeed` — lebih ringan, sesuai
      catatan Milestone 2) — tiap baris `Vol. X Ch. Y`, chapter
      `isUnavailable` ditampilkan abu-abu & tidak bisa ditap
- [x] Aksi bookmark (tambah/hapus) terhubung ke `librarySlice` — icon
      `Bookmark` toggle `fill` kuning, **diverifikasi persisten** (state
      MMKV yang sama dites sejak Milestone 1)
- [x] Tap chapter → push ke Reader dengan `{mangaId, chapterId}`

**Catatan konten (bukan bug, ditemukan saat verifikasi):** deskripsi
manga dari MangaDex sering mengandung markdown mentah (`**bold**`,
`[link](url)`, dsb) yang saat ini dirender apa adanya sebagai plain text
(belum ada markdown parser). Dicatat sebagai item polish di Milestone 10,
bukan diperbaiki sekarang (di luar scope checklist Milestone 7).

**Bug ditemukan & diperbaiki (post-Milestone 7, dilaporkan user):**
urutan chapter di beberapa manga tidak berurutan (mis. "My Dress-Up
Darling": Vol.15 Ch.115.5→114.1 descending dengan benar, tapi lanjut ke
"Chapter 25, 69, 91, 105, 106, 110, 113.2, 113.1, 112.2" — campur aduk).
Penyebab: `mapAggregate` (`src/api/mangadexMappers.ts`) memakai
`Object.values()` langsung atas objek `volume.chapters` dari respons
MangaDex tanpa sorting eksplisit. Objek itu berisi campuran key
integer-index (`"25"`, `"69"`, `"110"`) dan key non-integer-index
(`"113.2"`, `"112.1"`) — spec ECMAScript **mewajibkan key integer-index
diiterasi lebih dulu secara ascending**, baru diikuti key string lain
sesuai urutan insersi asli. Jadi `Object.values()` menghasilkan urutan
"25, 69, 91, 105, 106, 110" (dipaksa ascending oleh JS engine) diikuti
"113.2, 113.1, 112.2, ..." (urutan asli dari API, descending) —
bukan bug di sisi API MangaDex, murni gotcha `Object.values()` di sisi
app. **Fix:** tambah `numericSortValue()` helper, sort eksplisit
`volume.chapters` dan `raw.volumes` berdasar `parseFloat()` (descending),
terlepas dari urutan key objek aslinya. Diverifikasi lewat simulasi
Node.js terhadap data asli My Dress-Up Darling (`aggregate` endpoint) —
urutan sekarang konsisten descending (115.5→114.1, lalu 113.2→...→112.2
dst, tanpa lompatan).

**Diverifikasi jalan di emulator sungguhan:** buka MangaDetail dari
Browse → hero cover render, badge/chip/authors/deskripsi tampil, scroll
ke bawah → compact bar fade-in dengan judul, daftar chapter ter-render
(`Vol. 1 Ch. 0` dst.) → tap bookmark → icon jadi kuning terisi → tap
chapter → push ke Reader dengan `chapterId` yang benar di route params.

## Milestone 8 — Screen Reader

- [x] **Cek `chapter.externalUrl` sebelum fetch halaman** — `Reader`
      memanggil `useGetMangaFeedQuery({ mangaId })`, mencari chapter yang
      cocok berdasar `chapterId`, dan cuma memanggil `getAtHomeServer`
      (`skip: true` kalau belum) setelah dipastikan `externalUrl` kosong.
      Kalau terisi, chapter dibuka **in-app lewat `react-native-webview`**
      (bukan `Linking.openURL` ke Chrome) supaya user tidak keluar dari
      Mangaholic — cuma tombol back overlay, tanpa toolbar/CTA tambahan.
      **Diverifikasi jalan berkali-kali di emulator sungguhan** — banyak
      manga populer (Solo Leveling, Chained Soldier semua chapter yang
      dicoba, The Eminence in Shadow) ternyata **seluruhnya** simulpub resmi
      di MangaDex (bukan cuma chapter awal seperti dugaan awal dari smoke
      test One Piece).
      **Temuan keamanan penting + mitigasi:** situs pembaca resmi pihak
      ketiga (dicoba: tappytoon.com) ternyata mem-force-redirect browser
      mobile ke situs spam (contoh: situs streaming bola Vietnam) via skrip
      iklan — dikonfirmasi **bukan bug WebView kita**, karena membuka URL
      persis yang sama langsung di Chrome sistem emulator menghasilkan
      redirect yang sama persis, sedangkan `curl` (tanpa eksekusi JS) dari
      host mendapat konten asli tanpa redirect. Kesimpulan: skrip iklan di
      halaman men-deteksi browser mobile dan redirect paksa via
      `window.location`/sejenisnya, terlepas dari WebView in-app atau
      browser eksternal. Dimitigasi dengan `onShouldStartLoadWithRequest`
      pada `WebView`: navigasi dibatasi tetap di base-domain dari
      `externalUrl` (dibandingkan lewat `new URL(...).hostname`), request ke
      domain lain diblokir; `setSupportMultipleWindows={false}` untuk cegah
      popup window baru. Diverifikasi ulang di emulator: chapter Solo
      Leveling Vol.1 Ch.1 (tappytoon.com) sekarang render konten asli
      ("I'M AN E-RANK HUNTER...") tanpa redirect ke spam.
- [x] Tanpa header default; overlay chrome (back, page indicator, toggle
      mode) muncul on-demand saat tap layar — pola sama seperti placeholder
      Milestone 3, cuma ditambah tombol toggle mode
- [x] Mode page-by-page (`FlatList horizontal pagingEnabled`, mode awal)
- [x] Mode continuous scroll (`FlatList` vertikal, toggle lewat icon
      `GalleryHorizontal`/`GalleryVertical` di toolbar) — kedua mode pakai
      `onViewableItemsChanged` yang sama untuk page indicator "X / Y" (lebih
      akurat daripada hitung dari scroll offset, karena tinggi tiap gambar
      manga tidak selalu 2:3 persis)
- [x] Full-bleed image (`resizeMode="contain"`, tanpa padding horizontal)

**Bug ditemukan & diperbaiki (dilaporkan user, khusus iOS):** di iOS,
sebagian chapter tidak bisa di-paging lewat swipe (macet di tengah) dan
swipe kiri→kanan malah keluar dari Reader kembali ke MangaDetail.
Penyebab: iOS native "swipe-back" gesture (`gestureEnabled` default true
di `createNativeStackNavigator`) berebutan dengan pan gesture
`FlatList horizontal pagingEnabled` — swipe dari/mendekati tepi kiri
layar (arah kanan) ditangkap gesture recognizer pop-screen bawaan iOS,
bukan oleh FlatList, sehingga page tidak snap sempurna (macet) atau
malah trigger `navigation.goBack()` kalau swipe-nya penuh. Ini murni
gesture-conflict khusus iOS (Android tidak punya native swipe-back
sehingga tidak kena bug ini). **Fix:** `options={{ gestureEnabled: false
}}` di `<Stack.Screen name="Reader">` pada ketiga stack navigator
(`BrowseNavigator`, `SearchNavigator`, `LibraryNavigator`) — tombol back
manual di overlay Reader tetap jadi satu-satunya jalan keluar (sudah ada
sejak awal). **Belum diverifikasi langsung di iOS simulator/device** oleh
Claude di sesi ini (lingkungan kerja tidak punya akses Xcode/simulator
iOS berjalan) — user perlu konfirmasi setelah `yarn ios` jalan. (halaman asli dari
`/at-home/server`, `externalUrl` chapter kosong)** — banyak manga populer
(Solo Leveling, Chained Soldier, The Eminence in Shadow, Berserk chapter
terbaru) ternyata `externalUrl`-nya terisi (simulpub resmi), jadi butuh
beberapa kali coba manga berbeda untuk menemukan chapter yang benar-benar
lewat jalur normal. Ditemukan lewat "My Dress-Up Darling" chapter 113.1:
`externalUrl` kosong (lolos cek), `getAtHomeServer` benar-benar dipanggil
dan mengembalikan 1 halaman asli — page indicator "1 / 1" tampil benar di
reader-toolbar, full-bleed, chrome toggle saat tap layar bekerja.

**Temuan API tambahan (dicatat, bukan bug app):** halaman yang
dikembalikan MangaDex untuk chapter itu ternyata bukan gambar komik,
melainkan **gambar notice** ("EXTERNAL CHAPTER — This chapter is still
published, but it is no longer free to read...") — chapter berbayar yang
masa gratisnya sudah habis, tapi MangaDex tetap set `externalUrl: null`
di metadata (beda dari kasus simulpub yang eksplisit set `externalUrl`).
Jadi ada kategori ketiga di luar 2 kondisi yang sudah ditangani (baca
in-app / CTA externalUrl): "chapter kadaluarsa berbayar" yang lolos cek
`externalUrl` tapi isinya cuma gambar notice, bukan konten asli. App
tetap merender ini dengan benar (menampilkan apa pun gambar yang
dikembalikan API) — tidak ada crash/state salah — tapi UX-nya kurang
ideal (user melihat gambar notice tanpa konteks kenapa). Dicatat sebagai
item polish Milestone 10 (deteksi/pesan khusus untuk kasus ini perlu
riset lebih lanjut, MangaDex tidak expose flag eksplisit untuk ini di
level metadata chapter).

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
- [ ] Deteksi/pesan khusus untuk chapter berbayar yang masa gratisnya
      habis — `externalUrl` kosong tapi halaman dari `/at-home/server`
      cuma gambar notice "no longer free to read", bukan konten asli
      (ditemukan saat verifikasi Milestone 8, lihat catatan di situ).
      MangaDex tidak expose flag eksplisit untuk kasus ini di metadata
      chapter — perlu riset field/pendekatan yang tepat sebelum
      dikerjakan.
- [ ] Markdown rendering untuk deskripsi manga (ditemukan saat
      verifikasi Milestone 7 — deskripsi sering berisi `**bold**`,
      `[link](url)` mentah)

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

- [x] **`uploads.mangadex.org` (CDN cover image) ternyata ikut di-DNS-block
      ISP Indonesia** — sama seperti `api.mangadex.org` (lihat
      [DECISIONS.md #001](./DECISIONS.md#001)), bukan cuma domain API-nya.
      Ditemukan saat verifikasi Milestone 5 (grid Browse): semua cover
      manga gagal render (placeholder abu-abu terus, tidak ada error di
      JS) — dicek manual pakai `curl -v` ke `uploads.mangadex.org`
      langsung dari mesin dev: TLS handshake gagal, IP yang di-resolve
      (`36.86.63.185`) bukan IP Cloudflare asli MangaDex — ciri khas DNS
      hijack ISP, persis pola yang sudah didokumentasikan untuk domain
      API. **Selesai:** route `GET /covers/:mangaId/:fileName` ditambahkan
      di `mangadex-proxy/src/index.ts`, passthrough biner (bukan `.text()`
      seperti endpoint JSON — akan merusak image) ke
      `https://uploads.mangadex.org/...`, cache 7 hari `immutable` (nama
      file cover MangaDex content-addressed, aman di-cache lama). Sudah
      `wrangler deploy` ke produksi dan diverifikasi: `curl` ke
      `https://mangadex-proxy.mangaholic.workers.dev/covers/...`
      mengembalikan JPEG valid (dibuka & dicek isinya benar), dan app
      (`buildCoverUrl()` sudah diarahkan ke proxy) menampilkan cover asli
      di grid Browse saat dites di emulator.

---

## Eksplisit di luar scope MVP

- Streaming/nonton anime — hanya metadata & tracking, saat fitur anime
  dilanjutkan (lihat konteks di DECISIONS.md)
- Auth/backend — library disimpan lokal dulu
