'use client';
import Link from 'next/link';
import { JSX, useEffect, useState } from 'react';

interface CourseAttributes {
    credits: number;
    title: string;
    desc_replacement_course: string;
    description: string;
    desc_duplicate_credit: string;
    desc_registration_restriction: string;
    desc_prerequisite: string;
    hours_lecture: number;
    hours_seminar: number;
    hours_lab: number;
    offered_online: boolean;
    preparatory_course: boolean;
    RP: string;
    abbreviated_title: string;
    add_fees: number;
    rpt_limit: number;
    attr_ar: boolean;
    attr_sc: boolean;
    attr_hum: boolean;
    attr_lsc: boolean;
    attr_sci: boolean;
    attr_soc: boolean;
    attr_ut: boolean;
    first_offered_year: number;
    first_offered_term: number;
    last_offered_year: number;
    last_offered_term: number;
    on_langara_website: boolean;
    discontinued: boolean;
    transfer_destinations: string;
}

interface CourseSectionSchedule {
    type: string;
    days: string;
    time: string;
    start: string | null;
    end: string | null;
    room: string;
    instructor: string;
    id: string;
}

interface CourseSection {
    id: string;
    crn: number;
    RP: string;
    seats: string;
    waitlist: string;
    section: string;
    credits: number;
    abbreviated_title: string;
    add_fees: string | null;
    rpt_limit: number;
    notes: string;
    subject: string;
    course_code: string;
    year: number;
    term: number;
    schedule: CourseSectionSchedule[];
}

interface CourseTransfer {
    id: string;
    source: string;
    source_credits: number;
    source_title: string;
    destination: string;
    destination_name: string;
    credit: string;
    condition: string | null;
    effective_start: string;
    effective_end: string | null;
    subject: string;
    course_code: string;
}

interface CourseOutline {
    url: string;
    file_name: string;
    id: string;
}

interface Course {
    subject: string;
    course_code: string;
    id: string;
    attributes: CourseAttributes;
    sections: CourseSection[];
    transfers: CourseTransfer[];
    outlines: CourseOutline[];
}

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

// yes i am aware that this function is kind of cursed
// (because it was translated from python by chatgpt)
// BUT IT WORKS OK. AND THAT IS THE MOST IMPORTANT THING.
const addLinksToCourseDescription = (text: string): JSX.Element => {
    const SUS_SEPARATOR = "🏺";
    const replacementValues = " .,;/()[]";
    let textSplit = text;

    for (const char of replacementValues) {
        textSplit = textSplit.split(char).join(`${SUS_SEPARATOR}${char}${SUS_SEPARATOR}`);
    }

    const words = textSplit.split(SUS_SEPARATOR);
    const ARBITRARY_BIG_NUMBER = 1000000;
    let currentSubject = "";
    let distanceSinceSubjectUpdate = ARBITRARY_BIG_NUMBER;

    const parts: (string | JSX.Element | null)[] = [];

    words.forEach((word, index) => {
        if (/^[A-Z]{4,8}$/.test(word)) {
            currentSubject = word;
            distanceSinceSubjectUpdate = -1;
        }

        distanceSinceSubjectUpdate += 1;

        if (/^\d{4}$/.test(word)) {
            if (distanceSinceSubjectUpdate < ARBITRARY_BIG_NUMBER) {
                parts[parts.length - distanceSinceSubjectUpdate] = null;
                parts.push(
                    <a key={`${index}-${word}`} href={`/courses/${currentSubject}/${word}`} className="text-black hover:text-[#f15a22] underline transition-colors duration-200 ease-in">
                        {currentSubject} {word}
                    </a>
                );
                distanceSinceSubjectUpdate = ARBITRARY_BIG_NUMBER;
            } else {
                parts.push(
                    <a key={`${index}-${word}`} href={`/courses/${currentSubject}/${word}`} className="text-black hover:text-[#f15a22] underline transition-colors duration-200 ease-in">
                        {word}
                    </a>
                );
            }
        } else {
            parts.push(word);
        }
    });

    return <>{parts.filter(part => part !== null)}</>;
};

