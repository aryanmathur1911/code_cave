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
  const { username, caveId } = location?.state || {};
  const socketRef = useRef(null);

  const handleError = (err) => {
    console.log(`Socket Error : ${err}`);
    toast.error("Failed to connect socket, please try again");
    navigate("/");
  };

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", handleError);
      socketRef.current.on("connect_failed", handleError);
      
      socketRef.current.emit(ACTIONS.JOIN, { username, caveId });

      socketRef.current.on(ACTIONS.JOINED, ({ username, socketId, members }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} has joined the cave.`);
        }
        setMembers(members);
      });

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} has left the cave.`);
        setMembers((prev) => prev.filter((member) => member.socketId !== socketId));
      });
    };
    init();

    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOIN);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, []);

  if (!username) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden">
      {/* Sidebar for Members */}
      <div className="bg-zinc-600 w-full md:w-1/4 lg:w-1/5 p-4 flex flex-col items-center h-auto md:h-screen">
        <LogoAndTag />
        <h1 className="text-white text-2xl italic mt-4">Connected Members</h1>
        <div className="mt-3 w-full flex flex-col items-center space-y-2">
          {members.map((member) => (
            <Members key={member.socketId} username={member.username} />
          ))}
        </div>
        {/* Buttons */}
        <div className="mt-auto w-full flex flex-col gap-3 pb-4">
          <button className="bg-white p-2 rounded-md hover:bg-gray-200 w-full">Copy Cave ID</button>
          <button className="bg-red-500 p-2 rounded-md hover:bg-red-600 w-full">Leave</button>
        </div>
      </div>
      
      {/* Main Editor Section */}
      <div className="bg-zinc-800 w-full md:w-3/4 lg:w-4/5 h-screen flex flex-col">
        <Editor socketRef={socketRef} caveId={caveId} />
      </div>
    </div>
  );
};

export default EditorPage;
