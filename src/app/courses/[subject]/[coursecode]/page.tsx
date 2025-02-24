import CourseInfo from "./course-info";
import Header from "@/components/shared/header";

export async function generateMetadata({ params }: { params: Params }) {
    const { subject, coursecode } = await params;

    return {
        title: `${subject.toUpperCase()} ${coursecode}`,
        description: `Details about ${subject.toUpperCase()} ${coursecode} at Langara College.`,
    };
}

type Params = Promise<{ subject: string; coursecode: string }>;

export default async function Page({
    params
}: {
    params: Params
}
) {
    const { subject, coursecode } = await params;

    return (
        <div className="w-full h-full">
            <Header title="Langara Course Information" color="#A7C7E7"></Header>

            <div className="md:px-10 py-2">
                <CourseInfo subject={subject} course_code={coursecode} />
            </div>
        </div>
    );
}