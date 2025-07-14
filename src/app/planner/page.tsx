import { Suspense } from 'react';
import CoursePlanner from "./CoursePlanner";

export const metadata = {
  title: "Langara Course Planner",
  description: " Plan your Langara course schedule efficiently with an intuitive and visual planner.",
};

const PlannerPage = () => {
  return (
    <Suspense fallback={
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <CoursePlanner />
    </Suspense>
  );
};

export default PlannerPage;