import { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Draft = {
  title: string;
  slug: string;
  summary: string;
  cover: string;
  tags: string;
  markdown: string;
};

type Article = {
  slug: string;
  title: string;
  summary: string;
  cover: string;
  tags: string[];
  markdown: string;
  sourcePath: string;
  categoryPath: string;
};

type Frontmatter = {
  meta: Record<string, string>;
  body: string;
};

type DraftItem = Draft & { id: string };

const DRAFTS_KEY = "drippoco-md-drafts-v1";

const emptyDraft: Draft = {
  title: "",
  slug: "",
  summary: "",
  cover: "",
  tags: "",
  markdown: "",
};

// Helper functions
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function readFrontmatter(fileText: string): Frontmatter {
  if (!fileText.startsWith("---\n")) {
    return { meta: {}, body: fileText };
  }

  const end = fileText.indexOf("\n---\n", 4);
  if (end === -1) {
    return { meta: {}, body: fileText };
  }

  const rawMeta = fileText.slice(4, end).trim();
  const body = fileText.slice(end + 5).trim();
  const meta = {};

  rawMeta.split("\n").forEach((line) => {
    const separator = line.indexOf(":");
    if (separator === -1) return;
    const key = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    meta[key] = value;
  });

  return { meta, body };
}

function buildMarkdownFile(draft: Draft): string {
  const tags = draft.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .join(", ");

  const frontmatterLines = [
    "---",
    `title: ${draft.title.trim()}`,
    `summary: ${draft.summary.trim()}`,
    `tags: ${tags}`,
    `cover: ${draft.cover.trim()}`,
    "---",
    "",
  ];

  return `${frontmatterLines.join("\n")}${draft.markdown.trim()}\n`;
}

function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function formatCategoryLabel(categoryPath: string): string {
  if (!categoryPath || categoryPath === "root") return "All Posts";
  return categoryPath
    .split("/")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" / ");
}

function encodeCategoryPath(categoryPath: string): string {
  if (!categoryPath || categoryPath === "root") return "";
  return encodeURIComponent(categoryPath);
}

function decodeCategoryPath(encoded: string): string {
  if (!encoded) return "root";
  return decodeURIComponent(encoded);
}

function usePublishedArticles() {
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadArticles() {
      try {
        setLoading(true);
        setError("");
        const base = process.env.PUBLIC_URL || "";
        const indexResponse = await fetch(`${base}/posts/index.json`, {
          cache: "no-store",
        });

        if (!indexResponse.ok) {
          throw new Error("Cannot load posts index.");
        }

        const indexPayload = await indexResponse.json();
        const files = Array.isArray(indexPayload.files)
          ? indexPayload.files
          : [];

        const loaded = await Promise.all(
          files.map(async (filePath: string) => {
            const response = await fetch(`${base}/posts/${filePath}`, {
              cache: "no-store",
            });
            if (!response.ok) {
              throw new Error(`Cannot read post file: ${filePath}`);
            }

            const raw = await response.text();
            const { meta, body } = readFrontmatter(raw);
            const fileName = filePath.split("/").pop() || "untitled.md";
            const baseName = fileName.replace(/\.md$/i, "");
            const slug = meta.slug || baseName;

            // Extract category from path: "design/article.md" -> "design", "article.md" -> "root"
            const pathParts = filePath.split("/");
            const categoryPath =
              pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : "root";

            return {
              slug,
              title: meta.title || baseName,
              summary: meta.summary || "No summary",
              cover: meta.cover || "",
              tags: (meta.tags || "")
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
              markdown: body,
              sourcePath: filePath,
              categoryPath,
            };
          }),
        );

        setAllArticles(loaded);

        // Extract unique categories
        const categorySet = new Set(loaded.map((a) => a.categoryPath));
        const uniqueCategories = Array.from(categorySet).sort();
        setCategories(uniqueCategories);
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Failed to load posts.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadArticles();
  }, []);

  return { allArticles, categories, loading, error };
}

