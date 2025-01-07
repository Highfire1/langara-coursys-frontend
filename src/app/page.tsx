export const metadata = {
  title: "Langara Course Offerings Search",
  description: "A web application to search and explore Langara College course offerings",
};

import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full h-full">

      <header className="p-5 bg-[#F15A22]">
        <h1 className="font-bold text-xl">Langara College Course Tools</h1>
        <p>Note: this website is a student project and not affiliated with Langara College.</p>
        <p>Utilities built by Anderson Tseng and hosted by the Langara Computer Science Club.</p>
        <p>Please report bugs or suggestions at <a className="hover:underline hover:text-blue-800" href="https://forms.gle/CYKP7xsp2an6gNEK9" target="_blank">this form.</a></p>
        {/* <p>Data last updated ...</p> */}
      </header>

      <div className="md:px-10 pt-10 flex flex-row gap-4">

        {/* <h1>Welcome to the Langara Course Tools Hub</h1>
        <p>You can find some tools below:</p> */}


        <div className="w-min h-min">
          <Link href="/timetable">
            <div className="w-[400px] h-[400px] bg-slate-300 flex items-center justify-center text-center">
              Langara<br></br>Time Table<br></br>Generator
            </div>
          </Link>
        </div>

        <div className="w-min h-min">
          <Link href="/browse">
            <div className="w-[400px] h-[400px] bg-slate-300 flex items-center justify-center text-center">
              Langara<br></br>Course Offerings<br></br>Search
            </div>
          </Link>
        </div>

        <div className="w-min h-min">
          <Link href="/courses">
            <div className="w-[400px] h-[400px] bg-slate-300 flex items-center justify-center text-center">
              Langara<br></br>Courses<br></br>Search
            </div>
          </Link>
        </div>
      </div>







    </div>
  );
}
