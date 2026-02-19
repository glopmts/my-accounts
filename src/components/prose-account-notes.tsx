"use client";

import { FileText, Minimize2, MoveDiagonal2 } from "lucide-react";
import React from "react";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { Button } from "./ui/button";

const ProseAccountNotes = ({
  notes,
  isExpanded,
  setIsExpanded,
}: {
  notes: string;
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <>
      <div
        className={`${isExpanded ? "max-h-screen w-full" : "space-y-2 dark:bg-zinc-900 p-2 border rounded-md"}`}
      >
        {isExpanded ? (
          <div className=""></div>
        ) : (
          <div className={`flex items-center justify-between w-full`}>
            <div
              className={`flex items-center gap-2 text-sm font-medium dark:text-gray-400`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Contéudo</span>
            </div>
            <div className="pb-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded((prev) => !prev)}
              >
                {isExpanded ? (
                  <span title="Fechar">
                    <Minimize2 className="w-4 h-4 shrink-0" />
                  </span>
                ) : (
                  <span title="Expandir">
                    <MoveDiagonal2 className="w-4 h-4 shrink-0" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}

        <div
          className={`p-3 rounded-lg prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-strong:font-semibold prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg prose-img:rounded-lg prose-img:border prose-img:max-h-96 prose-img:object-cover prose-hr:border-border prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 prose-li:text-muted-foreground prose-table:border prose-table:rounded-lg prose-th:bg-muted prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2 prose-td:border-t  ${isExpanded ? "overflow-auto " : "overflow-hidden  max-h-96"}`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {notes}
          </ReactMarkdown>
        </div>
      </div>
    </>
  );
};

export default ProseAccountNotes;
