// Types specific to the planner functionality

export interface Schedule {
  id: string;
  days: string;
  time: string;
  start?: string;
  end?: string;
  type: string;
  room: string;
  instructor: string;
}

export interface Section {
  id: string;
  subject: string;
  course_code: string;
  section: string;
  title: string;
  crn: string;
  seats: string;
  waitlist?: string;
  schedule: Schedule[];
  // UI state properties
  rendered?: boolean;
  selected?: boolean;
  ghost?: boolean;
  weekends?: boolean;
}

export interface PlannerCourse {
  subject: string;
  course_code: string;
  sections: Section[];
  attributes?: {
    title?: string;
    credits?: number;
    description?: string;
    abbreviated_title?: string;
  };
}

export interface Semester {
  id: string;
  year: number;
  term: number;
}

export interface PlannerApiResponse {
  courses: PlannerCourse[];
}

export interface SemestersResponse {
  semesters: Semester[];
}

export interface LatestSemesterResponse {
  year: number;
  term: number;
}

export interface SectionsSearchResponse {
  sections: string[];
}

export interface CoursesApiResponse {
  courses: Array<{
    subject: string;
    course_code: string;
    [key: string]: unknown;
    attributes?: {
      title: string;
    }
  }>;
}

export interface SectionsApiResponse {
  sections: Section[];
}
