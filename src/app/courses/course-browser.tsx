'use client';

import React, { useState, useEffect, useMemo } from 'react';

import { debounce } from 'lodash';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import './styles.css';

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CourseMax {
    credits: number;
    title: string;
    desc_replacement_course: string;
    description: string;
    desc_duplicate_credit: string;
    desc_registration_restriction: string;
    desc_prerequisite: string;
    hours_lecture: number;
    hours_seminar: number;
    hours_lab: number;
    offered_online: boolean;
    preparatory_course: boolean;
    RP: string;
    abbreviated_title: string;
    add_fees: number;
    rpt_limit: number;
    attr_ar: boolean;
    attr_sc: boolean;
    attr_hum: boolean;
    attr_lsc: boolean;
    attr_sci: boolean;
    attr_soc: boolean;
    attr_ut: boolean;
    first_offered_year: number;
    first_offered_term: number;
    last_offered_year: number;
    last_offered_term: number;
    on_langara_website: boolean;
    discontinued: boolean;
    transfer_destinations: string;
    id: string;
    subject: string;
    course_code: string;
    id_course: string;
}

interface CoursesResponse {
    courses: CourseMax[];
    total_pages?: number;
}

interface SearchParams {
    subject?: string;
    course_code?: string;
    title_search?: string;
    attr_ar?: boolean;
    attr_sc?: boolean;
    attr_hum?: boolean;
    attr_lsc?: boolean;
    attr_sci?: boolean;
    attr_soc?: boolean;
    attr_ut?: boolean;
    credits?: number;
    on_langara_website?: boolean;
    offered_online?: boolean;
    transfer_destinations?: string[];
}

interface SubjectsResponse {
    count: number;
    subjects: string[];
}

interface TransferDestination {
    code: string;
    name: string;
}

interface TransfersResponse {
    transfers: TransferDestination[];
}

const termToSeason = (term: number): string => {
    switch (term) {
        case 10: return 'Spring';
        case 20: return 'Summer';
        case 30: return 'Fall';
        default: return 'Unknown';
    }
};

