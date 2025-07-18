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

interface TransferDestination {
    code: string;
    name: string;
}

interface TransferDestinationsResponse {
    transfers: TransferDestination[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Fetch all courses
    const coursesResponse = await fetch('https://api.langaracourses.ca/v1/index/courses');
    if (!coursesResponse.ok) {
      console.error('Failed to fetch courses for sitemap');
      return [];
    }
    
    const coursesData: CourseIndexList = await coursesResponse.json();

    // Generate sitemap entries for courses
    const courseUrls: MetadataRoute.Sitemap = coursesData.courses.map((course) => ({
      url: `${BASE_URL}/courses/${course.subject.toLowerCase()}-${course.course_code.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
    
    
    // Fetch transfer destinations
    const transfersResponse = await fetch('https://api.langaracourses.ca/v1/index/transfer_destinations');
    let transferUrls: MetadataRoute.Sitemap = [];
    
    if (transfersResponse.ok) {
      const transfersData: TransferDestinationsResponse = await transfersResponse.json();
      
      // Generate sitemap entries for transfer institution pages
      transferUrls = transfersData.transfers.map((institution) => ({
        url: `${BASE_URL}/transfers/${institution.code.toLowerCase()}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      }));
    } else {
      console.error('Failed to fetch transfer destinations for sitemap');
    }
    
    
    // Add main pages
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
      {
        url: `${BASE_URL}/transfers`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
    ];
    
    return [...mainPages, ...transferUrls, ...courseUrls];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [];
  }
}