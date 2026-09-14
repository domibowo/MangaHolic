---
version: alpha
name: Mangaholic Design Language
description: >
  Sintesis dari referensi Notion (getdesign.md/notion) dan Miro
  (getdesign.md/miro), disesuaikan untuk aplikasi mobile React Native.
  Basis warm-neutral & soft surface ala Notion untuk kenyamanan baca manga
  dalam waktu lama, dengan aksen kuning cerah + elemen playful ala Miro
  untuk CTA, badge status, dan highlight. Heading judul manga/anime pakai
  serif (Fraunces), body text sans-serif (Inter).

colors:
  # Base — warm neutral, dari Notion (canvas-soft), dihangatkan lagi
  canvas: "#f7f5f2"
  canvas-elevated: "#ffffff"
  surface: "#ffffff"
  surface-soft: "#efece7"
  hairline: "#e4e0d9"
  hairline-strong: "#d3cdc2"

  # Text — warm ink, bukan pure black (dari prinsip Notion, dihangatkan)
  ink: "#211f1c"
  ink-secondary: "#4a463f"
  ink-muted: "#847d72"
  ink-faint: "#b3aca0"
  on-dark: "#f7f5f2"

  # Aksen utama — Miro yellow, dipakai untuk CTA/badge/highlight
  brand-yellow: "#ffd02f"
  brand-yellow-deep: "#fcb900"
  yellow-soft: "#fff4c4"
  ink-on-yellow: "#211f1c"

  # Chip genre playful (pastel ala Miro sticky-note palette)
  accent-teal: "#0fbcb0"
  teal-soft: "#c3faf5"
  accent-coral: "#ff9999"
  coral-soft: "#ffe0e0"
  accent-rose: "#f6b6e8"
  rose-soft: "#fde0f0"
  accent-sky: "#62aef0"
  sky-soft: "#dcecfc"

  # Semantic — status manga (ongoing/completed/hiatus/error)
  success: "#00b473"
  success-soft: "#d7f5e8"
  warning: "#dd5b00"
  warning-soft: "#ffe6cd"
  error: "#d64545"
  error-soft: "#fbdcdc"

  # Dark mode base (lihat §7)
  canvas-dark: "#18140f"
  surface-dark: "#241f18"
  hairline-dark: "#3a342a"
  ink-dark: "#f2ede4"
  ink-secondary-dark: "#c9c1b3"

typography:
  heading-1:
    fontFamily: Fraunces
    fontSize: 24px
    fontWeight: 600
    lineHeight: 30px
  heading-2:
    fontFamily: Fraunces
    fontSize: 20px
    fontWeight: 600
    lineHeight: 26px
  heading-3:
    fontFamily: Fraunces
    fontSize: 17px
    fontWeight: 600
    lineHeight: 22px
  title:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 600
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 400
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 18px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
  eyebrow:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: 600
    lineHeight: 14px
    letterSpacing: 0.4px
  button:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 600
    lineHeight: 20px

rounded:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  xxl: 28px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  xxxl: 40px
  section: 48px

components:
  button-primary:
    backgroundColor: "{colors.brand-yellow}"
    textColor: "{colors.ink-on-yellow}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: "12px 20px"
  button-primary-pressed:
    backgroundColor: "{colors.brand-yellow-deep}"
    textColor: "{colors.ink-on-yellow}"
  button-secondary:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: "12px 20px"
    border: "1px solid {colors.hairline-strong}"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.ink-secondary}"
    typography: "{typography.button}"
    padding: "8px 12px"
  icon-button-circular:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: 40px
    border: "1px solid {colors.hairline}"
  search-input:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
    height: 44px
  manga-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "0"
    border: "1px solid {colors.hairline}"
  manga-card-featured:
    backgroundColor: "{colors.yellow-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  chip-genre:
    backgroundColor: "{colors.teal-soft}"
    textColor: "{colors.accent-teal}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  badge-status-ongoing:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "3px 8px"
  badge-status-hiatus:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "3px 8px"
  badge-status-error:
    backgroundColor: "{colors.error-soft}"
    textColor: "{colors.error}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "3px 8px"
  badge-new:
    backgroundColor: "{colors.brand-yellow}"
    textColor: "{colors.ink-on-yellow}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "2px 6px"
  tab-bar:
    backgroundColor: "{colors.canvas-elevated}"
    border: "1px solid {colors.hairline}"
    height: 80px
  tab-bar-active-indicator:
    backgroundColor: "{colors.yellow-soft}"
    rounded: "{rounded.full}"
  reader-toolbar:
    backgroundColor: "rgba(24, 20, 15, 0.72)"
    textColor: "{colors.on-dark}"
    padding: "{spacing.sm} {spacing.md}"
  empty-state:
    backgroundColor: "{colors.surface-soft}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xxl}"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
