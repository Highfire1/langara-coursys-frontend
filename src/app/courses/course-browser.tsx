'use client';

import React, { useState, useEffect, useMemo } from 'react';

import { throttle } from 'lodash';
import { useSearchParams } from 'next/navigation';

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CourseBrowserProps, CourseMax, v2SearchCoursesResponse } from '@/types/Course';
import CourseList from './course-list';

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

export default function CourseBrowser({ transfers, subjects, initialCourses }: CourseBrowserProps) {
    const searchParams = useSearchParams();

    // const [transfer_destinations, setDestinations] = useState<TransfersResponse>(transfers);
    const [courses, setCourses] = useState<CourseMax[] | null>(null);
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

    const debouncedSearch = useMemo(
        () =>
            throttle(
                async (params: SearchParams) => {
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

                    if (queryParams.toString() === 'on_langara_website=true') {
                        console.log("USED SERVER SIDE CALLED DATA")
                        const data = initialCourses
                        setCourses(data);
                        setLoading(false);
                    }

                    console.log("CALLED API")

                    const start = performance.now();
                    const response = await fetch(
                        `https://coursesapi.langaracs.ca/v2/search/courses?${queryParams}`
                    );
                    const dataRes: v2SearchCoursesResponse = await response.json();
                    const cached = response.headers.get('x-fastapi-cache') === 'HIT';
                    const time = Math.round(performance.now() - start);

                    setRequestInfo({ time, cached });
                    setCourses(dataRes.courses);
                    setLoading(false);
                },
                400,
            ),
        [initialCourses]
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

        window.history.replaceState(null, '', `?${queryParams.toString()}`);
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
                                        {transfers.map((destination, index) => (
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
                                Showing <span className='font-semibold'>{courses.length}</span> courses.
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

            <CourseList loading={loading} courses={courses || []} />

            

        </div>
    );
}