// src/app/history/page.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseConfig";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  Timestamp,
  writeBatch,
  doc,
} from "firebase/firestore";

interface HistoryItem {
  id: string;
  name: string;
  queue: number;
  calledAt: any;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [cleaning, setCleaning] = useState(false);

  useEffect(() => {
    const run = async () => {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      // 1) BUGÜNÜ ÇEK
      const qToday = query(
        collection(db, "history"),
        where("calledAt", ">=", Timestamp.fromDate(startOfToday)),
        where("calledAt", "<", Timestamp.fromDate(endOfToday)),
        orderBy("calledAt", "desc")
      );
      const snapToday = await getDocs(qToday);
      const todayData: HistoryItem[] = snapToday.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<HistoryItem, "id">),
      }));
      setHistory(todayData);

      // 2) DÜN VE ÖNCESİNİ TEMİZLE
      setCleaning(true);
      const qOld = query(
        collection(db, "history"),
        where("calledAt", "<", Timestamp.fromDate(startOfToday))
      );
      const snapOld = await getDocs(qOld);

      if (!snapOld.empty) {
        const batch = writeBatch(db);
        snapOld.docs.forEach((d) => batch.delete(doc(db, "history", d.id)));
        await batch.commit();
      }
      setCleaning(false);
    };

    run();
  }, []);

  return (
    <main className="min-h-screen p-6 bg-gray-50 text-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">📋 Bugünkü Hasta Çağrıları</h1>
        {cleaning && <span className="text-sm text-gray-500">Dünkü kayıtlar temizleniyor…</span>}
      </div>

      {history.length === 0 ? (
        <p>Bugün için çağrılan hasta bulunmuyor.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-100 text-left">
              <th className="p-2 border">Sıra</th>
              <th className="p-2 border">Ad Soyad</th>
              <th className="p-2 border">Saat</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50">
                <td className="p-2 border">{item.queue}</td>
                <td className="p-2 border">{item.name}</td>
                <td className="p-2 border">
                  {new Date(item.calledAt.seconds * 1000).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}