export default function CourseInfo({
    subject,
    course_code,
}: {
    subject: string;
    course_code: string;
}) {
    const [course, setCourse] = useState<Course | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [validTransfers, setValidTransfers] = useState<CourseTransfer[]>([]);
    const [oldTransfers, setOldTransfers] = useState<CourseTransfer[]>([]);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await fetch(
                    `https://coursesapi.langaracs.ca/v1/courses/${subject}/${course_code}`
                );
                if (!response.ok) {
                    throw new Error(`Failed to fetch course data: ${response.statusText}`);
                }
                const data = await response.json();
                setCourse(data);

                // show agreements that expired up to two years ago
                const transferDateCutoff = new Date();
                transferDateCutoff.setMonth(transferDateCutoff.getMonth() + 24);

                const validTransfers: CourseTransfer[] = [];
                const oldTransfers: CourseTransfer[] = [];

                data.transfers.forEach((transfer_agreement: CourseTransfer) => {
                    if (transfer_agreement.effective_end == null || new Date(transfer_agreement.effective_end) > transferDateCutoff) {
                        validTransfers.push(transfer_agreement);
                    } else {
                        oldTransfers.push(transfer_agreement);
                    }
                });

                setValidTransfers(validTransfers);
                setOldTransfers(oldTransfers);

                data.sections = data.sections.reverse();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [subject, course_code]); // Add dependencies here

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
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
                        <Link href={`https://langara.ca/programs-and-courses/courses/${course.subject}/${course.course_code}.html`} className="text-[#f15a22] transition-colors duration-200 ease-in hover:text-black hover:underline">
                            <p>{course.subject} {course.course_code}: {course.attributes.title}</p>

                        </Link>
                    ) : (
                        <>{course.subject} {course.course_code}: {course.attributes.title}</>
                    )}
                </h1>

                <table className="table-auto text-left w-fit">
                    <tbody>
                        {(course.attributes.hours_lecture !== null || course.attributes.hours_seminar !== null || course.attributes.hours_lab !== null) && (
                            <tr>
                                <th className='pr-4'>Course Format</th>
                                <td>Lecture {course.attributes.hours_lecture.toFixed(1)} h + Seminar {course.attributes.hours_seminar.toFixed(1)} h + Lab {course.attributes.hours_lab.toFixed(1)} h</td>
                            </tr>
                        )}
                        <tr>
                            <th>Credits</th>
                            <td>{course.attributes.credits.toFixed(1)}</td>
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
                                <td className={course.attributes.attr_ar ? 'bg-green-500' : ''}>{course.attributes.attr_ar === null ? 'Unknown' : course.attributes.attr_ar ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr>
                                <th>2nd Year Science</th>
                                <td className={course.attributes.attr_sc ? 'bg-green-500' : ''}>{course.attributes.attr_sc === null ? 'Unknown' : course.attributes.attr_sc ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr>
                                <th>Humanities</th>
                                <td className={course.attributes.attr_hum ? 'bg-green-500' : ''}>{course.attributes.attr_hum === null ? 'Unknown' : course.attributes.attr_hum ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr>
                                <th>Lab Science</th>
                                <td className={course.attributes.attr_lsc ? 'bg-green-500' : ''}>{course.attributes.attr_lsc === null ? 'Unknown' : course.attributes.attr_lsc ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr>
                                <th>Science</th>
                                <td className={course.attributes.attr_sci ? 'bg-green-500' : ''}>{course.attributes.attr_sci === null ? 'Unknown' : course.attributes.attr_sci ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr>
                                <th>Social Science</th>
                                <td className={course.attributes.attr_soc ? 'bg-green-500' : ''}>{course.attributes.attr_soc === null ? 'Unknown' : course.attributes.attr_soc ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr>
                                <th>University<br />Transferable</th>
                                <td className={course.attributes.attr_ut ? 'bg-green-500' : ''}>{course.attributes.attr_ut === null ? 'Unknown' : course.attributes.attr_ut ? 'Yes' : 'No'}</td>
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

                <details>
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