// import Image from "next/image";

import CourseBrowser from "./CourseBrowser";

export default function Home() {
  return (
    <div className="w-full h-full">
      <header className="font-bold text-lg p-5 bg-red-700">
        <h1>Langara CourSys</h1>
      </header>

      <div className="px-10">
        <CourseBrowser/>
      </div>
      
    </div>
  );
}
