'use client'
import * as React from "react"
import { useState, useEffect } from "react"
import { CourseInternal } from '../../types/Course';
import { Section } from '../../types/Section';
import { generateTimetables } from '@/utils/timetableGenerator';

interface CoursesProp {
  courses: CourseInternal[];
  setCurrentTimetable: (sections: Section[]) => void;
}

export default function TimetableSections({ courses, setCurrentTimetable }: CoursesProp) {
  const [timetables, setTimetables] = useState<Section[][]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  //  Generate timetables when courses change
  useEffect(() => {
    if (courses.length > 0) {
      const generated = generateTimetables(courses);
      setTimetables(generated);
      setCurrentIndex(0);
    } else {
      setTimetables([]);
    }
  }, [courses]);

  //  Update current timetable when index or timetables change
  useEffect(() => {
    const currentTimetable = timetables.length > 0 ? timetables[currentIndex] : [];
    setCurrentTimetable(currentTimetable);
  }, [currentIndex, timetables, setCurrentTimetable]);


  return (
    <div className='w-full h-full p-2 rounded flex flex-col'>
      
      <div className="flex flex-col lg:flex-row justify-between items-center mb-1">
        <div>
          <h2 className="font-bold text-lg">
            {courses.length === 0 ? "Timetables List" :
              timetables.length === 0 ? "No timetables found." :
                `Timetable ${currentIndex + 1} of ${timetables.length}`}
          </h2>
          {/* commented out until i can write better error messages that actually tell you what went wrong */}
          {/* {timetables.length === 0 && courses.length > 0 && (
            <>
              <p>There is likely an unfixable time conflict.</p>
              <p>Try selecting some different sections.</p>
            </>
          )} */}
        </div>


        <div className="flex gap-2 flex-row">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Prev
          </button>
          <button
            onClick={() => setCurrentIndex(prev => Math.min(timetables.length - 1, prev + 1))}
            disabled={timetables.length == 0 || currentIndex === timetables.length - 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>

      {/* todo: make shareable link */}
      {timetables.length > 0 && (
        <div className="text-sm mb-1">
          <span className="text-sm">CRNS: </span>
          {timetables[currentIndex].map((section) => (
            <span key={section.crn} className="mr-2">
              {section.crn}
            </span>
          ))}
        </div>
      )}

      <div className='flex-grow border-2 rounded overflow-auto'>
        {timetables.length > 0 && timetables[currentIndex].map((section, index) => (
          <div key={index} className="p-2 border-b">
            <h3 className="font-semibold">{section.subject} {section.course_code} - Section {section.section}</h3>
            <p className="text-sm">
              {section.seats} seat{Number(section.seats) == 1 ? '' : 's'} open
              {section.waitlist === " " ? "." : ` / ${section.waitlist} on waitlist.`}
            </p>

            <div className="text-sm">
              <table>
                <tbody>
                  {section.schedule.map((schedule, scheduleIndex) => (

                    <tr key={scheduleIndex} className="text-xs">
                      <td className="pr-1 whitespace-nowrap">{schedule.type}</td>
                      <td className="pr-1 whitespace-nowrap">{schedule.days}</td>
                      <td className="pr-1 whitespace-nowrap">{schedule.time}</td>
                      <td className="pr-1 whitespace-nowrap">{schedule.room}</td>
                      <td className="break-words">{schedule.instructor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


          </div>
        ))}

      </div>

    </div>
  );
}