'use client';

import { useState, useEffect, useMemo } from 'react';
import debounce from 'lodash/debounce';
import Link from 'next/link';

interface Semester {
    term: number;
    year: number;
    id: string;
}

interface SemestersResponse {
    count: number;
    semesters: Semester[];
}

interface Schedule {
    type: string;
    days: string;
    time: string;
    start: string;
    end: string;
    room: string;
    instructor: string;
    id: string;
}

interface Section {
    RP: string;
    abbreviated_title: string;
    course_code: string;
    credits: number;
    crn: number;
    id: string;
    section: string;
    subject: string;
    term: number;
    year: number;
    seats: string;
    waitlist: string;
    schedule: Schedule[];
}

interface SectionsResponse {
    page: number;
    sections_per_page: number;
    total_sections: number;
    total_pages: number;
    sections: Section[];
}

interface SearchParams {
    subject?: string;
    course_code?: string;
    instructor_search?: string;
    title_search?: string;
    year?: number;
    term?: number;
    attr_ar?: boolean;
    attr_sc?: boolean;
    attr_hum?: boolean;
    attr_lsc?: boolean;
    attr_sci?: boolean;
    attr_soc?: boolean;
    attr_ut?: boolean;
    online?: boolean;
    filter_no_waitlist?: boolean;
    filter_open_seats?: boolean;
    filter_not_cancelled?: boolean;
    page?: number;
    sections_per_page?: number;
}

interface SubjectsResponse {
    count: number;
    subjects: string[];
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
    const initial_sections_per_page = 50;

    const [semesters, setSemesters] = useState<SemestersResponse | null>(null);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [sections, setSections] = useState<SectionsResponse | null>(null);
    const [searchParams, setSearchParams] = useState<SearchParams>({
        page: 1,
        sections_per_page: initial_sections_per_page
    });
    const [loading, setLoading] = useState(false);


    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            const [semestersRes, subjectsRes] = await Promise.all([
                fetch('https://coursesapi.langaracs.ca/v1/index/semesters'),
                fetch('https://coursesapi.langaracs.ca/v1/index/subjects')
            ]);

            const semestersData = await semestersRes.json();
            const subjectsData: SubjectsResponse = await subjectsRes.json();

