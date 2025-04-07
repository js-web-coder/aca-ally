import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import "react-quill/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  previewContent?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  label,
  error,
  previewContent = true,
}: RichTextEditorProps) {
  const [editorTab, setEditorTab] = useState<string>("edit");
  const quillRef = useRef<ReactQuill>(null);

  // Custom toolbar modules
  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ["link", "image", "video"],
      ["clean"],
    ],
    clipboard: {
      matchVisual: false,
    },
  }), []);

  // Custom toolbar formats
  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "link",
    "image",
    "video",
    "color",
    "background",
    "font",
    "align",
  ];

  const handleImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      if (input.files) {
        const file = input.files[0];
        // Here we would typically upload to a server and get a URL
        // For now, we'll use a local FileReader as a demo
        const reader = new FileReader();
        reader.onload = () => {
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection();
            const position = range ? range.index : 0;
            quill.insertEmbed(position, "image", reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    };
  }, []);

  // Add custom handlers to toolbar buttons
  useEffect(() => {
    if (quillRef.current) {
      const toolbar = quillRef.current.getEditor().getModule("toolbar");
      toolbar.addHandler("image", handleImageUpload);
    }
  }, [handleImageUpload]);

  return (
    <div className="w-full">
      {label && <Label className="mb-2 block">{label}</Label>}
      
      <Tabs defaultValue="edit" value={editorTab} onValueChange={setEditorTab}>
        <TabsList className="mb-2">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          {previewContent && <TabsTrigger value="preview">Preview</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="edit" className="w-full">
          <div className="rounded-md border">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={value}
              onChange={onChange}
              modules={modules}
              formats={formats}
              className="min-h-[200px]"
            />
          </div>
        </TabsContent>
        
        {previewContent && (
          <TabsContent value="preview" className="w-full">
            <Card>
              <CardContent className="prose dark:prose-invert max-w-none py-4">
                <div dangerouslySetInnerHTML={{ __html: value }} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
      
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      
      <div className="flex justify-end space-x-2 mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setEditorTab(editorTab === "edit" ? "preview" : "edit")}
          className="text-sm"
        >
          {editorTab === "edit" ? "Preview" : "Edit"}
        </Button>
      </div>
    </div>
  );
}
