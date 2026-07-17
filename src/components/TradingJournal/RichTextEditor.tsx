"use client";

import React, { useRef, useEffect } from "react";
import "quill/dist/quill.snow.css";

interface RichTextEditorProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  minHeight?: string;
}

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Ghi chú thêm về lệnh này...",
  autoFocus = false,
  minHeight = "160px",
}: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing elements inside the container to prevent double toolbars/menus
    containerRef.current.innerHTML = "";

    // Create a new child div for Quill to attach to
    const editorElement = document.createElement("div");
    containerRef.current.appendChild(editorElement);

    let quill: any = null;

    // Dynamically import Quill to avoid SSR issues
    import("quill").then((QuillModule) => {
      // Check if container is still mounted
      if (!containerRef.current) return;

      const Quill = QuillModule.default;

      // Configure Quill to use inline styles instead of classes for better portability
      const Size = Quill.import("attributors/style/size") as any;
      const Color = Quill.import("attributors/style/color") as any;
      const Background = Quill.import("attributors/style/background") as any;

      Size.whitelist = ["12px", "14px", "16px", "18px", "20px", "24px", "32px"];

      Quill.register(Size as any, true);
      Quill.register(Color as any, true);
      Quill.register(Background as any, true);

      // Initialize Quill
      quill = new Quill(editorElement, {
        theme: "snow",
        placeholder: placeholder,
        modules: {
          toolbar: [
            ["bold", "italic", "underline"],
            [{ color: [] }, { background: [] }],
            [{ size: ["12px", "14px", "16px", "18px", "20px", "24px", "32px"] }],
          ],
        },
      });

      quillRef.current = quill;

      // Set initial value
      if (value) {
        quill.root.innerHTML = value;
      }

      // Handle text changes
      quill.on("text-change", () => {
        const html = quill.root.innerHTML;
        // Clean up empty state values
        if (html === "<p><br></p>" || html === "") {
          onChange?.("");
        } else {
          onChange?.(html);
        }
      });

      if (autoFocus) {
        setTimeout(() => {
          if (quillRef.current) {
            quillRef.current.focus();
          }
        }, 100);
      }
    });

    return () => {
      // Cleanup on unmount
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      quillRef.current = null;
    };
  }, []);

  // Sync value changes from parent (e.g. form resets)
  useEffect(() => {
    if (quillRef.current) {
      const currentValue = quillRef.current.root.innerHTML;
      const normalizedValue = value || "";
      const isEmptyCurrent = currentValue === "<p><br></p>" || currentValue === "";
      const isEmptyNew = normalizedValue === "";

      if (isEmptyCurrent && isEmptyNew) {
        return;
      }

      if (currentValue !== normalizedValue) {
        quillRef.current.root.innerHTML = normalizedValue;
      }
    }
  }, [value]);

  return (
    <div 
      className="quill-editor-wrapper border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-200 transition-all"
      style={{ minHeight }}
    >
      <div ref={containerRef} className="flex-1" />
    </div>
  );
}
