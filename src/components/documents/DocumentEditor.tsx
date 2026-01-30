// ============================================================
// L111: Editor de Documentos con TipTap
// ============================================================

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { DocumentToolbar } from './DocumentToolbar';
import { cn } from '@/lib/utils';

interface DocumentEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export function DocumentEditor({
  content,
  onChange,
  placeholder = 'Escribe el contenido del documento...',
  editable = true,
  className,
}: DocumentEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextStyle,
      Color,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-40 bg-muted/20 rounded-lg">
        <span className="text-muted-foreground text-sm">Cargando editor...</span>
      </div>
    );
  }

  return (
    <div className={cn('border rounded-lg overflow-hidden bg-background', className)}>
      {editable && <DocumentToolbar editor={editor} />}
      <EditorContent 
        editor={editor} 
        className="min-h-[300px] [&_.ProseMirror]:min-h-[300px] [&_.ProseMirror]:p-4 [&_.ProseMirror]:focus:outline-none"
      />
    </div>
  );
}
