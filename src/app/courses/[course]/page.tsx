import { Course } from "@/types/Course";
import CourseInfo from "./course-info";
import Header from "@/components/shared/header";
import { notFound } from "next/navigation";

// warning: note the difference between course_code and coursecode
// coursecode is the url slug / path parameter
// course_code is returned by the api

type expectedParams = Promise<{ course: string }>;

export async function generateMetadata({ params }: { params: expectedParams }) {
    const { course: courseParam } = await params;

    const [subject, coursecode] = courseParam.toUpperCase().split("-");
    const courseRes = await fetch(`https://api.langaracourses.ca/v1/courses/${subject}/${coursecode}`);

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
        alternates: {
            canonical: `https://langaracourses.ca/courses/${subject.toLowerCase()}-${coursecode.toLowerCase()}`
        }
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
//     const courses: CourseIndexList = await fetch('https://api.langaracourses.ca/v1/index/courses').then((res) =>
//       res.json()
//     )

//     return courses.courses.map((course) => ({
//         subject: String(course.subject),
//         coursecode: String(course.course_code)
//     }))
//   }


export default async function Page( {params}: {params: expectedParams} ) {
    const { course: course } = await params;

    // subject should be lowercase.
    // if (course !== course.toLowerCase() && courseList.includes(course.toLowerCase())) {
    //     permanentRedirect(`/courses/${course.toLowerCase()}`);
    // } 

    // 404 if subject is not in the course list
    // if (!courseList.includes(`${course}`)) {
    //     notFound();
    // }

    if (!course || !course.includes("-")) {
        notFound();
    }

    const [subject, coursecode] = course.toUpperCase().split("-");
    const response = await fetch(`https://api.langaracourses.ca/v1/courses/${subject}/${coursecode}`);
    
    if (!response.ok) {
        notFound();
        // return (
        //     <div className="w-full h-full">
        //         <Header title="Langara Course Information" color="#A7C7E7"></Header>

        //         <div className="md:px-10 py-2">
        //             Failed to fetch course data for {subject} {coursecode}: {response.status} {response.statusText}
        //         </div>
        //     </div>
        // )
    }

    const courseJSON: Course = await response.json();
    return (
        <div className="w-full h-full">
            <Header title="Langara Course Information" color="#A7C7E7"></Header>

            <div className="md:px-10 py-2">
                <CourseInfo course={courseJSON} />
            </div>
        </div>
    );
}