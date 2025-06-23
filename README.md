# Final Project Sistem Cerdas

## Anggota Kelompok 5

| Nama                     | NRP        |
| ------------------------ | ---------- |
| Jeany Aurellia P. D.     | 5027221008 |
| Monika Damelia H.        | 5027221011 |
| Clara Valentina          | 5027221016 |
| Samuel Yuma K.           | 5027221029 |
| Muhammad Harvian Dito S. | 5027221039 |

## Instalasi

Dokumentasi instalasi untuk client (frontend) dan server (backend) ada pada masing-masing folder.

## Fuzzy Table

![Image](https://github.com/user-attachments/assets/86c75eec-2387-4339-a1e3-9b8bb599936d)

## Deployment

Deployment dapat dilakukan pada Virtual Private Server (VPS) dengan basis sistem operasi Ubuntu. Berikut langkah-langkahnya:

### Instal Bun

Bun merupakan *runtime* javascript yang dirancang untuk menjadi alternatif yang lebih cepat dan efisien dari Node.js. Instalasi Bun dapat dilakukan dengan command berikut:

```bash
curl -fsSL https://bun.sh/install | bash
```

### Instal PM2

PM2 merupakan sebuah *daemon process manager* yang berfungsi untuk mengatur agar aplikasi dapat terus berjalan pada sebuah sistem. Instalasi PM2 dapat dilakukan dengan menggunakan *Node Package Manager* (NPM) dengan command berikut:

```bash
npm install pm2@latest -g
```

Dokumentasi terkait PM2 dapat dilihat pada [link berikut](https://pm2.keymetrics.io/docs/usage/quick-start/).

### Clone Repository

```bash
https://github.com/samuelyuma/fp-sistem-cerdas.git
```

### Konfigurasi Backend

Pada folder `frontend` dan `backend`, jalankan command berikut untuk melakukan instalasi *dependencies* yang dibutuhkan:

```bash
bun install
```

#### Backend

Masuk ke folder `backend` dan jalankan command berikut untuk melakukan kompilasi aplikasi menjadi bentuk file biner yang dapat langsung dieksekusi:

```bash 
bun build \
	--compile \
	--minify-whitespace \
	--minify-syntax \
	--target bun \
	--outfile server \
	./src/index.ts
```

#### Frontend

Masuk ke folder `frontend` dan jalankan command berikut:

```bash
bun run build
```

### Konfigurasi PM2

Pada folder `frontend` dan `backend`, jalankan command berikut untuk melakukan inisiasi file konfigurasi pm2 yaitu `ecosystem.config.js`:

```bash
pm2 init simple
```

#### Backend

Masuk ke folder `backend`, lalu buka file konfigurasi PM2 dan ubah isinya dengan konfigurasi berikut:

```js
module.exports = {
  apps : [{
    name   : "sistem-cerdas-backend",
    script : "./server"
  }]
}
```

lalu jalankan command:

```bash
pm2 start ./ecosystem.config.js
```

#### Frontend

Masuk ke folder `frontend`, lalu buka file konfigurasi PM2 dan ubah isinya dengan konfigurasi berikut:

```js
module.exports = {
  apps : [{
    name   : "sistem-cerdas-frontend",
    script : "bun",
	args   : "run preview",
  }]
}
```

lalu jalankan command:

```bash
pm2 start ./ecosystem.config.js
```

### Cek Status PM2

Untuk mengetahui apakah kedua aplikasi sudah berjalan di PM2, gunakan command:

```
pm2 status
```