export default function CourseBrowser() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [transfer_destinations, setDestinations] = useState<TransfersResponse>();
    const [subjects, setSubjects] = useState<string[]>([]);
    const [courses, setCourses] = useState<CoursesResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [requestInfo, setRequestInfo] = useState<{ time?: number; cached?: boolean }>({});

    const initialSearchParams: SearchParams = {
        subject: searchParams.get('subject') || '',
        course_code: searchParams.get('course_code') || '',
        title_search: searchParams.get('title_search') || '',
        attr_ar: searchParams.get('attr_ar') === 'true',
        attr_sc: searchParams.get('attr_sc') === 'true',
        attr_hum: searchParams.get('attr_hum') === 'true',
        attr_lsc: searchParams.get('attr_lsc') === 'true',
        attr_sci: searchParams.get('attr_sci') === 'true',
        attr_soc: searchParams.get('attr_soc') === 'true',
        attr_ut: searchParams.get('attr_ut') === 'true',
        credits: searchParams.get('credits') ? Number(searchParams.get('credits')) : undefined,
        on_langara_website: searchParams.get('on_langara_website') === null ? true : searchParams.get('on_langara_website') === 'true',
        offered_online: searchParams.get('offered_online') === 'true',
        transfer_destinations: searchParams.getAll('transfer_destinations'),
    };

    const [currentSearchParams, setCurrentSearchParams] = useState<SearchParams>(initialSearchParams);

    useEffect(() => {
        const fetchInitialData = async () => {
            const [transferRes, subjectsRes] = await Promise.all([
                fetch('https://coursesapi.langaracs.ca/v1/index/transfer_destinations'),
                fetch('https://coursesapi.langaracs.ca/v1/index/subjects')
            ]);

            const transfersData = await transferRes.json();
            const subjectsData: SubjectsResponse = await subjectsRes.json();

            setDestinations(transfersData);
            setSubjects(subjectsData.subjects);
        };

        fetchInitialData();
    }, []);

    const debouncedSearch = useMemo(
        () =>
            debounce(async (params: SearchParams) => {
                setLoading(true);
                const queryParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== '' && value !== false) {
                        if (Array.isArray(value)) {
                            value.forEach(v => queryParams.append(key, v));
                        } else {
                            queryParams.append(key, value.toString());
                        }
                    }
                });

                const start = performance.now();
                const response = await fetch(
                    `https://coursesapi.langaracs.ca/v2/search/courses?${queryParams}`
                );
                const data: CoursesResponse = await response.json();
                const cached = response.headers.get('x-fastapi-cache') === 'HIT';
                const time = Math.round(performance.now() - start);

                setRequestInfo({ time, cached });
                setCourses(data);
                setLoading(false);
            }, 400),
        []
    );

    useEffect(() => {
        debouncedSearch(currentSearchParams);
    }, [currentSearchParams, debouncedSearch]);


    const handleInputChange = (key: keyof SearchParams, value: string | boolean | string[]) => {
        setCurrentSearchParams(prev => ({ ...prev, [key]: value }));

        const newSearchParams = { ...currentSearchParams, [key]: value };
        const queryParams = new URLSearchParams();
        Object.entries(newSearchParams).forEach(([key, value]) => {
            if (key === 'on_langara_website') {
                if (value === false) {
                    queryParams.append(key, 'false');
                }
            }
            else if (value !== undefined && value !== '' && value !== false) {
                if (Array.isArray(value)) {
                    value.forEach(v => queryParams.append(key, v));
                } else {
                    queryParams.append(key, value.toString());
                }
            }
        });

        router.replace(`?${queryParams.toString()}`);
    };

    return (
        <div className="p-4">
            <div className="bg-white shadow-md rounded-lg p-4 mb-4">
                <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>

                    <div className='flex flex-row'>
                        <div className='flex flex-wrap gap-4'>

                            {/* Subject Dropdown */}
                            <div className='col-span-full flex flex-row gap-4'>
                                <div className="flex flex-col flex-2 w-min">
                                    <label htmlFor="subject" className="mb-1 text-sm font-medium w-fit">Subject</label>
                                    <select
                                        id="subject"
                                        value={currentSearchParams.subject}
                                        onChange={e => handleInputChange('subject', e.target.value)}
                                        className="border rounded p-[0.68rem] sm:w-fit w-[150px]"
                                    >
                                        <option value="">All Subjects</option>
                                        {subjects.map(subject => (
                                            <option key={subject} value={subject}>
                                                {subject}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Course Code */}
                                <div className="flex flex-col flex-1 w-fit">
                                    <label htmlFor="course_code" className="mb-1 text-sm font-medium w-fit text-nowrap">Course Code</label>
                                    <input
                                        type="text"
                                        id="course_code"
                                        value={currentSearchParams.course_code}
                                        className="border rounded p-2 w-[100px]"
                                        pattern="[0-9]*"
                                        maxLength={4}
                                        // ..... I can see why components are good now.... this is awful
                                        onKeyDown={(e) => {
                                            // Allow if:
                                            // - Is a number
                                            // - Is a navigation key
                                            // - Is a control/command combination
                                            if (
                                                /[0-9]/.test(e.key) ||
                                                e.key === 'Backspace' ||
                                                e.key === 'Delete' ||
                                                e.key === 'ArrowLeft' ||
                                                e.key === 'ArrowRight' ||
                                                e.key === 'Tab' ||
                                                e.ctrlKey ||
                                                e.metaKey
                                            ) {
                                                return;
                                            }
                                            e.preventDefault();
                                        }}
                                        onChange={e => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            handleInputChange('course_code', value);
                                        }}
                                        placeholder="e.g. 1181"
                                    />
                                </div>
                            </div>

                            <div className='col-span-full flex flex-row gap-4'>
                                {/* Title Search */}
                                <div className="flex flex-col w-min">
                                    <label htmlFor="title" className="mb-1 text-sm font-medium">Search by title</label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={currentSearchParams.title_search}
                                        className="border rounded p-2 sm:w-fit w-[150px]"
                                        onChange={e => handleInputChange('title_search', e.target.value)}
                                        placeholder="Introduction to..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attributes Section */}
                    <div className="col-span-full">
                        <p className="mb-2 text-sm font-medium">Attributes</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={currentSearchParams.attr_ar || false}
                                    onChange={e => handleInputChange('attr_ar', e.target.checked)}
                                    className="rounded"
                                />
                                <span>2nd Year Arts (2AR)</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={currentSearchParams.attr_sc || false}
                                    onChange={e => handleInputChange('attr_sc', e.target.checked)}
                                    className="rounded"
                                />
                                <span>2nd Year Science (2SC)</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={currentSearchParams.attr_hum || false}
                                    onChange={e => handleInputChange('attr_hum', e.target.checked)}
                                    className="rounded"
                                />
                                <span>Humanities (HUM)</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={currentSearchParams.attr_lsc || false}
                                    onChange={e => handleInputChange('attr_lsc', e.target.checked)}
                                    className="rounded"
                                />
                                <span>Lab Science (LSC)</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={currentSearchParams.attr_sci || false}
                                    onChange={e => handleInputChange('attr_sci', e.target.checked)}
                                    className="rounded"
                                />
                                <span>Science (SCI)</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={currentSearchParams.attr_soc || false}
                                    onChange={e => handleInputChange('attr_soc', e.target.checked)}
                                    className="rounded"
                                />
                                <span>Social Science (SOC)</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={currentSearchParams.attr_ut || false}
                                    onChange={e => handleInputChange('attr_ut', e.target.checked)}
                                    className="rounded"
                                />
                                <span>University Transferable (UT)</span>
                            </label>
                        </div>
                    </div>

                    {/* Attributes Section */}
                    <div className="col-span-full">
                        <p className="mb-2 text-sm font-medium">Filtering</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">


                            <div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">Select Transfer Destinations</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 bg-white overflow-y-scroll h-64" >
                                        {/* <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                                        <DropdownMenuSeparator /> */}
                                        {transfer_destinations?.transfers.map((destination, index) => (
                                            <DropdownMenuCheckboxItem
                                                key={index}
                                                onCheckedChange={(checked) => {
                                                    const newDestinations = checked
                                                        ? [...(currentSearchParams.transfer_destinations || []), destination.code]
                                                        : (currentSearchParams.transfer_destinations || []).filter(d => d !== destination.code);

                                                    handleInputChange('transfer_destinations', newDestinations);
                                                }}
                                                checked={currentSearchParams.transfer_destinations?.includes(destination.code)}
                                                className=
                                                    {`text-sm ${destination.code === "SFU" ? "bg-red-200" : ''} ${destination.code === "UBCV" ? "bg-blue-200" : ''}`}
                                            >
                                                {destination.code} ({destination.name})
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                            </div>

                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={currentSearchParams.on_langara_website || false}
                                    onChange={e => handleInputChange('on_langara_website', e.target.checked)}
                                    className="rounded"
                                />
                                <span>On Langara website.</span>
                            </label>

                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={currentSearchParams.offered_online || false}
                                    onChange={(e) => setCurrentSearchParams({
                                        ...currentSearchParams,
                                        offered_online: e.target.checked
                                    })}
                                    className="form-checkbox h-4 w-4 text-blue-600"
                                />
                                <span>Offered online.</span>
                            </label>

                        </div>
                    </div>
                </form>
            </div>


            <div className="flex justify-between items-center text-sm text-gray-600 my-4">

                <div className="items-center gap-1 font-medium flex-1 hidden md:block ">
                </div>

                <div className="flex-1 text-left md:text-center">
                    <span className='md:text-nowrap'>
                        {courses ? (
                            <>
                                Showing <span className='font-semibold'>{courses.courses.length}</span> courses.
                            </>
                        ) : "Loading... This should take less than five seconds..."}
                    </span>
                </div>

                <div className="flex-1 text-right">
                    {loading
                        ? ' loading...'
                        : requestInfo.cached ||
                            (requestInfo.time && requestInfo.time < 50)
                            ? `query fulfilled in ${requestInfo.time}ms (cached)`
                            : requestInfo.time
                                ? ` query fulfilled in ${requestInfo.time}ms`
                                : ''}
                </div>
            </div>

            <div className="mt-4">
                <table className="w-full table-fixed relative min-w-[1000px]">
                    <thead className=" bg-white z-10">
                        <tr className="bg-gray-100 text-left text-xs md:text-sm">
                            <th className="sticky-header w-[5%]">On Langara Website</th>
                            <th className="sticky-header w-[15%]">Course</th>
                            <th className="sticky-header w-[5%]">Credits</th>
                            <th className="sticky-header text-center w-[3%]">2AR</th>
                            <th className="sticky-header text-center w-[3%]">2SC</th>
                            <th className="sticky-header text-center w-[3%]">HUM</th>
                            <th className="sticky-header text-center w-[3%]">LSC</th>
                            <th className="sticky-header text-center w-[3%]">SCI</th>
                            <th className="sticky-header text-center w-[3%]">SOC</th>
                            <th className="sticky-header text-center w-[3%]">UT</th>
                            <th className="sticky-header p-2 w-[5%] text-sm">Offered Online</th>
                            <th className="sticky-header p-2 w-[6%] text-sm">First Offered</th>
                            <th className="sticky-header p-2 w-[6%] text-sm">Last Offered</th>
                            <th className="sticky-header p-2 w-[50%]">Description</th>
                            {/* <th className="p-2 w-[10%]">Prerequisites:</th> */}
                            <th className="sticky-header p-2 w-[10%]">Transfers to</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && false ? (
                            Array.from({ length: 10 }).map((_, index) => (
                                <tr key={index}>
                                    <td colSpan={5} className="p-2">
                                        Loading...
                                    </td>
                                </tr>
                            ))
                        ) : (
                            courses?.courses.map(course => (
                                <tr key={course.id} className={`border-b align-top ${course.on_langara_website ? '' : 'bg-red-200'}`}>

                                    <td className={`p-2 break-words text-white text-center ${course.on_langara_website ? 'bg-green-800' : 'bg-red-600'}`}>
                                        {/* {course.on_langara_website ? '✓' : '✗ '} */}
                                    </td>

                                    <td className="p-2 break-words">
                                        <Link className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600" target="_blank" href={`/courses/${course.subject}/${course.course_code}`}>
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
                                        {/* {course.first_offered_year == 1999 && course.first_offered_term == 20 ?
                                            "Before 1999" // we only have data going back to summer 1999
                                            : course.first_offered_year
                                                ?
                                                `${termToSeason(course.first_offered_term)} ${course.first_offered_year}`
                                                : "???"}</td> */}
                                        {course.first_offered_year ?
                                            `${termToSeason(course.first_offered_term)} ${course.first_offered_year}`
                                            : "???"}</td>

                                    <td className={`p-2 break-words text-sm ${course.last_offered_year < 2021 ? 'bg-red-200' : ''}`}>
                                        {course.first_offered_year ?
                                            `${termToSeason(course.last_offered_term)} ${course.last_offered_year}`
                                            : "???"}</td>

                                    <td className="p-2 break-words flex flex-col gap-2 text-sm">
                                        {/* <span>Lecture: {course.hours_lecture ? course.hours_lecture : "0"} h + Seminar {course.hours_seminar ? course.hours_seminar: "0"} h + Lab. {course.hours_lab ? course.hours_lab : "0"} h</span> */}
                                        
                                        {course.desc_registration_restriction &&
                                            <span>{course.desc_registration_restriction}</span>
                                        }

                                        <span>
                                            {course.description 
                                                ? course.description //.replace(/\n/g, '\n\n')
                                                : "No description available."
                                            }
                                        </span>

                                        {course.desc_prerequisite &&
                                            <span>{course.desc_prerequisite}</span>
                                        }
                                        {course.desc_duplicate_credit &&
                                            <span>{course.desc_duplicate_credit}</span>
                                        }
                                        {course.desc_replacement_course &&
                                            <span>{course.desc_replacement_course}</span>
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

        </div>
    );
}