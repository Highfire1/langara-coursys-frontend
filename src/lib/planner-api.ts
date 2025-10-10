import {
  PlannerApiResponse,
  SemestersResponse,
  LatestSemesterResponse,
  SectionsSearchResponse,
  CoursesApiResponse,
  SectionsApiResponse,
  Section
} from '@/types/Planner2';

const API_BASE = 'https://api.langaracourses.ca';

// Revalidation time for ISR (in seconds). Adjust as needed.
// Setting to 3600 (1 hour) by default.
const REVALIDATE_SECONDS = 3600;

export const plannerApi = {
  // Get courses and sections for a specific semester
  getCoursesForSemester: async (year: number, term: number): Promise<PlannerApiResponse> => {
  const coursesRes = await fetch(`${API_BASE}/v1/semester/${year}/${term}/courses`, { next: { revalidate: REVALIDATE_SECONDS } });
  const sectionsRes = await fetch(`${API_BASE}/v1/semester/${year}/${term}/sections`, { next: { revalidate: REVALIDATE_SECONDS } });

    const [coursesData, sectionsData]: [CoursesApiResponse, SectionsApiResponse] = await Promise.all([
      coursesRes.json(),
      sectionsRes.json()
    ]);

    // Map sections to courses like in the original Flask code
    const sectionsDict: { [key: string]: Section[] } = {};

    for (const section of sectionsData.sections) {
      const key = `${section.subject}-${section.course_code}`;
      if (!sectionsDict[key]) {
        sectionsDict[key] = [];
      }
      sectionsDict[key].push(section);
    }

    // Add sections to courses
    const coursesWithSections = coursesData.courses.map(course => ({
      ...course,
      sections: sectionsDict[`${course.subject}-${course.course_code}`] ?? []
    }));

    return { courses: coursesWithSections };
  },

  // Get available semesters
  getSemesters: async (): Promise<SemestersResponse> => {
    const response = await fetch(`${API_BASE}/v1/index/semesters`, { next: { revalidate: REVALIDATE_SECONDS } });
    return response.json();
  },

  // Get latest semester
  getLatestSemester: async (): Promise<LatestSemesterResponse> => {
    const response = await fetch(`${API_BASE}/v1/index/latest_semester`, { next: { revalidate: REVALIDATE_SECONDS } });
    return response.json();
  },

  // Search sections
  searchSections: async (query: string, year: number, term: number): Promise<SectionsSearchResponse> => {
    const response = await fetch(`${API_BASE}/v1/search/sections?query=${encodeURIComponent(query)}&year=${year}&term=${term}`, { next: { revalidate: REVALIDATE_SECONDS } });
    return response.json();
  }
};

// Utility functions
export const termToSeason = (term: number): string => {
  switch (term) {
    case 10: return "Spring";
    case 20: return "Summer";
    case 30: return "Fall";
    default: return "Unknown";
  }
};

export const getSemesterDates = (year: number, term: number): { start: Date; end: Date } => {

  switch (term) {
    case 10:
      return {
        start: new Date(`${year}-01-08`),
        end: new Date(`${year}-04-04`)
      };
    case 20:
      return {
        start: new Date(`${year}-05-05`),
        end: new Date(`${year}-08-01`)
      };
    case 30:
      return {
        start: new Date(`${year}-09-02`),
        end: new Date(`${year}-12-01`)
      };
    default:
      throw new Error("Invalid term");
  }
};
