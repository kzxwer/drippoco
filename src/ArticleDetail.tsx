import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

interface ArticleDetailProps {
  article: Article | null;
}

export function ArticleDetail({ article }: ArticleDetailProps) {
  if (!article) {
    return (
      <div className="text-center text-stone-500 dark:text-zinc-400 py-12">
        Select an article to read
      </div>
    );
  }

  return (
    <div className="bg-stone-50 dark:bg-zinc-900 rounded-lg p-8 shadow-sm border border-stone-200 dark:border-zinc-800">
      <h1 className="text-4xl font-bold mb-4 text-stone-900 dark:text-zinc-100">
        {article.title}
      </h1>
      {article.summary && (
        <p className="text-lg text-stone-600 dark:text-zinc-300 mb-6">
          {article.summary}
        </p>
      )}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="bg-stone-200 dark:bg-zinc-700 text-stone-700 dark:text-zinc-200 px-3 py-1 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {article.markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
