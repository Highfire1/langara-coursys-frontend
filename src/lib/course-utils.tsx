import Link from 'next/link';
import React, { JSX } from 'react';

function isCourseInList(subject: string, courseCode: string, courseList: string[]): boolean {
    const courseKey = `${subject}-${courseCode}`.toLowerCase();
    return courseList.includes(courseKey);
}



// yes i am aware that this function is kind of cursed
// (because it was translated from python by chatgpt)
// BUT IT WORKS OK. AND THAT IS THE MOST IMPORTANT THING.
export function addLinksToCourseDescription(text: string, courseList: string[]): JSX.Element {
    const SUS_SEPARATOR = "🏺";
    const replacementValues = " .,;/()[]\n";
    let textSplit = text;
    // console.log(text)
    // console.log(courseList)

    for (const char of replacementValues) {
        textSplit = textSplit.split(char).join(`${SUS_SEPARATOR}${char}${SUS_SEPARATOR}`);
    }

    const words = textSplit.split(SUS_SEPARATOR);
    let currentSubject: string | null = null;
    let indexOfCurrentSubject = -1;

    const parts: (string | JSX.Element | null)[] = [];

    words.forEach((word, index) => {
        // console.log(index, word)
        if (/^[A-Z]{4,8}$/.test(word)) {
            currentSubject = word;
            // so we can remove the subject from the parts array
            // and readd it inside the link
            indexOfCurrentSubject = index;
            parts.push(word);
            return
        }
        
        // bandaid fix for "Discontinued Fall 2014"
        if (word == "Fall" || word == "Spring" || word == "Summer") {
            currentSubject = null;
            indexOfCurrentSubject = -1;
        }


        if (currentSubject && /^\d{4}$/.test(word)) {
            // console.log("course code found", word);

            if (!isCourseInList(currentSubject, word, courseList)) {
                
                parts.push(
                    <span
                        key={index}
                        className=' hover:text-gray-500 transition-colors duration-200 ease-in text-red'
                        title={`${currentSubject} ${word} does not exist.`}
                    >
                        {indexOfCurrentSubject != -1 ? `${currentSubject} ${word}` : word}
                    </span>
                );

            } else {

                parts.push(
                    <Link
                        key={index}
                        href={`/courses/${currentSubject.toLowerCase()}-${word.toLowerCase()}`}
                        className="hover:text-[#f15a22] underline transition-colors duration-200 ease-in"
                        title=''
                    >
                        {indexOfCurrentSubject != -1 ? `${currentSubject} ${word}` : word}
                    </Link>
                );

            }

            parts[indexOfCurrentSubject] = null;
            indexOfCurrentSubject = -1

        } else if (word == "\n") {
            parts.push(<br key={`${index}`} />);
        } else {
            parts.push(word);
        }
    });

    return <>{parts.filter(part => part !== null)}</>;
}