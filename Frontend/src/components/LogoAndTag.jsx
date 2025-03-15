import React from 'react'

const LogoAndTag = () => {
  return (
    <>
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
    </>
  )
}

export default LogoAndTag