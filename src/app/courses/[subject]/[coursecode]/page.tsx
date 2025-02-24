import { Course } from "@/types/Course";
import CourseInfo from "./course-info";
import Header from "@/components/shared/header";


export const revalidate = 1800; // regeneate every 30 minutes
export const dynamicParams = true;


export async function generateMetadata({ params }: { params: expectedParams }) {
    const { subject, coursecode: course_code } = await params;

    const courseRes = await fetch(`https://coursesapi.langaracs.ca/v1/courses/${subject}/${course_code}`);

    if (!courseRes.ok) { return { title: `Error ${courseRes.status}`}}

    const course: Course = await courseRes.json();

    let titleText;
    if (course.attributes.title)
        titleText = `: ${course.attributes.title}`;
    else if (course.attributes.abbreviated_title)
        titleText = `: ${course.attributes.abbreviated_title}`;
    else 
        titleText = "";

    return {
        title: `${subject.toUpperCase()} ${course_code}${titleText}`,
        description: `Details about ${subject.toUpperCase()} ${course_code} at Langara College.`,
    };
}

interface CourseIndex {
    subject: string;
    course_code: string;
    title: string;
    on_langara_website: boolean;
}

interface CourseIndexList {
    course_count: number;
    courses: CourseIndex[];
}

export async function generateStaticParams() {
    const courses: CourseIndexList = await fetch('https://coursesapi.langaracs.ca/v1/index/courses').then((res) =>
      res.json()
    )

    return courses.courses.map((course) => ({
        subject: String(course.subject),
        course_code: String(course.course_code)
    }))
  }


type expectedParams = Promise<{ subject: string; coursecode: string }>;

export default async function Page({
    params: searchParams
}: {
    params: expectedParams
}
) {
    const { subject, coursecode: course_code } = await searchParams;

    const response = await fetch(`https://coursesapi.langaracs.ca/v1/courses/${subject}/${course_code}`);
    if (!response.ok) {
        return (
            <div className="w-full h-full">
                <Header title="Langara Course Information" color="#A7C7E7"></Header>

                <div className="md:px-10 py-2">Failed to fetch course data for {subject} {course_code}: {response.status} {response.statusText}</div>
            </div>
        )
    }



    const course: Course = await response.json();


    return (
        <div className="w-full h-full">
            <Header title="Langara Course Information" color="#A7C7E7"></Header>

            <div className="md:px-10 py-2">
                <CourseInfo course={course} />
            </div>
        </div>
    );
}