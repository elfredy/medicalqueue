# MedicalQueue

A real-time queue and patient call system for clinics and doctors, built with **Next.js** and **Firebase**.

## Features

- 👨‍⚕️ Doctor control panel to call patients
- 📺 External screen for displaying current patient info
- 🔁 Live updates using Firebase Firestore
- 🔊 Custom banner messages for announcements (e.g. surgery, break)
- 🕒 Auto-reset queue number daily
- ✨ Responsive and modern UI

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Firebase Firestore

## Pages

- `/admin` → Doctor’s panel
- `/display` → External TV screen display
- `/history` → View previously called patients

## Coming soon

- 🔐 Authentication
- 📊 Analytics dashboard
- 🧑‍⚕️ Multi-doctor support

---

## Setup

```bash
git clone https://github.com/yourusername/medicalqueue.git
cd medicalqueue
npm install
npm run dev