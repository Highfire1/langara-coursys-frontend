import Link from "next/link";
import CourseInfo from "./course-info";

// export const metadata = {
//     title: "Langara Course Offerings Search",
//     description: "A web application to search and explore Langara College course offerings",
// };

export default async function Page({
    params,
  }: {
    params: Promise<{ subject: string, coursecode: string }>;
  }) {
    // const { subject, 'course-code': courseCode } = router.query;
    const subject = (await params).subject;
    const courseCode = (await params).coursecode;

    return (
        <div className="w-full h-full">
            <header className="p-5 bg-[#A7C7E7]">
                <h1 className="font-bold text-xl"><Link href="/">Langara Course Search</Link></h1>
                <p>Note: this website is a student project and not affiliated with Langara College.</p>
                <p>Inspired by the <a href="https://coursys.sfu.ca/browse" target="_blank">SFU CourSys</a>. Please report bugs or suggestions at <a className="hover:underline hover:text-blue-800" href="https://forms.gle/CYKP7xsp2an6gNEK9" target="_blank">this form.</a></p>
                {/* <p>Data last updated ...</p> */}
            </header>

            <div className="md:px-10 py-2">
                {/* I don't understand why suspense is required here
                next.js requires it when using useSearchParams, but i don't understand why it can't just handle it... */}
                <CourseInfo subject={subject} course_code={courseCode} />
            </div>
        </div>
    );
}