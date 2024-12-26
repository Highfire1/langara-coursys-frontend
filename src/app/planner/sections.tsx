'use client'
// src/app/Sections.tsx

import React from 'react';
import { Course } from '../../types/Course';
import CourseSections from './CourseSections';

interface CoursesProp {
  courses: Course[];
}



const Sections: React.FC<CoursesProp> = ({ courses }) => {
  return (
    <div className='border w-full h-full p-2 rounded flex flex-col'>
      
      <h2 className="font-bold text-lg">Selected Courses</h2>
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

export default Sections;