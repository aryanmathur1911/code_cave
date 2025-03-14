import React, { useState } from "react";
import {v4 as uuidV4} from 'uuid' //for generating unique 
import toast from "react-hot-toast"

const Home = () => {

  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('')

  const generateUniqueId = (e) => {
    e.preventDefault();
    const id = uuidV4()
    setRoomId(id);    
    toast.success("Created a new cave")
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
            action=""
            className="border-2 w-full max-w-lg flex flex-col bg-zinc-700 rounded-md"
          >
            <div className="flex gap-2 bg-zinc-800 p-4">
              <img src="../images/mainLogo.png" className="w-[90px]" alt="" />
              <div>
                <h1 className="font-semibold italic text-3xl text-white">
                  Code Cave
                </h1>
                <h2 className="tracking-tighter text-green-500 italic">
                  Get realtime collaborations
                </h2>
              </div>
            </div>

            <h3 className="text-xs mt-4 mb-4 bg-white w-11/12 sm:w-1/2 tracking-tighter m-auto rounded-lg text-center">
              Paste your cave id here
            </h3>

            <input
              onChange={(e) => {setRoomId(e.target.value)}}
              value={roomId}
              type="text"
              className="border-2 p-2 my-2 mx-auto w-11/12 sm:w-auto text-center bg-white shadow-md"
              placeholder="Cave ID"
            />
            <input
            onChange={(e) => {setUsername(e.target.value)}}
            value={username}
              type="text"
              className="border-2 p-2 my-2 mx-auto w-11/12 sm:w-auto text-center bg-white shadow-md"
              placeholder="Username"
            />

            <button className="bg-green-500 rounded-lg px-3 py-2 m-auto mt-2 mb-2 block hover:bg-green-600 hover:scale-105 active:scale-90">
              Join
            </button>

            <p className="text-white mb-2 ml-3 text-center">
              if you don't have any invitation{" "}
              <span className="text-green-600"><a href="" 
              onClick={generateUniqueId}
              className="hover:underline">create a cave</a></span>
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