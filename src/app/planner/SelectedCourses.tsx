'use client'

import React, { useState } from 'react';
// import { VariableSizeList as List } from 'react-window';
// import AutoSizer from "react-virtualized-auto-sizer";
import { Course } from '../../types/Course';


import { ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


// interface CoursesProps {
//   courses: Course[];
// }

interface CoursesProps {
  courses: Course[];
  selectedCourses: Course[];
  setSelectedCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}


export default function SelectedCourses({ courses, selectedCourses, setSelectedCourses }: CoursesProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("");

  const onCourseSelect = (courseId: string) => {
    const selectedCourse = courses.find(course => course.id === courseId)
    if (selectedCourse && !selectedCourses.some(c => c.id === courseId)) {
      setSelectedCourses([...selectedCourses, selectedCourse])
    }
    setOpen(false)
  }

  return (
    <div className='flex flex-col gap-2 h-full w-full p-2 rounded border overflow-hidden'>
      <h2 className='font-bold text-lg'>Selected Courses</h2>

      {/* Combobox to select courses to add to our selected courses list */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {value
              ? `Added ${courses.find((course) => course.id === value)?.subject} ${courses.find((course) => course.id === value)?.course_code}`
              : "Add a course"}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search for a course..." />
            <CommandList>
              <CommandEmpty>No course found.</CommandEmpty>
              <CommandGroup>
                {courses.map((course) => (
                  <CommandItem
                    key={course.id}
                    value={course.id}
                    onSelect={onCourseSelect} // Replace the existing onSelect with onCourseSelect
                  >
                    {`${course.subject} ${course.course_code} - ${course.attributes.title}`}
                    {/* <Check
                      className={cn(
                        "ml-auto",
                        value === course.id ? "opacity-100" : "opacity-0"
                      )}
                    /> */}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Courses List */}
      {/* <div className="mt-4">
        <h3 className="text-lg font-semibold">Selected Courses</h3>
        <div className="space-y-2">
          {selectedCourses.map((course) => (
            <div 
              key={course.id} 
              className="flex items-center justify-between p-2 border rounded"
            >
              <span>{`${course.subject} ${course.course_code} - ${course.attributes.title}`}</span>
              <button
                onClick={() => setSelectedCourses(selectedCourses.filter(c => c.id !== course.id))}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div> */}



      <div className='h-full w-full border-2 rounded overflow-auto'>


        <div className="w-full overflow-y-scroll max-h-fit overflow-scroll">
          {selectedCourses.map((course, index) => (

            <div key={index} className='border-b'>

              <div className='p-4'>

                <p className='font-semibold'>
                  {`${course.subject} ${course.course_code}`}
                </p>

                <p className='text-sm'>{course.attributes.title} ({course.attributes.credits} credits)</p>

                <button
                  onClick={() => setSelectedCourses(selectedCourses.filter(c => c.id !== course.id))}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>

                {/* <p className='text-sm'>{course.attributes.description.substring(0, 200)}...</p>
                {course.attributes.desc_prerequisite &&
                  <p className='text-sm'>{course.attributes.desc_prerequisite.substring(0, 200)}...</p>
                } */}

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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
