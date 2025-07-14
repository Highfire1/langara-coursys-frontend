import { Suspense } from 'react';
import CoursePlanner from "./CoursePlanner";

const PlannerContent = () => {
  return (
    <div className="w-full h-screen">
      <div>
        <CoursePlanner />
      </div>
    </div>
  );
};

const PlannerPage = () => {
  return (
    <Suspense fallback={
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <PlannerContent />
    </Suspense>
  );
};

export default PlannerPage;