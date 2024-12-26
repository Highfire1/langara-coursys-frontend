import { Course } from "../../types/Course";

const CourseSections: React.FC<{ index: number; courses: Course[] }> = ({ index, courses }) => (
    <div className="p-2 border-b overflow-hidden">
        <h3 className="font-bold">{courses[index].subject} {courses[index].course_code}</h3>
        <p>{courses[index].attributes.desc_prerequisite}</p>
        <br></br>
        <p>{courses[index].sections.length} sections available.</p>


        {courses[index].sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="p-2 border rounded">
                <span>Section {section.section}</span> (<span>{section.crn}</span>)
                <br></br>
                <span>{section.seats} seats available</span> - <span>{section.waitlist} waitlisted</span>
                <br></br>
                
            </div>
        ))}
        
    </div>
);

export default CourseSections;