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

  useEffect(() => {
    const fetchQueue = async () => {
      const docRef = doc(db, "currentCall", "data");
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
  
        const now = new Date();
        const lastCallTime = data.calledAt?.toDate?.() || null;
  
        if (lastCallTime) {
          const sameDay =
            now.getFullYear() === lastCallTime.getFullYear() &&
            now.getMonth() === lastCallTime.getMonth() &&
            now.getDate() === lastCallTime.getDate();
  
          if (sameDay) {
            setQueue(data.queue + 1); // Aynı gün → devam et
          } else {
            setQueue(1); // Farklı gün → sıfırla
          }
        } else {
          setQueue(1); // Veri yoksa başla
        }
  
        setBannerText(data.bannerText || "");
      } else {
        setQueue(1); // Belge hiç yoksa başla
      }
    };
  
    fetchQueue();
  }, []);

  const handleCall = async () => {
    if (!name.trim()) return;

    const timestamp = Timestamp.now();

    await setDoc(
      doc(db, "currentCall", "data"),
      {
        name,
        queue,
        calledAt: timestamp,
        bannerText, // banner'ı da aynı anda yollayalım
      },
      { merge: true }
    );

    await addDoc(collection(db, "history"), {
      name,
      queue,
      calledAt: timestamp,
    });

    setQueue((prev) => prev + 1);
    setName("");
  };

  const updateBanner = async () => {
    await setDoc(
      doc(db, "currentCall", "data"),
      { bannerText },
      { merge: true }
    );
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-8 bg-[#F7F9FC] text-[#2C3E50]">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">👨‍⚕️ Admin Panel</h1>
      {/* Geçmişe Git Butonu */}
      <a
        href="/history"
        className="mb-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-lg shadow-sm transition"
      >
        📋 Çağrılan Pasientlər
      </a>
       {/* Hasta Adı */}
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl mb-6">
        <label className="block text-sm font-semibold mb-2">
          Xəstə adı və soyadı
        </label>
        <input
          className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Xəstə adı və soyadı"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={handleCall}
          className="mt-4 bg-blue-600 cursor-pointer text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 w-full"
        >
          Çağır (Sıra: {queue})
        </button>
      </div>
      {/* Reklam / Uyarı Mesajı */}
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl">
        <label className="block text-sm font-semibold mb-2">Elan bölməsi</label>
        <input
          className="w-full p-3 border  border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-red-400"
          type="text"
          placeholder="Həkim 14:20 dən etibarən əməliyyatdadır."
          value={bannerText}
          onChange={(e) => setBannerText(e.target.value)}
        />
        <button
          onClick={updateBanner}
          className="mt-4 cursor-pointer bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 w-full"
        >
          Yadda Saxla
        </button>
      </div>
    </main>
  );
}
