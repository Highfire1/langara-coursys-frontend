'use client'

import { addLinksToCourseDescription } from '@/lib/course-utils';
import { CourseMax } from '@/types/Course'
import Link from 'next/link'
import { JSX } from 'react';


const termToSeason = (term: number): string => {
    switch (term) {
        case 10: return 'Spring';
        case 20: return 'Summer';
        case 30: return 'Fall';
        default: return 'Unknown';
    }
};


interface CourseListProps {
    loading: boolean;
    courses: CourseMax[];
}

export default function CourseList({ loading, courses }: CourseListProps): JSX.Element {

    console.log("rendering course list")

    return (
        <div className="mt-4">
            <table className="w-full table-fixed relative min-w-[1000px]">
                <thead className=" bg-white z-10">
                    <tr className="bg-gray-100 text-left text-xs md:text-sm">
                        <th className="sticky bg-gray-100 top-0 w-[5%]">On Langara Website</th>
                        <th className="sticky bg-gray-100 top-0 w-[15%]">Course</th>
                        <th className="sticky bg-gray-100 top-0 w-[5%]">Credits</th>
                        <th className="sticky bg-gray-100 top-0 text-center w-[3%]">2AR</th>
                        <th className="sticky bg-gray-100 top-0 text-center w-[3%]">2SC</th>
                        <th className="sticky bg-gray-100 top-0 text-center w-[3%]">HUM</th>
                        <th className="sticky bg-gray-100 top-0 text-center w-[3%]">LSC</th>
                        <th className="sticky bg-gray-100 top-0 text-center w-[3%]">SCI</th>
                        <th className="sticky bg-gray-100 top-0 text-center w-[3%]">SOC</th>
                        <th className="sticky bg-gray-100 top-0 text-center w-[3%]">UT</th>
                        <th className="sticky bg-gray-100 top-0 p-2 w-[5%] text-sm">Offered Online</th>
                        <th className="sticky bg-gray-100 top-0 p-2 w-[6%] text-sm">First Offered</th>
                        <th className="sticky bg-gray-100 top-0 p-2 w-[6%] text-sm">Last Offered</th>
                        <th className="sticky bg-gray-100 top-0 p-2 w-[50%]">Description</th>
                        {/* <th className="p-2 w-[10%]">Prerequisites:</th> */}
                        <th className="sticky bg-gray-100 top-0 p-2 w-[10%]">Transfers to</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                            <tr>
                                <td colSpan={15} className="p-2 text-center h-[2000px]">
                                    Loading...
                                </td>
                            </tr>
                    ) : (
                        courses?.map(course => (
                            <tr key={course.id} className={`border-b align-top ${course.on_langara_website ? '' : 'bg-red-200'}`}>

                                <td className={`p-2 break-words text-white text-center ${course.on_langara_website ? 'bg-green-800' : 'bg-red-600'}`}>
                                </td>

                                <td className="p-2 break-words">
                                    <Link className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600" href={`/courses/${course.subject}/${course.course_code}`}>
                                        {course.subject} {course.course_code}</Link>
                                    <p>{course.title ? course.title : course.abbreviated_title}</p>
                                </td>
                                <td className="p-2 break-words">{course.credits ? course.credits.toFixed(1) : ""}</td>

                                <td className={`p-2 break-words ${course.attr_ar ? 'bg-green-800 text-white text-center' : ''}`}>
                                    {course.attr_ar ? '✓' : ''}
                                </td>
                                <td className={`p-2 break-words ${course.attr_sc ? 'bg-green-800 text-white text-center' : ''}`}>
                                    {course.attr_sc ? '✓' : ''}
                                </td>
                                <td className={`p-2 break-words ${course.attr_hum ? 'bg-green-800 text-white text-center' : ''}`}>
                                    {course.attr_hum ? '✓' : ''}
                                </td>
                                <td className={`p-2 break-words ${course.attr_lsc ? 'bg-green-800 text-white text-center' : ''}`}>
                                    {course.attr_lsc ? '✓' : ''}
                                </td>
                                <td className={`p-2 break-words ${course.attr_sci ? 'bg-green-800 text-white text-center' : ''}`}>
                                    {course.attr_sci ? '✓' : ''}
                                </td>
                                <td className={`p-2 break-words ${course.attr_soc ? 'bg-green-800 text-white text-center' : ''}`}>
                                    {course.attr_soc ? '✓' : ''}
                                </td>
                                <td className={`p-2 break-words ${course.attr_ut ? 'bg-green-800 text-white text-center' : ''}`}>
                                    {course.attr_ut ? '✓' : ''}
                                </td>
                                <td className={`p-2 break-words ${course.offered_online ? 'bg-green-800 text-white text-center' : ''}`}>
                                    {course.offered_online ? '✓' : ''}
                                </td>


                                <td className="p-2 break-words text-sm">
                                    {course.first_offered_year ?
                                        `${termToSeason(course.first_offered_term)} ${course.first_offered_year}`
                                        : "???"}</td>

                                <td className={`p-2 break-words text-sm ${course.last_offered_year < 2021 ? 'bg-red-200' : ''}`}>
                                    {course.first_offered_year ?
                                        `${termToSeason(course.last_offered_term)} ${course.last_offered_year}`
                                        : "???"}</td>

                                <td className="p-2 break-words flex flex-col gap-2 text-sm">
                                    {course.desc_registration_restriction &&
                                        <span>{course.desc_registration_restriction}</span>
                                    }

                                    <span>
                                        {course.description
                                            ? addLinksToCourseDescription(course.description)
                                            : "No description available."
                                        }
                                    </span>

                                    {course.desc_prerequisite &&
                                        <span>{addLinksToCourseDescription(course.desc_prerequisite)}</span>
                                    }
                                    {course.desc_duplicate_credit &&
                                        <span>{addLinksToCourseDescription(course.desc_duplicate_credit)}</span>
                                    }
                                    {course.desc_replacement_course &&
                                        <span>{addLinksToCourseDescription(course.desc_replacement_course)}</span>
                                    }
                                </td>

                                <td className="p-2 break-words text-sm">
                                    {course.transfer_destinations ? course.transfer_destinations.slice(1, -1).replaceAll(",", ", ") : ""}
                                </td>



                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )

}