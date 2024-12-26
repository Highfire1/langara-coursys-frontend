import React from 'react';

import SelectedCourses from './SelectedCourses';
import TimetableSections from './TimetableSections';

import { CoursesResponse } from '../../types/Course';
import { SectionsResponse } from '../../types/Section';
import Calendar from './Calendar';

export default async function Home() {
  const courses_request = await fetch('https://coursesapi.langaracs.ca/v1/semester/2025/10/courses');
  const courses_data: CoursesResponse = await courses_request.json();

  const sections_request = await fetch('https://coursesapi.langaracs.ca/v1/semester/2025/10/sections');
  const sections_data: SectionsResponse = await sections_request.json();

  courses_data.courses.forEach(course => {
    course.sections = sections_data.sections.filter(section => 
      section.subject === course.subject && section.course_code === course.course_code
    );
  });

  return (
    <div className="w-[100vw] h-[100vh] flex flex-col">
      {/* <header className="py-2 flex-1">
        <h1 className="font-bold text-lg m-2">Langara Course Planner 2.0</h1>
      </header> */}

    <div className="flex gap-2 bg-gray-400 w-full h-full">
      
      <div className="w-1/4 p-2 max-h-full">
        <SelectedCourses courses={courses_data.courses} />
      </div>

      <div className="w-1/4 p-2 max-h-full">
        <TimetableSections courses={[]} />
      </div>

      <div className="w-2/4 h-full flex flex-col p-2">
        <div className='bg-gray-500 rounded h-full p-2'>
        <Calendar />
        </div>
      </div>
    </div>
    </div>
  );
}