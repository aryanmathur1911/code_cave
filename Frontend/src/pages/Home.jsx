import React, { useState } from "react";
import { v4 as uuidV4 } from "uuid"; //for generating unique
import toast from "react-hot-toast";
import LogoAndTag from "../components/LogoAndTag";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const [caveId, setCaveId] = useState("");
  const [username, setUsername] = useState("");

  const generateUniqueId = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setCaveId(id);
    toast.success("Created a new cave");
  };

  const joinCave = (e) => {
    e.preventDefault();

    //check if user has entered username and cave id
    if (!caveId || !username) {
      toast.error("username and caveId is required");
      return;
    }

    navigate(`/editor/${caveId}`, { state: { username, caveId } });
  };

  const handleInputEnter = (e) => {
      if(e.code === "Enter"){
        joinCave();
      }    
  }

  return (
    <>
      <div
        id="HomePageWrapper"
        className="w-screen h-screen flex justify-center items-center"
      >
        <div
          id="formWrapper"
          className="w-screen h-full flex flex-col justify-center items-center"
        >
          <form
            onSubmit={joinCave}
            action=""
            className="border-2 w-full max-w-lg flex flex-col bg-zinc-700 rounded-md"
          >
            <LogoAndTag />

            <h3 className="text-xs mt-4 mb-4 bg-white w-11/12 sm:w-1/2 tracking-tighter m-auto rounded-lg text-center">
              Paste your cave id here
            </h3>

            <input
              onKeyUp={handleInputEnter}
              onChange={(e) => {
                setCaveId(e.target.value);
              }}
              value={caveId}
              type="text"
              className="border-2 p-2 my-2 mx-auto w-11/12 sm:w-auto text-center bg-white shadow-md"
              placeholder="Cave ID"
            />
            <input
              onKeyUp={handleInputEnter}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              value={username}
              type="text"
              className="border-2 p-2 my-2 mx-auto w-11/12 sm:w-auto text-center bg-white shadow-md"
              placeholder="Username"
            />

            <button
              type="submit"
              className="bg-green-500 rounded-lg px-3 py-2 m-auto mt-2 mb-2 block hover:bg-green-600 hover:scale-105 active:scale-90"
            >
              Join
            </button>

            <p className="text-white mb-2 ml-3 text-center">
              if you don't have any invitation{" "}
              <span className="text-green-600">
                <a
                  href=""
                  onClick={generateUniqueId}
                  className="hover:underline"
                >
                  create a cave
                </a>
              </span>
            </p>
          </form>
        </div>
      </div>
      <footer className="text-center p-4">
        designed by <span className="text-green-800">Aryan Mathur</span>
      </footer>
    </>
  );
};

export default Home;
