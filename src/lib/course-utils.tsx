import React, { JSX } from 'react';

// yes i am aware that this function is kind of cursed
// (because it was translated from python by chatgpt)
// BUT IT WORKS OK. AND THAT IS THE MOST IMPORTANT THING.
export function addLinksToCourseDescription(text: string): JSX.Element {
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

        if (/^\d{4}$/.test(word) && currentSubject) {
            if (distanceSinceSubjectUpdate < ARBITRARY_BIG_NUMBER) {
                parts[parts.length - distanceSinceSubjectUpdate] = null;
                parts.push(
                    <a
                        key={`${index}-${word}`}
                        href={`/courses/${currentSubject.toLowerCase()}-${word.toLowerCase()}`}
                        className="text-black hover:text-[#f15a22] underline transition-colors duration-200 ease-in"
                    >
                        {currentSubject} {word}
                    </a>
                );
                distanceSinceSubjectUpdate = ARBITRARY_BIG_NUMBER;
            } else {
                parts.push(
                    <a
                        key={`${index}-${word}`}
                        href={`/courses/${currentSubject.toLowerCase()}-${word.toLowerCase()}`}
                        className="text-black hover:text-[#f15a22] underline transition-colors duration-200 ease-in"
                    >
                        {word}
                    </a>
                );
            }
        } else {
            parts.push(word);
        }
    });

    return <>{parts.filter(part => part !== null)}</>;
}