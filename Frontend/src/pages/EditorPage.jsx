import React, { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import LogoAndTag from "../components/LogoAndTag";
import Members from "../components/Members";
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import ACTIONS from "../../Actions";
import toast from "react-hot-toast";

const EditorPage = () => {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);

  const location = useLocation();
  const { username, caveId } = location?.state || {}; //comming from Home.jsx

  const socketRef = useRef(null);

  const handleError = (err) => {
    console.log(`Socket Error : ${err}`);
    toast.error("Failed to connect socket, please try again");
    navigate("/");
  };

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => {
        handleError(err);
      });
      socketRef.current.on("connect_failed", (err) => {
        handleError(err);
      });
      console.log(socketRef.current);

      socketRef.current.emit(ACTIONS.JOIN, {
        username: username,
        caveId: caveId,
      });

      //listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ username, socketId, members }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} has joined the cave.`);
          }
          setMembers(members);
        }
      );
      //listening for disconnected event
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} has left the cave.`);
        setMembers((prev) => {
          return prev.filter((member) => member.socketId !== socketId);
        });
      });
    };
    init();
  }, []);

  if (!username) {
    <Navigate to="/" />;
  }

  return (
    <>
      <div className="w-full h-screen flex overflow-hidden">
        <div id="20%Wrapper" className="bg-zinc-600 w-[20%] h-screen">
          <div id="LogoAndTagWrapper">
            <LogoAndTag />
          </div>
          <div className="m-3 flex flex-col  h-screen items-center">
            <h1 className="text-white text-2xl italic">Connected members</h1>

            <div className="mt-3" id="membersWrapper">
              {members.map((member) => (
                <Members key={member.socketId} username={member.username} />
              ))}
            </div>
            <div className="flex flex-col gap-3 absolute bottom-8 ">
              <button className="bg-white p-2">Copy cave Id</button>
              <button className="bg-red-500 p-2">Leave</button>
            </div>
          </div>
        </div>
        <div id="80%Wrapper" className="bg-zinc-800 w-[80%] h-screen">
          <div id="editorWrapper">
            <Editor />
          </div>
        </div>
      </div>
    </>
  );
};

export default EditorPage;
