import { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://langaracourses.ca'

interface CourseIndex {
    subject: string;
    course_code: string;
    title: string;
    on_langara_website: boolean;
}

interface CourseIndexList {
    course_count: number;
    courses: CourseIndex[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Fetch all courses
    const response = await fetch('https://api.langaracourses.ca/v1/index/courses');
    if (!response.ok) {
      console.error('Failed to fetch courses for sitemap');
      return [];
    }
    
    const data: CourseIndexList = await response.json();
    
    // Generate sitemap entries for individual courses
    const courseUrls: MetadataRoute.Sitemap = data.courses.map((course) => ({
      url: `${BASE_URL}/courses/${course.subject.toLowerCase()}/${course.course_code}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
    
    // Get unique subjects for subject pages
    // commented out because it just redirects to /courses
    // const uniqueSubjects = [...new Set(data.courses.map(course => course.subject))];
    // const subjectUrls: MetadataRoute.Sitemap = uniqueSubjects.map((subject) => ({
    //   url: `${BASE_URL}/courses?subject=${subject}`,
    //   lastModified: new Date(),
    //   changeFrequency: 'weekly',
    //   priority: 0.7,
    // }));
    
    // Main pages
    const mainPages: MetadataRoute.Sitemap = [
      {
        url: `${BASE_URL}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/courses`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/planner`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/sections`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/timetable`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
    ];
    
    return [...mainPages, ...courseUrls];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [];
  }
}