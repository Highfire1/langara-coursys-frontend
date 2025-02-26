'use client'

import React from 'react';
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

// import { generateColor } from '@/utils/calendarHelper'

interface CoursesProps {
  courses: Course[];
  selectedCourses: CourseInternal[];
  setSelectedCourses: React.Dispatch<React.SetStateAction<CourseInternal[]>>;
  year: string;
  term: string;
}

export default function SelectedCourses({ courses, selectedCourses, setSelectedCourses, year, term }: CoursesProps) {
  const [open, setOpen] = React.useState(false)
  const value = ""

  const onCourseSelect = (courseId: string) => {
    const c_id = courseId.split(' ')[0]
    const selectedCourse = courses.find(course => course.id === c_id)

    if (selectedCourse && !selectedCourses.some(c => c.id === c_id)) {
      const courseInternal: CourseInternal = {
        ...selectedCourse,
        hidden: false,
        ui_hidden: true,
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
      <h2 className='font-bold text-lg'>Selected Courses ({term === "10" ? "Spring" : term === "20" ? "Summer" : term === "30" ? "Fall" : ""} {year})</h2>

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
              : "Add a course..."}
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
                    onSelect={onCourseSelect}
                    className={!selectedCourses.some(selectedCourse => selectedCourse.id === course.id) ? "" : "hidden"}
                  >
                    {`${course.subject} ${course.course_code} - ${course.attributes.title}`}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div>
        <p className='text-sm'>
          {selectedCourses.length === 0 && (
            <>
              Nothing here... yet.
              <br />
              You can add a course using the search bar above.
            </>
          )}
        </p>
      </div>

      <div className='h-full w-full border-2 rounded overflow-auto'>
        <div className="w-full overflow-y-scroll max-h-fit overflow-scroll">
          {selectedCourses.map((course, index) => (

            <div key={index} className='border-b pb-3'>

              {/* tailwind has some issues with rendering arbitrary values... it should be fixable but this works */}
              {/* <div className={`p-2 ${course.hidden ? 'bg-gray-300' : ''}`} style={{backgroundColor: !course.hidden ? generateColor(course.subject, course.course_code) : undefined}}>  */}
              <div className={`p-2 ${course.hidden ? 'bg-gray-300' : 'bg-[#d0ead0]'}`}>



                <p className='font-semibold'>
                  {`${course.subject} ${course.course_code}: ${course.attributes.abbreviated_title}`}
                </p>
                <p className='text-sm'>{course.attributes.title} ({course.attributes.credits} credits)</p>

                <div className='sm:grid sm:grid-cols-[1fr_2fr_1fr] sm:text-base flex flex-col text-sm'>
                  <button
                    onClick={() => {
                      const hideAll = !course.hidden;
                      setSelectedCourses(selectedCourses.map(c =>
                        c.id === course.id
                          ? {
                            ...c,
                            hidden: hideAll,
                          }
                          : c
                      ));
                    }}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    {(course.hidden) ? "Select" : "Hide"}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCourses(selectedCourses.map(c =>
                        c.id === course.id
                          ? { ...c, ui_hidden: !c.ui_hidden }
                          : c
                      ));
                    }}
                    className="text-blue-700 hover:text-blue-900 text-center"
                  >
                    {(course.ui_hidden) ? `Show Sections (${course.sections_enhanced.length})` : `Hide Sections (${course.sections_enhanced.length})`}
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
              </div>

              {!course.ui_hidden && (
                <div>
                  {course.sections_enhanced.map((section, sectionIndex) => (
                    <div key={sectionIndex} className={`border-2 p-1 border-black text-sm ${section.hidden || section.hidden_by_pin || course.hidden
                        ? 'bg-gray-200'
                        : (section.waitlist !== " " && Number(section.waitlist) > 10) || section.seats === "Cancel"
                          ? 'bg-red-200'
                          : section.waitlist !== " " && Number(section.waitlist) > 0
                            ? 'bg-yellow-200'
                            : 'bg-green-200'
                      }`}>
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
                          {(section.hidden_by_pin) ? "Hidden by pin" : (section.hidden) ? "Select" : "Hide"}
                        </button>

                        <button
                          onClick={() => {
                            setSelectedCourses(selectedCourses.map(c => {
                              if (c.id !== course.id) return c;

                              return {
                                ...c,
                                sections_enhanced: c.sections_enhanced.map(s => {
                                  if (section.pinned) {
                                    return {
                                      ...s,
                                      pinned: false,
                                      hidden_by_pin: false
                                    };
                                  } else {
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
                            {section.seats} seat{Number(section.seats) == 1 ? '' : 's'} open
                            {section.waitlist === " " ? "." : ` / ${section.waitlist} on waitlist.`}
                          </p>

                          <table>
                            <tbody>
                              {section.schedule.map((schedule, scheduleIndex) => (
                                <tr key={scheduleIndex}>
                                  <td className="pr-1 whitespace-nowrap">{schedule.type}</td>
                                  <td className="pr-1 whitespace-nowrap">{schedule.days}</td>
                                  <td className="pr-1 whitespace-nowrap">{schedule.time}</td>
                                  <td className="break-words">{schedule.instructor}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
