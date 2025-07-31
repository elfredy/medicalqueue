"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import Image from "next/image";

export default function DisplayScreen() {
  const [patientName, setPatientName] = useState("");
  const [queue, setQueue] = useState<number | null>(null);
  const [bannerText, setBannerText] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "currentCall", "data"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPatientName(data.name);
        setQueue(data.queue);
        setBannerText(data.bannerText || "");
      }
    });

    return () => unsub();
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-between p-8 text-[#2C3E50]">
      {/* Doktor Bilgisi Kartı */}
      <div className="flex items-center gap-6 bg-white rounded-xl shadow-md px-6 py-4 w-full max-w-4xl">
        <Image
          src="/assets/doctor.jpg"
          alt="Doktor"
          width={180}
          height={180}
          className="rounded-full border-2 border-blue-600 object-cover shadow-lg bg-white p-1"
        />
        <div>
          <h2 className="text-3xl font-bold text-blue-700">
            Dr. Cavid İsmayılov
          </h2>
          <p className=" text-gray-600 my-2 font-semibold text-xl">
            Həkim Travmatoloq
          </p>
          <p className=" text-gray-600 font-semibold text-xl">
            <a href="tel:+994515284140">📞 +994 51 528 41 40</a> | ✉️ cavidismayilov@gmail.com
          </p>
        </div>
      </div>

      {/* Hasta Bilgisi */}
      <div className="text-center mt-5 bg-white px-18 py-10 rounded-2xl shadow-lg w-full max-w-3xl">
        <p className="text-3xl font-semibold mb-4 text-gray-700">
          📢 Növbəti Pasient
        </p>
        <h1 className="text-5xl md:text-6xl font-bold text-blue-600">
          {patientName || "—"}
        </h1>
        <p className="text-2xl mt-4 text-gray-700">
          Sıra No: <span className="font-semibold">{queue ?? "—"}</span>
        </p>
      </div>

      {/* Reklam Bandosu */}
      <div className="w-full overflow-hidden bg-red-600 py-5 mt-10">
        <div className="animate-marquee whitespace-nowrap text-white text-3xl font-medium">
          <span className="mx-10">
            {bannerText || "⚠️ Ekranda ad soyadı gördükdən sonra daxil olun."}
          </span>
          <span className="mx-10">
          {bannerText || "⚠️ Ekranda ad soyadı gördükdən sonra daxil olun."}          </span>
          <span className="mx-10">
          {bannerText || "⚠️ Ekranda ad soyadı gördükdən sonra daxil olun."}          </span>
        </div>
      </div>
    </main>
  );
}