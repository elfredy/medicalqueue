"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  Timestamp,
} from "firebase/firestore";

export default function AdminPanel() {
  const [name, setName] = useState("");
  const [queue, setQueue] = useState(1);
  const [bannerText, setBannerText] = useState("");
  const [saving, setSaving] = useState(false);

  // Yeni: İnstrumental checkbox
  const [isInstrumental, setIsInstrumental] = useState(false);

  // Yeni: Manuel sıra girişi
  const [manualQueue, setManualQueue] = useState<string>("");

  const resetQueue = async () => {
    await setDoc(
      doc(db, "currentCall", "data"),
      { name: "", queue: 1, calledAt: Timestamp.now() },
      { merge: true }
    );
    setQueue(1);
  };

  useEffect(() => {
    const fetchQueue = async () => {
      const docRef = doc(db, "currentCall", "data");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as {
          queue?: number;
          calledAt?: { toDate?: () => Date };
          bannerText?: string;
          isInstrumental?: boolean;
        };

        const now = new Date();
        const lastCallTime = data?.calledAt?.toDate?.() || null;

        if (lastCallTime) {
          const sameDay =
            now.getFullYear() === lastCallTime.getFullYear() &&
            now.getMonth() === lastCallTime.getMonth() &&
            now.getDate() === lastCallTime.getDate();

          if (sameDay && typeof data.queue === "number") {
            setQueue(data.queue + 1); // Aynı gün → devam
          } else {
            setQueue(1); // Farklı gün → sıfırla
          }
        } else {
          setQueue(1);
        }

        setBannerText(data.bannerText || "");
        setIsInstrumental(!!data.isInstrumental);
      } else {
        setQueue(1);
      }
    };

    fetchQueue();
  }, []);

  // Otomatik sıra ile çağır
  const handleCall = async () => {
    if (!name.trim()) return;

    const timestamp = Timestamp.now();
    setSaving(true);

    await setDoc(
      doc(db, "currentCall", "data"),
      {
        name,
        queue,
        calledAt: timestamp,
        bannerText,
        isInstrumental,
      },
      { merge: true }
    );

    await addDoc(collection(db, "history"), {
      name,
      queue,
      calledAt: timestamp,
      isInstrumental,
      manual: false,
    });

    setSaving(false);
    setQueue((prev) => prev + 1);
    setName("");
  };

  // Manuel sıra ile çağır (sırayı bozmaz; next queue artmaz)
  const handleManualCall = async () => {
    if (!name.trim()) return;
    const num = parseInt(manualQueue, 10);
    if (isNaN(num) || num < 1) return;

    const timestamp = Timestamp.now();
    setSaving(true);

    await setDoc(
      doc(db, "currentCall", "data"),
      {
        name,
        queue: num,
        calledAt: timestamp,
        bannerText,
        isInstrumental,
      },
      { merge: true }
    );

    await addDoc(collection(db, "history"), {
      name,
      queue: num,
      calledAt: timestamp,
      isInstrumental,
      manual: true,
    });

    setSaving(false);
    setName("");
    // Not: queue state'ini değiştirmiyoruz; akış bozulmasın.
  };

  const updateBanner = async () => {
    setSaving(true);
    await setDoc(
      doc(db, "currentCall", "data"),
      { bannerText },
      { merge: true }
    );
    setSaving(false);
  };

  const bannerMax = 500;

  return (
    <main className="min-h-screen flex flex-col items-center p-8 bg-[#F7F9FC] text-[#2C3E50]">
      <h1 className="text-3xl font-bold mb-4 text-blue-700">👨‍⚕️ Admin Panel</h1>

      <a
        href="/history"
        className="mb-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-lg shadow-sm transition"
      >
        📋 Çağrılan Pasientlər
      </a>

      {/* Hasta Adı */}
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl mb-6">
        <label htmlFor="patientName" className="block text-sm font-semibold mb-2">
          Xəstə adı və soyadı
        </label>
        <input
          id="patientName"
          className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Xəstə adı və soyadı"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* İnstrumental checkbox */}
        <label className="flex items-center gap-2 mt-4 select-none cursor-pointer">
          <input
            type="checkbox"
            className="h-5 w-5 accent-blue-600"
            checked={isInstrumental}
            onChange={(e) => setIsInstrumental(e.target.checked)}
          />
          <span className="text-md text-gray-600 font-semibold ">
            Eyni gündə təkrar müayinəyə gələn
          </span>
        </label>

        <button
          onClick={handleCall}
          disabled={!name.trim() || saving}
          className={`mt-4 px-6 py-3 rounded-lg font-semibold w-full text-white transition
            ${!name.trim() || saving ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"}`}
        >
          {saving ? "Göndərilir..." : `Çağır (Sıra: ${queue})`}
        </button>

        {/* Manuel sıra alanı + butonlar */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={resetQueue}
            className="bg-gray-800 cursor-pointer text-white px-6 py-3 rounded-lg font-semibold hover:bg-black w-full"
          >
            🔄 Sıranı Sıfırla (1-dən Başlat)
          </button>

          <div className="flex items-center gap-2">
            <input
              className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="number"
              min={1}
              placeholder="Manual sıra nömrəsi"
              value={manualQueue}
              onChange={(e) => setManualQueue(e.target.value)}
            />
            <button
              onClick={handleManualCall}
              disabled={!name.trim() || !manualQueue.trim() || saving}
              className={`px-4 py-3 rounded-lg cursor-pointer font-semibold text-white transition
                ${!name.trim() || !manualQueue.trim() || saving ? "bg-emerald-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"}`}
            >
              Özəl Çağır
            </button>
          </div>
        </div>
      </div>

      {/* Elan / Uyarı Mesajı */}
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl">
        <label htmlFor="banner" className="block text-sm font-semibold mb-2">
          Elan bölməsi
        </label>

        <textarea
          id="banner"
          className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-red-400 resize-y min-h-[120px]"
          placeholder={`Örn:\nHəkim 14:20-dən etibarən əməliyyatdadır.\nLütfən sıranızı qoruyun.`}
          value={bannerText}
          onChange={(e) => setBannerText(e.target.value)}
          rows={5}
          maxLength={bannerMax}
        />
        <div className="mt-1 text-right text-sm text-gray-500">
          {bannerText.length}/{bannerMax}
        </div>

        <button
          onClick={updateBanner}
          disabled={saving}
          className={`mt-4 px-6 py-3 rounded-lg font-semibold w-full text-white transition
            ${saving ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 cursor-pointer"}`}
        >
          {saving ? "Yadda saxlanılır..." : "Yadda Saxla"}
        </button>
      </div>
    </main>
  );
}