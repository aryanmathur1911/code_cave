import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import LogoAndTag from "../components/LogoAndTag";
import Members from "../components/Members";
import Editor from "../components/Editor";

const EditorPage = () => {
  const location = useLocation();
  // const { username, caveId } = location.state || {};
  const [members, setMembers] = useState([
    { username: "Adit", socketId: 1 },
    { username: "Jack", socketId: 2 },
  ]);
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
              {members.map((member) => 
                <Members key={member.socketId} username={member.username} />
              )}
            </div>
            <div className="flex flex-col gap-3 absolute bottom-8 ">
              <button className="bg-white p-2">Copy cave Id</button>
              <button className="bg-red-500 p-2">Leave</button>
            </div>
          </div>
        </div>
        <div id="80%Wrapper" className="bg-zinc-800 w-[80%] h-screen">
          <div id="editorWrapper">
              <Editor/>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditorPage;
