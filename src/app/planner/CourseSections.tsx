import { Course } from "../../types/Course";


const CourseSections = ({ courses, index }: { courses: Course[]; index: number }) => {

    return (
        <div className="p-2 border-b overflow-hidden">
            <h3 className="font-bold">
                {courses[index].subject} {courses[index].course_code}
            </h3>
            


            <p>{courses[index].attributes.desc_prerequisite}</p>

            <p className="mt-4">
                {courses[index].sections.length} sections available.
            </p>

            <div className="space-y-2 mt-4">
                {courses[index].sections.map((section, sectionIndex) => (
                    <div
                        key={sectionIndex}
                        className="p-2 border rounded hover:bg-gray-50"
                    >
                        <div>Section {section.section} ({section.crn})</div>
                        <div>
                            {section.seats} seats available - {section.waitlist} waitlisted
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseSections;