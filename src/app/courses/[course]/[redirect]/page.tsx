import { notFound, permanentRedirect } from "next/navigation";

// Force this page to be dynamic (runtime) instead of static (build-time)
export const dynamic = 'force-dynamic';
export const revalidate = 86400; // Cache for 24 hours

type ExpectedParams = Promise<{ course: string; redirect: string }>;

interface c_index {
    course_code: string;
    on_langara_website: boolean;
    subject: string;
    title: string;
}

export default async function RedirectPage({ params }: { params: ExpectedParams }) {
    const { course: subject, redirect: code } = await params;
    
    // Fetch courses at runtime instead of build time
    const res = await fetch('https://api.langaracourses.ca/v1/index/courses', { 
        next: { revalidate: 86400 }
    });
    const data: { courses: c_index[] } = await res.json();
    const courses = data.courses.map(
        (course) => `${course.subject}-${course.course_code}`.toLowerCase()
    );
    
    if (!courses.includes(`${subject}-${code}`.toLowerCase())) {
        notFound();
    }
    
    // Redirect from old format /courses/[subject]/[code] to new format /courses/[subject]-[code]
    const newPath = `/courses/${subject.toLowerCase()}-${code.toLowerCase()}`;
    
    permanentRedirect(newPath);
}
