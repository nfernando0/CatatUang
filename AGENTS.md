<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Internal Engineering Standards

## 1. Architectural Conventions
* **Component Model:** Seluruh komponen di dalam directory `app/` default sebagai Server Components. Penambahan directive `'use client'` wajib diminimalisasi ke level daun (*leaf components*).
* **Next.js API References:** Patuhi panduan lokal di `node_modules/next/dist/docs/` untuk breaking changes routing, headers, dan cookies.
* **Module Resolution:** Gunakan absolute alias `@/*` untuk seluruh internal import.

## 2. Code Quality & Type Safety
* Mode TypeScript strict aktif; penulisan eksplisit `any` dilarang.
* Komponen UI reusable ditempatkan di `@/components/ui`, sedangkan logika bisnis/fetching terisolasi di `@/services` atau Server Actions.

## 3. Pre-Commit Checklist
* Jalankan `npm run lint` dan pastikan zero error/warning.
* Jalankan `npm run build` lokal untuk memastikan type-check lolos.
* Jangan hapus atau modifikasi tag komentar Next.js dev rules di atas.