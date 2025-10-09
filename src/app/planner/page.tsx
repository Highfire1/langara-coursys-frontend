import { Suspense } from 'react';
import CoursePlanner from "./CoursePlanner";
import type { Metadata } from 'next';

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

  return (
    <Suspense fallback={
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <CoursePlanner isScreenshotMode={isScreenshotMode} />
    </Suspense>
  );
};

export default PlannerPage;