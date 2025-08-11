"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/firebase/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import Image from "next/image";

export default function DisplayScreen() {
  const [patientName, setPatientName] = useState("");
  const [queue, setQueue] = useState<number | null>(null);
  const [bannerText, setBannerText] = useState("");
  const [isInstrumental, setIsInstrumental] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "currentCall", "data"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as {
          name?: string;
          queue?: number;
          bannerText?: string;
          isInstrumental?: boolean;
        };
        setPatientName(data?.name ?? "");
        setQueue(typeof data?.queue === "number" ? data.queue : null);
        setBannerText(data?.bannerText ?? "");
        setIsInstrumental(!!data?.isInstrumental);
      }
    });
    return () => unsub();
  }, []);

  // Banner normalize (newline -> •) + hız
  const normalized = useMemo(() => {
    const base = bannerText?.trim().length
      ? bannerText
      : "⚠️ Ekranda ad-soyadı gördükdən sonra daxil olun.";
    return base.replace(/\n+/g, " • ").replace(/\s+/g, " ").trim();
  }, [bannerText]);
  const durationSec = Math.max(15, Math.floor(normalized.length / 5));

  return (
    <main className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-between p-8 text-[#2C3E50]">
      {/* Doktor Bilgisi Kartı */}
      <div className="flex items-center gap-6 bg-white rounded-xl shadow-md px-6 py-4 w-full max-w-4xl">
        <div className="relative w-[250px] h-[250px] rounded-full overflow-hidden border-2 border-blue-600 shadow-lg bg-white p-1">
          <Image
            src="/assets/doctor.jpeg"
            alt="Doktor"
            fill
            sizes="250px"
            className="object-cover rounded-full"
            priority
          />
        </div>
        <div>
          <h2 className="text-4xl font-bold text-blue-700">Dr. Cavid İsmayılov</h2>
          <p className="text-gray-600 my-2 font-semibold text-3xl">
            Həkim Travmatoloq - Ortoped
          </p>
          <p className="text-gray-600 font-semibold text-2xl">
            <a href="tel:+994515284140">📞 +994 51 528 41 40</a> | ✉️ dr.j.ismayilov@gmail.com
          </p>
        </div>
      </div>

      {/* Hasta Bilgisi */}
      <div className="text-center mt-5 bg-white px-16 py-10 rounded-2xl shadow-lg w-full max-w-3xl">
        <p className="text-3xl font-semibold mb-2 text-gray-700">📢 Növbəti Pasient</p>
        {isInstrumental && (
          <p className="text-3xl font-semibold text-emerald-700 mb-3">
             Eyni gündə təkrar müayinəyə gələn
          </p>
        )}
        <h1 className="text-5xl md:text-6xl font-bold text-blue-600">
          {patientName || "—"}
        </h1>
        <p className="text-2xl mt-4 font-semibold text-gray-700">
          Sıra No: <span className="font-semibold">{queue ?? "—"}</span>
        </p>
      </div>

      {/* Reklam Bandosu */}
      <div className="w-full overflow-hidden bg-red-600 py-8 mt-8">
        <div
          className="marquee-track whitespace-nowrap text-white text-4xl font-bold inline-flex w-max gap-10 will-change-transform"
          style={{ animationDuration: `${durationSec}s` }}
        >
          <span>{normalized} • </span>
          <span aria-hidden="true">{normalized} • </span>
        </div>
      </div>
    </main>
  );
}