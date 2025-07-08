// Types specific to the planner functionality

export interface Schedule {
  id: string;
  days: string;
  time: string;
  start?: string;
  end?: string;
  type: string;
  room: string;
}

export interface Section {
  id: string;
  subject: string;
  course_code: string;
  section: string;
  crn: string;
  seats: number;
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
  }>;
}

export interface SectionsApiResponse {
  sections: Section[];
}
