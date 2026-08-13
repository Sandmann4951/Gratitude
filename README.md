# Dankbarkeitstagebuch

Ein digitales Dankbarkeits-Tagebuch als installierbare Web-App (PWA). Morgens und abends
beantwortest du je 3 kurze Fragen aus einem rotierenden Fragenkatalog, hältst deine
Stimmung auf einer Skala von 0–10 fest und kannst optional ein Foto anhängen. Einmal
gespeicherte Einträge sind danach nur noch lesbar – nie mehr veränderbar.

**Alle Daten bleiben ausschließlich auf deinem Gerät** (IndexedDB im Browser). Es gibt
keinen Server, kein Konto, keine Synchronisation.

## Funktionen

- 🌅🌙 Morgen- und Abend-Eintrag mit je 3 Fragen aus einem Katalog von 20 rotierenden Fragen
- 📊 Stimmungsbarometer 0–10 pro Eintrag
- 📷 Optionales Stimmungsfoto (wird lokal komprimiert gespeichert)
- 🔒 Einträge sind nach dem Speichern unveränderlich – nur Verlauf & Statistik zum Nachlesen
- 🔐 Optionale App-Sperre (PIN, wahlweise mit Face ID/Touch ID) schützt das Tagebuch auf dem Gerät
- 📅 Kalender-Verlauf und Wochen-/Monats-Statistik (Stimmungsverlauf, Serien, Vollständigkeit)
- ⏰ Erinnerungen: zuverlässiger In-App-Hinweis + optionale native Benachrichtigungen
  (echte Hintergrund-Zustellung ist ohne eigenen Server browserabhängig eingeschränkt,
  siehe Hinweistext in den Einstellungen)
- 💾 JSON-Backup exportieren/importieren, da alles nur lokal gespeichert wird
- 📱 Installierbar als PWA, funktioniert offline

## Entwicklung

```bash
npm install
npm run dev       # Entwicklungsserver
npm run build     # Produktions-Build (dist/)
npm run preview   # Produktions-Build lokal ansehen
npm run test      # Unit-Tests (Vitest)
npm run lint      # oxlint
```

## Architektur

- **Vite + React + TypeScript + Tailwind CSS**
- **IndexedDB via Dexie.js** – einzige Persistenzschicht, siehe `src/db/`.
  `src/db/repository.ts` ist die einzige Schnittstelle zur Datenbank und exponiert
  bewusst kein „Eintrag bearbeiten/löschen" – das ist der zentrale Mechanismus, der die
  Unveränderbarkeit der Einträge sicherstellt (ergänzt durch einen Unique-Index
  `[date+period]` auf DB-Ebene).
- **react-router-dom** (`HashRouter`, passend für statisches Hosting + PWA)
- **Zustand** für rein clientseitigen UI-Zustand; **`dexie-react-hooks`** (`useLiveQuery`)
  für alles aus der Datenbank
- **Recharts** für den Stimmungsverlauf in der Statistik
- **vite-plugin-pwa** (`injectManifest`-Strategie) – eigener Service Worker in `src/sw.ts`
  für Offline-Precaching und Erinnerungs-Benachrichtigungen
- **App-Sperre** (`src/features/lock/`, `src/lib/appLock.ts`): PIN wird nie im Klartext
  gespeichert, nur ein gesalzener PBKDF2-Hash in `localStorage`; Face ID/Touch ID läuft
  über WebAuthn mit einem lokalen "platform authenticator" – ganz ohne Server, da ein
  erfolgreicher `navigator.credentials.get()` bereits die Geräte-Biometrie bestätigt.

Weitere Details (Datenmodell, Fragen-Rotationslogik, Reminder-Konzept) siehe Code-Kommentare
in `src/db/schema.ts`, `src/features/entry/questionSelector.ts` und
`src/features/reminders/`.
