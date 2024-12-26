// import Image from "next/image";

// import Courses from "./courses";
import Planner from "./planner"

export default function Home() {
  return (
    <div className="w-[100vw] h-[100vh] flex flex-col">
      <header className="py-2">
        <h1 className="font-bold text-lg m-2">Langara Course Planner 2.0</h1>
      </header>
      <Planner/>
    </div>
  );
}
