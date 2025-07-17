'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  Schedule,
  SavedSchedule
} from '@/types/Planner2';
import Link from 'next/link';
import { Virtuoso } from 'react-virtuoso';
import Header from '@/components/shared/header';
import EventDetailsPopup from '@/app/planner/EventDetailsPopup';
// import ScheduleDebugger from '@/app/planner/ScheduleDebugger';

interface PlannerProps {
  initialYear?: number;
  initialTerm?: number;
}

// Save bar component
const SaveBar = ({
  currentYear,
  currentTerm,
  selectedSections,
  allSections,
  currentScheduleId,
  onScheduleSelect,
  onInitialScheduleSet,
  hasInitialized,
  className = ""
}: {
  currentYear: number;
  currentTerm: number;
  selectedSections: Set<string>;
  allSections: Section[];
  currentScheduleId: string | null;
  onScheduleSelect: (scheduleId: string) => void;
  onInitialScheduleSet: (scheduleId: string) => void;
  hasInitialized: boolean;
  className?: string;
}) => {
  // State for UI reactivity - localStorage is the source of truth
  const [schedulesForRender, setSchedulesForRender] = useState<SavedSchedule[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [schedulesLoaded, setSchedulesLoaded] = useState(false);

  // localStorage utility functions - always use these for data operations
  const loadSchedulesFromStorage = (): SavedSchedule[] => {
    try {
      const saved = localStorage.getItem('langara-saved-schedules');
      if (!saved) return [];
      return JSON.parse(saved);
    } catch (error) {
      console.error('Failed to load schedules from localStorage:', error);
      return [];
    }
  };

  const saveSchedulesToStorage = (schedules: SavedSchedule[]): void => {
    try {
      localStorage.setItem('langara-saved-schedules', JSON.stringify(schedules));
      // Update state to trigger re-render
      setSchedulesForRender([...schedules]);
    } catch (error) {
      console.error('Failed to save schedules to localStorage:', error);
    }
  };



  const setCurrentScheduleInStorage = (scheduleId: string): void => {
    try {
      localStorage.setItem('langara-current-schedule-id', scheduleId);
    } catch (error) {
      console.error('Failed to set current schedule in localStorage:', error);
    }
  };

  // Load saved schedules from localStorage and create default if none exist
  useEffect(() => {
    // Only proceed after initialization is complete
    if (!hasInitialized) return;

    let schedules = loadSchedulesFromStorage();

    // If no schedules exist, create a default schedule with the current semester
    if (schedules.length === 0) {
      console.log('No schedules found, creating default schedule for:', currentYear, currentTerm);
      const defaultSchedule: SavedSchedule = {
        id: 'default-1',
        name: 'Schedule 1',
        year: currentYear,
        term: currentTerm,
        crns: [],
        createdAt: Date.now()
      };
      schedules = [defaultSchedule];
      saveSchedulesToStorage(schedules);

      // Set this as the current schedule
      onInitialScheduleSet(defaultSchedule.id);
      setCurrentScheduleInStorage(defaultSchedule.id);
    } else {
      // Just update the render state with existing schedules
      setSchedulesForRender([...schedules]);
    }

    setSchedulesLoaded(true);
  }, [hasInitialized, currentYear, currentTerm, onInitialScheduleSet]);

  // Get current CRNs from selected sections
  const getCurrentCRNs = (): string[] => {
    return Array.from(selectedSections)
      .map(sectionId => {
        const section = allSections.find(s => s.id === sectionId);
        return section?.crn.toString();
      })
      .filter((crn): crn is string => Boolean(crn));
  };

  // Create a new empty schedule
  const saveCurrentSchedule = () => {
    const existingSchedules = loadSchedulesFromStorage();

    const newSchedule: SavedSchedule = {
      id: Date.now().toString(),
      name: `Schedule ${existingSchedules.length + 1}`,
      year: currentYear,
      term: currentTerm,
      crns: [], // New schedule should start empty
      createdAt: Date.now()
    };

    const updated = [...existingSchedules, newSchedule].slice(0, 50); // Cap at 50

    console.log('Creating new schedule:', newSchedule);
    saveSchedulesToStorage(updated);

    // Auto-select the new schedule
    onScheduleSelect(newSchedule.id);
  };

  // Copy current schedule as a new one with current selections
  const copyCurrentSchedule = () => {
    const existingSchedules = loadSchedulesFromStorage();
    const crns = getCurrentCRNs();
    const currentSchedule = existingSchedules.find(s => s.id === currentScheduleId);

    const newSchedule: SavedSchedule = {
      id: Date.now().toString(),
      name: `${currentSchedule?.name || 'Schedule'} Copy`,
      year: currentYear,
      term: currentTerm,
      crns, // Copy current courses
      createdAt: Date.now()
    };

    const updated = [...existingSchedules, newSchedule].slice(0, 50); // Cap at 50
    saveSchedulesToStorage(updated);
    console.log("Created schedule copy:", newSchedule);

    // Auto-select the new schedule
    onScheduleSelect(newSchedule.id);
  };

  // Load a saved schedule (clicked from SaveBar)
  const loadSchedule = (schedule: SavedSchedule) => {
    onScheduleSelect(schedule.id);
  };

  // Delete a schedule from localStorage
  const deleteSchedule = (id: string) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      const existingSchedules = loadSchedulesFromStorage();
      const updated = existingSchedules.filter(s => s.id !== id);
      saveSchedulesToStorage(updated);

      // If we deleted the current schedule, select the first remaining one
      if (currentScheduleId === id) {
        if (updated.length > 0) {
          onScheduleSelect(updated[0].id);
        } else {
          // No schedules left, clear the current schedule from localStorage
          try {
            localStorage.removeItem('langara-current-schedule-id');
          } catch (error) {
            console.error('Failed to clear current schedule ID:', error);
          }
        }
      }
    }
  };

  // Start editing a schedule name
  const startEditing = (schedule: SavedSchedule) => {
    setEditingId(schedule.id);
    setEditingName(schedule.name);
  };

  // Save name edit to localStorage
  const saveNameEdit = () => {
    if (editingId && editingName.trim()) {
      const existingSchedules = loadSchedulesFromStorage();
      const updated = existingSchedules.map(s =>
        s.id === editingId ? { ...s, name: editingName.trim() } : s
      );
      saveSchedulesToStorage(updated);
      console.log('Updated schedule name:', editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  // Cancel name edit
  const cancelNameEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className={`bg-white border-b shadow-sm px-4 py-2 ${className}`}>
      {schedulesLoaded ? (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {schedulesForRender.map((schedule: SavedSchedule) => (
            
            <div
              key={schedule.id}
              className={`flex items-center rounded px-1 min-w-0 flex-shrink-0 ${currentScheduleId === schedule.id
                ? 'bg-blue-200 border-2 border-blue-400'
                : 'bg-gray-100'
                }`}
            >
              {editingId === schedule.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveNameEdit();
                      if (e.key === 'Escape') cancelNameEdit();
                    }}
                    onBlur={saveNameEdit}
                    className="p-1 text-sm border rounded px-1 w-36"
                    autoFocus
                  />
                </div>
              ) : (
                <>
                  <button
                    onClick={() => currentScheduleId === schedule.id ? startEditing(schedule) : loadSchedule(schedule)}
                    className={`p-1 text-sm truncate max-w-40 ${currentScheduleId === schedule.id
                      ? 'text-blue-800 font-medium hover:text-blue-900 cursor-pointer'
                      : 'hover:text-blue-600'
                      }`}
                    title={currentScheduleId === schedule.id
                      ? `Click to rename: ${schedule.name} (${schedule.year} ${schedule.term === 10 ? 'Spring' : schedule.term === 20 ? 'Summer' : 'Fall'})`
                      : `${schedule.name} (${schedule.year} ${schedule.term === 10 ? 'Spring' : schedule.term === 20 ? 'Summer' : 'Fall'})`
                    }
                  >
                    {schedule.name}
                  </button>
                  <button
                    onClick={() => startEditing(schedule)}
                    className="p-1 cursor-pointer text-xs text-gray-500 hover:text-gray-700"
                    title="Rename"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteSchedule(schedule.id)}
                    className="p-1 cursor-pointer text-xs text-gray-500 hover:text-red-600"
                    title="Delete"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          ))}

          <button
            onClick={copyCurrentSchedule}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 whitespace-nowrap cursor-pointer"
            title="Copy current schedule"
          >
            Copy
          </button>
          <button
            onClick={saveCurrentSchedule}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 whitespace-nowrap cursor-pointer"
            title="Create new empty schedule"
          >
            + New
          </button>
        </div>
      ) : (
        <div className="h-12 bg-white border-b shadow-sm px-4 py-2 "></div>

        // <div className="flex items-center">
        //   {/* <div className="text-sm text-gray-500">Loading schedules...</div> */}
        // </div>
      )}
    </div>
  );
};

