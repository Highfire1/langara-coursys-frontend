// src/types/Section.ts

export interface Schedule {
    type: string;
    days: string;
    time: string;
    start: null;
    end: null;
    room: string;
    instructor: string;
    id: string;
}

export interface Section {
    RP: string;
    abbreviated_title: string;
    course_code: string;
    credits: number;
    crn: number;
    id: string;
    rpt_limit: number;
    schedule: Schedule[]; // Adjust type if you have a specific structure for schedule
    seats: string;
    waitlist: string;
    section: string;
    subject: string;
    term: number;
    year: number;
    course_id: string;
  }

export interface SectionInternal extends Section {
    hidden: boolean;
    pinned: boolean;
    hidden_by_pin: boolean;
}
  
  export interface SectionsResponse {
    sections: Section[];
  }