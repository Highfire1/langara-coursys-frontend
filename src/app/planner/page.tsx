import { Suspense } from 'react';
import CoursePlanner from "./CoursePlanner";
import { plannerApi } from '@/lib/planner-api';
import type { Metadata } from 'next';
import type { LatestSemesterResponse, PlannerCourse, SemestersResponse } from '@/types/Planner2';

// Revalidate this page every hour (seconds) so server fetches are rebuilt on ISR schedule
export const revalidate = 3600;

export async function generateMetadata({ 
  searchParams 
}: { 
  searchParams: Promise<{ view?: string; y?: string; t?: string; crns?: string }> 
}): Promise<Metadata> {
  const params = await searchParams;
  
  // Build the screenshot URL with the same parameters
  const screenshotParams = new URLSearchParams();
  if (params.y) screenshotParams.set('y', params.y);
  if (params.t) screenshotParams.set('t', params.t);
  if (params.crns) screenshotParams.set('crns', params.crns);
  
  const screenshotUrl = screenshotParams.toString() 
    ? `/api/screenshot?${screenshotParams.toString()}`
    : '/api/screenshot';

  return {
    title: "Langara Course Planner",
    description: "Plan your Langara course schedule efficiently with an intuitive and visual planner.",
    openGraph: {
      title: "Langara Course Planner",
      description: "Plan your Langara course schedule efficiently with an intuitive and visual planner.",
      images: [
        {
          url: screenshotUrl,
          width: 1920,
          height: 1080,
          alt: "Langara Course Planner Schedule",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Langara Course Planner",
      description: "Plan your Langara course schedule efficiently with an intuitive and visual planner.",
      images: [screenshotUrl],
    },
  };
}

const PlannerPage = async ({ searchParams }: { searchParams: Promise<{ view?: string }> }) => {
  const params = await searchParams;
  const isScreenshotMode = params.view === 'screenshot';

  // Fetch planner data at build / server time so it can be embedded into the page (ISR via planner-api)
  // We prefer to fetch the latest semester, semesters list, courses for that semester, and an initial search result.
  let initialSemesters: SemestersResponse | null = null;
  let initialLatestSemester: LatestSemesterResponse | null = null;
  let initialCourses: PlannerCourse[] | null = null;
  let initialFilteredSections: string[] | null = null;

  try {
    initialSemesters = await plannerApi.getSemesters();
    initialLatestSemester = await plannerApi.getLatestSemester();
    if (initialLatestSemester && typeof (initialLatestSemester as LatestSemesterResponse).year === 'number') {
      const { year, term } = initialLatestSemester as LatestSemesterResponse;
      const coursesData = await plannerApi.getCoursesForSemester(year, term);
      initialCourses = coursesData.courses as PlannerCourse[];
  const searchResults = await plannerApi.searchSections('', year, term);
  initialFilteredSections = searchResults.sections;
    }
  } catch (err) {
    // If server fetches fail, we still render the page and CoursePlanner will fall back to client fetches
    console.error('Server-side planner fetch failed:', err);
  }

  return (
    <Suspense fallback={
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <CoursePlanner
        isScreenshotMode={isScreenshotMode}
        initialSemesters={initialSemesters ?? undefined}
        initialLatestSemester={initialLatestSemester ?? undefined}
        initialCourses={initialCourses ?? undefined}
        initialFilteredSections={initialFilteredSections ?? undefined}
      />
    </Suspense>
  );
};

export default PlannerPage;