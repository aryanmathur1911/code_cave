import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import EditorPage from "./pages/EditorPage";
import { Toaster } from "react-hot-toast";
const App = () => {
  return (
    <>
    
    <div>
      <Toaster
      position="top-right"
      toastOptions={{
        success : {
          theme : {
            primary : 'grenn-600'
          },
        },
      }}>

      </Toaster>
    </div>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/editor/:caveId" element={<EditorPage/>}/>
      </Routes>
    </BrowserRouter>
    </>
  );
};

export default App;
