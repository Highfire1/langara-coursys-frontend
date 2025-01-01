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

  // Generate timetables when courses change
  useEffect(() => {
    if (courses.length > 0) {
      const generated = generateTimetables(courses);
      setTimetables(generated);
      setCurrentIndex(0);
    } else {
      setTimetables([]);
    }
  }, [courses]);

  // Update current timetable when index or timetables change
  useEffect(() => {
    const currentTimetable = timetables.length > 0 ? timetables[currentIndex] : [];
    setCurrentTimetable(currentTimetable);
  }, [currentIndex, timetables, setCurrentTimetable]);

  if (timetables.length === 0) {
    return (
      <div className='border w-full h-full p-2 rounded flex flex-col'>
        <h2 className="font-bold text-lg">No timetables available</h2>
      </div>
    );
  }

  return (
    <div className='border w-full h-full p-2 rounded flex flex-col'>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">
          Timetable {currentIndex + 1} of {timetables.length}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Prev
          </button>
          <button
            onClick={() => setCurrentIndex(prev => Math.min(timetables.length - 1, prev + 1))}
            disabled={currentIndex === timetables.length - 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>

      <div className='flex-grow border-2 rounded overflow-auto'>
        {timetables[currentIndex].map((section, index) => (
          <div key={index} className="p-2 border-b">
            <h3 className="font-semibold">{section.subject} {section.course_code} - Section {section.section}</h3>
            {section.schedule.map((schedule, scheduleIndex) => (
              <div key={scheduleIndex} className="text-sm">
                <p>{schedule.type}: {schedule.days} {schedule.time}</p>
                <p>Instructor: {schedule.instructor}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}