import { Course } from "@/types/Course";
import CourseInfo from "./course-info";
import Header from "@/components/shared/header";

// warning: note the difference between course_code and coursecode
// coursecode is the url slug / path parameter
// course_code is returned by the api

export const revalidate = 1800; // regeneate every 30 minutes
// export const dynamicParams/ = true;



export async function generateMetadata({ params }: { params: expectedParams }) {
    const { subject, coursecode: coursecode } = await params;

    const courseRes = await fetch(`http://168.138.79.49:5010/v1/courses/${subject}/${coursecode}`);

    if (!courseRes.ok) { return { title: `Error ${courseRes.status}`}}

    const course: Course = await courseRes.json();

    let titleText;
    if (course.attributes.title)
        titleText = `: ${course.attributes.title}`;
    else if (course.attributes.abbreviated_title)
        titleText = `: ${course.attributes.abbreviated_title}`;
    else 
        titleText = "";

    let description;
    if (course.attributes.description)
        description = course.attributes.description;
    else
        description = "No description available.";

    return {
        title: `${subject.toUpperCase()} ${coursecode}${titleText}`,
        description: `${description}`,
    };
}

// GenerateStaticParams commented out for now
// it has to generate ~2800 pages which takes a lot of time on the build server
// and the request is usually fast so there is no need to pregenerate it

// interface CourseIndex {
//     subject: string;
//     course_code: string;
//     title: string;
//     on_langara_website: boolean;
// }

// interface CourseIndexList {
//     course_count: number;
//     courses: CourseIndex[];
// }

// export async function generateStaticParams() {
//     const courses: CourseIndexList = await fetch('http://168.138.79.49:5010/v1/index/courses').then((res) =>
//       res.json()
//     )

//     return courses.courses.map((course) => ({
//         subject: String(course.subject),
//         coursecode: String(course.course_code)
//     }))
//   }


type expectedParams = Promise<{ subject: string; coursecode: string }>;

export default async function Page({
    params: searchParams
}: {
    params: expectedParams
}
) {
    const { subject, coursecode: coursecode } = await searchParams;

    const response = await fetch(`http://168.138.79.49:5010/v1/courses/${subject}/${coursecode}`);
    if (!response.ok) {
        return (
            <div className="w-full h-full">
                <Header title="Langara Course Information" color="#A7C7E7"></Header>

                <div className="md:px-10 py-2">Failed to fetch course data for {subject} {coursecode}: {response.status} {response.statusText}</div>
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