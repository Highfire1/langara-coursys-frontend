// import Image from "next/image";

import CourseBrowser from "./CourseBrowser";

export default function Home() {
  return (
    <div className="w-full h-full">
      <header className="p-5 bg-[#F15A22]">
        <h1 className="font-bold text-xl">Langara CourSys</h1>
        <p>Note: this website is a student project and not affiliated with Langara College.</p>
      </header>

      <div className="px-10">
        <CourseBrowser/>
      </div>
      
    </div>
  );
}