function Shell({ children }: { children: React.ReactNode }) {
  const { categories } = usePublishedArticles();
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#f5f5f4,_#fafaf9_45%,_#f3f4f6)] pb-16">
      <header className="sticky top-0 z-20 border-b border-zinc-200/70 bg-stone-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          {/* Left: Logo */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Think and write
            </p>
            <h1 className="text-xl font-extrabold tracking-tight text-zinc-900">
              Drippoco Journal
            </h1>
          </div>

          {/* Center: Glasses icon with category menu */}
          <div
            className="relative"
            onMouseEnter={() => setShowCategoryMenu(true)}
            onMouseLeave={() => setShowCategoryMenu(false)}
          >
            <button
              className="text-2xl transition hover:opacity-70"
              type="button"
            >
              👓
            </button>

            {showCategoryMenu && (
              <div className="absolute left-1/2 top-12 -translate-x-1/2 transform whitespace-nowrap rounded-lg border border-zinc-200 bg-white shadow-lg">
                <Link
                  className="block px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 first:rounded-t-lg"
                  to="/"
                  onClick={() => setShowCategoryMenu(false)}
                >
                  All Posts
                </Link>
                {categories.map((cat) => (
                  <Link
                    className="block px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                    key={cat}
                    to={`/category/${encodeCategoryPath(cat)}`}
                    onClick={() => setShowCategoryMenu(false)}
                  >
                    {formatCategoryLabel(cat)}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right: Home/Create links */}
          <nav className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white p-1">
            <Link
              className="rounded-full px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
              to="/"
            >
              Home
            </Link>
            <Link
              className="rounded-full bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-700"
              to="/create-article"
            >
              Create article
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

function HomePage() {
  return (
    <main className="flex items-center justify-center px-5 py-16 md:px-8">
      <div className="animate-rise rounded-2xl border border-zinc-200/80 bg-white p-8 text-center shadow-sm md:p-12">
        <h1 className="font-serif text-lg font-bold text-zinc-900 md:text-xl">
          Hello from Drippoco
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          Use the glasses icon (👓) above to browse articles by category.
        </p>
      </div>
    </main>
  );
}

function CategoryPage() {
  const { encodedPath = "" } = useParams<{ encodedPath: string }>();
  const categoryPath = decodeCategoryPath(encodedPath);
  const { allArticles, loading, error } = usePublishedArticles();
  const [selectedSlug, setSelectedSlug] = useState("");

  const articles = useMemo(
    () => allArticles.filter((a) => a.categoryPath === categoryPath),
    [allArticles, categoryPath],
  );

  const selectedArticle = useMemo(
    () => articles.find((a) => a.slug === selectedSlug) || articles[0],
    [articles, selectedSlug],
  );

  useEffect(() => {
    setSelectedSlug(articles[0]?.slug || "");
  }, [articles]);

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-5 pt-6 md:grid-cols-12 md:px-8">
      <section className="animate-rise rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm md:col-span-4">
        <h2 className="text-lg font-bold tracking-tight text-zinc-900">
          {formatCategoryLabel(categoryPath)}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {articles.length} article{articles.length !== 1 ? "s" : ""}
        </p>

        {loading ? (
          <p className="mt-4 text-sm text-zinc-500">Loading...</p>
        ) : null}
        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

        {!loading && !error ? (
          <div className="mt-4 space-y-3">
            {articles.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No posts in this category yet.
              </p>
            ) : (
              articles.map((article) => (
                <button
                  className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                    selectedArticle?.slug === article.slug
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white hover:border-zinc-400"
                  }`}
                  key={article.sourcePath}
                  onClick={() => setSelectedSlug(article.slug)}
                  type="button"
                >
                  <p className="text-base font-semibold tracking-tight">
                    {article.title}
                  </p>
                  <p
                    className={`mt-1 text-sm ${
                      selectedArticle?.slug === article.slug
                        ? "text-zinc-200"
                        : "text-zinc-500"
                    }`}
                  >
                    {article.summary}
                  </p>
                </button>
              ))
            )}
          </div>
        ) : null}
      </section>

      <section className="md:col-span-8">
        {selectedArticle ? (
          <article className="animate-rise overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
            {selectedArticle.cover ? (
              <img
                alt={selectedArticle.title}
                className="h-56 w-full object-cover"
                src={selectedArticle.cover}
              />
            ) : null}
            <div className="p-6 md:p-8">
              <h3 className="font-serif text-3xl font-semibold leading-tight text-zinc-900">
                {selectedArticle.title}
              </h3>
              <p className="mt-3 text-lg text-zinc-600">
                {selectedArticle.summary}
              </p>
              {selectedArticle.tags.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedArticle.tags.map((tag) => (
                    <span
                      className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600"
                      key={`${selectedArticle.slug}-${tag}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="article-body prose prose-zinc mt-6 max-w-none prose-headings:font-sans prose-headings:font-semibold prose-p:font-serif prose-p:text-lg prose-pre:overflow-x-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedArticle.markdown}
                </ReactMarkdown>
              </div>
            </div>
          </article>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-zinc-500 shadow-sm">
            No articles in this category yet.
          </div>
        )}
      </section>
    </main>
  );
}

function CreateArticlePage() {
  const [draft, setDraft] = useState(emptyDraft);
  const [drafts, setDrafts] = useState<DraftItem[]>(() => {
    try {
      const raw = localStorage.getItem(DRAFTS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [editingId, setEditingId] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  }, [drafts]);

  function updateDraft(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  }

  function saveDraft() {
    if (!draft.title.trim() || !draft.markdown.trim()) {
      setNotice("Title and markdown are required.");
      return;
    }

    if (editingId) {
      setDrafts((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...item, ...draft } : item,
        ),
      );
      setNotice("Draft updated.");
      return;
    }

    const nextDraft = { id: crypto.randomUUID(), ...draft };
    setDrafts((prev) => [nextDraft, ...prev]);
    setEditingId(nextDraft.id);
    setNotice("Draft saved.");
  }

  function editDraft(item: DraftItem) {
    setEditingId(item.id);
    setDraft({
      title: item.title || "",
      slug: item.slug || "",
      summary: item.summary || "",
      cover: item.cover || "",
      tags: item.tags || "",
      markdown: item.markdown || "",
    });
    setNotice("Editing selected draft.");
  }

  function deleteDraft(id: string) {
    setDrafts((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      setEditingId("");
      setDraft(emptyDraft);
    }
    setNotice("Draft deleted.");
  }

  function resetEditor() {
    setEditingId("");
    setDraft(emptyDraft);
    setNotice("Editor reset.");
  }

  function downloadArticle() {
    if (!draft.title.trim() || !draft.markdown.trim()) {
      setNotice("Title and markdown are required before download.");
      return;
    }

    const fileContent = buildMarkdownFile(draft);
    const fileSlug =
      draft.slug.trim() || slugify(draft.title) || "untitled-article";
    downloadTextFile(`${fileSlug}.md`, fileContent);
    setNotice(
      "Markdown file downloaded. Move it into public/posts/... then deploy.",
    );
  }

  const previewMarkdown = draft.markdown.trim()
    ? draft.markdown
    : "# Live preview\n\nStart writing markdown to see a preview.";

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-5 pt-6 md:grid-cols-12 md:px-8">
      <section className="animate-rise rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm md:col-span-5">
        <h2 className="text-lg font-bold tracking-tight text-zinc-900">
          Create article
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Write markdown, preview live, and download a <code>.md</code> post
          file.
        </p>

        <div className="mt-4 space-y-3">
          <input
            className="field"
            name="title"
            onChange={updateDraft}
            placeholder="Article title"
            value={draft.title}
          />
          <input
            className="field"
            name="slug"
            onChange={updateDraft}
            placeholder="Slug (optional, auto-generated if empty)"
            value={draft.slug}
          />
          <input
            className="field"
            name="summary"
            onChange={updateDraft}
            placeholder="Summary"
            value={draft.summary}
          />
          <input
            className="field"
            name="cover"
            onChange={updateDraft}
            placeholder="Cover image URL"
            value={draft.cover}
          />
          <input
            className="field"
            name="tags"
            onChange={updateDraft}
            placeholder="Tags (comma-separated)"
            value={draft.tags}
          />
          <textarea
            className="field min-h-64 resize-y font-mono"
            name="markdown"
            onChange={updateDraft}
            placeholder="Write markdown here..."
            value={draft.markdown}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
            onClick={saveDraft}
            type="button"
          >
            {editingId ? "Update draft" : "Save draft"}
          </button>
          <button
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
            onClick={resetEditor}
            type="button"
          >
            Reset
          </button>
          <button
            className="col-span-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
            onClick={downloadArticle}
            type="button"
          >
            Download article file
          </button>
        </div>

        {notice ? <p className="mt-3 text-sm text-zinc-600">{notice}</p> : null}

        <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
          <p className="font-semibold text-zinc-800">Publishing flow</p>
          <p className="mt-1">1. Download markdown file from here.</p>
          <p>
            2. Move it to <code>public/posts/[any-path]/</code>.
          </p>
          <p>3. Run deploy. The post is auto-indexed and appears on Home.</p>
        </div>
      </section>

      <section className="space-y-4 md:col-span-7">
        <div className="animate-rise rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold tracking-tight text-zinc-900">
            Drafts
          </h3>
          {drafts.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">No drafts yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {drafts.map((item) => (
                <div
                  className="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2"
                  key={item.id}
                >
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {item.title || "Untitled draft"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {item.slug || slugify(item.title || "") || "no-slug"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                      onClick={() => editDraft(item)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                      onClick={() => deleteDraft(item.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <article className="animate-rise overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
          {draft.cover ? (
            <img
              alt="Preview cover"
              className="h-48 w-full object-cover"
              src={draft.cover}
            />
          ) : null}
          <div className="p-6 md:p-8">
            <h3 className="font-serif text-3xl font-semibold leading-tight text-zinc-900">
              {draft.title || "Preview title"}
            </h3>
            <p className="mt-2 text-lg text-zinc-600">
              {draft.summary || "Preview summary"}
            </p>
            {draft.tags.trim() ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {draft.tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            ) : null}
            <div className="article-body prose prose-zinc mt-6 max-w-none prose-headings:font-sans prose-headings:font-semibold prose-p:font-serif prose-p:text-lg prose-pre:overflow-x-auto">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {previewMarkdown}
              </ReactMarkdown>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Shell>
        <Routes>
          <Route element={<HomePage />} path="/" />
          <Route element={<CategoryPage />} path="/category/:encodedPath" />
          <Route element={<CreateArticlePage />} path="/create-article" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}

export default App;
