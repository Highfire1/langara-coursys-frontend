// src/types/Course.ts
import { Section } from "./Section";

export interface Transfer {
    id: number;
    sourceId?: number;
    source: string;
    sourceCredits: number;
    sourceTitle: string;
    destination: string;
    destinationName: string | null;
    credit: string;
    condition: string | null;
    effectiveStart: string;
    effectiveEnd: string | null;
    subject: string;
    courseNumber: string;
  }

  export interface Outline {
    url: string;
    file_name: string;
    id: string;
  }
  
  export interface Course {
    subject: string;
    course_code: string;
    id: string;
    title: string | null;
    on_langara_website: boolean;
    study_type: string | null;
    credits: number;
    lecture_hours: number;
    seminar_hours: number;
    lab_hours: number;
    description: string | null;
    desc_prerequisites: string | null;
    desc_corequisites: string | null;
    desc_degree_requirements: string | null;
    desc_requisites_catalogue: string | null;
    desc_replacement_course: string | null;
    offered_online: boolean;
    first_offered_year: number | null;
    first_offered_term: number | null;
    last_offered_year: number | null;
    last_offered_term: number | null;
    transfer_destinations: string | null;
    // Fields that may be absent on some endpoints
    abbreviated_title?: string | null;
    preparatory_course?: boolean | null;
    desc_duplicate_credit?: string | null;
    desc_registration_restriction?: string | null;
    // Nested course category attributes
    attributes: V3CourseAttributes;
    sections: Section[];
    transfers: Transfer[];
    outlines: Outline[];
  }

  export interface CourseInternal extends Course {
    hidden: boolean;
    sections_enhanced: import("./Section").SectionInternal[];
    ui_hidden: boolean;
  }

  export interface LatestSemesterResponse {
    courses_first_day: string;
    courses_last_day: string;
    id: string;
    term: number;
    year: number;
  }

  
export interface V3CourseAttributes {
  attr_2ar: boolean;
  attr_2sc: boolean;
  attr_hum: boolean;
  attr_lsc: boolean;
  attr_sci: boolean;
  attr_soc: boolean;
  attr_ut: boolean;
}

export interface CourseMax {
  subject: string;
  course_code: string;
  title: string | null;
  on_langara_website: boolean;
  study_type: string | null;
  credits: number;
  lecture_hours: number;
  seminar_hours: number;
  lab_hours: number;
  description: string | null;
  desc_prerequisites: string | null;
  desc_corequisites: string | null;
  desc_degree_requirements: string | null;
  desc_requisites_catalogue: string | null;
  desc_replacement_course: string | null;
  offered_online: boolean;
  first_offered_year: number | null;
  first_offered_term: number | null;
  last_offered_year: number | null;
  last_offered_term: number | null;
  transfer_destinations: string | null;
  attributes: V3CourseAttributes;
}

export interface CoursesResponse {
  courses: Course[];
}

export interface TransferDestination {
  code: string;
  name: string;
}

export interface CourseBrowserProps {
  transfers: TransferDestination[];
  subjects: string[];
  initialCourses: CourseMax[];
  initialTotalCount: number;
  validCourses: string[];
}
export interface v1IndexTransfersResponse {
  transfers: {
    code: string;
    name: string;
  }[];
}

export interface v1IndexSubjectsResponse {
  count: number;
  subjects: string[];
}

export interface v2SearchCoursesResponse {
  page: number;
  limit: number;
  total_count: number;
  total_pages: number;
  courses: CourseMax[];
}

export interface v1SearchCoursesResponse {
    subject_count: number;
    course_count: number;
    courses: {
      subject: string;
      course_code: string;
      on_langara_website: boolean;
    }[];
}