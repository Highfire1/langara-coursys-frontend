import { addLinksToCourseDescription } from '@/lib/course-utils';
import { Course, Transfer } from '@/types/Course';
import Link from 'next/link';

const _courses: {
    course_count: number;
    courses: {
        course_code: string;
        on_langara_website: boolean;
        subject: string;
        title: string;
    }[];
    subject_count: number;
} = await fetch(
    'https://api2.langaracourses.ca/api/v3/index/courses',
    {
        cache: 'force-cache',
        next: { revalidate: 1800 } // 30 minutes
    }
).then((res) => res.json());

const courseList = _courses.courses.map(
    (c) => `${c.subject}-${c.course_code}`.toLowerCase()
);

const mapTerm = (term: number): string => {
    switch (term) {
        case 10:
            return 'Spring';
        case 20:
            return 'Summer';
        case 30:
            return 'Fall';
        default:
            return term === null ? "null" : term.toString();
    }
};

interface CourseInfoProps {
    course: Course;
}

export default async function CourseInfo({ course }: CourseInfoProps) {

    const validTransfers: Transfer[] = [];
    const oldTransfers: Transfer[] = [];

    const now = new Date();
    const currentDateString = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0');

    course.transfers.forEach((transfer_agreement: Transfer) => {
        if (!transfer_agreement.effectiveEnd || transfer_agreement.effectiveEnd >= currentDateString) {
            validTransfers.push(transfer_agreement);
        } else {
            oldTransfers.push(transfer_agreement);
        }
    });



    if (!course) return <div>No course data found.</div>;

    return (
        <div className="flex flex-col gap-2">

            {!course.on_langara_website && (
                <div className='border-2 border-gray-200 rounded p-2 flex gap-2 flex-col bg-red-200'>
                    <p><strong>Warning: This course is not listed on the Langara website and is almost certainly discontinued.

                        {course.last_offered_term ?
                            ` It was last offered in the term of ${mapTerm(course.last_offered_term!)} ${course.last_offered_year}` :
                            ' It was likely last offered before 1999'}</strong>.</p>
                </div>
            )}

            {course.on_langara_website && course.last_offered_year != null && course.last_offered_year < new Date().getFullYear() - 5 &&
                (course.last_offered_term != null ? (
                    <div className='border-2 border-gray-200 rounded p-2 flex gap-2 flex-col bg-yellow-200'>
                        <p>Warning: This course is listed on the Langara website, but it was last offered in the term of <strong>{mapTerm(course.last_offered_term)} {course.last_offered_year}</strong>.</p>
                    </div>
                ) : (
                    <div className='border-2 border-gray-200 rounded p-2 flex gap-2 flex-col bg-yellow-200'>
                        <p>Warning: This course is listed on the Langara website, but it has never been offered for registration before.</p>
                    </div>
                ))
            }

            {/* COURSE INFORMATION */}
            <div className='border-2 border-gray-200 rounded p-2 flex gap-2 flex-col'>
                <h1 className="text-2xl font-bold">
                    {course.on_langara_website ? (
                        <Link href={`https://langara.ca/programs-courses/${course.subject.toLowerCase()}-${course.course_code.toLowerCase()}`} className="text-[#f15a22] transition-colors duration-200 ease-in hover:text-black hover:underline">
                            <p>{course.subject} {course.course_code}{course.title ? `: ${course.title}` : course.abbreviated_title ? `: ${course.abbreviated_title}` : ''}</p>

                        </Link>
                    ) : (
                        <p>{course.subject} {course.course_code}{course.title ? `: ${course.title}` : course.abbreviated_title ? `: ${course.abbreviated_title}` : ''}</p>
                    )}
                </h1>

                <table className="table-auto text-left w-fit">
                    <tbody>
                        <tr>
                            <th className='pr-4'>Course Format</th>
                            <td>
                                {course.lecture_hours != null && course.seminar_hours != null && course.lab_hours != null ? (
                                    <>
                                        Lecture {course.lecture_hours.toFixed(1)} h +
                                        Seminar {course.seminar_hours.toFixed(1)} h +
                                        Lab {course.lab_hours.toFixed(1)} h
                                    </>
                                ) : 'N/A'}
                            </td>
                        </tr>

                        <tr>
                            <th>Credits</th>
                            <td>{course.credits != null ? course.credits.toFixed(1) : 'N/A'}</td>
                        </tr>
                    </tbody>
                </table>

                {/* <h2 className="text-xl pt-2 pb-1">Course Description</h2> */}
                <div className='flex flex-col gap-2'>
                    {course.description ? (
                        <p>{addLinksToCourseDescription(course.description, courseList)}</p>
                    ) : (
                        <p>No description available for this course</p>
                    )}


                    {course.desc_duplicate_credit && (
                        <p>{addLinksToCourseDescription(course.desc_duplicate_credit, courseList)}</p>
                    )}

                    {course.desc_registration_restriction && (
                        <p>{addLinksToCourseDescription(course.desc_registration_restriction, courseList)}</p>
                    )}

                    {course.desc_prerequisites && (
                        <p>{addLinksToCourseDescription(course.desc_prerequisites, courseList)}</p>
                    )}
                </div>

                <br></br>

                <div className='flex flex-row gap-2'>
                    <table className="h-min table-auto text-left w-fit text-sm border-collapse [&_td]:border [&_th]:border [&_td]:border-black [&_th]:border-black [&_td]:p-1 [&_th]:p-1">
                        <tbody>
                            <tr>
                                <th colSpan={2} className="text-center">Course Attributes:</th>
                            </tr>

                            <tr>
                                <th>2nd Year Arts</th>
                                <td className={`min-w-[50px] ${course.attributes.attr_2ar ? 'bg-green-500' : ''}`}>{course.attributes.attr_2ar === null ? '' : course.attributes.attr_2ar ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr>
                                <th>2nd Year Science</th>
                                <td className={course.attributes.attr_2sc ? 'bg-green-500' : ''}>{course.attributes.attr_2sc === null ? '' : course.attributes.attr_2sc ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr>
                                <th>Humanities</th>
                                <td className={course.attributes.attr_hum ? 'bg-green-500' : ''}>{course.attributes.attr_hum === null ? '' : course.attributes.attr_hum ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr>
                                <th>Lab Science</th>
                                <td className={course.attributes.attr_lsc ? 'bg-green-500' : ''}>{course.attributes.attr_lsc === null ? '' : course.attributes.attr_lsc ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr>
                                <th>Science</th>
                                <td className={course.attributes.attr_sci ? 'bg-green-500' : ''}>{course.attributes.attr_sci === null ? '' : course.attributes.attr_sci ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr>
                                <th>Social Science</th>
                                <td className={course.attributes.attr_soc ? 'bg-green-500' : ''}>{course.attributes.attr_soc === null ? '' : course.attributes.attr_soc ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr>
                                <th>University<br />Transferable</th>
                                <td className={course.attributes.attr_ut ? 'bg-green-500' : ''}>{course.attributes.attr_ut === null ? '' : course.attributes.attr_ut ? 'Yes' : 'No'}</td>
                            </tr>

                        </tbody>
                    </table>

                    <table className="h-fit table-auto text-left w-fit text-sm border-collapse [&_td]:border [&_th]:border [&_td]:border-black [&_th]:border-black [&_td]:p-1 [&_th]:p-1">
                        <tbody>
                            <tr>
                                <th colSpan={2} className="text-center">Other Attributes:</th>
                            </tr>

                            <tr className="align-top">
                                <th>Offered online:</th>
                                <td className="min-w-[200px]">{course.offered_online == null ? 'Unknown' : course.offered_online ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr className="align-top">
                                <th>Preparatory course:</th>
                                <td className="min-w-[200px]">{course.preparatory_course == null ? 'Unknown' : course.preparatory_course ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr className="align-top">
                                <th>Repeat limit</th>
                                <td className="min-w-[200px]">{course.sections[0]?.rpt_limit ?? 'N/A'}</td>
                            </tr>
                            {/* <tr className="align-top">
                                <th className='pr-4'>Also known as:</th>
                                <td className="min-w-[200px]">{course.attributes.abbreviated_title}</td>
                            </tr> */}
                            <tr className="align-top">
                                <th className='pr-4'>Additional fees:</th>
                                <td className="min-w-[200px]">{course.sections[0]?.add_fees ? `$${course.sections[0]?.add_fees}` : ''}</td>
                            </tr>
                            <tr className="align-top">
                                <th>First offered:</th>
                                <td>{course.first_offered_term != null ? mapTerm(course.first_offered_term) : ''} {course.first_offered_year ?? ''}</td>
                            </tr>
                            <tr className={`align-top ${course.last_offered_year != null && course.last_offered_year < new Date().getFullYear() - 5 ? 'bg-red-200' : ''}`}>
                                <th>Last offered:</th>
                                <td>{course.last_offered_term != null ? mapTerm(course.last_offered_term) : ''} {course.last_offered_year ?? ''}</td>
                            </tr>

                            <tr className="align-top">
                                <th className='pr-4'>Registration<br></br>restrictions:</th>
                                <td className="min-w-[200px]">{course.sections[0]?.rp ?? course.sections[0]?.RP ?? ''}</td>
                            </tr>

                            <tr className="align-top">
                                <th>Outline(s):</th>
                                <td>
                                    {course.outlines.length > 0 ? (
                                        course.outlines.map((outline, i) => (
                                            // unfortunately langara evaporated all of the example outlines, so we have to use the wayback machine
                                            <Link 
                                                key={outline.id ?? i} 
                                                href={`https://web.archive.org/web/*/${outline.url}`} className="text-blue-600 hover:text-blue-800 underline"
                                                target="_blank">
                                                <p>{outline.file_name}</p>
                                            </Link>
                                        ))
                                    ) : (
                                        "No outline found."
                                    )}
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>
            </div>

            <div className='border-2 border-gray-200 rounded p-2 flex gap-2 flex-col'>
                <details open>
                    <summary className="text-l font-bold cursor-pointer">Transfer Agreements</summary>
                    <div className="max-w-[1000px] overflow-x-auto pt-2">
                        <table className="p-2 w-full rounded table-auto text-left text-sm border-collapse [&_td]:border [&_th]:border [&_td]:border-black [&_th]:border-black [&_td]:p-1 [&_th]:p-1">
                            <thead>
                                <tr>
                                    <th className="w-[8%]">Course</th>
                                    <th className="w-[16%]">Destination</th>
                                    <th className="w-[40%]">Credit</th>
                                    <th className="w-[12%]">Start to End</th>
                                </tr>
                            </thead>
                            <tbody>
                                {validTransfers.length === 0 ? (
                                    <tr>
                                        <td className="text-center" colSpan={4}>No active transfer agreements.</td>
                                    </tr>
                                ) : (
                                    validTransfers.map((transfer) => (
                                        <tr key={transfer.id} className={`align-top ${(transfer.credit === "No Credit" || transfer.credit === "No credit") ? 'bg-red-200' :
                                            (() => {
                                                if (transfer.credit.includes('=')) {
                                                    // Handle cases like "LANG CPSC 1150 (3) & LANG CPSC 1160 (3) = UNBC CPSC 100 (4) & UNBC CPSC 1XX (2)"
                                                    const [leftSide, rightSide] = transfer.credit.split('=').map(s => s.trim());
                                                    const leftCredits = (leftSide.match(/\((\d+)\)/g) || [])
                                                        .map(n => parseInt(n.replace(/[()]/g, '')))
                                                        .reduce((a, b) => a + b, 0);
                                                    const rightCredits = (rightSide.match(/\((\d+)\)/g) || [])
                                                        .map(n => parseInt(n.replace(/[()]/g, '')))
                                                        .reduce((a, b) => a + b, 0);
                                                    return rightCredits < leftCredits ? 'bg-yellow-200' : '';
                                                } else {
                                                    // Handle cases like "UBCV CPSC_V 1st (3)"
                                                    const creditMatch = transfer.credit.match(/\((\d+)\)/);
                                                    const destinationCredits = creditMatch ? parseInt(creditMatch[1]) : 0;
                                                    return destinationCredits < transfer.sourceCredits ? 'bg-yellow-200' : '';
                                                }
                                            })()
                                            }`}>
                                            <td>{transfer.subject} {transfer.courseNumber}</td>
                                            <td>{(transfer.destinationName?.length ?? 0) > 35 ? transfer.destination : (transfer.destinationName ?? transfer.destination)}</td>
                                            <td>{transfer.credit} {transfer.condition}</td>
                                            <td>{transfer.effectiveStart}{transfer.effectiveEnd ? ` to ${transfer.effectiveEnd}` : ' to present'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </details>

                <details open={validTransfers.length === 0}>
                    <summary className="text-l font-bold cursor-pointer">Inactive Transfer Agreements (click to open)</summary>
                    <div className="max-w-[1000px] overflow-x-auto pt-2">

                        {oldTransfers.length > 0 && (
                            <p>Note: If you took courses within the period stated below, you can still transfer those credits.</p>
                        )}
                        <table className="p-2 w-full rounded table-auto text-left text-sm border-collapse [&_td]:border [&_th]:border [&_td]:border-black [&_th]:border-black [&_td]:p-1 [&_th]:p-1">
                            <thead>
                                <tr>
                                    <th className="w-[8%]">Course</th>
                                    <th className="w-[16%]">Destination</th>
                                    <th className="w-[40%]">Credit</th>
                                    <th className="w-[12%]">Start to End</th>
                                </tr>
                            </thead>
                            <tbody>
                                {oldTransfers.length === 0 ? (
                                    <tr>
                                        <td className="text-center" colSpan={4}>No inactive transfer agreements.</td>
                                    </tr>
                                ) : (
                                    oldTransfers.map((transfer) => (
                                        <tr key={transfer.id} className='align-top bg-red-200'>
                                            <td>{transfer.subject} {transfer.courseNumber}</td>
                                            <td>{(transfer.destinationName?.length ?? 0) > 35 ? transfer.destination : (transfer.destinationName ?? transfer.destination)}</td>

                                            <td>{transfer.credit} {transfer.condition}</td>

                                            <td>{transfer.effectiveStart}{transfer.effectiveEnd ? ` to ${transfer.effectiveEnd}` : ' to present'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </details>
            </div>

            <div className='border-2 border-gray-200 rounded p-2 flex gap-2 flex-col'>
                <p className="text-l font-bold cursor-pointer">Offerings of this course:</p>
                <table className="offeredTable mono table-auto text-left w-fit text-sm border-collapse [&_td]:border [&_th]:border [&_td]:border-black [&_th]:border-black [&_td]:p-1 [&_th]:p-1 min-w-[1000px]">
                    <thead>
                        <tr>
                            <th>Semester</th>
                            <th>CRN</th>
                            <th>Section</th>
                            <th>Seats</th>
                            <th>Waitlist</th>
                            <th>Days</th>
                            <th>Time</th>
                            <th>Room</th>
                            <th>Type</th>
                            <th>Instructor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {course.sections.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="text-center">No offerings found.</td>
                            </tr>
                        ) : (
                            course.sections.flatMap((section) => (
                                section.schedule.map((schedule, index) => (
                                    <tr key={`${section.crn}-${section.year}-${section.term}-${index}`} className={`
                                        ${section.term === 10 ? 'bg-green-100' : ''}
                                        ${section.term === 20 ? 'bg-yellow-100' : ''}
                                        ${section.term === 30 ? 'bg-orange-100' : ''}
                                    `}>
                                        {index === 0 && (
                                            <>
                                                <td rowSpan={section.schedule.length}>{mapTerm(section.term)} {section.year}</td>
                                                <td rowSpan={section.schedule.length}>{section.crn}</td>
                                                <td rowSpan={section.schedule.length}>{section.section}</td>
                                                <td rowSpan={section.schedule.length}>{section.seats}</td>
                                                <td rowSpan={section.schedule.length}>{section.waitlist}</td>
                                            </>
                                        )}
                                        <td>{schedule.days}</td>
                                        <td>{schedule.time}</td>
                                        <td>{schedule.room}</td>
                                        <td>{schedule.type}</td>
                                        <td>{schedule.instructor}</td>
                                    </tr>
                                ))
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}