            setSemesters(semestersData);
            setSubjects(subjectsData.subjects);
        };

        fetchInitialData();
    }, []);

    // Debounced search function
    const debouncedSearch = useMemo(
        () =>
            debounce(async (params: SearchParams) => {
                setLoading(true);
                const queryParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    // note that we are not sending false to the api
                    // the api can handle it but its more confusing than helpful
                    if (value !== undefined && value !== '' && value !== false) {
                        queryParams.append(key, value.toString());
                    }
                });

                const response = await fetch(
                    `https://coursesapi.langaracs.ca/v2/search/sections?${queryParams}`
                );
                const data = await response.json();
                setSections(data);
                setLoading(false);
            }, 200),
        []
    );

    // Trigger search when params change
    useEffect(() => {
        debouncedSearch(searchParams);
    }, [searchParams, debouncedSearch]);

    const handleInputChange = (key: keyof SearchParams, value: string | boolean) => {
        setSearchParams(prev => ({ ...prev, [key]: value }));

        if (key === 'page') return;
        setSearchParams(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    // Transform semesters for dropdown
    const semesterOptions = useMemo(() => {
        if (!semesters) return [];
        return semesters.semesters.map(sem => ({
            value: `${sem.year}-${sem.term}`,
            label: `${termToSeason(sem.term)} ${sem.year}`
        }));
    }, [semesters]);

    return (
        <div className="p-4">
            <div className="bg-white shadow-md rounded-lg p-4 mb-4">
                <form className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4" onSubmit={e => e.preventDefault()}>

                    {/* Semester Selection */}
                    <div className="flex flex-col">
                        <label htmlFor="semester" className="mb-1 text-sm font-medium">Semester</label>
                        <select
                            id="semester"
                            className="border rounded p-[0.68rem]"
                            onChange={e => {
                                const [year, term] = e.target.value.split('-');
                                handleInputChange('year', year);
                                handleInputChange('term', term);
                            }}
                        >
                            <option value="">All Semesters</option>
                            {semesterOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Subject Dropdown */}
                    <div className='flex flex-row gap-4 w-fit'>
                        <div className="flex flex-col flex-1">
                            <label htmlFor="subject" className="mb-1 text-sm font-medium">Subject</label>
                            <select
                                id="subject"
                                className="border rounded p-[0.68rem]"
                                onChange={e => handleInputChange('subject', e.target.value)}
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
                                className="border rounded p-2 w-[100px]"
                                onChange={e => handleInputChange('course_code', e.target.value)}
                                placeholder="e.g. 1181"
                            />
                        </div>
                    </div>

                    {/* <div className='col-span-full flex flex-row gap-4'> */}
                        {/* Title Search */}
                        <div className="flex flex-col w-min">
                            <label htmlFor="title" className="mb-1 text-sm font-medium">Search by title</label>
                            <input
                                type="text"
                                id="title"
                                className="border rounded p-2"
                                onChange={e => handleInputChange('title_search', e.target.value)}
                                placeholder="Introduction to..."
                            />
                        </div>

                        {/* Instructor Search */}
                        <div className="flex flex-col w-min">
                            <label htmlFor="instructor" className="mb-1 text-sm font-medium">Instructor</label>
                            <input
                                type="text"
                                id="instructor"
                                className="border rounded p-2"
                                onChange={e => handleInputChange('instructor_search', e.target.value)}
                                placeholder="Search by instructor..."
                            />
                        </div>
                    {/* </div> */}


                    {/* Attributes Section */}
                    <div className="col-span-full">
                        <p className="mb-2 text-sm font-medium">Attributes</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    onChange={e => handleInputChange('attr_ar', e.target.checked)}
                                    className="rounded"
                                />
                                <span>2nd Year Arts (2AR)</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    onChange={e => handleInputChange('attr_sc', e.target.checked)}
                                    className="rounded"
                                />
                                <span>2nd Year Science (2SC)</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    onChange={e => handleInputChange('attr_hum', e.target.checked)}
                                    className="rounded"
                                />
                                <span>Humanities (HUM)</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    onChange={e => handleInputChange('attr_lsc', e.target.checked)}
                                    className="rounded"
                                />
                                <span>Lab Science (LSC)</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    onChange={e => handleInputChange('attr_sci', e.target.checked)}
                                    className="rounded"
                                />
                                <span>Science (SCI)</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    onChange={e => handleInputChange('attr_soc', e.target.checked)}
                                    className="rounded"
                                />
                                <span>Social Science (SOC)</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
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
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={searchParams.online || false}
                                    onChange={(e) => setSearchParams({
                                        ...searchParams,
                                        online: e.target.checked
                                    })}
                                    className="form-checkbox h-4 w-4 text-blue-600"
                                />
                                <span>Online Only</span>
                            </label>

                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    onChange={e => handleInputChange('filter_open_seats', e.target.checked)}
                                    className="rounded"
                                />
                                <span>Has open seats.</span>
                            </label>

                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    onChange={e => handleInputChange('filter_no_waitlist', e.target.checked)}
                                    className="rounded"
                                />
                                <span>None on waitlist.</span>
                            </label>

                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    onChange={e => handleInputChange('filter_not_cancelled', e.target.checked)}
                                    className="rounded"
                                />
                                <span>Not cancelled.</span>
                            </label>
                        </div>
                    </div>
                </form>
            </div>

            {sections && (
                <>
                    <div className="flex justify-between items-center text-sm text-gray-600 my-4">
                        {/* Entries selector */}
                        <div className="flex items-center gap-1 font-medium flex-1">
                            <span>Show</span>
                            <select
                                id="subject"
                                className="border rounded p-[1px] w-min"
                                onChange={e => handleInputChange('sections_per_page', e.target.value)}
                            >
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="250">250</option>
                                <option value="1000">1000</option>
                            </select>
                            <span>entries</span>
                        </div>

                        {/* Results counter */}
                        <div className="flex-1 text-right md:text-center">
                            <span>
                                Showing {((Number(searchParams.page) || 1) - 1) * Number(searchParams.sections_per_page) + 1} to{' '}
                                {Math.min((Number(searchParams.page) || 1) * Number(searchParams.sections_per_page), sections.total_sections)}{' '}
                                of {sections.total_sections.toLocaleString()} course sections.
                            </span>
                        </div>

                        <div className="flex-1 hidden md:block"></div>
                    </div>
                </>
            )}

            {/* Results Table */}
            <div className="mt-4 overflow-x-scroll">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="p-2">Semester</th>
                                <th className="p-2">Course</th>
                                <th className="p-2">Section</th>
                                <th className="p-2">Title</th>
                                <th className="p-2">Instructor(s)</th>
                                <th className="p-2">Seats</th>
                                <th className="p-2 whitespace-nowrap">On Waitlist</th>
                                {/* <th className="p-2">Room</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {sections?.sections.map(section => (
                                <tr key={section.id} className="even:bg-gray-50 odd:bg-white hover:bg-gray-100 transition-colors">
                                    <td className="p-2">{`${termToSeason(section.term)} ${section.year}`}</td>
                                    <td className="p-2"><Link target='_blank' href={`https://planner.langaracs.ca/courses/${section.subject}/${section.course_code}`}>{section.subject} {section.course_code}</Link></td>
                                    <td className="p-2">{section.section}</td>
                                    <td className="p-2">{section.abbreviated_title}</td>
                                    <td className="p-2">
                                        {section.schedule
                                            .filter(schedule => schedule.type !== "Exam")
                                            .map(schedule => schedule.instructor)
                                            .filter((instructor, index, self) => self.indexOf(instructor) === index) // Remove duplicates
                                            .join(", ") || "TBA"}
                                    </td>
                                    <td className="p-2">{section.seats}</td>
                                    <td className="p-2">{section.waitlist}</td>
                                    {/* <td className="p-2">
                                        {section.schedule
                                            .filter(schedule => schedule.type !== "Exam")
                                            .map(schedule => schedule.room)
                                            .filter((instructor, index, self) => self.indexOf(instructor) === index) // Remove duplicates
                                            .join(", ") || "TBA"}
                                    </td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {sections && (
                <div className="mt-4 flex justify-center gap-2">
                    {(() => {
                        const totalPages = sections.total_pages;
                        const currentPage = Number(searchParams.page) || 1;
                        const pages: (number | string)[] = [];

                        // Always add page 1
                        pages.push(1);

                        // Add first ellipsis
                        if (currentPage > 4) {
                            pages.push('...');
                        }

                        // Add pages around current page
                        const start = Math.max(2, currentPage - 2);
                        const end = Math.min(totalPages - 1, currentPage + 2);

                        for (let i = start; i <= end; i++) {
                            if (i !== 1 && i !== totalPages) { // Prevent duplicates
                                pages.push(i);
                            }
                        }

                        // Add second ellipsis
                        if (currentPage < totalPages - 3) {
                            pages.push('...');
                        }

                        // Add last page
                        if (totalPages > 1) {
                            pages.push(totalPages);
                        }

                        return pages.map((pageNum, i) => (
                            <button
                                key={i}
                                onClick={() => typeof pageNum === 'number' &&
                                    handleInputChange('page', pageNum.toString())}
                                className={`px-3 py-1 border rounded
                        ${typeof pageNum === 'number'
                                        ? pageNum === currentPage
                                            ? 'bg-blue-500 text-white'
                                            : 'hover:bg-gray-100'
                                        : 'cursor-default pointer-events-none text-gray-500'
                                    }`}
                                disabled={typeof pageNum === 'string'}
                            >
                                {pageNum}
                            </button>
                        ));
                    })()}
                </div>
            )}
        </div>
    );
}