# VIVIW

AI Interview Assistant — Real-time, Invisible, Local.

---

## Quick Start

### Untuk Development

```bat
npm install --ignore-scripts
npm run dev
```

### Untuk Build Installer

```bat
npm run dist:win
```

Installer ada di folder `release/`.

---

## Requirements

| Requirement | Keterangan |
|-------------|-----------|
| Node.js 18+ | Runtime untuk Electron |
| Python 3.9+ | Untuk faster-whisper STT |
| SoX | Audio capture WASAPI loopback |
| 9Router | AI gateway di `localhost:20128` |

### Setup Python STT

```bat
python\install_deps.bat
```

### Install SoX

Download dari [https://sox.sourceforge.net](https://sox.sourceforge.net) dan tambahkan ke PATH.

---

## Keyboard Shortcuts

| Shortcut | Aksi |
|----------|------|
| `Ctrl+Shift+Space` | Tampilkan/sembunyikan window |
| `Ctrl+Shift+C` | Copy jawaban AI |

*(Bisa dikonfigurasi di Settings)*

---

## Features

- Capture audio dari speaker/meeting (WASAPI loopback)
- Transkripsi offline dengan `faster-whisper` (model small)
- Deteksi otomatis apakah ucapan adalah pertanyaan interview
- Streaming jawaban AI via 9Router (OpenAI-compatible)
- Upload resume (PDF/DOCX) sebagai konteks
- Upload dokumen tambahan (JD, notes, technical docs)
- Riwayat sesi Q&A
- Window stealth — tidak terdeteksi screen recording/proctoring
- Global keyboard shortcut untuk toggle visibility

---

## Architecture

```
Audio (SoX) → STT (Python/faster-whisper) → Question Detection
                                                      ↓
                                           AI (9Router @ :20128)
                                                      ↓
                                             Streaming Answer UI
```
