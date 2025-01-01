'use client'

import React from 'react';
// import { VariableSizeList as List } from 'react-window';
// import AutoSizer from "react-virtualized-auto-sizer";
import { Course, CourseInternal } from '../../types/Course';


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
// import { SectionInternal } from '@/types/Section';


// interface CoursesProps {
//   courses: Course[];
// }

interface CoursesProps {
  courses: Course[];
  selectedCourses: CourseInternal[];
  setSelectedCourses: React.Dispatch<React.SetStateAction<CourseInternal[]>>;
}


export default function SelectedCourses({ courses, selectedCourses, setSelectedCourses }: CoursesProps) {
  const [open, setOpen] = React.useState(false)

  // const [value, setValue] = React.useState("");
  const value = ""

  const onCourseSelect = (courseId: string) => {
    const c_id = courseId.split(' ')[0]
    const selectedCourse = courses.find(course => course.id === c_id)

    // convert Course to CourseInternal so we can add additional properties and easily pass it around 
    if (selectedCourse && !selectedCourses.some(c => c.id === c_id)) {
      const courseInternal: CourseInternal = {
        ...selectedCourse,
        hidden: false,
        sections_enhanced: selectedCourse.sections.map(section => ({
          ...section,
          hidden: false,
          pinned: false,
          hidden_by_pin: false
        }))
      };
      setSelectedCourses([courseInternal, ...selectedCourses])
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
              <CommandEmpty><span className='p-2'>Couldn&apos;t find a course with that query. Check if its offered this semester or if you have already added it.</span></CommandEmpty>
              <CommandGroup>
                {courses.map((course) => (
                  <CommandItem
                    key={course.id}
                    value={`${course.id} ${course.attributes.title}`}
                    onSelect={onCourseSelect} // Replace the existing onSelect with onCourseSelect
                    className={!selectedCourses.some(selectedCourse => selectedCourse.id === course.id) ? "" : "hidden"}

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

      <div>
        <p className='text-sm'>
          {(selectedCourses.length==0) ? "Nothing here. Try adding a course with the search bar." : ""} 
          {/* `${selectedCourses.length} course${selectedCourses.length == 1 ? '' : 's'} selected (${selectedCourses.reduce<number>((acc, course) => acc + parseFloat(String(course.attributes.credits)), 0)} credits)`} */}
        </p>
      </div>

      <div className='h-full w-full border-2 rounded overflow-auto'>


        <div className="w-full overflow-y-scroll max-h-fit overflow-scroll">
          {selectedCourses.map((course, index) => (

            <div key={index} className='border-b'>

              <div className='p-2'>

                <p className='font-semibold'>
                  {`${course.subject} ${course.course_code}`}
                </p>

                <p className='text-sm'>{course.attributes.title} ({course.attributes.credits} credits)</p>

                <div className='flex justify-between'>
                  <button
                    onClick={() => {
                      if (selectedCourses.some(c => c.id === course.id && c.hidden)) {
                        setSelectedCourses(selectedCourses.map(c => c.id === course.id ? { ...c, hidden: false } : c));
                      } else {
                        setSelectedCourses(selectedCourses.map(c => c.id === course.id ? { ...c, hidden: true } : c));
                      }
                    }}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    {(course.hidden) ? "Unhide" : "Hide all"}
                  </button>


                  <button
                    onClick={() => {
                      setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
                    }}
                    className="text-red-700 hover:text-red-900"
                  >
                    Remove
                  </button>
                </div>


                {/* <p className='text-sm'>{course.attributes.description.substring(0, 200)}...</p>
                {course.attributes.desc_prerequisite &&
                  <p className='text-sm'>{course.attributes.desc_prerequisite.substring(0, 200)}...</p>
                } */}

                {course.sections_enhanced.map((section, sectionIndex) => (

                  <div key={sectionIndex} className='mt-1 p-1 border text-sm'>
                    <div className="flex justify-between">
                      <button
                        onClick={() => {
                          if (section.hidden) {
                            setSelectedCourses(selectedCourses.map(c =>
                              c.id === course.id
                                ? {
                                  ...c, sections_enhanced: c.sections_enhanced.map(s =>
                                    s.id === section.id ? { ...s, hidden: false } : s
                                  )
                                }
                                : c
                            ));
                          } else {
                            setSelectedCourses(selectedCourses.map(c =>
                              c.id === course.id
                                ? {
                                  ...c, sections_enhanced: c.sections_enhanced.map(s =>
                                    s.id === section.id ? { ...s, hidden: true } : s
                                  )
                                }
                                : c
                            ));
                          }
                        }}
                        className="text-gray-700 hover:text-gray-900"
                      >
                        {(section.hidden_by_pin) ? "Hidden by pin" : (section.hidden) ? "Unhide" : "Hide"}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedCourses(selectedCourses.map(c => {
                            if (c.id !== course.id) return c;

                            return {
                              ...c,
                              sections_enhanced: c.sections_enhanced.map(s => {
                                if (section.pinned) {
                                  // Unpinning: reset all sections
                                  return {
                                    ...s,
                                    pinned: false,
                                    hidden_by_pin: false
                                  };
                                } else {
                                  // Pinning: set this section as pinned, others as hidden
                                  return {
                                    ...s,
                                    pinned: s.id === section.id,
                                    hidden_by_pin: s.id !== section.id
                                  };
                                }
                              })
                            };
                          }));
                        }}
                        className="text-gray-700 hover:text-gray-900"
                      >
                        {section.pinned ? "PINNED (unpin)" : "Pin"}
                      </button>
                    </div>

                    <p>Section {section.section} ({section.crn})</p>
                    {section.seats === "Cancel" ? (
                      <p className="text-red-900">Cancelled</p>
                    ) : (
                    <div>
                      <p>
                        {section.seats} seat{Number(section.seats) > 0 ? '' : 's'} open
                        {section.waitlist === " " ? "." : ` / ${section.waitlist} on waitlist.`}
                      </p>
                      <div>
                        {section.schedule.map((schedule, scheduleIndex) => (
                          <div key={scheduleIndex}>
                            <p>{schedule.type} {schedule.days} {schedule.time}   {schedule.instructor}</p>

                          </div>
                        ))}
                      </div>
                    </div>)}

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
