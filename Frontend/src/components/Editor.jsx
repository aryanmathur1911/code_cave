import { EditorView, keymap,  lineNumbers , highlightActiveLine  } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { closeBrackets, autocompletion } from "@codemirror/autocomplete";
import { indentOnInput } from "@codemirror/language";
import { history, defaultKeymap } from "@codemirror/commands";
import { oneDark } from "@codemirror/theme-one-dark";
import { useEffect, useRef, useState } from "react";

export default function Editor() {
    const [output, setOutput] = useState("");
    const editorRef = useRef(null)
    const viewRef = useRef(null)
    
    useEffect(() => {
     
        // Create the editor
        const state = EditorState.create({
        doc: "//Write your code here",
        extensions: [
        javascript(),
        closeBrackets(),
        autocompletion(),
        history(),
        keymap.of(defaultKeymap), // Add custom keymaps here
        oneDark,
        indentOnInput(), 
        lineNumbers(),
        highlightActiveLine()
        ],
        });
    
        viewRef.current = new EditorView({
            state,
            parent: editorRef.current
          });
      
          return () => viewRef.current.destroy();
    }, [])

    const runCode = () => {
        //catching the code and converting it to string
        const code = viewRef.current.state.doc.toString();
    
        try {
            //this function runs the code
            const result = new Function(code)();
           
            //setting the output to the result of the code
            setOutput(result !== undefined ? String(result) : "Code executed successfully (returned undefined)");
            
            
        } catch (error) {
            setOutput("Error executing code: " + error.message);
            console.error("Error executing code:", error);
          }
      };
    
  return (
    <>
        <button onClick={runCode} className="bg-green-500 p-2 rounded m-2 hover:scale-105 hover:bg-green-600 ">
        Run Code
      </button>
         <div ref={editorRef} className="border-2 border-white text-white p-2 h-screen"></div>;
    </>
  );
}

