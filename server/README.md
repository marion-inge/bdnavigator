# BD Navigator – Self-Hosting (Windows IIS)

## Architektur

```
IIS Server
├── index.html          ← React SPA (Vite build output)
├── assets/             ← Static JS/CSS
├── server/
│   ├── index.js        ← Express API (via iisnode)
│   ├── web.config      ← IIS URL Rewrite + iisnode config
│   ├── BDNavigator.db  ← SQLite Datenbank
│   └── uploads/        ← Dateianhänge
```

## Voraussetzungen

1. **Node.js** (v18+) auf dem Server installiert
2. **iisnode** Modul für IIS installiert ([Download](https://github.com/azure/iisnode/releases))
3. **URL Rewrite** Modul für IIS installiert

## Deployment

### 1. Frontend bauen

```bash
# Im Projektverzeichnis
VITE_BACKEND=sqlite VITE_API_URL=/api npm run build
```

### 2. Server vorbereiten

```bash
cd server
npm install
```

### 3. Dateien auf IIS kopieren

```
IIS Site Root/
├── index.html              ← aus dist/
├── assets/                 ← aus dist/assets/
├── index.js                ← aus server/
├── web.config              ← aus server/
├── node_modules/           ← aus server/
├── package.json            ← aus server/
├── BDNavigator.db          ← aus Projektroot (oder leer lassen, wird erstellt)
└── uploads/                ← wird automatisch erstellt
```

### 4. IIS konfigurieren

- Neue Website oder Application erstellen
- Physical Path auf das Deployment-Verzeichnis setzen
- Application Pool: "No Managed Code"
- Sicherstellen, dass der App Pool-User Schreibrechte auf DB und uploads/ hat

### 5. Umgebungsvariablen (optional)

| Variable     | Default              | Beschreibung                 |
|-------------|----------------------|------------------------------|
| `PORT`      | 3001                 | API Port (ignoriert von IIS) |
| `DB_PATH`   | `./BDNavigator.db`   | Pfad zur SQLite-Datei        |
| `UPLOAD_DIR`| `./uploads`          | Upload-Verzeichnis           |

## Backend umschalten

Im Frontend wird über `VITE_BACKEND` gesteuert, welches Backend genutzt wird:

- `VITE_BACKEND=supabase` (Default) → Lovable Cloud
- `VITE_BACKEND=sqlite` → Express/SQLite API

## API Endpunkte

| Methode | Pfad                          | Beschreibung              |
|---------|-------------------------------|---------------------------|
| GET     | `/api/opportunities`          | Alle Ideen laden          |
| GET     | `/api/opportunities/:id`      | Eine Idee laden           |
| POST    | `/api/opportunities`          | Neue Idee erstellen       |
| PUT     | `/api/opportunities/:id`      | Idee aktualisieren        |
| DELETE  | `/api/opportunities/:id`      | Idee löschen              |
| GET     | `/api/ai-assessments`         | KI-Bewertungen laden      |
| POST    | `/api/ai-assessments`         | KI-Bewertung erstellen    |
| PUT     | `/api/ai-assessments/:id`     | KI-Bewertung aktualisieren|
| DELETE  | `/api/ai-assessments/:id`     | KI-Bewertung löschen      |
| GET     | `/api/opportunity-files`      | Dateien laden             |
| POST    | `/api/opportunity-files`      | Datei hochladen           |
| DELETE  | `/api/opportunity-files/:id`  | Datei löschen             |
| GET     | `/api/health`                 | Health Check              |
