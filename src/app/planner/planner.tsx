// import Courses from './courses';


import React from 'react';
import SelectedCourses from './SelectedCourses';
import { CoursesResponse } from '../../types/Course';
import Sections from './sections';
import { SectionsResponse } from '../../types/Section';
import Calendar from './Calendar';

export default async function Planner() {
  const courses_request = await fetch('https://coursesapi.langaracs.ca/v1/semester/2024/10/courses');
  const courses_data: CoursesResponse = await courses_request.json();

  const sections_request = await fetch('https://coursesapi.langaracs.ca/v1/semester/2024/10/sections');
  const sections_data: SectionsResponse = await sections_request.json();

  courses_data.courses.forEach(course => {
    course.sections = sections_data.sections.filter(section => section.subject === course.subject && section.course_code === course.course_code);
  });

  return (
    <div className="grid grid-cols-4 gap-2 bg-gray-400 w-full h-full overfloy-y-clip">

      <div className="col-span-1 p-2 w-full h-full">
        <SelectedCourses courses={[]} />
      </div>

      <div className="col-span-1 p-2 w-full h-full">
        <Sections courses={courses_data.courses} />
      </div>

      <div className="col-span-2 w-full h-full flex flex-col p-2 ">
        <div className='bg-gray-500 rounded h-full p-2'>
          <Calendar />
        </div>
        {/* <p className='w-full h-full p-2 bg-cyan-900 rounded'>filler</p> */}
      </div>

    </div>
  );
}