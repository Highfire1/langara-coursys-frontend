'use client'
// src/app/Sections.tsx

import * as React from "react"

import { Course } from '../../types/Course';
import CourseSections from './CourseSections';

interface CoursesProp {
  courses: Course[];
}


export default function TimetableSections({ courses }: CoursesProp) {

  return (
    <div className='border w-full h-full p-2 rounded flex flex-col'>
      
      <h2 className="font-bold text-lg">Timetable generated</h2>
      <div className='flex-grow border-2 rounded'>
        <div className="overflow-auto h-full">
          <table className="w-full">
            <tbody>

              {courses.map((course, index) => (
                <CourseSections
                  key={index}
                  index={index}
                  courses={courses}
                />
              ))}

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};