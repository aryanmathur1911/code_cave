import React from "react";

const Members = (props) => {
  return (
    <div>
      <div className="m-2">
        <h1 className="bg-white p-2 block rounded-xl">{props.username}</h1>
      </div>
    </div>
  );
};

export default Members;
