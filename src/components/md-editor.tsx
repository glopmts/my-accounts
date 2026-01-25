import MDEditor from "@uiw/react-md-editor";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface EditorContentProps {
  id?: string;
  name?: string;
  placeholder?: string;
  rows?: number;
  value: string;
  onChange: (
    value:
      | string
      | React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
  ) => void;
  className?: string;
}

const EditorContent: React.FC<EditorContentProps> = ({
  id,
  name,
  placeholder,
  value,
  onChange,
  className = "",
}) => {
  const [editorValue, setEditorValue] = useState<string>(value);
  const { theme, resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  const handleEditorChange = (newValue?: string) => {
    const valueToSet = newValue || "";
    setEditorValue(valueToSet);

    if (onChange.length === 1) {
      try {
        const syntheticEvent = {
          target: {
            name: name || "description",
            value: valueToSet,
            id: id,
            type: "textarea",
          },
        } as React.ChangeEvent<HTMLTextAreaElement>;

        onChange(syntheticEvent);
      } catch {
        onChange(valueToSet);
      }
    } else {
      onChange(valueToSet);
    }
  };

  const currentTheme = resolvedTheme || "light";

  return (
    <div className={`container-editor ${className}`}>
      <MDEditor
        value={editorValue}
        onChange={handleEditorChange}
        height={200}
        style={{
          backgroundColor: currentTheme === "dark" ? "#333" : "#fff",
          color: currentTheme === "dark" ? "#fff" : "#000",
        }}
        preview="edit"
        textareaProps={{
          placeholder,
          name,
          id,
        }}
      />
    </div>
  );
};

export default EditorContent;
