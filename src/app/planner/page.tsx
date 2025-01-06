'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import Calendar from './Calendar';
import { Course, CoursesResponse } from '../../types/Course';
import { SectionsResponse,  } from '../../types/Section';
import Link from 'next/link';

function PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const year = searchParams.get('year') || '2025';
  const term = searchParams.get('term') || '10';

  const [, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParams.get('year') || !searchParams.get('term')) {
      router.replace(`/timetable?year=${year}&term=${term}`);
      return;
    }

    const fetchData = async () => {
      try {
        const [coursesResponse, sectionsResponse] = await Promise.all([
          fetch(`https://coursesapi.langaracs.ca/v1/semester/${year}/${term}/courses`),
          fetch(`https://coursesapi.langaracs.ca/v1/semester/${year}/${term}/sections`)
        ]);

        const coursesData: CoursesResponse = await coursesResponse.json();
        const sectionsData: SectionsResponse = await sectionsResponse.json();

        coursesData.courses.forEach(course => {
          course.sections = sectionsData.sections.filter(
            section =>
              section.subject === course.subject && section.course_code === course.course_code
          );
        });

        setCourses(coursesData.courses);
      } catch (err) {
        setError('Failed to fetch data: ' + (err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [year, term, searchParams, router]);

  if (isLoading) return <div className='w-[100vw] h-[100vh] p-4'>Loading...</div>;
  if (error) return <div className='w-[100vw] h-[100vh] p-4'>{error}</div>;

  return (
    <div className="w-[100vw] h-[100vh] flex flex-col">
      <header className="p-5 bg-[#F15A22]">
        <h1 className="font-bold text-xl">
          <Link href="/">Langara Time Table Generator</Link>
        </h1>
        <p>
          Note: this website is a student project and not affiliated with Langara College.
        </p>
        <p>
          This website helps you visualize all of your possible schedules given a list of
          courses. Please report bugs or suggestions at{' '}
          <a
            className="hover:underline hover:text-blue-800"
            href="https://forms.gle/CYKP7xsp2an6gNEK9"
            target="_blank"
            rel="noopener noreferrer"
          >
            this form.
          </a>
        </p>
      </header>
      <div className="flex gap-2 bg-gray-400 w-full h-full">
        <div className="w-1/4 p-2 max-h-full">
          <h1>HI!</h1>
        </div>
        <div className="w-1/4 p-2 max-h-full">
          <h2>WHEEE</h2>
        </div>
        <div className="w-2/4 h-full flex flex-col p-2">
          <div className="bg-gray-500 rounded h-full p-2">
            <Calendar currentTimetable={[]} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading search parameters...</div>}>
      <PageContent />
    </Suspense>
  );
}
