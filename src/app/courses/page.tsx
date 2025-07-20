export const metadata = {
  title: "Langara Course Search",
  description: "A web application to explore courses at Langara College. Search by attribute, transfer destinations, and more.",
};

import CourseBrowser from "./course-browser";
import { Suspense } from "react";
import Header from "@/components/shared/header";
import { v1IndexSubjectsResponse, v1IndexTransfersResponse, v2SearchCoursesResponse } from "@/types/Course";


export const revalidate = 3600 // revalidate every hour

const _courses: {
    course_count: number;
    courses: {
        course_code: string;
        on_langara_website: boolean;
        subject: string;
        title: string;
    }[];
    subject_count: number;
} = await fetch(
    'https://api.langaracourses.ca/v1/index/courses',
    {
        cache: 'force-cache',
        next: { revalidate: 1800 } // 30 minutes
    }
).then((res) => res.json());

const courseList = _courses.courses.map(
    (c) => `${c.subject}-${c.course_code}`.toLowerCase()
);


export default async function Page() {

  const [transfersRes, subjectsRes, coursesRes] = await Promise.all([
    fetch('https://api.langaracourses.ca/v1/index/transfer_destinations'),
    fetch('https://api.langaracourses.ca/v1/index/subjects'),
    fetch('https://api.langaracourses.ca/v2/search/courses?on_langara_website=true'),
  ]);

  const [transfersData, subjectsData, coursesData] : [v1IndexTransfersResponse, v1IndexSubjectsResponse, v2SearchCoursesResponse] = await Promise.all([
    transfersRes.json(),
    subjectsRes.json(),
    coursesRes.json(),
  ]);

  // always put ubc, sfu, uvic, and tru at the top of the list
  const transfers = [
    ...transfersData.transfers.filter(t => ['UBCV', 'SFU', 'UVIC', 'TRU'].includes(t.code)),
    ...transfersData.transfers.filter(t => !['UBCV', 'SFU', 'UVIC', 'TRU'].includes(t.code))
  ];
  const subjects = subjectsData.subjects;
  const courses = coursesData.courses;
  
  return (
    <div className="w-full h-full">
      <Header title="Langara Course Search" color="#F1B5CB" />

      <div className="lg:px-10">
        <Suspense fallback={<div>Loading...</div>}>
          <CourseBrowser transfers={transfers} subjects={subjects} initialCourses={courses} validCourses={courseList}/>
        </Suspense>
      </div>
    </div>
  );
}