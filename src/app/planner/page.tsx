import { Metadata } from 'next';
import { Suspense } from 'react';
import PlannerClient from './PlannerClient';

export const metadata: Metadata = {
  title: 'Langara Course Planner',
  description: 'Plan your courses at Langara College with ease. This tool helps you create, manage, and share your course schedules using a visual timetable.',
  keywords: ['Langara College', 'course planner', 'schedule', 'timetable', 'courses'],
  openGraph: {
    title: 'Langara Course Planner',
    description: 'Plan your courses at Langara College with ease. This tool helps you create, manage, and share your course schedules using a visual timetable.',
    type: 'website',
  },
};

const PlannerPage = () => {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-lg">Loading course planner...</div>
      </div>
    }>
      <PlannerClient />
    </Suspense>
  );
};

export default PlannerPage;