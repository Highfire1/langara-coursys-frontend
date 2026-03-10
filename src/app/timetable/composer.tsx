'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SelectedCourses from './SelectedCourses';
import TimetableSections from './TimetableSections';
import Calendar from './Calendar';
import { Course, CourseInternal, CoursesResponse, LatestSemesterResponse } from '../../types/Course';
import { SectionsResponse, Section } from '../../types/Section';

interface Semester { year: number; term: number; }

function termToSeason(term: number | string): string {
    switch (Number(term)) {
        case 10: return 'Spring';
        case 20: return 'Summer';
        case 30: return 'Fall';
        default: return '';
    }
}

export default function Composer() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [year, setYear] = useState<string>('');
    const [term, setTerm] = useState<string>('');
    const [semesters, setSemesters] = useState<Semester[]>([]);

    const [selectedCourses, setSelectedCourses] = useState<CourseInternal[]>([]);
    const [currentTimetable, setCurrentTimetable] = useState<Section[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch semesters list once
    useEffect(() => {
        fetch(`https://api2.langaracourses.ca/api/v3/index/semesters`)
            .then(r => r.json())
            .then((data: { semesters: Semester[] }) => setSemesters(data.semesters))
            .catch(() => {});
    }, []);

    useEffect(() => {
        const yearParam = searchParams.get('year');
        const termParam = searchParams.get('term');

        if (yearParam && termParam) {
            setYear(yearParam);
            setTerm(termParam);
        } else {
            const fetchLatestSemester = async () => {
                try {
                    const latestSemesterResponse = await fetch(`https://api2.langaracourses.ca/api/v3/index/registration_semester`);
                    const latestSemesterData: LatestSemesterResponse = await latestSemesterResponse.json();

                    setYear(String(latestSemesterData.year));
                    setTerm(String(latestSemesterData.term));
                } catch (err) {
                    setError('Failed to fetch latest semester data: ' + (err as Error).message);
                }
            };

            fetchLatestSemester();
        }
    }, [searchParams]);

    useEffect(() => {
        if (!year || !term) return;

        const fetchData = async () => {
            try {
                const [coursesResponse, sectionsResponse] = await Promise.all([
                    fetch(`https://api2.langaracourses.ca/api/v3/semester/${year}/${term}/courses`),
                    fetch(`https://api2.langaracourses.ca/api/v3/semester/${year}/${term}/sections`)
                ]);

                if (coursesResponse.status !== 200 || sectionsResponse.status !== 200) {
                    setError('Error: '+  sectionsResponse.status + ' ' + sectionsResponse.statusText);
                    setIsLoading(false);
                    return;
                }

                const coursesData: CoursesResponse = await coursesResponse.json();
                const sectionsData: SectionsResponse = await sectionsResponse.json();

                coursesData.courses.forEach(course => {
                    course.id = `${course.subject}-${course.course_code}`;
                    course.sections = sectionsData.sections
                        .filter(
                            section =>
                                section.subject === course.subject && section.course_code === course.course_code
                        )
                        .map(section => ({ ...section, id: section.crn.toString() }));
                });

                if (!searchParams.get('year') || !searchParams.get('term')) {
                    router.replace(`/timetable?year=${year}&term=${term}`, { scroll: false });
                    return;
                }

                setCourses(coursesData.courses);
            } catch (err) {
                setError('Failed to fetch data: ' + (err as Error).message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [year, term, searchParams, router]);

    if (isLoading) return <div className=''>Loading...</div>;
    if (error) return <div className='w-[100vw] h-[100vh] p-4'>{error}</div>;

    return (
        <div className="flex gap-2 bg-gray-100 flex-grow overflow-hidden min-w-[800px]">
            <div className="w-1/4 overflow-y-auto h-full">
                <div className="px-2 pt-2">
                    <select
                        className={`w-full p-2 border border-gray-300 rounded-md mb-2 ${term === '10' ? 'bg-green-100' : term === '20' ? 'bg-yellow-100' : term === '30' ? 'bg-orange-100' : 'bg-white'}`}
                        value={`${year}-${term}`}
                        onChange={(e) => {
                            const [newYear, newTerm] = e.target.value.split('-');
                            if (selectedCourses.length > 0) {
                                const confirmed = confirm(
                                    `You have ${selectedCourses.length} course${selectedCourses.length !== 1 ? 's' : ''} selected. Changing terms will clear your selections. Continue?`
                                );
                                if (!confirmed) return;
                                setSelectedCourses([]);
                                setCurrentTimetable([]);
                            }
                            setYear(newYear);
                            setTerm(newTerm);
                            router.replace(`/timetable?year=${newYear}&term=${newTerm}`, { scroll: false });
                        }}
                    >
                        {semesters.map(s => (
                            <option key={`${s.year}-${s.term}`} value={`${s.year}-${s.term}`} className="bg-white">
                                {s.year} {termToSeason(s.term)}
                            </option>
                        ))}
                    </select>
                </div>
                <SelectedCourses
                    courses={courses}
                    selectedCourses={selectedCourses}
                    setSelectedCourses={setSelectedCourses}
                    year={year}
                    term={term}
                />
            </div>
            <div className="w-1/4 overflow-auto ">
                <TimetableSections
                    courses={selectedCourses}
                    setCurrentTimetable={setCurrentTimetable}
                />
            </div>
            <div className="w-2/4 h-full">
                <div className="rounded h-full p-2">
                    <Calendar currentTimetable={currentTimetable} />
                </div>
            </div>
        </div>
    );
}