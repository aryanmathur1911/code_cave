import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
} from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { closeBrackets, autocompletion } from "@codemirror/autocomplete";
import { indentOnInput } from "@codemirror/language";
import { history, defaultKeymap } from "@codemirror/commands";
import { oneDark } from "@codemirror/theme-one-dark";
import { useEffect, useRef, useState } from "react";

export default function Editor() {
  const [output, setOutput] = useState("");
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const terminalRef = useRef(null);
  const [terminalHeight, setTerminalHeight] = useState(150); // Default terminal height

  useEffect(() => {
    // Create the editor's state(blueprint)
    const state = EditorState.create({
      doc: "//Write your code here",
      extensions: [
        javascript(),
        closeBrackets(),
        autocompletion(),
        history(),
        keymap.of(defaultKeymap),
        oneDark,
        indentOnInput(),
        lineNumbers(),
        highlightActiveLine(),
      ],
    });

    viewRef.current = new EditorView({
      state,
      parent: editorRef.current,
    });

    return () => viewRef.current.destroy();
  },[]);

  const runCode = () => {
    const code = viewRef.current.state.doc.toString();
    setOutput(""); // Clear previous output

    // Create a sandboxed iframe
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const iframeWindow = iframe.contentWindow;
    const iframeDocument = iframe.contentDocument;

    const script = iframeDocument.createElement("script");

    script.innerHTML = `
      try {
        console.log = (...args) => parent.postMessage({ type: "log", message: args.join(" ") }, "*");
        console.error = (...args) => parent.postMessage({ type: "error", message: args.join(" ") }, "*");

        window.prompt = (question) => {
          parent.postMessage({ type: "prompt", question: question }, "*");
          return "Waiting for input..."; 
        };

        ${code}
      } catch (error) {
        parent.postMessage({ type: "error", message: error.message }, "*");
      }
    `;

    iframeDocument.body.appendChild(script);

    const messageHandler = (event) => {
      if (event.data.type === "log") {
        setOutput((prev) => prev + event.data.message + "\n");
      } else if (event.data.type === "error") {
        setOutput("Error executing code: " + event.data.message);
      } else if (event.data.type === "prompt") {
        const userInput = prompt(event.data.question) || "";
        iframeWindow.postMessage({ type: "promptResponse", response: userInput }, "*");
      }
    };

    window.addEventListener("message", messageHandler);

    setTimeout(() => {
      document.body.removeChild(iframe);
      window.removeEventListener("message", messageHandler);
    }, 5000);
  };

  // Handle terminal resize
  const startResizing = (e) => {
    e.preventDefault();
    document.addEventListener("mousemove", resizeTerminal);
    document.addEventListener("mouseup", stopResizing);
  };

  const resizeTerminal = (e) => {
    const newHeight = window.innerHeight - e.clientY;
    if (newHeight > 50 && newHeight < window.innerHeight - 100) {
      setTerminalHeight(newHeight);
    }
  };

  const stopResizing = () => {
    document.removeEventListener("mousemove", resizeTerminal);
    document.removeEventListener("mouseup", stopResizing);
  };

  return (
    <div className="flex flex-col h-screen">
      <button
        onClick={runCode}
        className="bg-green-500 p-2 rounded m-2 hover:scale-105 hover:bg-green-600 w-1/5 hover:cursor-pointer"
      >
        Run Code
      </button>

      {/* Editor Section */}
      <div ref={editorRef} className="flex-1 border-2 border-white text-white p-2 overflow-auto"></div>

      {/* Resizable Handle */}
      <div
        className="h-2 bg-gray-600 cursor-row-resize"
        onMouseDown={startResizing}
      ></div>

      {/* Terminal Section */}
      <div
        ref={terminalRef}
        className="bg-black text-green-400 p-2 overflow-auto"
        style={{ height: `${terminalHeight}px` }}
      >
        {output.split("\n").map((line, index) => (
    <div key={index}>{line}</div>
  ))}
      </div>
    </div>
  );
}
