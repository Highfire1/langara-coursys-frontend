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

export async function generateSitemaps() {
  // Fetch total number of courses to determine how many sitemaps we need
  try {
    const response = await fetch('https://api.langaracourses.ca/v1/index/courses');
    if (!response.ok) {
      console.error('Failed to fetch courses for sitemap generation');
      return [{ id: 0 }];
    }
    
    const data: CourseIndexList = await response.json();
    const totalCourses = data.course_count;
    
    // Google's limit is 50,000 URLs per sitemap
    const sitemapsNeeded = Math.ceil(totalCourses / 50000);
    
    return Array.from({ length: sitemapsNeeded }, (_, i) => ({ id: i }));
  } catch (error) {
    console.error('Error generating sitemaps:', error);
    return [{ id: 0 }];
  }
}
 
export default async function sitemap({
  id,
}: {
  id: number
}): Promise<MetadataRoute.Sitemap> {
  try {
    // Fetch all courses
    const response = await fetch('https://api.langaracourses.ca/v1/index/courses');
    if (!response.ok) {
      console.error('Failed to fetch courses for sitemap');
      return [];
    }
    
    const data: CourseIndexList = await response.json();
    
    // Google's limit is 50,000 URLs per sitemap
    const start = id * 50000;
    const end = start + 50000;
    const coursesSlice = data.courses.slice(start, end);
    
    // Generate sitemap entries for courses
    const courseUrls: MetadataRoute.Sitemap = coursesSlice.map((course) => ({
      url: `${BASE_URL}/courses/${course.subject.toLowerCase()}-${course.course_code.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
    
    // Add main pages only to the first sitemap
    if (id === 0) {
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
        // {
        //   url: `${BASE_URL}/transfers`,
        //   lastModified: new Date(),
        //   changeFrequency: 'monthly',
        //   priority: 0.6,
        // },
      ];
      
      return [...mainPages, ...courseUrls];
    }
    
    return courseUrls;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [];
  }
}