---

## Overview

Mangaholic terasa seperti meja baca yang hangat di siang hari — bukan
lembar kerja putih klinis, tapi juga bukan panel komik yang berisik.
Kanvas dasarnya warm-neutral (`{colors.canvas}` #f7f5f2), diambil dari
prinsip Notion: cocok untuk sesi baca manga yang panjang tanpa melelahkan
mata. Di atas kanvas itu, satu aksen kuning cerah (`{colors.brand-yellow}`,
sama seperti kuning ikonik Miro) dipakai secara sengaja terbatas — untuk
tombol aksi utama, badge "chapter baru", dan highlight — supaya tetap
terasa istimewa setiap kali muncul, bukan tersebar di mana-mana.

Judul manga & anime memakai serif **Fraunces** — dipilih spesifik untuk
project ini (bukan dari Notion maupun Miro, keduanya all-sans) karena
karakter serif kontemporer Fraunces punya kehangatan editorial yang pas
untuk judul karya (mirip cara majalah/toko buku menampilkan judul), tanpa
jatuh terlalu formal seperti serif klasik. Body text, label, dan UI chrome
tetap sans-serif **Inter** (dari sistem Notion) — supaya teks deskripsi,
metadata chapter, dan tombol tetap terbaca jernih di ukuran kecil pada
layar mobile.

Elemen playful ala Miro — chip genre pastel warna-warni (teal, coral,
rose), radius membulat lebih besar dari Notion, kartu "featured" dengan
tint kuning lembut — dipakai untuk membuat halaman browse manga terasa
hidup, tanpa mengorbankan ketenangan kanvas dasar. Prinsipnya: **kanvas
tenang, aksen yang bicara.**

**Key characteristics:**
- Kanvas warm-neutral `{colors.canvas}`, bukan putih klinis — nyaman untuk
  baca lama
- Satu aksen struktural: kuning cerah `{colors.brand-yellow}` untuk CTA,
  badge status baru, dan highlight — bukan warna yang tersebar
- Chip genre pastel playful (teal/coral/rose) — dekoratif, bukan struktural
- Serif Fraunces khusus judul manga/anime & section header; Inter untuk
  semua teks lain
- Radius membulat lebar (mengarah ke Miro) untuk kartu & chip; radius
  lebih ketat untuk input form (mengarah ke Notion)
- Shadow tipis berlapis (ala Notion) — hanya kartu featured/hero yang
  pakai elevation lebih terasa

---

## 1. Warna

### Base & Surface
- `{colors.canvas}` — background utama seluruh screen
- `{colors.canvas-elevated}` / `{colors.surface}` — kartu, bottom sheet,
  tab bar
- `{colors.surface-soft}` — search input, section background sekunder
- `{colors.hairline}` / `{colors.hairline-strong}` — border tipis, divider

### Teks
- `{colors.ink}` — heading & body utama
- `{colors.ink-secondary}` — body sekunder, deskripsi panjang
- `{colors.ink-muted}` — metadata (jumlah chapter, tanggal update)
- `{colors.ink-faint}` — placeholder, teks nonaktif

### Aksen utama (gunakan hemat)
- `{colors.brand-yellow}` — CTA utama ("Baca Sekarang", "+ Bookmark"),
  badge "chapter baru", highlight
- `{colors.brand-yellow-deep}` — pressed state tombol kuning
- `{colors.yellow-soft}` — tint background kartu featured, background
  badge kuning

> Deviasi sadar dari DESIGN.miro.md: Miro membatasi kuning hanya untuk
> wordmark/tag, primary CTA-nya hitam. Di Mangaholic, kuning justru jadi
> warna CTA utama sesuai arahan desain — diterima karena app ini tidak
> punya tabel perbandingan harga yang padat seperti Miro, jadi risiko
> "kuning kebanyakan" jauh lebih rendah. Tetap disiplin: satu tombol kuning
> paling menonjol per layar, bukan berulang di semua tombol.

### Chip genre (dekoratif, playful — pilih salah satu per chip)
`{colors.accent-teal}`/`{colors.teal-soft}`,
`{colors.accent-coral}`/`{colors.coral-soft}`,
`{colors.accent-rose}`/`{colors.rose-soft}`,
`{colors.accent-sky}`/`{colors.sky-soft}` — dipakai bergilir untuk genre
tag, tidak dipetakan tetap ke genre tertentu.

### Semantic (status manga)
- `{colors.success}` / `{colors.success-soft}` — status "Ongoing"
- `{colors.warning}` / `{colors.warning-soft}` — status "Hiatus"
- `{colors.error}` / `{colors.error-soft}` — error state, status "Dropped"

---

## 2. Tipografi

### Font family
- **Fraunces** (heading, khusus judul manga/anime & section header) —
  Google Font, variable, style `soft`. Fallback: Georgia, serif.
- **Inter** (body, UI chrome, tombol, badge) — Google Font, fallback:
  -apple-system, Roboto, sans-serif.

Kedua font perlu dibundle sebagai asset native (bukan link web font) —
detail linking font masuk ke Milestone 0 (Setup) di TODO.md.

### Skala (mobile, bukan skala marketing web)

| Token | Size | Font | Weight | Use |
|---|---|---|---|---|
| `{typography.heading-1}` | 24px | Fraunces | 600 | Judul screen (mis. judul manga di detail screen) |
| `{typography.heading-2}` | 20px | Fraunces | 600 | Section header (mis. "Sedang Populer", "Update Terbaru") |
| `{typography.heading-3}` | 17px | Fraunces | 600 | Judul manga di card/list row |
| `{typography.title}` | 16px | Inter | 600 | Judul komponen non-manga (mis. nama section pengaturan) |
| `{typography.body-md}` | 15px | Inter | 400 | Deskripsi/sinopsis, body utama |
| `{typography.body-sm}` | 13px | Inter | 400 | Metadata: jumlah chapter, waktu update |
| `{typography.caption}` | 12px | Inter | 500 | Isi badge & chip |
| `{typography.eyebrow}` | 11px | Inter | 600 | Label kecil kapital (mis. "GENRE", "STATUS") |
| `{typography.button}` | 15px | Inter | 600 | Label tombol |

### Prinsip
- Serif **hanya** untuk judul manga/anime & section header — jangan pernah
  dipakai di badge, chip, tombol, atau body text (ukuran kecil + serif =
  susah dibaca di layar mobile).
- Kontras berat: Fraunces 600 di heading vs Inter 400 di body — kontras
  inilah yang membawa karakter "editorial hangat", tanpa perlu banyak
  ukuran font.
- Tidak ada skala hero 60-80px seperti referensi web — mobile screen
  butuh skala yang jauh lebih kompak, headline terbesar app ini 24px.

---

## 3. Layout & Spacing

- **Base unit:** 4px
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px
  · `{spacing.md}` 16px · `{spacing.lg}` 20px · `{spacing.xl}` 24px ·
  `{spacing.xxl}` 32px · `{spacing.xxxl}` 40px · `{spacing.section}` 48px
- **Padding kartu standar:** `{spacing.md}` (16px)
- **Gap antar card di grid/list:** `{spacing.sm}` (12px)
- **Margin horizontal screen:** `{spacing.md}` (16px)
- **Reader screen:** full-bleed, tanpa padding horizontal — gambar chapter
  edge-to-edge, kontras dengan padding 16px di screen lain

### Grid
- Browse screen: grid 2 kolom untuk manga card (cover-forward), gap 12px
- Detail screen: single column, cover besar di atas, metadata + deskripsi
  di bawah
- Library screen: list 1 kolom (row card dengan cover kecil di kiri)

---

## 4. Elevation & Shadow

Filosofi ala Notion — "barely-there", shadow tipis berlapis, bukan drop
shadow berat. Warna shadow warm-tinted (bukan hitam murni) supaya
menyatu dengan kanvas.

| Level | React Native shadow | Android `elevation` | Use |
|---|---|---|---|
| 0 — Flat | tidak ada, hanya `{colors.hairline}` border | 0 | Manga card default, list row |
| 1 — Soft | `shadowColor: "#211f1c"`, `shadowOpacity: 0.06`, `shadowOffset: {0,2}`, `shadowRadius: 6` | 2 | Card featured, search input saat fokus |
| 2 — Elevated | `shadowColor: "#211f1c"`, `shadowOpacity: 0.12`, `shadowOffset: {0,8}`, `shadowRadius: 16` | 8 | Bottom sheet, modal, toast |

Kartu di reader screen **tidak** pakai shadow — full-bleed image harus
bebas dari chrome visual.

---

## 5. Shapes

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | Badge kecil, discount-style tag |
| `{rounded.sm}` | 8px | Search input, icon button persegi |
| `{rounded.md}` | 12px | Manga card, form field |
| `{rounded.lg}` | 16px | Card featured, bottom sheet corner |
| `{rounded.xl}` | 20px | Modal besar |
| `{rounded.xxl}` | 28px | Empty-state illustration frame |
| `{rounded.full}` | 9999px | Semua tombol, chip, badge, tab indicator |

Cover manga di dalam card tetap mengikuti radius induknya (jangan pakai
radius berbeda antara image dan card container).

---

## 6. Iconografi

Icon set: **lucide-react-native**. Style guide:
- Ukuran default 20px (inline dengan `{typography.body-md}`) atau 24px
  (tombol icon berdiri sendiri/tab bar)
- Warna icon default `{colors.ink-secondary}`; icon di tombol/tab aktif
  pakai `{colors.ink}` (bukan kuning — kuning dicadangkan untuk fill
  badge/CTA, bukan warna icon berulang)
- `stroke-width` konsisten 1.75–2 di seluruh app, jangan campur ketebalan
  stroke antar screen

---

## 7. Komponen

### Tombol
- **`button-primary`** — pill kuning, teks ink gelap. Dipakai untuk SATU
  aksi paling penting per screen ("Baca Sekarang", "Mulai Baca").
- **`button-secondary`** — pill outline, transparan. Aksi kedua
  ("Bookmark", "Bagikan").
- **`button-ghost`** — teks saja, tanpa background. Aksi tersier ("Lihat
  Semua").
- **`icon-button-circular`** — tombol icon bulat 40px, dipakai untuk
  back button, toggle bookmark di card.

### Kartu
- **`manga-card`** — card default di grid browse: cover image (rasio
  2:3) + `{typography.heading-3}` judul + `{typography.body-sm}` metadata
  (jumlah chapter). Flat, hanya hairline border.
- **`manga-card-featured`** — dipakai di carousel "Continue Reading" atau
  highlight di home: tint kuning lembut, radius lebih besar, shadow
  level 1.

### Chip & Badge
- **`chip-genre`** — pastel rounded pill, warna bergilir dari palet
  aksen (teal/coral/rose/sky). Dipakai di detail screen & filter.
- **`badge-status-ongoing` / `-hiatus` / `-error`** — badge status manga,
  warna semantic tetap (jangan pakai warna bebas seperti chip genre).
- **`badge-new`** — dot/pill kuning kecil menandai chapter baru sejak
  terakhir dibuka.

### Input
- **`search-input`** — pill rounded-md, background surface-soft, icon
  search di kiri (lucide `Search`), placeholder `{colors.ink-faint}`.

### Navigasi

**Aturan dasar: tidak ada header global/tradisional.** Satu-satunya chrome
navigasi yang persisten adalah `tab-bar` di bawah. Tidak ada top nav-bar
seragam di semua screen (bukan pola React Navigation default "header di
atas, judul di tengah, back button kiri" yang sama di setiap screen) —
setiap screen mendefinisikan header-nya sendiri sesuai kebutuhan
kontennya (header kontekstual), supaya konten manga/anime dapat ruang
maksimal dan tidak ada dua lapis chrome (top bar + tab bar) yang bersaing.

- **`tab-bar`** — bottom tab bar, background `{colors.canvas-elevated}`,
  border atas tipis. Tab aktif: icon+label warna `{colors.ink}` dengan
  `{components.tab-bar-active-indicator}` (pill tint kuning lembut) di
  belakang icon. Tab nonaktif: `{colors.ink-faint}`. Muncul di Browse,
  Search, Library — disembunyikan di MangaDetail & Reader (kedua screen
  itu full-screen, diakses via push dari tab, bukan tab tersendiri).

**Header kontekstual per screen:**
- **Browse** — tanpa top bar terpisah; judul "Mangaholic" (Fraunces,
  `{typography.heading-1}`) inline di atas konten, scroll bersama grid.
  Di bawahnya: sticky filter chip row (`chip-genre` style, horizontal
  scroll) yang nempel begitu grid discroll — pengganti fungsi header,
  bukan header terpisah.
- **Search** — `search-input` itu sendiri yang jadi "header": nempel di
  atas, fokus otomatis saat tab dibuka. Tidak ada judul screen terpisah.
- **MangaDetail** — collapsible header: hero cover manga full-width di
  atas (tinggi besar saat scroll posisi awal), mengecil & menyatu jadi
  compact bar (judul manga + tombol back) saat discroll ke atas. Tombol
  back & bookmark melayang di atas hero (scrim gelap tipis di baliknya
  supaya tetap kebaca di atas cover apa pun warnanya).
- **Reader** — tidak ada header sama sekali secara default; chrome
  (`reader-toolbar`) hanya muncul on-demand saat tap layar, lihat bagian
  Reader di bawah.
- **Library** — sama seperti Browse: judul inline, tanpa top bar
  terpisah, tab section (Bookmark Manga) langsung di bawah judul.

### Reader
- **`reader-toolbar`** — overlay scrim gelap semi-transparan, muncul saat
  tap di layar reader, berisi page indicator ("12 / 24") dan tombol
  kembali. Full-bleed image di bawahnya tidak boleh terganggu chrome saat
  toolbar tersembunyi.

### Feedback
- **`empty-state`** — frame surface-soft, ikon/ilustrasi sederhana +
  `{typography.body-md}` pesan + opsional `button-secondary`.
- **`toast`** — notifikasi singkat (mis. "Ditambahkan ke Bookmark"),
  background ink gelap, teks on-dark, muncul dari bawah.

---

## 8. Dark Mode (persiapan, implementasi di backlog TODO.md)

Token dasar sudah disiapkan di front-matter (`colors.canvas-dark`,
`colors.surface-dark`, dll) supaya NativeWind `dark:` variant tinggal
dipetakan saat milestone dark mode dikerjakan:

- `{colors.canvas}` → `{colors.canvas-dark}` (#18140f — warm-black, bukan
  abu netral)
- `{colors.surface}` → `{colors.surface-dark}`
- `{colors.ink}` → `{colors.ink-dark}`
- `{colors.brand-yellow}` **tetap sama** di dark mode — konsistensi brand
  lebih penting daripada penyesuaian kontras; teks di atas kuning tetap
  pakai `{colors.ink-on-yellow}` (dark ink), bukan ink-dark

---

## 9. Do's and Don'ts

### Do
- Pakai `{colors.canvas}` warm-neutral di semua screen kecuali reader
  (reader boleh gelap solid saat overlay aktif)
- Batasi `{colors.brand-yellow}` ke satu CTA paling penting per screen +
  badge status baru
- Pakai Fraunces hanya untuk judul manga/anime & section header
- Variasikan warna chip genre secara playful, tapi jaga badge status
  semantic tetap konsisten
- Jaga reader screen bebas chrome — full-bleed, minimal UI overlay

### Don't
- Jangan pakai serif di badge, chip, tombol, atau teks kecil lain
- Jangan pakai `{colors.brand-yellow}` untuk status error/dropped —
  pakai `{colors.error}`
- Jangan tumpuk shadow berat di list row/chip kecil — shadow level 1-2
  hanya untuk card featured, modal, toast
- Jangan pakai radius berbeda antara card dan cover image di dalamnya
- Jangan pakai kanvas putih murni (`#ffffff`) untuk background screen
  penuh — pakai `{colors.canvas}` warm

---

## 10. Mapping ke NativeWind

Saat Milestone 0 (Setup, TODO.md) mengonfigurasi NativeWind, token di atas
dipetakan langsung ke `tailwind.config.js theme.extend` — bukan disalin
ulang manual ke component:

```js
// tailwind.config.js (cuplikan, dilengkapi saat implementasi)
theme: {
  extend: {
    colors: {
      canvas: '#f7f5f2',
      'canvas-elevated': '#ffffff',
      'brand-yellow': '#ffd02f',
      // ...selebihnya mengikuti colors: di front-matter atas
    },
    fontFamily: {
      heading: ['Fraunces'],
      sans: ['Inter'],
    },
    borderRadius: {
      xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '20px', xxl: '28px',
    },
  },
},
```

Component tidak boleh hardcode hex/px yang sudah punya token di sini —
kalau butuh nilai baru, tambahkan token baru di DESIGN.md dulu, baru
dipetakan ke `tailwind.config.js`.

---

## Referensi

Dua sumber referensi mentah yang disintesis jadi dokumen ini disimpan di
root project untuk kebutuhan lookup detail primitif yang tidak tercakup
di atas:
- [DESIGN.miro.md](./DESIGN.miro.md) — referensi playful/brand-yellow
- [DESIGN.notion.md](./DESIGN.notion.md) — referensi warm-minimalism

Kalau butuh primitif yang belum ada di DESIGN.md ini (mis. varian
komponen baru), cek referensi mentah dulu sebelum mengarang token baru,
lalu tambahkan hasilnya sebagai entry resmi di sini.
