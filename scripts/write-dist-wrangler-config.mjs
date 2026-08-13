// Schreibt zusätzlich eine wrangler.jsonc direkt in den Build-Output (dist/).
//
// Hintergrund: Der Cloudflare-Deploy-Schritt ("npx wrangler versions upload")
// fand die wrangler.jsonc im Repo-Root nicht, obwohl sie dort committet ist
// und ein lokaler Dry-Run sie korrekt erkennt. Das deutet darauf hin, dass
// der Deploy-Schritt in einem anderen Arbeitsverzeichnis läuft als der
// Build-Schritt (z. B. direkt in "dist/"), sodass Wrangler dort keine Config
// findet. Diese Kopie deckt genau diesen Fall ab: Sie liegt im Build-Output
// selbst und referenziert das Assets-Verzeichnis relativ dazu ("."), statt
// wie die Root-Version relativ zum Repo-Root ("./dist").
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const distDir = fileURLToPath(new URL('../dist', import.meta.url))

const config = {
  name: 'gratitude',
  compatibility_date: '2026-08-13',
  assets: {
    directory: '.',
    not_found_handling: 'single-page-application',
  },
}

writeFileSync(`${distDir}/wrangler.jsonc`, JSON.stringify(config, null, 2) + '\n')
