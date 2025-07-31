"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";


interface HistoryItem {
  id: string;
  name: string;
  queue: number;
  calledAt: Timestamp;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const q = query(collection(db, "history"), orderBy("calledAt", "desc"));
      const snapshot = await getDocs(q);
      const data: HistoryItem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<HistoryItem, "id">),
      }));
      setHistory(data);
    };

    fetchHistory();
  }, []);

  return (
    <main className="min-h-screen p-6 bg-gray-50 text-gray-800">
      <h1 className="text-2xl font-bold mb-4">📋 Çağrılan Pasientlər</h1>

      {history.length === 0 ? (
        <p>Çağrılan Pasient yoxdur.</p>
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