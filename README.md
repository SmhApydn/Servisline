# ServisLine Monorepo

Bu proje, hem frontend (React + Vite + TypeScript) hem de backend (Express + TypeScript) uygulamalarını ve ortak tipleri (TypeScript ile) tek bir monorepo yapısında barındırır.

## Klasör Yapısı

```
servisline/
├── apps/
│   ├── admin-panel/      # Frontend (React)
│   └── backend/          # Backend (Express)
├── packages/
│   └── shared/           # Ortak tipler (TypeScript)
```

## Geliştirme Ortamı

### 1. Bağımlılıkları Yükle
Kök dizinde:
```sh
npm install
```

### 2. Backend'i Başlat
```sh
cd apps/backend
npm run dev
```

### 3. Frontend'i Başlat
Başka bir terminalde:
```sh
cd apps/admin-panel
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend:  [http://localhost:4000](http://localhost:4000)

## Özellikler
- Servis, kullanıcı ve şoför CRUD işlemleri
- Servise kullanıcı atama/çıkarma
- Servise şoför atama (select ile)
- Ortak tipler ile tam tip güvenliği
- Modern, modüler ve geliştirilebilir monorepo yapı

## Notlar
- Tüm veri geçici olarak bellekte (in-memory) tutulur. Gerçek bir veritabanı için backend kodu kolayca genişletilebilir.
- Ortak tipler `packages/shared/types.ts` dosyasında tutulur ve hem frontend hem backend tarafından kullanılır.

---
Sorularınız için: [Semih](mailto:semih@example.com)
