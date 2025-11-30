import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Typography from "@tiptap/extension-typography";
import { TextStyle, Color } from "@tiptap/extension-text-style";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@tiptap/extension-table";

const lowlight = createLowlight(common);

const extensions = [
  StarterKit.configure({
    codeBlock: false,
  }),
  Underline,
  Typography,
  TextStyle,
  Color,
  Superscript,
  Subscript,
  // ✅ THÊM "codeBlock" vào types để đồng bộ với Tiptap.tsx
  TextAlign.configure({
    types: ["heading", "paragraph", "youtube", "image", "codeBlock"],
  }),
  Link.configure({ openOnClick: true, autolink: true }),
  Youtube,
  // ✅ THÊM attributes để đồng bộ với Tiptap.tsx
  Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        src: {
          default: null,
        },
        alt: {
          default: null,
        },
        title: {
          default: null,
        },
        width: {
          default: "100%",
          renderHTML: (attributes) => {
            return {
              width: attributes.width,
            };
          },
        },
        height: {
          default: "auto",
          renderHTML: (attributes) => {
            return {
              height: attributes.height,
            };
          },
        },
        textAlign: {
          default: "center",
          renderHTML: (attributes) => {
            return {
              style: `text-align: ${attributes.textAlign}`,
            };
          },
          parseHTML: (element) => {
            return element.style.textAlign || "center";
          },
        },
      };
    },
  }),
  // ✅ THÊM attributes textAlign cho CodeBlock
  CodeBlockLowlight.configure({
    lowlight,
  }).extend({
    addAttributes() {
      return {
        language: {
          default: null,
          parseHTML: (element) => {
            const { languageClassPrefix } = this.options;
            if (
              !languageClassPrefix ||
              typeof languageClassPrefix !== "string"
            ) {
              return null;
            }
            const classNames = Array.from(
              element.firstElementChild?.classList || []
            );
            const languages = classNames
              .filter(
                (className) =>
                  typeof className === "string" &&
                  className.startsWith(languageClassPrefix)
              )
              .map((className) => className.replace(languageClassPrefix, ""));
            const language = languages[0];

            if (!language) {
              return null;
            }

            return language;
          },
          rendered: false,
        },
        textAlign: {
          default: "left",
          renderHTML: (attributes) => ({
            style: `text-align: ${attributes.textAlign}`,
          }),
          parseHTML: (element) => element.style.textAlign || "left",
        },
      };
    },
  }),
  Table.configure({ resizable: true }),
  TableCell,
  TableHeader,
  TableRow,
];

export function convertTiptapJsonToHtml(jsonContent: object): string {
  const content = jsonContent || {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Nội dung trống." }],
      },
    ],
  };
  return generateHTML(content, extensions);
}
