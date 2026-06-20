import { useState } from "react";

export function SendMessagePage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSend() {
    if (!message.trim()) {
      setErrorMsg("Please enter a message");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setErrorMsg("");

    try {
      const response = await fetch("https://drippoco-production.up.railway.app/api/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Failed to send message. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setErrorMsg(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSend();
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-5 pt-6 md:px-8">
      <div className="animate-rise rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
          Send Message
        </h1>
        <p className="text-base text-zinc-500 dark:text-zinc-400 mb-8">
          Send a message to Slack. Use Ctrl+Enter (or Cmd+Enter on Mac) to send
          quickly.
        </p>

        <div className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="field min-h-40 resize-none"
          />

          {status === "success" && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-200">
              ✓ Message sent successfully!
            </div>
          )}

          {status === "error" && (
            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-200">
              ✕ {errorMsg}
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={loading || !message.trim()}
            className="w-full bg-zinc-900 dark:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-zinc-800 dark:hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </div>
      </div>
    </main>
  );
}
