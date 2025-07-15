import React from 'react';
import { Section, Schedule } from '@/types/Planner2';
import Link from 'next/link';

interface EventDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  eventData: {
    courseCode: string;
    title: string;
    sectionNumber: string;
    crn: string;
  } | null;
  allSections: Section[];
}

const EventDetailsPopup: React.FC<EventDetailsPopupProps> = ({
  isOpen,
  onClose,
  eventData,
  allSections
}) => {
  if (!isOpen || !eventData) return null;

  const { courseCode, sectionNumber, crn } = eventData;

  // Find the section to get additional details
  const section = allSections.find(s => s.crn.toString() === crn.toString());
  if (!section) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
        <div
          className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-semibold text-red-600 mb-4">Error</h3>
          <p className="text-gray-800">
            Something catastrophic happened. Please file a bug report.
          </p>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  console.log(eventData)
  console.log(section)

  return (
    <div
      className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(249, 250, 251, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-2 border-b">
          <h3 className="text-xl font-semibold text-gray-800">Section Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-2 space-y-2">
          {/* Course Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-blue-900 mb-2">
              <Link
                href={`/courses/${section.subject}-${section.course_code}`.toLowerCase()}
                target="_blank"
                className='text-blue-600 hover:underline'
              >
                {courseCode} {sectionNumber}: {section?.abbreviated_title}
              </Link>
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">CRN:</span>
                <span className="ml-2 text-gray-800">{crn}</span>
              </div>
              <div></div> {/* spacer */}
              {section && (
                <>
                  <div>
                    <span className="font-medium text-gray-600">Seats:</span>
                    <span className="ml-2 text-gray-800">{section.seats}</span>
                  </div>

                  {section.waitlist && section.waitlist !== " " && (
                    <div>
                      <span className="font-medium text-gray-600">Waitlist:</span>
                      <span className="ml-2 text-gray-800">{section.waitlist}</span>
                    </div>
                  )}

                </>
              )}

            </div>
          </div>

          {/* Section Details */}
          {section && (
            <>
              {section.schedule && section.schedule.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="text-gray-800 mb-3">Schedule:</h5>
                  <div className="space-y-3">
                    <table className="table-auto w-full text-sm text-left text-gray-800">
                      <thead>
                      <tr className="bg-gray-200">
                        <th className="px-2 py-2">Days</th>
                        <th className="px-2 py-2">Time</th>
                        <th className="px-2 py-2">Room</th>
                        <th className="px-2 py-2">Type</th>
                        <th className="px-2 py-2">Instructor</th>
                      </tr>
                      </thead>
                      <tbody>
                      {section.schedule.map((schedule: Schedule, idx: number) => (
                        <tr key={idx} className="border-t">
                        <td className="px-2 py-2 text-nowrap font-mono">{schedule.days}</td>
                        <td className="px-2 py-2 font-mono">{schedule.time}</td>
                        <td className="px-2 py-2">{schedule.room}</td>
                        <td className="px-2 py-2">{schedule.type}</td>
                        <td className="px-2 py-2">{schedule.instructor}</td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="py-2 px-6 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPopup;
