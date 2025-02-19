import CourseInfo from "./course-info";
import Header from "@/components/shared/header";

export async function generateMetadata({ params }: { params: { subject: string, coursecode: string } }) {
    const { subject, coursecode } = params;
    return {
        title: `${subject} ${coursecode}`,
        description: "Information about a given course",
    };
}

export default async function Page({
    params,
  }: {
    params: Promise<{ subject: string, coursecode: string }>;
  }) {
    const subject = (await params).subject;
    const courseCode = (await params).coursecode;

    return (
        <div className="w-full h-full">
            <Header title="Langara Course Information" color="#A7C7E7"></Header>

            <div className="md:px-10 py-2">
                {/* I don't understand why suspense is required here
                next.js requires it when using useSearchParams, but i don't understand why it can't just handle it... */}
                <CourseInfo subject={subject} course_code={courseCode} />
            </div>
        </div>
    );
}