export const metadata = {
    title: "Langara Course Planner",
    description: "Plan your Langara course schedule efficiently with an intuitive and visual planner. Easily search, select, and organize courses for upcoming semesters.",
  };

import CoursePlanner from "./CoursePlanner";
// import Header from "@/components/shared/header";

const PlannerPage = () => {
  return (
    <div className="w-full h-full">
      {/* <Header title="Langara Course Planner" color="#FEB95F"></Header> */}

      <div>
        <CoursePlanner/>
      </div>
      
    </div>
  )
};

export default PlannerPage;