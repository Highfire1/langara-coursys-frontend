// you can revert this to a ssg page by using the client-redirect component


// import ClientRedirect from './client-redirect'
import { redirect } from 'next/navigation'

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
//         res.json()
//     )

//     // Get unique subjects from the course list
//     const uniqueSubjects = [...new Set(courses.courses.map((course) => course.subject))]

//     return uniqueSubjects.map((subject) => ({
//         subject: String(subject)
//     }))
// }

type Params = Promise<{ subject: string }>

// TODO: i think this violates html best practices
// but i don't want to leave it as a 404
// and /courses has all the information that a /courses/[subject] would have
export default async function CoursePage({ params }: { params: Params }) {
    const { subject } = await params
    
    // return <ClientRedirect subject={subject} />
    redirect(`/courses?subject=${subject.toUpperCase()}`)
}