// src/types/Course.ts
import { Section } from "./Section";

export interface CourseAttributes {
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
    active: boolean;
    discontinued: boolean;
    transfer_destinations: string;
    on_langara_website: boolean;
  }
  
  export interface Transfer {
    id: string;
    source: string;
    source_credits: number;
    source_title: string;
    destination: string;
    destination_name: string;
    credit: string;
    condition: string;
    effective_start: string;
    effective_end: string;
    subject: string;
    course_code: string;
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
    attributes: CourseAttributes;
    sections: Section[];
    transfers: Transfer[];
    outlines: Outline[];
  }

  export interface CourseInternal extends Course {
    hidden: boolean;
    sections_enhanced: import("./Section").SectionInternal[];
  }
  
  export interface CoursesResponse {
    courses: Course[];
  }