const CoursePlanner: React.FC<PlannerProps> = ({
  initialYear = 2025,
  initialTerm = 10
}) => {
  // URL handling
  const searchParams = useSearchParams();
  const router = useRouter();

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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentScheduleId, setCurrentScheduleId] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('langara-current-schedule-id') : null
  );
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isProcessingUrl, setIsProcessingUrl] = useState(true);
  const [eventDetailsPopup, setEventDetailsPopup] = useState<{
    isOpen: boolean;
    eventData: {
      courseCode: string;
      title: string;
      sectionNumber: string;
      crn: string;
      room: string;
    } | null;
  }>({
    isOpen: false,
    eventData: null
  });
  // const [isDebugOpen, setIsDebugOpen] = useState(false);

  // Refs
  const calendarRef = useRef<FullCalendar>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // localStorage utility functions - centralized data management
  const loadSchedulesFromStorage = (): SavedSchedule[] => {
    try {
      const saved = localStorage.getItem('langara-saved-schedules');
      if (!saved) return [];
      return JSON.parse(saved);
    } catch (error) {
      console.error('Failed to load schedules from localStorage:', error);
      return [];
    }
  };

  const saveSchedulesToStorage = (schedules: SavedSchedule[]): void => {
    try {
      localStorage.setItem('langara-saved-schedules', JSON.stringify(schedules));
    } catch (error) {
      console.error('Failed to save schedules to localStorage:', error);
    }
  };

  const setCurrentScheduleInStorage = (scheduleId: string): void => {
    try {
      localStorage.setItem('langara-current-schedule-id', scheduleId);
    } catch (error) {
      console.error('Failed to set current schedule in localStorage:', error);
    }
  };

  // URL processing effect - handle shared links
  useEffect(() => {
    const processUrlParams = async () => {
      const urlYear = searchParams.get('y');
      const urlTerm = searchParams.get('t');
      const urlCrns = searchParams.get('crns');

      if (urlYear && urlTerm && urlCrns) {
        try {
          const year = parseInt(urlYear);
          const term = parseInt(urlTerm);
          const crns = urlCrns.split(',').filter(Boolean);

          console.log('Processing shared link:', { year, term, crns });

          // Load courses for the specified semester
          const coursesData = await plannerApi.getCoursesForSemester(year, term);

          // Find sections by CRN
          const foundSections = new Set<string>();
          coursesData.courses.forEach(course => {
            course.sections.forEach(section => {
              if (crns.includes(section.crn.toString())) {
                console.log('Found matching section:', section.crn, section.id);
                foundSections.add(section.id);
              }
            });
          });

          console.log('Found sections to select:', foundSections);

          // Create a new schedule for the shared link
          const newSchedule: SavedSchedule = {
            id: `shared-${Date.now()}`,
            name: `Shared Schedule`,
            year,
            term,
            crns,
            createdAt: Date.now()
          };

          // Save the new schedule to localStorage
          const existingSchedules = loadSchedulesFromStorage();
          const updatedSchedules = [...existingSchedules, newSchedule];
          saveSchedulesToStorage(updatedSchedules);

          // Set the state for the shared schedule
          setCurrentYear(year);
          setCurrentTerm(term);
          setSelectedSections(foundSections);
          setCurrentScheduleId(newSchedule.id);
          setCurrentScheduleInStorage(newSchedule.id);

          // Clean up URL parameters
          router.replace('/planner', { scroll: false });

          console.log('Shared schedule processed successfully with', foundSections.size, 'sections');

        } catch (error) {
          console.error('Failed to process shared schedule:', error);
        }
      }

      setIsProcessingUrl(false);
    };

    processUrlParams();
  }, [searchParams, router]);

  // Get all sections from courses (simple, no pre-processing)
  const allSections = courses.flatMap(course =>
    course.sections.map((section: Section) => ({
      ...section,
      parent: course
    }))
  );

  // Single initialization effect - determines semester and schedules
  useEffect(() => {
    const initialize = async () => {
      if (hasInitialized) return;

      let targetYear = currentYear;
      let targetTerm = currentTerm;
      let targetScheduleId: string | null = null;

      // Check for existing schedules first
      const existingSchedules = loadSchedulesFromStorage();
      const currentId = localStorage.getItem('langara-current-schedule-id');

      if (existingSchedules.length > 0) {
        // We have existing schedules - use the current schedule's semester
        let scheduleToUse = existingSchedules[0]; // default to first

        if (currentId) {
          const foundSchedule = existingSchedules.find(s => s.id === currentId);
          if (foundSchedule) {
            scheduleToUse = foundSchedule;
          }
        }

        targetYear = scheduleToUse.year;
        targetTerm = scheduleToUse.term;
        targetScheduleId = scheduleToUse.id;

        console.log('Using existing schedule:', scheduleToUse);
      } else {
        // No existing schedules - get latest semester and we'll create a default schedule
        try {
          const latestSemester = await plannerApi.getLatestSemester();
          targetYear = latestSemester.year;
          targetTerm = latestSemester.term;
          console.log('No schedules found, will use latest semester:', latestSemester);
        } catch (error) {
          console.error('Failed to get latest semester, using defaults:', error);
        }
      }

      // Set the determined semester
      setCurrentYear(targetYear);
      setCurrentTerm(targetTerm);

      // Set the current schedule if we found one
      if (targetScheduleId) {
        setCurrentScheduleId(targetScheduleId);
        setCurrentScheduleInStorage(targetScheduleId);
      }

      setHasInitialized(true);
    };

    initialize();
  }, [hasInitialized, currentYear, currentTerm]);

  // Load a saved schedule
  const loadSavedSchedule = useCallback(async (year: number, term: number, crns: string[]) => {
    try {
      console.log('Loading saved schedule:', { year, term, crns });
      setLoading(true);
      setCurrentYear(year);
      setCurrentTerm(term);

      // Clear current selection first
      setSelectedSections(new Set());

      // Load courses for the specified semester
      const coursesData = await plannerApi.getCoursesForSemester(year, term);
      setCourses(coursesData.courses);

      // Find sections by CRN and select them
      const foundSections = new Set<string>();
      coursesData.courses.forEach(course => {
        course.sections.forEach(section => {
          if (crns.includes(section.crn.toString())) {
            // console.log('Found matching section:', section.crn, section.id);
            foundSections.add(section.id);
          }
        });
      });

      // console.log('Selected sections:', foundSections);
      setSelectedSections(foundSections);

      // Load all sections for search
      const searchResults = await plannerApi.searchSections('', year, term);
      setFilteredSections(searchResults.sections);

      console.log('Saved schedule loaded successfully');
    } catch (error) {
      console.error('Failed to load saved schedule:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    if (!hasInitialized) return;

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
  }, [currentYear, currentTerm, hasInitialized]);

  // Load current schedule's sections after courses are loaded (for page refresh)
  useEffect(() => {
    if (!loading && currentScheduleId && courses.length > 0) {
      // Get current schedule from localStorage
      const currentSchedule = (() => {
        try {
          const schedules = loadSchedulesFromStorage();
          return schedules.find(s => s.id === currentScheduleId) || null;
        } catch (error) {
          console.error('Failed to get current schedule:', error);
          return null;
        }
      })();

      if (currentSchedule && currentSchedule.crns.length > 0) {
        // The courses should already be loaded for the correct semester by now
        // Just find sections by CRN and select them
        const foundSections = new Set<string>();

        courses.forEach(course => {
          course.sections.forEach(section => {
            if (currentSchedule.crns.includes(section.crn.toString())) {
              console.log('Found section on refresh:', section.crn, section.id);
              foundSections.add(section.id);
            }
          });
        });

        console.log('Setting sections on refresh:', foundSections);
        setSelectedSections(foundSections);
      }
    }
  }, [loading, currentScheduleId, courses]);

  // Handle schedule selection
  const handleScheduleSelect = (scheduleId: string) => {
    console.log('Selecting schedule:', scheduleId);
    setCurrentScheduleId(scheduleId);

    // Save current schedule ID to localStorage
    setCurrentScheduleInStorage(scheduleId);

    // Always load the schedule's data to ensure consistency
    const selectedSchedule = (() => {
      try {
        const schedules = loadSchedulesFromStorage();
        return schedules.find(s => s.id === scheduleId) || null;
      } catch (error) {
        console.error('Failed to load schedule for selection:', error);
        return null;
      }
    })();

    if (selectedSchedule) {
      // Always reload to ensure we have the correct data
      loadSavedSchedule(selectedSchedule.year, selectedSchedule.term, selectedSchedule.crns);
    }
  };

  // Update current schedule when selections change (but not during loading)
  useEffect(() => {
    if (currentScheduleId && !loading) {
      const crns = Array.from(selectedSections)
        .map(sectionId => {
          const section = allSections.find(s => s.id === sectionId);
          return section?.crn.toString();
        })
        .filter((crn): crn is string => Boolean(crn));

      // Update schedule in localStorage immediately
      try {
        const schedules = loadSchedulesFromStorage();
        const updatedSchedules = schedules.map(s =>
          s.id === currentScheduleId ? { ...s, year: currentYear, term: currentTerm, crns } : s
        );
        saveSchedulesToStorage(updatedSchedules);
        console.log('Updated schedule in localStorage:', currentScheduleId, 'with CRNs:', crns);
      } catch (error) {
        console.error('Failed to update schedule in localStorage:', error);
      }
    }
  }, [selectedSections, currentScheduleId, currentYear, currentTerm, allSections, loading]);

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

  // fullcalendar will support tailwind with the v7 release
  // which is coming in august 2025
  const getSectionColor = (section: Section): string => {
    // const seats = typeof section.seats === 'string' ? parseInt(section.seats) : section.seats || 0;
    // const waitlist = section.waitlist ? parseInt(section.waitlist.toString()) : 0;

    if (
      section.seats === 'Cancel' ||
      section.waitlist === 'Full' ||
      (
        parseInt(section.seats) <= 0) && (section.waitlist && parseInt(section.waitlist?.toString()) > 10
      )
    )
      return '#ffa2a2'; // red-300

    if ((section.waitlist && parseInt(section.waitlist) <= 10) || section.seats == '0')
      return '#ffdf20'; // yellow-300
    return '#7bf1a8'; // green-300
  };

  // Helper function to identify online sections
  const isOnlineSection = (section: Section): boolean => {
    // Check if section ends with 'W'
    if (section.section.endsWith('W')) return true;

    // Check if all non-exam schedules have no meeting times
    const nonExamSchedules = section.schedule.filter(s => s.type !== 'Exam');
    if (nonExamSchedules.length === 0) return false;

    return nonExamSchedules.every(s => s.days === '-------');
  };

  // Get selected online sections (for the online courses display)
  const getSelectedOnlineSections = () => {
    return allSections
      .filter(section =>
        selectedSections.has(section.id) && isOnlineSection(section)
      );
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
        if (schedule.type === 'Exam') return; // Skip exam schedules

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
          title: `${section.subject} ${section.course_code} ${section.section} ${schedule.type}`,
          startRecur: eventStart,
          endRecur: eventEnd,
          daysOfWeek: days,
          startTime,
          endTime,
          backgroundColor: getSectionColor(section),
          textColor: '#000000',
          extendedProps: {
            course: `${section.subject}-${section.course_code}`.toLowerCase(),
            title: section.title,
            sectionId: section.id,
            courseCode: `${section.subject} ${section.course_code}`,
            sectionNumber: section.section,
            crn: section.crn,
            isPreview: false
          }
        });
      });
    });

    // Add hovered section (gray preview events for in-person courses)
    if (hoveredSection && !selectedSections.has(hoveredSection)) {
      const section = allSections.find(s => s.id === hoveredSection);
      if (section && !isOnlineSection(section)) {
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
            title: `${section.subject} ${section.course_code} ${section.section} ${schedule.type}`,
            startRecur: eventStart,
            endRecur: eventEnd,
            daysOfWeek: days,
            startTime,
            endTime,
            backgroundColor: '#9ca3af',
            borderColor: '#6b7280',
            textColor: '#000000',
            opacity: 0.7,
            extendedProps: {
              course: `${section.subject}-${section.course_code}`.toLowerCase(),
              title: section.title,
              sectionId: section.id,
              courseCode: `${section.subject} ${section.course_code}`,
              sectionNumber: section.section,
              crn: section.crn,
              isPreview: true
            }
          });
        });
      }
    }

    return events;
  };

  // Simple event handlers - memoized to prevent unnecessary rerenders
  const toggleSection = useCallback((sectionId: string) => {
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
      if (section?.schedule.some((s: Schedule) => s.type !== 'Exam' && s.days.includes('S'))) {
        section.weekends = true;
        setSaturdayCoursesCount(prev => prev + 1);
      }
    }
    setSelectedSections(newSelected);
  }, [selectedSections, allSections]);

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
    headerToolbar: false as const, // this is truly a typescript moment
    slotMinTime: '08:00:00', // todo: make this dynamic
    slotMaxTime: '22:00:00',
    hiddenDays: saturdayCoursesCount > 0 ? [0] : [0, 6],
    initialDate: semesterStart,
    // rerenderDelay: 1,
    slotDuration: '00:60:00',
    expandRows: true,
    // aspectRatio: 10,
    allDaySlot: false,
    dayHeaderFormat: { weekday: typeof window !== 'undefined' && window.innerWidth < 900 ? "short" : "long" } as const,
    height: '100%',
    events: generateCalendarEvents(),
    eventClick: (clickInfo: EventClickArg) => {
      const { courseCode, title, sectionNumber, crn, room } = clickInfo.event.extendedProps;
      setEventDetailsPopup({
        isOpen: true,
        eventData: {
          courseCode,
          title,
          sectionNumber,
          crn,
          room
        }
      });
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

  // Share modal component
  const ShareModal = ({
    isOpen,
    onClose,
    year,
    term,
    crns
  }: {
    isOpen: boolean;
    onClose: () => void;
    year: number;
    term: number;
    crns: string[];
  }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const shareUrl = `${window.location.origin}/planner?y=${year}&t=${term}&crns=${crns.join(',')}`;

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    return (
      <div
        className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50"
        style={{ backgroundColor: 'rgba(249, 250, 251, 0.5)' }}
        onClick={onClose}
      >

        <div
          className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Share Schedule</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-3">
            Share this link to let others view your schedule:
          </p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 p-2 border rounded text-sm bg-gray-50"
            />
            <button
              onClick={copyToClipboard}
              className={`px-3 py-2 rounded text-sm ${copied
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="text-xs text-gray-500">
            This link includes {crns.length} course{crns.length !== 1 ? 's' : ''} for {term === 10 ? 'Spring' : term === 20 ? 'Summer' : 'Fall'} {year}.
          </div>
        </div>
      </div>
    );
  };

  // Share current schedule
  const shareCurrentSchedule = () => {
    const crns = getCurrentCRNs();

    if (crns.length === 0) {
      alert('Select some courses before sharing!');
      return;
    }

    setIsShareModalOpen(true);
  };

  // Get current CRNs for sharing
  const getCurrentCRNs = (): string[] => {
    return Array.from(selectedSections)
      .map(sectionId => {
        const section = allSections.find(s => s.id === sectionId);
        return section?.crn.toString();
      })
      .filter((crn): crn is string => Boolean(crn));
  };

  // Memoize filtered sections for better performance
  const visibleSections = useMemo(() =>
    allSections.filter(section => filteredSections.includes(section.id)),
    [allSections, filteredSections]
  );

  // Create memoized callbacks using a map to prevent recreating on every render
  const toggleCallbacks = useMemo(() => {
    const callbacks = new Map<string, () => void>();
    visibleSections.forEach(section => {
      callbacks.set(section.id, () => toggleSection(section.id));
    });
    return callbacks;
  }, [visibleSections, toggleSection]);

  const mouseEnterCallbacks = useMemo(() => {
    const callbacks = new Map<string, () => void>();
    visibleSections.forEach(section => {
      callbacks.set(section.id, () => setHoveredSection(section.id));
    });
    return callbacks;
  }, [visibleSections]);

  const mouseLeaveCallback = useCallback(() => setHoveredSection(null), []);

  // Course item component for simple rendering - memoized to prevent unnecessary rerenders
  const CourseItem = React.memo(({
    section,
    courses,
    isSelected,
    isHovered,
    onToggle,
    onMouseEnter,
    onMouseLeave
  }: {
    section: Section;
    courses: PlannerCourse[];
    isSelected: boolean;
    isHovered: boolean;
    onToggle: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  }) => {

    const borderColor = useMemo(() => {
      if (
        section.seats === 'Cancel' ||
        section.waitlist === 'Full' ||
        (parseInt(section.seats) <= 0 && section.waitlist && parseInt(section.waitlist?.toString()) > 10)
      ) {
        return 'border-l-red-500';
      } else if ((section.waitlist && parseInt(section.waitlist) <= 10) || section.seats === '0') {
        return 'border-l-yellow-500';
      } else {
        return 'border-l-green-500';
      }
    }, [section]);

    const bgColor = useMemo(() => {
      if (
        section.seats === 'Cancel' ||
        section.waitlist === 'Full' ||
        (parseInt(section.seats) <= 0 && section.waitlist && parseInt(section.waitlist?.toString()) > 10)
      ) {
        return isSelected ? 'bg-red-300' : isHovered ? 'bg-red-200' : 'bg-red-100';
      } else if ((section.waitlist && parseInt(section.waitlist) <= 10) || section.seats === '0') {
        return isSelected ? 'bg-yellow-300' : isHovered ? 'bg-yellow-200' : 'bg-yellow-100';
      } else {
        return isSelected ? 'bg-green-300' : isHovered ? 'bg-green-200' : 'bg-green-100';
      }
    }, [section, isHovered, isSelected]);

    const bgBorder = useMemo(() => {
      if (
        section.seats === 'Cancel' ||
        section.waitlist === 'Full' ||
        (parseInt(section.seats) <= 0 && section.waitlist && parseInt(section.waitlist?.toString()) > 10)
      ) {
        return isSelected ? 'border-red-500' : isHovered ? 'border-red-400' : 'border-red-300';
      } else if ((section.waitlist && parseInt(section.waitlist) <= 10) || section.seats === '0') {
        return isSelected ? 'border-yellow-500' : isHovered ? 'border-yellow-400' : 'border-yellow-300';
      } else {
        return isSelected ? 'border-green-500' : isHovered ? 'border-green-400' : 'border-green-300';
      }
    }, [section, isHovered, isSelected]);


    return (
      <div className="px-4">
        <div
          onClick={onToggle}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className={`p-3 rounded-lg border cursor-pointer transition-colors mb-2 
            border-l-6 ${borderColor} ${bgColor} ${bgBorder}
            `}


        >
          <div className="font-medium">
            <Link
              href={`/courses/${section.subject.toLowerCase()}-${section.course_code.toLowerCase()}`}
              target='_blank'
              className="hover:text-blue-700 hover:underline w-fit"
            >
              {section.subject} {section.course_code} {section.section}: {courses.find(c => c.subject === section.subject && c.course_code === section.course_code)?.attributes?.title || ''}
            </Link>
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
                    <React.Fragment key={idx}>
                      <tr className="text-gray-500 align-top">
                        <td className="min-w-14 font-mono align-top">
                          {schedule.days}
                        </td>
                        <td className="min-w-14 pr-1 font-mono align-top">
                          {schedule.time}
                        </td>
                        <td className="min-w-12 w-min align-top">
                          {schedule.type}
                        </td>
                        <td className="w-full font-mono align-top">
                          {typeof window !== 'undefined' && window.innerWidth > 768 ? schedule.instructor : ''}
                        </td>
                      </tr>
                      {typeof window !== 'undefined' && window.innerWidth <= 768 && (
                        <tr className="text-gray-500 align-top">
                          <td colSpan={4} className="w-full font-mono align-top text-left">
                            {schedule.instructor}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}

                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  });

  CourseItem.displayName = 'CourseItem';

  // Handle opening event details popup for online courses
  const handleOnlineCourseClick = (section: Section) => {
    // For online courses, we need to create event data from the section
    // Since online courses don't have traditional schedule data, we'll use online-specific info
    setEventDetailsPopup({
      isOpen: true,
      eventData: {
        courseCode: `${section.subject} ${section.course_code}`,
        title: section.title,
        sectionNumber: section.section,
        crn: section.crn.toString(),
        room: 'Online Learning'
      }
    });
  };

  // Show loading state while processing URL params
  // if (isProcessingUrl) {
  //   return (
  //     <div className="w-full h-full flex items-center justify-center">
  //       <div className="text-lg">Loading...</div>
  //     </div>
  //   );
  // }

  return (
    <div className=" h-screen bg-gray-50 max-h-screen block min-w-2xl">

      {/* Header */}
      <Header title={'Langara Course Planner'} />

      {/* Save Bar */}
      {hasInitialized && !isProcessingUrl ? (
        <SaveBar
          className="block max-h-12"
          currentYear={currentYear}
          currentTerm={currentTerm}
          selectedSections={selectedSections}
          allSections={allSections}
          currentScheduleId={currentScheduleId}
          onScheduleSelect={handleScheduleSelect}
          onInitialScheduleSet={setCurrentScheduleId}
          hasInitialized={hasInitialized}
        />
      ) : (
        <div className="h-12 bg-white border-b shadow-sm px-4 py-2 "></div>
      )}

      <div className="flex flex-1 flex-grow h-[calc(100vh-48px-40px)]">

        {/* Sidebar */}
        <div className="max-w-full md:max-w-[30rem]  bg-white shadow-lg flex flex-col flex-1 h-full">

          <div className="px-4 py-2 border-b">

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
                  const newYear = parseInt(year);
                  const newTerm = parseInt(term);

                  // Check if there are selected courses and we're changing terms
                  if (selectedSections.size > 0 && (newYear !== currentYear || newTerm !== currentTerm)) {
                    const confirmed = confirm(
                      `You have ${selectedSections.size} course${selectedSections.size !== 1 ? 's' : ''} selected. ` +
                      `Changing terms will clear your current selections. Are you sure you want to continue?`
                    );

                    if (!confirmed) {
                      return; // Don't change the term if user cancels
                    }

                    // Clear selected courses if user confirms
                    setSelectedSections(new Set());
                    setSaturdayCoursesCount(0);
                  }

                  setCurrentYear(newYear);
                  setCurrentTerm(newTerm);
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
                className="flex-5 px-1 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
              >
                Select all in Results
              </button>
              <button
                onClick={clearAllSections}
                className="flex-4 px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
              >
                Clear All
              </button>
              <button
                onClick={shareCurrentSchedule}
                className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer"
                title="Share schedule"
              >
                Share
              </button>

              {/* <button
                onClick={() => setIsDebugOpen(true)}
                className="w-min px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
                title="Debug schedule information"
              >
                🐛
              </button> */}
            </div>
          </div>

          {/* Course List */}
          <div className="flex-1 h-full">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">Loading courses...</div>
              </div>
            ) : visibleSections.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">No courses found</div>
              </div>
            ) : (
              <Virtuoso
                style={{ height: '100%' }}
                data={visibleSections}
                itemContent={(index, section) => (
                  <CourseItem
                    section={section}
                    courses={courses}
                    isSelected={selectedSections.has(section.id)}
                    isHovered={hoveredSection === section.id}
                    onToggle={toggleCallbacks.get(section.id)!}
                    onMouseEnter={mouseEnterCallbacks.get(section.id)!}
                    onMouseLeave={mouseLeaveCallback}
                  />
                )}
              />
            )}
          </div>
        </div>

        {/* Calendar and Online Courses */}
        <div className="flex-1 p-2 flex flex-col">

          <div className="min-h-36 sm:h-fit flex-1 bg-white rounded-lg shadow mb-2 sm:mb-4">
            <FullCalendar
              ref={calendarRef}
              {...calendarOptions}
            />
          </div>

          {/* Online Courses 

          ideally this would be laid out a bit better
          and not have hardcoded heights
          alas, i am only human
          
          */}
          {/* im very good at coding */}
          <div className={`h-fit min-h-42 max-h-50  md:max-h-72 pb-2 bg-white rounded-lg shadow overflow-y-scroll ${
            // (window && window.outerWidth > 900) || 
            (getSelectedOnlineSections().length === 0 && (!hoveredSection || !allSections.some(s => s.id === hoveredSection && isOnlineSection(s))))
            ? 'hidden sm:block' 
            : 'block'
          }`}>
            <div className="pl-3 pt-2 md:pt-3">
              <h3 className="sm:text-lg font-semibold text-gray-800">Online Courses:</h3>
            </div>

            <div className="px-3 py-1 md:pb-3 h-fit">
              {/* <div></div> */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 h-fit">
                {/* Show online courses (selected and hovered) in alphabetical order */}
                {(() => {
                  const selectedOnlineSections = getSelectedOnlineSections();
                  const hoveredOnlineSection = hoveredSection && !selectedSections.has(hoveredSection)
                    ? allSections.find(s => s.id === hoveredSection && isOnlineSection(s))
                    : null;

                  // Combine selected and hovered sections
                  const allOnlineSections = [...selectedOnlineSections];
                  if (hoveredOnlineSection) {
                    allOnlineSections.push(hoveredOnlineSection);
                  }

                  // Sort alphabetically by subject and course code
                  const sortedSections = allOnlineSections.sort((a, b) => {
                    const aCode = `${a.subject} ${a.course_code} ${a.section}`;
                    const bCode = `${b.subject} ${b.course_code} ${b.section}`;
                    return aCode.localeCompare(bCode);
                  });

                  return sortedSections.map(section => {
                    const isSelected = selectedSections.has(section.id);
                    const isHovered = hoveredSection === section.id;
                    const isPreview = !isSelected;

                    return (
                      <div
                        key={isPreview ? `preview-${section.id}` : section.id}
                        onClick={() => handleOnlineCourseClick(section)}
                        // onMouseEnter={() => setHoveredSection(section.id)}
                        // onMouseLeave={() => setHoveredSection(null)}
                        className={`p-2 rounded border cursor-pointer transition-colors text-sm ${isPreview
                          ? `opacity-70 border-dashed ${(
                            section.seats === 'Cancel' ||
                            section.waitlist === 'Full' ||
                            (
                              parseInt(section.seats) <= 0) && (section.waitlist && parseInt(section.waitlist?.toString()) > 10
                            )
                          )
                            ? 'bg-red-50 border-red-300 border-l-4 border-l-red-500'
                            : (section.waitlist && parseInt(section.waitlist) <= 10) || section.seats == '0'
                              ? 'bg-yellow-50 border-yellow-300 border-l-4 border-l-yellow-500'
                              : 'bg-green-50 border-green-300 border-l-4 border-l-green-500'
                          }`
                          : `${isHovered
                            ? 'bg-gray-100 border-gray-300'
                            : 'bg-blue-100 border-blue-300'
                          } ${(
                            section.seats === 'Cancel' ||
                            section.waitlist === 'Full' ||
                            (
                              parseInt(section.seats) <= 0) && (section.waitlist && parseInt(section.waitlist?.toString()) > 10
                            )
                          )
                            ? 'border-l-4 border-l-red-500'
                            : (section.waitlist && parseInt(section.waitlist) <= 10) || section.seats == '0'
                              ? 'border-l-4 border-l-yellow-500'
                              : 'border-l-4 border-l-green-500'
                          }`
                          }`}
                      >
                        <div className="font-medium">
                          {section.subject} {section.course_code} {section.section}
                        </div>
                        <div className="text-xs text-gray-600">
                          CRN: {section.crn} • Seats: {section.seats}
                          {section.waitlist && section.waitlist !== " " && ` • Waitlist: ${section.waitlist}`}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {courses.find(c => c.subject === section.subject && c.course_code === section.course_code)?.attributes?.title || 'Online Course'}
                        </div>
                      </div>
                    );
                  });
                })()}

                {getSelectedOnlineSections().length === 0 && 
                (!hoveredSection || !allSections.some(s => s.id === hoveredSection && isOnlineSection(s))) &&
                // !hoveredSection && 
                (
                  <div className="col-span-full text-gray-500">
                    No online courses selected.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>


      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        year={currentYear}
        term={currentTerm}
        crns={getCurrentCRNs()}
      />

      {/* Event Details Popup */}
      <EventDetailsPopup
        isOpen={eventDetailsPopup.isOpen}
        onClose={() => setEventDetailsPopup({ isOpen: false, eventData: null })}
        eventData={eventDetailsPopup.eventData}
        allSections={allSections}
      />

      {/* Schedule Debugger */}
      {/* <ScheduleDebugger
        isOpen={isDebugOpen}
        onClose={() => setIsDebugOpen(false)}
        currentScheduleId={currentScheduleId}
        selectedSections={selectedSections}
        allSections={allSections}
        currentYear={currentYear}
        currentTerm={currentTerm}
      /> */}
    </div>
  );
};

export default CoursePlanner;
