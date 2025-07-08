// API utilities for fetching course data from Langara API

import { 
  Semester, 
  SemesterResponse, 
  SearchSectionResponse, 
  SectionResponse,
  Section 
} from '@/types/Planner';

const API_BASE_URL = 'https://api.langaracourses.ca';

export class CourseAPI {
  static async getLatestSemester(): Promise<Semester> {
    const response = await fetch(`${API_BASE_URL}/v1/index/latest_semester`);
    if (!response.ok) {
      throw new Error('Failed to fetch latest semester');
    }
    return response.json();
  }

  static async getAllSemesters(): Promise<Semester[]> {
    const response = await fetch(`${API_BASE_URL}/v1/index/semesters`);
    if (!response.ok) {
      throw new Error('Failed to fetch semesters');
    }
    const data: SemesterResponse = await response.json();
    return data.semesters;
  }

  static async getSections(year: number, term: number): Promise<Section[]> {
    const response = await fetch(`${API_BASE_URL}/v1/semester/${year}/${term}/sections`);
    if (!response.ok) {
      throw new Error('Failed to fetch sections');
    }
    const data: SectionResponse = await response.json();
    return data.sections;
  }

  static async searchSections(
    query: string = '', 
    year?: number, 
    term?: number
  ): Promise<SearchSectionResponse> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (year) params.append('year', year.toString());
    if (term) params.append('term', term.toString());

    const response = await fetch(`${API_BASE_URL}/v1/search/sections?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to search sections');
    }
    return response.json();
  }

  static termToSeason(term: number): string {
    switch (term) {
      case 10:
        return 'Spring';
      case 20:
        return 'Summer';
      case 30:
        return 'Fall';
      default:
        return 'Unknown';
    }
  }

  static getSemesterDates(year: number, term: number): { firstDay: Date; lastDay: Date } {
    // Default dates based on typical Langara schedule
    let firstDay: Date;
    let lastDay: Date;

    if (year === 2025 && term === 10) {
      firstDay = new Date('2025-01-08');
      lastDay = new Date('2025-04-04');
    } else if (year === 2025 && term === 20) {
      firstDay = new Date('2025-05-05');
      lastDay = new Date('2025-08-01');
    } else if (year === 2025 && term === 30) {
      firstDay = new Date('2025-09-02');
      lastDay = new Date('2025-12-01');
    } else {
      // Fallback dates based on term
      switch (term) {
        case 10: // Spring
          firstDay = new Date(`${year}-01-08`);
          lastDay = new Date(`${year}-04-04`);
          break;
        case 20: // Summer
          firstDay = new Date(`${year}-05-05`);
          lastDay = new Date(`${year}-08-01`);
          break;
        case 30: // Fall
          firstDay = new Date(`${year}-09-02`);
          lastDay = new Date(`${year}-12-01`);
          break;
        default:
          throw new Error('Unknown term');
      }
    }

    return { firstDay, lastDay };
  }
}
