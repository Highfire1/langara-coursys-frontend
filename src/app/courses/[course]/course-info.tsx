import { addLinksToCourseDescription } from '@/lib/course-utils';
import { Course, Transfer } from '@/types/Course';
import Link from 'next/link';


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

    // show agreements that expired up to two years ago
    const transferDateCutoff = new Date();
    transferDateCutoff.setMonth(transferDateCutoff.getMonth() + 24);

    course.transfers.forEach((transfer_agreement: Transfer) => {
        if (transfer_agreement.effective_end == null || new Date(transfer_agreement.effective_end) > transferDateCutoff) {
            validTransfers.push(transfer_agreement);
        } else {
            oldTransfers.push(transfer_agreement);
        }
    });

    course.sections = course.sections.reverse();


    if (!course) return <div>No course data found.</div>;

    return (
        <div className="flex flex-col gap-2">

            {!course.attributes.on_langara_website && (
                <div className='border-2 border-gray-200 rounded p-2 flex gap-2 flex-col bg-red-200'>
                    <p><strong>Warning: This course is not listed on the Langara website and is almost certainly discontinued.

                        {course.attributes.last_offered_term ?
                            ` It was last offered in the term of ${mapTerm(course.attributes.last_offered_term)} ${course.attributes.last_offered_year}` :
                            ' It was likely last offered before 1999'}</strong>.</p>
                </div>
            )}

            {course.attributes.on_langara_website && course.attributes.last_offered_year < new Date().getFullYear() - 5 &&
                (course.attributes.last_offered_term !== null ? (
                    <div className='border-2 border-gray-200 rounded p-2 flex gap-2 flex-col bg-yellow-200'>
                        <p>Warning: This course is listed on the Langara website, but it was last offered in the term of <strong>{mapTerm(course.attributes.last_offered_term)} {course.attributes.last_offered_year}</strong>.</p>
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
                    {course.attributes.on_langara_website ? (
                        <Link href={`https://langara.ca/programs-courses/${course.subject.toLowerCase()}-${course.course_code.toLowerCase()}`} className="text-[#f15a22] transition-colors duration-200 ease-in hover:text-black hover:underline">
                            <p>{course.subject} {course.course_code}{course.attributes.title ? `: ${course.attributes.title}` : course.attributes.abbreviated_title ? `: ${course.attributes.abbreviated_title}` : ''}</p>

                        </Link>
                    ) : (
                        <p>{course.subject} {course.course_code}{course.attributes.title ? `: ${course.attributes.title}` : course.attributes.abbreviated_title ? `: ${course.attributes.abbreviated_title}` : ''}</p>
                    )}
                </h1>

                <table className="table-auto text-left w-fit">
                    <tbody>
                        <tr>
                            <th className='pr-4'>Course Format</th>
                            <td>
                                {course.attributes.hours_lecture !== null && course.attributes.hours_seminar !== null && course.attributes.hours_lab !== null ? (
                                    <>
                                        Lecture {course.attributes.hours_lecture.toFixed(1)} h +
                                        Seminar {course.attributes.hours_seminar.toFixed(1)} h +
                                        Lab {course.attributes.hours_lab.toFixed(1)} h
                                    </>
                                ) : 'N/A'}
                            </td>
                        </tr>

                        <tr>
                            <th>Credits</th>
                            <td>{course.attributes.credits !== null ? course.attributes.credits.toFixed(1) : 'N/A'}</td>
                        </tr>
                    </tbody>
                </table>

                {/* <h2 className="text-xl pt-2 pb-1">Course Description</h2> */}
                <div className='flex flex-col gap-2'>
                    {course.attributes.description ? (
                        <p>{addLinksToCourseDescription(course.attributes.description)}</p>
                    ) : (
                        <p>No description available for this course</p>
                    )}


                    {course.attributes.desc_duplicate_credit && (
                        <p>{addLinksToCourseDescription(course.attributes.desc_duplicate_credit)}</p>
                    )}

                    {course.attributes.desc_registration_restriction && (
                        <p>{addLinksToCourseDescription(course.attributes.desc_registration_restriction)}</p>
                    )}

                    {course.attributes.desc_prerequisite && (
                        <p>{addLinksToCourseDescription(course.attributes.desc_prerequisite)}</p>
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
                                <td className={`min-w-[50px] ${course.attributes.attr_ar ? 'bg-green-500' : ''}`}>{course.attributes.attr_ar === null ? '' : course.attributes.attr_ar ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr>
                                <th>2nd Year Science</th>
                                <td className={course.attributes.attr_sc ? 'bg-green-500' : ''}>{course.attributes.attr_sc === null ? '' : course.attributes.attr_sc ? 'Yes' : 'No'}</td>
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
                                <td className="min-w-[200px]">{course.attributes.offered_online === null ? 'Unknown' : course.attributes.offered_online ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr className="align-top">
                                <th>Preparatory course:</th>
                                <td className="min-w-[200px]">{course.attributes.preparatory_course === null ? 'Unknown' : course.attributes.preparatory_course ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr className="align-top">
                                <th>Repeat limit</th>
                                <td className="min-w-[200px]">{course.attributes.rpt_limit}</td>
                            </tr>
                            {/* <tr className="align-top">
                                <th className='pr-4'>Also known as:</th>
                                <td className="min-w-[200px]">{course.attributes.abbreviated_title}</td>
                            </tr> */}
                            <tr className="align-top">
                                <th className='pr-4'>Additional fees:</th>
                                <td className="min-w-[200px]">{course.attributes.add_fees ? `$${course.attributes.add_fees}` : ''}</td>
                            </tr>
                            <tr className="align-top">
                                <th>First offered:</th>
                                <td>{mapTerm(course.attributes.first_offered_term)} {course.attributes.first_offered_year}</td>
                            </tr>
                            <tr className={`align-top ${course.attributes.last_offered_year < new Date().getFullYear() - 5 ? 'bg-red-200' : ''}`}>
                                <th>Last offered:</th>
                                <td>{mapTerm(course.attributes.last_offered_term)} {course.attributes.last_offered_year}</td>
                            </tr>

                            <tr className="align-top">
                                <th className='pr-4'>Registration<br></br>restrictions:</th>
                                <td className="min-w-[200px]">{course.attributes.RP ? course.attributes.RP : ""}</td>
                            </tr>

                            <tr className="align-top">
                                <th>Outline(s):</th>
                                <td>
                                    {course.outlines.length > 0 ? (
                                        course.outlines.map((outline) => (
                                            <a key={outline.id} href={outline.url} className="text-blue-600 hover:text-blue-800 underline">
                                                <p>{outline.file_name}</p>
                                            </a>
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
                                                    return destinationCredits < transfer.source_credits ? 'bg-yellow-200' : '';
                                                }
                                            })()
                                            }`}>
                                            <td>{transfer.subject} {transfer.course_code}</td>
                                            <td>{transfer.destination_name.length > 35 ? transfer.destination : transfer.destination_name}</td>
                                            <td>{transfer.credit} {transfer.condition}</td>
                                            <td>{transfer.effective_start}{transfer.effective_end ? ` to ${transfer.effective_end}` : ' to present'}</td>
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
                                            <td>{transfer.subject} {transfer.course_code}</td>
                                            <td>{transfer.destination_name.length > 35 ? transfer.destination : transfer.destination_name}</td>

                                            <td>{transfer.credit} {transfer.condition}</td>

                                            <td>{transfer.effective_start}{transfer.effective_end ? ` to ${transfer.effective_end}` : ' to present'}</td>
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
                            course.sections.map((section) => (
                                section.schedule.map((schedule, index) => (
                                    <tr key={`${section.id}-${index}`} className={`
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