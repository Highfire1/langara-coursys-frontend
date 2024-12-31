'use client'

import { useState, useEffect } from 'react';
import SelectedCourses from './SelectedCourses';
import TimetableSections from './TimetableSections';
import Calendar from './Calendar';
import { Course, CoursesResponse } from '../../types/Course';
import { SectionsResponse, Section } from '../../types/Section';

export default function Page() {
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [currentTimetable, setCurrentTimetable] = useState<Section[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [coursesResponse, sectionsResponse] = await Promise.all([
          fetch('https://coursesapi.langaracs.ca/v1/semester/2025/10/courses'),
          fetch('https://coursesapi.langaracs.ca/v1/semester/2025/10/sections')
        ]);

        const coursesData: CoursesResponse = await coursesResponse.json();
        const sectionsData: SectionsResponse = await sectionsResponse.json();

        // Attach sections to courses
        coursesData.courses.forEach(course => {
          course.sections = sectionsData.sections.filter(section =>
            section.subject === course.subject && section.course_code === course.course_code
          );
        });

        setCourses(coursesData.courses);
      } catch (err) {
        setError('Failed to load courses data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="w-[100vw] h-[100vh] flex flex-col">
      <div className="flex gap-2 bg-gray-400 w-full h-full">
        <div className="w-1/4 p-2 max-h-full">
          <SelectedCourses
            courses={courses}
            selectedCourses={selectedCourses}
            setSelectedCourses={setSelectedCourses}
          />
        </div>

        <div className="w-1/4 p-2 max-h-full">
          <TimetableSections 
            courses={selectedCourses} 
            setCurrentTimetable={setCurrentTimetable}
          />
        </div>

        <div className="w-2/4 h-full flex flex-col p-2">
          <div className='bg-gray-500 rounded h-full p-2'>
            <Calendar currentTimetable={currentTimetable} />
          </div>
        </div>
      </div>
    </div>
  );
}