"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [apiMessage, setApiMessage] = useState<string>(
    "Loading from backend...",
  );

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setApiMessage(data.message))
      .catch((err) =>
        setApiMessage("Failed to fetch API: Is the backend running?"),
      );
  }, []);

  console.log(apiMessage);

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-black text-black dark:text-white">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16 space-y-12 text-center">
        <Image
          className="dark:invert mb-8 transition-transform duration-500 hover:scale-110"
          src="/next.svg"
          alt="Next.js logo"
          width={150}
          height={30}
          priority
        />

        <div className="flex flex-col items-center gap-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-blue-500 to-emerald-500">
            Next.js + FastAPI
          </h1>
          <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
            Seamlessly rendering Next.js UI using a backend powered by Python.
          </p>
        </div>

        <div className="relative group w-full max-w-md p-px rounded-2xl bg-linear-to-r from-teal-400 via-blue-500 to-purple-600">
          <div className="absolute inset-0 bg-linear-to-r from-teal-400 via-blue-500 to-purple-600 blur opacity-40 group-hover:opacity-80 transition duration-500"></div>
          <div className="relative bg-white dark:bg-zinc-950 rounded-2xl p-8 flex flex-col items-center gap-4 transition-transform hover:-translate-y-1">
            <span className="text-sm uppercase tracking-widest text-zinc-500 font-semibold mb-2">
              Backend Response
            </span>
            <div className="text-2xl font-medium text-zinc-800 dark:text-zinc-100 flex items-center justify-center min-h-16">
              {apiMessage === "Loading from backend..." ? (
                <span className="animate-pulse">{apiMessage}</span>
              ) : (
                apiMessage
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
