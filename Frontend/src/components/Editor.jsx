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
import ACTIONS from "../../Actions";

export default function Editor({ socketRef, caveId }) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const terminalRef = useRef(null);
  const [output, setOutput] = useState("");
  const [terminalHeight, setTerminalHeight] = useState(150);

  useEffect(() => {
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
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const text = update.state.doc.toString();
            if (socketRef.current) {
              socketRef.current.emit(ACTIONS.CODE_CHANGE, { caveId, text });
            }
          }
        }),
      ],
    });

    viewRef.current = new EditorView({
      state,
      parent: editorRef.current,
    });

    return () => {
      socketRef.current?.off(ACTIONS.CODE_CHANGE);
      viewRef.current.destroy();
    };
  }, []);

  useEffect(() => {
    socketRef.current?.on(ACTIONS.OUTPUT_CHANGE, ({ output }) => {
      setOutput((prev) => prev + output + "\n");
    });

    socketRef.current?.on(ACTIONS.CODE_CHANGE, ({ text }) => {
      if (text !== viewRef.current.state.doc.toString()) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: viewRef.current.state.doc.length,
            insert: text,
          },
        });
      }
    });
  }, [socketRef.current]);

  const runCode = () => {
    const code = viewRef.current.state.doc.toString();
    setOutput("");

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const iframeWindow = iframe.contentWindow;
    const iframeDocument = iframe.contentDocument;

    const script = iframeDocument.createElement("script");
    script.innerHTML = `
      try {
        console.log = (...args) => {
          const formattedArgs = args.map(arg => 
            typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(" ");
          parent.postMessage({ type: "log", message: formattedArgs }, "*");
        };

        console.error = (...args) => parent.postMessage({ type: "error", message: args.join(" ") }, "*");

        ${code}
      } catch (error) {
        parent.postMessage({ type: "error", message: error.message }, "*");
      }
    `;

    iframeDocument.body.appendChild(script);

    const messageHandler = (event) => {
      if (event.data.type === "log") {
        setOutput((prev) => prev + event.data.message + "\n");
        if (socketRef.current) {
          socketRef.current.emit(ACTIONS.OUTPUT_CHANGE, {
            caveId,
            output: event.data.message,
          });
        }
      } else if (event.data.type === "error") {
        setOutput("Error executing code: " + event.data.message);
      }
    };

    window.addEventListener("message", messageHandler);

    setTimeout(() => {
      document.body.removeChild(iframe);
      window.removeEventListener("message", messageHandler);
    }, 5000);
  };

  // 🔥 Terminal Resizing Logic
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
    <div className="flex flex-col h-screen w-full">
      {/* Run & Clear Buttons */}
      <div className="flex justify-between p-2">
        <button
          onClick={runCode}
          className="bg-green-500 text-white p-2 rounded hover:scale-105 hover:bg-green-600 w-1/2 sm:w-1/3 md:w-1/5"
        >
          Run Code
        </button>

        <button
          onClick={() => setOutput("")}
          className="bg-red-500 text-white p-2 rounded hover:scale-105 hover:bg-red-600 w-1/2 sm:w-1/3 md:w-1/5"
        >
          Clear Output
        </button>
      </div>

      {/* Editor Section */}
      <div
        ref={editorRef}
        className="flex-1 border border-gray-300 text-white p-2 overflow-auto bg-gray-900"
      ></div>

      {/* Resizable Handle */}
      <div
        className="h-2 bg-gray-600 cursor-row-resize"
        onMouseDown={startResizing}
      ></div>

      {/* Terminal Section */}
      <div
        ref={terminalRef}
        className="bg-black text-green-400 p-2 overflow-auto text-sm sm:text-base"
        style={{ height: `${terminalHeight}px` }}
      >
        {output.split("\n").map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
    </div>
  );
}
