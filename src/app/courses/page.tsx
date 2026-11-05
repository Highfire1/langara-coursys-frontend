export const metadata = {
  title: "Langara Course Search",
  description: "A web application to explore courses at Langara College. Search by attribute, transfer destinations, and more.",
};

import CourseBrowser from "./course-browser";
import { Suspense } from "react";
import Header from "@/components/shared/header";
import { v1IndexSubjectsResponse, v1IndexTransfersResponse, v2SearchCoursesResponse } from "@/types/Course";


export const revalidate = 3600 // revalidate every hour
export const dynamic = "force-dynamic";

interface CourseIndexResponse {
    course_count: number;
    courses: {
        course_code: string;
        on_langara_website: boolean;
        subject: string;
        title: string;
    }[];
    subject_count: number;
}

async function fetchJson<T>(url: string, revalidate: number): Promise<T> {
  const response = await fetch(url, {
    cache: "force-cache",
    next: { revalidate },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}


export default async function Page() {

  const [courseIndex, transfersData, subjectsData, firstPageData] = await Promise.all([
    fetchJson<CourseIndexResponse>(
      'https://api2.langaracourses.ca/api/v3/index/courses',
      1800
    ),
    fetchJson<v1IndexTransfersResponse>(
      'https://api2.langaracourses.ca/api/v3/index/transfer_destinations',
      3600
    ),
    fetchJson<v1IndexSubjectsResponse>(
      'https://api2.langaracourses.ca/api/v3/index/subjects',
      3600
    ),
    fetchJson<v2SearchCoursesResponse>(
      'https://api2.langaracourses.ca/api/v3/search/courses?on_langara_website=true&limit=200&page=1',
      1800
    ),
  ]);

  // Fetch remaining pages in parallel
  const remainingPages = Array.from({ length: firstPageData.total_pages - 1 }, (_, i) => i + 2);
  const remainingResults = await Promise.all(
    remainingPages.map(page =>
      fetchJson<v2SearchCoursesResponse>(
        `https://api2.langaracourses.ca/api/v3/search/courses?on_langara_website=true&limit=200&page=${page}`,
        1800
      )
    )
  );
  const allCourses = [
    ...firstPageData.courses,
    ...remainingResults.flatMap(r => r.courses),
  ];
  const initialTotalCount = firstPageData.total_count;
  const courseList = courseIndex.courses.map(
    (course) => `${course.subject}-${course.course_code}`.toLowerCase()
  );

  // always put ubc, sfu, uvic, and tru at the top of the list
  const transfers = [
    ...transfersData.transfers.filter(t => ['UBCV', 'SFU', 'UVIC', 'TRU'].includes(t.code)),
    ...transfersData.transfers.filter(t => !['UBCV', 'SFU', 'UVIC', 'TRU'].includes(t.code))
  ];
  const subjects = subjectsData.subjects;
  const courses = allCourses;
  
  return (
    <div className="w-full h-full">
      <Header title="Langara Course Search" color="#F1B5CB" />

      <div className="lg:px-10">
        <Suspense fallback={<div>Loading...</div>}>
          <CourseBrowser transfers={transfers} subjects={subjects} initialCourses={courses} initialTotalCount={initialTotalCount} validCourses={courseList}/>
        </Suspense>
      </div>
    </div>
  );
}