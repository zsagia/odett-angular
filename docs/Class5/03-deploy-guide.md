# WebSocket Chat - Deploy Guide

Ez a dokumentáció leírja, hogyan lehet a WebSocket chat alkalmazást Firebase-re és Google Cloud Run-ra deployolni GitHub Actions segítségével.

## Architektúra

```
┌─────────────────────────────────────────────────────────────┐
│                        GitHub                               │
│                          │                                  │
│                    Push to main                             │
│                          ▼                                  │
│                  GitHub Actions                             │
│                    │         │                              │
│                    ▼         ▼                              │
│        ┌───────────────┐  ┌─────────────────┐              │
│        │  Cloud Run    │  │ Firebase Hosting │              │
│        │  (WebSocket)  │  │ (Angular SPA)    │              │
│        └───────────────┘  └─────────────────┘              │
│               │                    │                        │
│               └────────────────────┘                        │
│                        │                                    │
│                        ▼                                    │
│                    Felhasználók                             │
└─────────────────────────────────────────────────────────────┘
```

## Előfeltételek

1. **Google Cloud fiók** - [console.cloud.google.com](https://console.cloud.google.com)
2. **Firebase projekt** - [console.firebase.google.com](https://console.firebase.google.com)
3. **GitHub repository**

## 1. Google Cloud beállítása

### 1.1 Projekt létrehozása

```bash
# GCloud CLI telepítése után
gcloud projects create YOUR_PROJECT_ID
gcloud config set project YOUR_PROJECT_ID
```

### 1.2 API-k engedélyezése

```bash
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 1.3 Service Account létrehozása

```bash
# Service account létrehozása
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# Jogosultságok hozzáadása
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Kulcs letöltése
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

## 2. Firebase beállítása

### 2.1 Firebase CLI telepítése

```bash
npm install -g firebase-tools
firebase login
```

### 2.2 Projekt inicializálása

```bash
firebase init hosting
# Válaszd ki a meglévő GCP projektet
# Public directory: dist/odett-angular/browser
# Single-page app: Yes
```

### 2.3 Firebase Service Account

1. Menj a Firebase Console → Project Settings → Service Accounts
2. Kattints "Generate new private key"
3. Mentsd el a JSON fájlt

## 3. GitHub Secrets beállítása

A repository Settings → Secrets and variables → Actions oldalon add hozzá:

| Secret név | Érték |
|------------|-------|
| `GCP_PROJECT_ID` | A Google Cloud projekt ID-ja |
| `GCP_SA_KEY` | A `key.json` fájl teljes tartalma |
| `FIREBASE_SERVICE_ACCOUNT` | A Firebase service account JSON tartalma |

## 4. Environment frissítése

A deploy után frissítsd a production environment fájlt a Cloud Run URL-lel:

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  websocketUrl: 'wss://websocket-chat-XXXXXX-ew.a.run.app',
};
```

A Cloud Run URL-t megtalálod:
- Google Cloud Console → Cloud Run → websocket-chat → URL
- Vagy a GitHub Actions log-ban

**Fontos:** A `ws://` helyett `wss://` kell, mert a Cloud Run HTTPS-t használ!

## 5. Deploy indítása

### Automatikus (push-ra)

```bash
git add .
git commit -m "feat: add deployment configuration"
git push origin main
```

### Manuális

GitHub → Actions → Deploy to Firebase & Cloud Run → Run workflow

## 6. Ellenőrzés

### Cloud Run

```bash
# Szolgáltatás státusza
gcloud run services describe websocket-chat --region europe-west1

# Logok
gcloud run logs read websocket-chat --region europe-west1
```

### Firebase Hosting

```bash
firebase hosting:channel:list
```

## Költségek

### Cloud Run (ingyenes szint)

- 2 millió request/hó
- 360,000 GB-másodperc memória
- 180,000 vCPU-másodperc

### Firebase Hosting (ingyenes szint)

- 10 GB tárhely
- 360 MB/nap adatforgalom

## Hibaelhárítás

### "Permission denied" hiba

Ellenőrizd, hogy a service account-nak megvannak-e a jogosultságai:

```bash
gcloud projects get-iam-policy YOUR_PROJECT_ID
```

### WebSocket nem kapcsolódik

1. Ellenőrizd, hogy `wss://` protokollt használsz (nem `ws://`)
2. Ellenőrizd a Cloud Run logokat
3. Ellenőrizd, hogy a CORS engedélyezve van

### Build hiba

```bash
# Lokális build teszt
npm run build

# Docker build teszt
docker build -t test -f server/Dockerfile .
docker run -p 8080:8080 test
```

## Fájlok

| Fájl | Leírás |
|------|--------|
| `.github/workflows/deploy.yml` | GitHub Actions workflow |
| `server/Dockerfile` | WebSocket szerver Docker image |
| `firebase.json` | Firebase Hosting konfiguráció |
| `src/environments/environment.ts` | Development környezet |
| `src/environments/environment.prod.ts` | Production környezet |
