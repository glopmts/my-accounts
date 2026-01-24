"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

type TextareaMarkdownProps = {
  initialValue?: string;
  placeholder?: string;
  className?: string;
  textareaClassName?: string;
  previewClassName?: string;
  showPreview?: boolean;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
};

const defaultMarkdown = `# Título Principal

## Subtítulo

Este é um **texto em negrito** e este é um *texto em itálico*.

### Lista não ordenada
- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2

### Lista ordenada
1. Primeiro item
2. Segundo item
3. Terceiro item

### Código
\`\`\`javascript
function exemplo() {
  console.log('Código de exemplo')
}
\`\`\`

Código inline: \`console.log('Hello')\`

### Outros elementos
> Citação
---

Texto normal.`;

const TextareaMarkdown = ({
  initialValue = defaultMarkdown,
  placeholder = "Digite seu texto em Markdown...",
  className = "",
  textareaClassName = "",
  previewClassName = "",
  showPreview = true,
  onChange,
  onBlur,
}: TextareaMarkdownProps) => {
  const [markdown, setMarkdown] = useState(initialValue);
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMarkdown(initialValue);
  }, [initialValue]);

  // Função para inserir texto na posição do cursor
  const insertAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newText = before + textToInsert + after;

    setMarkdown(newText);
    onChange?.(newText);

    // Restaurar foco e posição do cursor
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + textToInsert.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // Função para envolver texto selecionado
  const wrapSelection = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    let newText: string;
    let newPosition: number;

    if (selectedText) {
      // Texto selecionado: envolver com prefixo e sufixo
      newText = before + prefix + selectedText + suffix + after;
      newPosition = end + prefix.length + suffix.length;
    } else {
      // Nenhum texto selecionado: inserir marcadores
      newText = before + prefix + suffix + after;
      newPosition = start + prefix.length;
    }

    setMarkdown(newText);
    onChange?.(newText);

    // Restaurar foco e posição do cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMarkdown(value);
    onChange?.(value);
  };

  const handleBlur = () => {
    onBlur?.(markdown);
  };

  // Funções específicas para cada tipo de formatação
  const insertHeading = (level: number) => {
    const hashes = "#".repeat(level);
    wrapSelection(hashes + " ", "");
  };

  const insertBold = () => {
    wrapSelection("**", "**");
  };

  const insertItalic = () => {
    wrapSelection("*", "*");
  };

  const insertCode = () => {
    wrapSelection("`", "`");
  };

  const insertCodeBlock = () => {
    insertAtCursor("```\n\n```");
  };

  const insertUnorderedList = () => {
    insertAtCursor("- ");
  };

  const insertOrderedList = () => {
    insertAtCursor("1. ");
  };

  const insertBlockquote = () => {
    insertAtCursor("> ");
  };

  const insertHorizontalRule = () => {
    insertAtCursor("\n---\n");
  };

  // Componente para renderizar código
  const CodeBlock = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Barra de ferramentas */}
      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-1">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2 self-center">
            Títulos:
          </span>
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <button
              key={level}
              onClick={() => insertHeading(level)}
              className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              title={`Título H${level}`}
            >
              H{level}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2 self-center">
            Formatação:
          </span>
          <button
            onClick={insertBold}
            className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-bold"
            title="Negrito"
          >
            B
          </button>
          <button
            onClick={insertItalic}
            className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors italic"
            title="Itálico"
          >
            I
          </button>
          <button
            onClick={insertCode}
            className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-mono"
            title="Código inline"
          >
            {"</>"}
          </button>
          <button
            onClick={insertCodeBlock}
            className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-mono"
            title="Bloco de código"
          >
            {"{ }"}
          </button>
        </div>

        <div className="flex flex-wrap gap-1">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2 self-center">
            Listas:
          </span>
          <button
            onClick={insertUnorderedList}
            className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            title="Lista não ordenada"
          >
            •
          </button>
          <button
            onClick={insertOrderedList}
            className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            title="Lista ordenada"
          >
            1.
          </button>
        </div>

        <div className="flex flex-wrap gap-1">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2 self-center">
            Outros:
          </span>
          <button
            onClick={insertBlockquote}
            className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            title="Citação"
          >
            &quot;
          </button>
          <button
            onClick={insertHorizontalRule}
            className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            title="Linha horizontal"
          >
            ―
          </button>
        </div>

        <div className="ml-auto flex items-center">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="px-4 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {isPreview ? "Editar" : "Visualizar"}
          </button>
        </div>
      </div>

      {/* Área principal: Editor + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor */}
        {(!isPreview || !showPreview) && (
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Editor Markdown
            </label>
            <textarea
              ref={textareaRef}
              value={markdown}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={placeholder}
              className={`
                w-full h-96 p-4 border border-gray-300 dark:border-gray-600 
                rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                font-mono text-sm resize-none focus:outline-none focus:ring-2 
                focus:ring-blue-500 focus:border-transparent
                ${textareaClassName}
              `}
            />
          </div>
        )}

        {/* Preview */}
        {(isPreview || showPreview) && (
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pré-visualização
            </label>
            <div
              className={`
              w-full h-96 p-4 border border-gray-300 dark:border-gray-600 
              rounded-lg bg-white dark:bg-gray-800 overflow-y-auto prose 
              dark:prose-invert max-w-none
              ${previewClassName}
            `}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={CodeBlock}>
                {markdown}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Contador de caracteres e linhas */}
      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
        <div>{markdown.split("\n").length} linhas</div>
        <div>{markdown.length} caracteres</div>
      </div>
    </div>
  );
};

export default TextareaMarkdown;
