'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput, EventClickArg } from '@fullcalendar/core';

import { plannerApi, termToSeason, getSemesterDates } from '@/lib/planner-api';
import {
  Section,
  PlannerCourse,
  Semester,
  Schedule
} from '@/types/Planner2';

interface PlannerProps {
  initialYear?: number;
  initialTerm?: number;
}

const CoursePlanner: React.FC<PlannerProps> = ({
  initialYear = 2025,
  initialTerm = 10
}) => {
  // State
  const [courses, setCourses] = useState<PlannerCourse[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentTerm, setCurrentTerm] = useState(initialTerm);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSections, setFilteredSections] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saturdayCoursesCount, setSaturdayCoursesCount] = useState(0);

  // Refs
  const calendarRef = useRef<FullCalendar>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get all sections from courses (simple, no pre-processing)
  const allSections = courses.flatMap(course =>
    course.sections.map((section: Section) => ({
      ...section,
      parent: course
    }))
  );

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [semestersData, coursesData] = await Promise.all([
          plannerApi.getSemesters(),
          plannerApi.getCoursesForSemester(currentYear, currentTerm)
        ]);

        setSemesters(semestersData.semesters);
        setCourses(coursesData.courses);

        // Initial search to show all courses
        const searchResults = await plannerApi.searchSections('', currentYear, currentTerm);
        setFilteredSections(searchResults.sections);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [currentYear, currentTerm]);

  // Simple search functionality with debounce (keep this - it's actually helpful)
  const handleSearch = useCallback(async (query: string) => {
    try {
      const searchResults = await plannerApi.searchSections(query, currentYear, currentTerm);
      setFilteredSections(searchResults.sections);
    } catch (error) {
      console.error('Search failed:', error);
      setFilteredSections([]);
    }
  }, [currentYear, currentTerm]);

  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const debounceTime = Math.max(100, (4 - query.length) * 50);

    debounceTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, debounceTime);
  }, [handleSearch]);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Simple helper functions
  const parseDays = (days: string): number[] => {
    const dayMap = ['', 'M', 'T', 'W', 'R', 'F', 'S', 'U'];
    const result: number[] = [];

    for (let i = 0; i < days.length; i++) {
      if (days[i] !== '-') {
        const dayIndex = dayMap.indexOf(days[i]);
        if (dayIndex !== -1) {
          result.push(dayIndex === 0 ? 0 : dayIndex);
        }
      }
    }

    return result;
  };

  const getSectionColor = (section: Section): string => {
    const seats = typeof section.seats === 'string' ? parseInt(section.seats) : section.seats || 0;
    const waitlist = section.waitlist ? parseInt(section.waitlist.toString()) : 0;
    if (seats <= 0 || waitlist > 10) return '#ef4444'; // red-500
    if (seats <= 10) return '#eab308'; // yellow-500
    return '#00c951'; // blue-500
  };

  // Simple calendar events generation
  const generateCalendarEvents = (): EventInput[] => {
    const events: EventInput[] = [];
    const { start: semesterStart, end: semesterEnd } = getSemesterDates(currentYear, currentTerm);

    // Add selected sections (colored events)
    selectedSections.forEach(sectionId => {
      const section = allSections.find(s => s.id === sectionId);
      if (!section) return;

      section.schedule.forEach((schedule: Schedule) => {
        if (schedule.days === '-------' || schedule.days.trim() === '') return;

        const days = parseDays(schedule.days);
        if (days.length === 0) return;

        const times = schedule.time.split('-');
        if (times.length !== 2) return;

        const startTime = `${times[0].slice(0, 2)}:${times[0].slice(2, 4)}`;
        const endTime = `${times[1].slice(0, 2)}:${times[1].slice(2, 4)}`;

        const eventStart = schedule.start ? new Date(schedule.start) : semesterStart;
        const eventEnd = schedule.end ? new Date(schedule.end) : semesterEnd;

        events.push({
          id: `${section.id}-${schedule.id}`,
          title: `${section.subject} ${section.course_code} ${section.section}`,
          startRecur: eventStart,
          endRecur: eventEnd,
          daysOfWeek: days,
          startTime,
          endTime,
          backgroundColor: getSectionColor(section),
          extendedProps: {
            sectionId: section.id,
            courseCode: `${section.subject} ${section.course_code}`,
            sectionNumber: section.section,
            crn: section.crn,
            scheduleType: schedule.type,
            room: schedule.room,
            isPreview: false
          }
        });
      });
    });

    // Add hovered section (gray preview events)
    if (hoveredSection && !selectedSections.has(hoveredSection)) {
      const section = allSections.find(s => s.id === hoveredSection);
      if (section) {
        section.schedule.forEach((schedule: Schedule) => {
          if (schedule.days === '-------' || schedule.days.trim() === '') return;

          const days = parseDays(schedule.days);
          if (days.length === 0) return;

          const times = schedule.time.split('-');
          if (times.length !== 2) return;

          const startTime = `${times[0].slice(0, 2)}:${times[0].slice(2, 4)}`;
          const endTime = `${times[1].slice(0, 2)}:${times[1].slice(2, 4)}`;

          const eventStart = schedule.start ? new Date(schedule.start) : semesterStart;
          const eventEnd = schedule.end ? new Date(schedule.end) : semesterEnd;

          events.push({
            id: `preview-${section.id}-${schedule.id}`,
            title: `${section.subject} ${section.course_code} ${section.section}`,
            startRecur: eventStart,
            endRecur: eventEnd,
            daysOfWeek: days,
            startTime,
            endTime,
            backgroundColor: '#9ca3af',
            borderColor: '#6b7280',
            opacity: 0.7,
            extendedProps: {
              sectionId: section.id,
              courseCode: `${section.subject} ${section.course_code}`,
              sectionNumber: section.section,
              crn: section.crn,
              scheduleType: schedule.type,
              room: schedule.room,
              isPreview: true
            }
          });
        });
      }
    }

    return events;
  };

  // Simple event handlers
  const toggleSection = (sectionId: string) => {
    const newSelected = new Set(selectedSections);
    if (newSelected.has(sectionId)) {
      newSelected.delete(sectionId);

      const section = allSections.find(s => s.id === sectionId);
      if (section?.weekends) {
        setSaturdayCoursesCount(prev => Math.max(0, prev - 1));
      }
    } else {
      newSelected.add(sectionId);

      const section = allSections.find(s => s.id === sectionId);
      if (section?.schedule.some((s: Schedule) => s.days.includes('S'))) {
        section.weekends = true;
        setSaturdayCoursesCount(prev => prev + 1);
      }
    }
    setSelectedSections(newSelected);
  };

  const clearAllSections = () => {
    setSelectedSections(new Set());
    setSaturdayCoursesCount(0);
  };

  const selectAllVisibleSections = () => {
    const visibleSectionIds = allSections
      .filter(section => filteredSections.includes(section.id))
      .map(section => section.id);

    setSelectedSections(new Set(visibleSectionIds));
  };

  // Simple calendar configuration
  let { start: semesterStart } = getSemesterDates(currentYear, currentTerm);
  semesterStart = new Date(semesterStart);
  semesterStart.setDate(semesterStart.getDate() + 7);

  const calendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    slotMinTime: '07:00:00',
    slotMaxTime: '22:00:00',
    hiddenDays: saturdayCoursesCount > 0 ? [0] : [0, 6],
    initialDate: semesterStart,
    rerenderDelay: 10,
    allDaySlot: false,
    height: '100%',
    events: generateCalendarEvents(),
    eventClick: (clickInfo: EventClickArg) => {
      const { courseCode, sectionNumber, crn, scheduleType, room } = clickInfo.event.extendedProps;
      alert(`${courseCode} ${sectionNumber}\nCRN: ${crn}\nType: ${scheduleType}\nRoom: ${room}`);
    }
  };

  // Update calendar date when semester changes
  useEffect(() => {
    if (calendarRef.current && !loading) {
      const { start } = getSemesterDates(currentYear, currentTerm);
      const newDate = new Date(start);
      newDate.setDate(newDate.getDate() + 7); // Add a week
      
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(newDate);
    }
  }, [currentYear, currentTerm, loading]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-96 bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">

          {/* Term Selector */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Term:
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={`${currentYear}-${currentTerm}`}
              onChange={(e) => {
                const [year, term] = e.target.value.split('-');
                setCurrentYear(parseInt(year));
                setCurrentTerm(parseInt(term));
              }}
            >
              {semesters.map(semester => (
                <option
                  key={semester.id}
                  value={`${semester.year}-${semester.term}`}
                >
                  {semester.year} {termToSeason(semester.term)}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="mb-2">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={onSearchChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {loading ? (
              <p className="text-sm text-gray-600 mt-1">
                Loading...
              </p>
            ) : (

              <p className="text-sm text-gray-600 mt-1">
                Found {filteredSections.length} sections.
              </p>
            )
            }

          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={selectAllVisibleSections}
              className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Show All Visible
            </button>
            <button
              onClick={clearAllSections}
              className="flex-1 px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear All
            </button>
          </div>

        </div>

        {/* Course List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Loading courses...</div>
            </div>
          ) : (
            <div className="space-y-2">
              {allSections
                .filter(section => filteredSections.includes(section.id))
                .map(section => (
                  <div
                    key={section.id}
                    onClick={() => toggleSection(section.id)}
                    onMouseEnter={() => setHoveredSection(section.id)}
                    onMouseLeave={() => setHoveredSection(null)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedSections.has(section.id)
                        ? 'bg-blue-100 border-blue-300'
                        : hoveredSection === section.id
                          ? 'bg-gray-100 border-gray-300'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      } ${(parseInt(section.seats) <= 0 || section.seats === 'Cancel') || (section.waitlist && parseInt(section.waitlist?.toString()) > 10)
                        ? 'border-l-4 border-l-red-500'
                        : parseInt(section.seats) <= 10
                          ? 'border-l-4 border-l-yellow-500'
                          : 'border-l-4 border-l-green-500'
                      }`}
                  >
                    <div className="font-medium">
                      {section.subject} {section.course_code} {section.section} {section.title}
                    </div>
                    <div className="text-sm text-gray-600">
                      CRN: {section.crn} • Seats: {section.seats}
                      {section.waitlist && section.waitlist !== " " && ` • Waitlist: ${section.waitlist}`}
                    </div>
                    {section.schedule.length > 0 && (
                      <div className="mt-2">
                        <table className="w-full text-xs">
                          <tbody>
                            {section.schedule.map((schedule: Schedule, idx: number) => (
                                <tr key={idx} className="text-gray-500 align-top">
                                <td className="min-w-14 font-mono align-top">
                                  {schedule.days}
                                </td>
                                <td className="min-w-14 pr-1 font-mono align-top">
                                  {schedule.time}
                                </td>
                                <td className="min-w-12 w-min align-top">
                                  {schedule.type}
                                </td>
                                {/* <td className="font-mono align-top">
                                  {schedule.room}
                                </td> */}
                                <td className="w-full font-mono align-top">
                                  {schedule.instructor}
                                </td>
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
      </div>

      {/* Calendar */}
      <div className="flex-1 p-4">
        <div className="h-full bg-white rounded-lg shadow">
          <FullCalendar
            ref={calendarRef}
            {...calendarOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default CoursePlanner;
