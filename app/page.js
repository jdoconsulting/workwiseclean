"use client";

import { useState } from "react";

export default function Page() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const payload = {
      messages: [...messages, userMsg],
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("DATA FROM BACKEND:", data);

      const assistantMsg = {
        role: "assistant",
        content: data.reply || "(no response)",
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Client error:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#1d1e20] text-white p-6">
      <div className="flex justify-center mb-6">
        <img
          src="/chatgpt-icon.svg"
          alt="WorkWise"
          className="h-12 w-12 opacity-90"
        />
      </div>

      <h1 className="text-center text-lg mb-4 opacity-90">
        Welcome — I’ll be your sounding board throughout the Leader as Coach program.
        Choose a module below to begin.
      </h1>

      <div className="flex flex-wrap gap-3 justify-center mb-6">
        <button className="px-6 py-3 border rounded-lg">Module 1: Foundations</button>
        <button className="px-6 py-3 border rounded-lg">Module 2: Awareness</button>
        <button className="px-6 py-3 border rounded-lg">Module 3: Cultivating</button>
        <button className="px-6 py-3 border rounded-lg">Module 4: Impact</button>
      </div>

      <div className="flex justify-center mb-6">
        <button className="px-6 py-3 border rounded-lg flex items-center gap-2">
          🗣 Practice Powerful Questioning
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-4 border border-gray-700 rounded-lg mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl whitespace-pre-wrap break-words leading-relaxed text-sm ${
              msg.role === "user"
                ? "bg-blue-600 ml-auto max-w-[80%]"
                : "bg-gray-800 mr-auto max-w-[80%]"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <input
          className="flex-1 rounded-lg px-4 py-3 bg-[#2a2b2f] border border-gray-700"
          placeholder="Type your message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="px-5 py-3 bg-blue-600 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
