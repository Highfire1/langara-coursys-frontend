// TypeScript interfaces for the course planner based on the API schema

export interface Semester {
  id: string;
  year: number;
  term: number;
  courses_first_day?: string;
  courses_last_day?: string;
}

export interface ScheduleEntry {
  id: string;
  type: string;
  days: string; // e.g., "M-W----"
  time: string; // e.g., "1030-1220"
  start?: string;
  end?: string;
  room: string;
  instructor: string;
}

export interface Section {
  id: string;
  crn: number;
  RP?: string;
  seats?: string;
  waitlist?: string;
  section?: string;
  credits: number;
  abbreviated_title?: string;
  add_fees?: number;
  rpt_limit?: number;
  notes?: string;
  subject: string;
  course_code: string;
  year: number;
  term: number;
  schedule: ScheduleEntry[];
  // Added for UI state management
  rendered?: boolean;
  selected?: boolean;
  ghost?: boolean;
  weekends?: boolean;
}

export interface Course {
  subject: string;
  course_code: string;
  id: string;
  attributes?: {
    credits?: number;
    title?: string;
    description?: string;
    abbreviated_title?: string;
    // ... other attributes from CourseMaxAPI
  };
  sections?: Section[];
  transfers?: unknown[];
  outlines?: unknown[];
}

export interface SearchSectionResponse {
  subject_count: number;
  course_count: number;
  section_count: number;
  sections: string[];
}

export interface SectionResponse {
  sections: Section[];
}

export interface SemesterResponse {
  count: number;
  semesters: Semester[];
}

// Calendar event interface for FullCalendar
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startRecur?: Date;
  endRecur?: Date;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  backgroundColor: string;
  resourceId?: string;
  overlap?: boolean;
  source?: string;
}
