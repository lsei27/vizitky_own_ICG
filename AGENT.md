# Vizitky App - Project Architecture & Summary

Tento repozitář obsahuje aplikaci pro zobrazení a správu digitálních vizitek. Níže je shrnutí technologického stacku a fungování aplikace pro budoucí úpravy, aby případní další AI softwaroví vývojáři rychle porozuměli kontextu a architektuře.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Jazyk**: TypeScript
- **Styling**: Vanilla CSS a CSS Modules (úmyslně vynechán Tailwind CSS).
  - Hlavní design vizitky (`/[slug]/card.module.css`) detailně (pixel-perfect) kopíruje vizuální identitu z *QR Code Chimp*.
  - Aplikace nativně hostuje font **Satoshi Variable** (umístěn bezpečně přes Next.js `next/font/local`, assety leží ve složce `/src/app/fonts/`).
  - Globální reset CSS je v `src/app/globals.css`.
- **Databáze**: Prisma (verze 7.x)
- **Generátor QR**: `qr-code-styling` (klientská knihovna)

## Architektura Databáze a Prisma 7.x
- **Kritická poznámka**: Používáme nejnovější **Prisma 7**. Pro lokální SQLite vývoj Prisma 7 namísto nativního zabudovaného enginu vyžaduje instalovaný adaptér `@prisma/adapter-better-sqlite3` a knihovnu `better-sqlite3`. Tyto jsou instanciovány v `src/lib/prisma.ts`.
- Další specifikum Prisma 7: Konfigurace připojení (`datasource url`) už **NENÍ** v souboru `schema.prisma`. Byla přesunuta do konfiguračního souboru `prisma.config.ts`.
- **Datové modely**:
  - `Card`: Ukládá profilové a kontaktní informace (jméno, mobil, adresa, tématická hex barva, logo atd.). Unikátní identifikátor pro url je atribut `slug`.
  - `Link`: Vztah 1:N s `Card` (webové odkazy uživatele).
  - `Social`: Vztah 1:N s `Card` (odkazy na sociální sítě uživatele).

*Infrastruktura pro Vercel Postgres*: Pro nasazení na Vercel s Postgres databází je nutné nainstalovat `@prisma/adapter-pg`, v `src/lib/prisma.ts` instanciovat a předat PrismaPg (včetně `Pool` z balíčku `pg`), a následně změnit v konfiguraci `provider = "postgresql"`. Generování přes `npm run build` musí předcházet `prisma generate` a `prisma migrate deploy`.

## Hlavní Routy
1. `/[slug]` (např. `/lukas-seifert`) -> **Public Vizitka**
   - Vykresluje finální vizitku pro veřejnost přes Server Components (SSR).
   - Úmyslně neobsahuje Apple/Google Wallet integrace (pro zamezení povinnosti řešit vývojářské certifikáty).
2. `/api/vcard/[id]` -> **vCard endpoint**
   - Backend API generátor, který ze záznamu v databázi sestaví platný textový řetězec `.vcf`. 
   - Tímhle způsobem se vizitka ukládá do Kontaktů na iOS/Android přímo při prokliku tlačítka na public vizitce.
3. `/admin` -> **Admin Dashboard / Správa**
   - Klientské rozhraní (`src/app/admin/CardForm.tsx`) běžící nad Next.js Server Actions (`src/app/actions/card.ts`).
   - Zajišťuje plný CRUD databáze, včetně dynamického přidávání pole pro odkazy a sítě.
   - **QR Code Generátor**: Každá vizitka v adminu i koncový frontend modul `FloatingActions.tsx` používají moderní render přes knihovnu `qr-code-styling`. Pro zamezení rozmazání kódu na jemných displejích se na pozadí plátno renderuje do obřího rozlišení **1080x1080 px** (s maximální tolerancí poškození "H") a následně je pro uživatele CSSkem vizuálně zmenšeno na míru. Osa generátoru do sebe automaticky vyřezává prostor pro nahrání URL loga. Stažený obrázek navíc inteligentně přejímá jmenovku dané karty (`[slug]-vizitka-qr.png`).
   - **Klonování vizitek**: V okně server actions existuje logická vrstva `duplicateCard`. V administraci lze po jejím vyvolání provést deep-copy jedné konkrétní vizitky (včetně všech dynamických relací N:1 pro odkazy). Slugu naklonované vizitky je bezpečně přiřazen randomizovaný unikátní prefix (např. `-kopie-5321`), což jí ve stejný moment propůjčuje absolutně unikátní čitelný navázaný QR kód.

## Design
- Architektura používá jako primární ikonku projektového modulu strukturovaný formát `icon.png` uvnitř složky `src/app/`, skrze který Next.js 13+ zaručí precizní generování webových, "touch" icon i meta podkladů navzdory zahození tradiční historické favikony.
