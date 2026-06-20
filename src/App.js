import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "drippoco-articles-v1";

const starterArticles = [
  {
    id: "starter-1",
    title: "Why Minimal Interfaces Win",
    subtitle: "Less decoration, more intention.",
    tags: ["Design", "Productivity"],
    cover:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
    content:
      "Most great writing tools disappear while you work. They don't compete for attention. They frame your ideas with enough structure to keep momentum, then get out of the way.\n\nWhen your editor feels calm, you write longer, revise better, and publish faster. The goal isn't to be plain. The goal is to be precise.",
    createdAt: "2026-06-20T09:00:00.000Z",
  },
  {
    id: "starter-2",
    title: "Shipping Articles Like Product Iterations",
    subtitle: "Treat each post like a small release.",
    tags: ["Writing", "Workflow"],
    cover:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1600&q=80",
    content:
      "Great publishing is mostly rhythm. Draft quickly, publish small, and revisit after feedback.\n\nA simple queue of drafts keeps you from waiting for perfect inspiration. Momentum compounds when your process is lightweight.",
    createdAt: "2026-06-17T14:40:00.000Z",
  },
];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getExcerpt(text) {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.length > 180 ? `${trimmed.slice(0, 180)}...` : trimmed;
}

function App() {
  const [articles, setArticles] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return starterArticles;
    }

    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : starterArticles;
    } catch {
      return starterArticles;
    }
  });

  const [selectedId, setSelectedId] = useState(articles[0]?.id ?? "");
  const [draft, setDraft] = useState({
    title: "",
    subtitle: "",
    tags: "",
    cover: "",
    content: "",
  });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  }, [articles]);

  const selectedArticle = useMemo(
    () => articles.find((article) => article.id === selectedId) ?? articles[0],
    [articles, selectedId],
  );

  function updateDraft(event) {
    const { name, value } = event.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  }

  function publishArticle(event) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.content.trim()) {
      setNotice("Title and content are required to publish.");
      return;
    }

    const newArticle = {
      id: crypto.randomUUID(),
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim() || "Freshly published from Drippoco.",
      tags: draft.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      cover:
        draft.cover.trim() ||
        "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1600&q=80",
      content: draft.content.trim(),
      createdAt: new Date().toISOString(),
    };

    setArticles((prev) => [newArticle, ...prev]);
    setSelectedId(newArticle.id);
    setDraft({ title: "", subtitle: "", tags: "", cover: "", content: "" });
    setNotice("Published. Your new article is now at the top.");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#f5f5f4,_#fafaf9_45%,_#f3f4f6)] pb-16">
      <header className="sticky top-0 z-20 border-b border-zinc-200/70 bg-stone-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Medium-like Template
            </p>
            <h1 className="text-xl font-extrabold tracking-tight text-zinc-900">
              Drippoco Journal
            </h1>
          </div>
          <div className="rounded-full border border-zinc-200 bg-white px-4 py-1 text-sm font-medium text-zinc-700">
            {articles.length} published
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-5 pt-6 md:grid-cols-12 md:px-8">
        <section className="animate-rise rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm md:col-span-5">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900">
            Write a post
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Draft in plain text. Separate tags with commas.
          </p>

          <form className="mt-4 space-y-3" onSubmit={publishArticle}>
            <input
              className="field"
              name="title"
              placeholder="Article title"
              value={draft.title}
              onChange={updateDraft}
            />
            <input
              className="field"
              name="subtitle"
              placeholder="Subtitle"
              value={draft.subtitle}
              onChange={updateDraft}
            />
            <input
              className="field"
              name="tags"
              placeholder="Design, React, Tailwind"
              value={draft.tags}
              onChange={updateDraft}
            />
            <input
              className="field"
              name="cover"
              placeholder="Cover image URL (optional)"
              value={draft.cover}
              onChange={updateDraft}
            />
            <textarea
              className="field min-h-52 resize-y"
              name="content"
              placeholder="Write your article..."
              value={draft.content}
              onChange={updateDraft}
            />
            <button
              className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
              type="submit"
            >
              Publish article
            </button>
            {notice ? <p className="text-sm text-zinc-600">{notice}</p> : null}
          </form>
        </section>

        <section className="space-y-4 md:col-span-7">
          <div className="animate-rise rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900">
              Published stories
            </h2>
            <div className="mt-4 space-y-3">
              {articles.map((article) => (
                <button
                  className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                    selectedArticle?.id === article.id
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white hover:border-zinc-400"
                  }`}
                  key={article.id}
                  onClick={() => setSelectedId(article.id)}
                  type="button"
                >
                  <p className="text-base font-semibold tracking-tight">
                    {article.title}
                  </p>
                  <p
                    className={`mt-1 line-clamp-2 text-sm ${
                      selectedArticle?.id === article.id
                        ? "text-zinc-200"
                        : "text-zinc-500"
                    }`}
                  >
                    {getExcerpt(article.content)}
                  </p>
                  <p
                    className={`mt-2 text-xs uppercase tracking-wider ${
                      selectedArticle?.id === article.id
                        ? "text-zinc-300"
                        : "text-zinc-400"
                    }`}
                  >
                    {formatDate(article.createdAt)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {selectedArticle ? (
            <article className="animate-rise overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
              <img
                alt={selectedArticle.title}
                className="h-52 w-full object-cover"
                src={selectedArticle.cover}
              />
              <div className="p-6 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  {formatDate(selectedArticle.createdAt)}
                </p>
                <h3 className="mt-2 font-serif text-3xl font-semibold leading-tight text-zinc-900">
                  {selectedArticle.title}
                </h3>
                <p className="mt-3 text-lg text-zinc-600">
                  {selectedArticle.subtitle}
                </p>
                {selectedArticle.tags?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedArticle.tags.map((tag) => (
                      <span
                        className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600"
                        key={tag}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="article-body mt-6">
                  {selectedArticle.content.split("\n").map((line, index) => (
                    <p key={`${selectedArticle.id}-${index}`}>{line}</p>
                  ))}
                </div>
              </div>
            </article>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default App;
