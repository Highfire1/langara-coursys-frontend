'use client'

import React, { useState } from 'react';
// import { VariableSizeList as List } from 'react-window';
// import AutoSizer from "react-virtualized-auto-sizer";
import { Course } from '../../types/Course';

interface CoursesProps {
  courses: Course[];
}


export default function SelectedCourses({ courses }: CoursesProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = courses.filter(course =>
    `${course.subject} ${course.course_code} ${course.attributes.title}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className='flex flex-col gap-2 h-full w-full p-2 rounded border'>
      <h2 className='font-bold text-lg'>Selected Courses</h2>
      <div className="input-group w-full flex-nowrap">
        <input
          type="text"
          className="form-control"
          placeholder="Search courses..."
          aria-label="Course Search"
          aria-describedby="addon-wrapping"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className='flex-grow border-2 rounded '>
        <div className='flex flex-col gap-2 h-full w-full p-2 rounded border'>


            <table className="w-full">
              <tbody>
                {filteredCourses.map((course, index) => (
                  <tr key={index} className='border-b'>
                    <td className='p-4'>
                      <p className='font-semibold'>
                        {`${course.subject} ${course.course_code} ${course.attributes.title} (${course.attributes.credits} credits)`}
                      </p>
                      <p className='text-sm'>{course.attributes.description.substring(0, 200)}...</p>
                      {course.attributes.desc_prerequisite &&
                        <p className='text-sm'>{course.attributes.desc_prerequisite.substring(0, 200)}...</p>
                      }
                      {course.sections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className='mt-1 p-1 border text-sm'>
                          <p>Section {section.section} ({section.crn})</p>
                          <p>{section.seats} seats open / {section.waitlist} on waitlist</p>
                          {section.schedule.map((schedule, scheduleIndex) => (
                            <div key={scheduleIndex}>
                              <p>{schedule.type} {schedule.days} {schedule.time} {schedule.instructor}</p>
                            </div>
                          ))}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
        );
      </div>
    </div>
  );
}
