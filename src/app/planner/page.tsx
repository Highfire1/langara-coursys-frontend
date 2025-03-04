export const metadata = {
    title: "Langara Course Planner",
    description: "Plan your Langara course schedule efficiently with an intuitive and visual planner. Easily search, select, and organize courses for upcoming semesters.",
  };

import Header from "@/components/shared/header";

const PlannerPage = () => {
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header title="Langara Course Planner" color="rgb(189,237,189)"/>
            <iframe
                src="https://oldplanner.langaracs.ca/"
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    flexGrow: 1
                }}
                title="Langara CS Planner"
            />
        </div>
    );
};

export default PlannerPage;