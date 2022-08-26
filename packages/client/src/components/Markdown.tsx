import { FC } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
  content: string;
}
export const Markdown: FC<MarkdownProps> = ({ content }) => {
  return (
    <ReactMarkdown className="markdown" remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSlug]}>
      {content}
    </ReactMarkdown>
  );
};
