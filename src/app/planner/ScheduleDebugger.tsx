'use client'

import React, { useState, useEffect } from 'react';
import { SavedSchedule, Section } from '@/types/Planner2';

interface ScheduleDebuggerProps {
  isOpen: boolean;
  onClose: () => void;
  currentScheduleId: string | null;
  selectedSections: Set<string>;
  allSections: Section[];
  currentYear: number;
  currentTerm: number;
}

const ScheduleDebugger: React.FC<ScheduleDebuggerProps> = ({
  isOpen,
  onClose,
  currentScheduleId,
  selectedSections,
  allSections,
  currentYear,
  currentTerm
}) => {
  const [savedSchedules, setSavedSchedules] = useState<SavedSchedule[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load saved schedules from localStorage
  useEffect(() => {
    const loadSchedules = () => {
      const saved = localStorage.getItem('langara-saved-schedules');
      if (saved) {
        try {
          const schedules = JSON.parse(saved);
          setSavedSchedules(schedules);
        } catch (e) {
          console.error('Failed to parse saved schedules:', e);
          setSavedSchedules([]);
        }
      } else {
        setSavedSchedules([]);
      }
    };

    if (isOpen) {
      loadSchedules();
    }
  }, [isOpen, refreshKey]);

  // Get current CRNs
  const getCurrentCRNs = (): string[] => {
    return Array.from(selectedSections)
      .map(sectionId => {
        const section = allSections.find(s => s.id === sectionId);
        return section?.crn.toString();
      })
      .filter((crn): crn is string => Boolean(crn));
  };

  // Get current section details
  const getCurrentSectionDetails = () => {
    return Array.from(selectedSections).map(sectionId => {
      const section = allSections.find(s => s.id === sectionId);
      return section ? {
        id: section.id,
        crn: section.crn,
        subject: section.subject,
        course_code: section.course_code,
        section: section.section
      } : { id: sectionId, error: 'Section not found' };
    });
  };

  const currentCRNs = getCurrentCRNs();
  const currentSectionDetails = getCurrentSectionDetails();
  const currentSchedule = savedSchedules.find(s => s.id === currentScheduleId);

  const clearAllSchedules = () => {
    if (confirm('Are you sure you want to delete ALL schedules? This cannot be undone.')) {
      localStorage.removeItem('langara-saved-schedules');
      localStorage.removeItem('langara-current-schedule-id');
      setRefreshKey(prev => prev + 1);
    }
  };

  const exportSchedules = () => {
    const data = {
      schedules: savedSchedules,
      currentScheduleId,
      currentYear,
      currentTerm,
      selectedSections: Array.from(selectedSections),
      currentCRNs,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedule-debug-${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Schedule Debug Information</h2>
          <div className="flex gap-2">
            <button
              onClick={exportSchedules}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              Export Data
            </button>
            <button
              onClick={clearAllSchedules}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Clear All
            </button>
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Refresh
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Current State */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Current State</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Current Schedule ID:</strong>
                <div className="font-mono text-xs mt-1 p-2 bg-gray-100 rounded">
                  {currentScheduleId || 'null'}
                </div>
              </div>
              <div>
                <strong>Current Semester:</strong>
                <div className="font-mono text-xs mt-1 p-2 bg-gray-100 rounded">
                  {currentYear} {currentTerm === 10 ? 'Spring' : currentTerm === 20 ? 'Summer' : 'Fall'} (Year: {currentYear}, Term: {currentTerm})
                </div>
              </div>
              <div>
                <strong>Selected Sections Count:</strong>
                <div className="font-mono text-xs mt-1 p-2 bg-gray-100 rounded">
                  {selectedSections.size}
                </div>
              </div>
              <div>
                <strong>Current CRNs:</strong>
                <div className="font-mono text-xs mt-1 p-2 bg-gray-100 rounded max-h-20 overflow-y-auto">
                  {currentCRNs.length > 0 ? currentCRNs.join(', ') : 'None'}
                </div>
              </div>
            </div>
          </div>

          {/* Current Schedule Details */}
          {currentSchedule && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Current Schedule Details</h3>
              <div className="text-sm space-y-2">
                <div><strong>Name:</strong> {currentSchedule.name}</div>
                <div><strong>ID:</strong> <span className="font-mono text-xs">{currentSchedule.id}</span></div>
                <div><strong>Semester:</strong> {currentSchedule.year} {currentSchedule.term === 10 ? 'Spring' : currentSchedule.term === 20 ? 'Summer' : 'Fall'}</div>
                <div><strong>Stored CRNs ({currentSchedule.crns.length}):</strong></div>
                <div className="font-mono text-xs p-2 bg-gray-100 rounded max-h-20 overflow-y-auto">
                  {currentSchedule.crns.length > 0 ? currentSchedule.crns.join(', ') : 'Empty schedule'}
                </div>
                <div><strong>Created:</strong> {new Date(currentSchedule.createdAt).toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* Current Section Details */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Current Selected Sections</h3>
            {currentSectionDetails.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {currentSectionDetails.map((section, index) => (
                  <div key={index} className="text-xs font-mono p-2 bg-gray-100 rounded">
                    {section.error ? (
                      <span className="text-red-600">Error: {section.error} (ID: {section.id})</span>
                    ) : (
                      <span>
                        {section.subject} {section.course_code} {section.section} - CRN: {section.crn} (ID: {section.id})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No sections currently selected</div>
            )}
          </div>

          {/* Data Consistency Check */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Data Consistency Check</h3>
            <div className="space-y-2 text-sm">
              <div className={`p-2 rounded ${currentSchedule && currentSchedule.year === currentYear && currentSchedule.term === currentTerm ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <strong>Semester Match:</strong> {currentSchedule ? 
                  (currentSchedule.year === currentYear && currentSchedule.term === currentTerm ? 
                    '✓ Schedule semester matches current semester' : 
                    `✗ Schedule is for ${currentSchedule.year} ${currentSchedule.term === 10 ? 'Spring' : currentSchedule.term === 20 ? 'Summer' : 'Fall'}, but current is ${currentYear} ${currentTerm === 10 ? 'Spring' : currentTerm === 20 ? 'Summer' : 'Fall'}`
                  ) : 
                  '? No current schedule'
                }
              </div>
              <div className={`p-2 rounded ${currentSchedule && JSON.stringify(currentSchedule.crns.sort()) === JSON.stringify(currentCRNs.sort()) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <strong>CRN Match:</strong> {currentSchedule ? 
                  (JSON.stringify(currentSchedule.crns.sort()) === JSON.stringify(currentCRNs.sort()) ? 
                    '✓ Stored CRNs match selected sections' : 
                    '✗ Stored CRNs do not match selected sections'
                  ) : 
                  '? No current schedule'
                }
              </div>
              <div className={`p-2 rounded ${localStorage.getItem('langara-current-schedule-id') === currentScheduleId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <strong>localStorage Sync:</strong> {localStorage.getItem('langara-current-schedule-id') === currentScheduleId ? 
                  '✓ localStorage matches state' : 
                  `✗ localStorage has "${localStorage.getItem('langara-current-schedule-id')}" but state has "${currentScheduleId}"`
                }
              </div>
            </div>
          </div>

          {/* All Saved Schedules */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">All Saved Schedules ({savedSchedules.length})</h3>
            {savedSchedules.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {savedSchedules.map((schedule) => (
                  <div key={schedule.id} className={`border rounded p-3 text-sm ${schedule.id === currentScheduleId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <strong>{schedule.name}</strong>
                        {schedule.id === currentScheduleId && <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">CURRENT</span>}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(schedule.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div><strong>ID:</strong> <span className="font-mono">{schedule.id}</span></div>
                      <div><strong>Semester:</strong> {schedule.year} {schedule.term === 10 ? 'Spring' : schedule.term === 20 ? 'Summer' : 'Fall'}</div>
                      <div><strong>CRNs ({schedule.crns.length}):</strong></div>
                      <div className="font-mono p-2 bg-gray-100 rounded max-h-16 overflow-y-auto">
                        {schedule.crns.length > 0 ? schedule.crns.join(', ') : 'Empty schedule'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No schedules found</div>
            )}
          </div>

          {/* localStorage Raw Data */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Raw localStorage Data</h3>
            <div className="space-y-3">
              <div>
                <strong>langara-saved-schedules:</strong>
                <pre className="text-xs font-mono p-2 bg-gray-100 rounded mt-1 max-h-32 overflow-auto">
                  {localStorage.getItem('langara-saved-schedules') || 'null'}
                </pre>
              </div>
              <div>
                <strong>langara-current-schedule-id:</strong>
                <pre className="text-xs font-mono p-2 bg-gray-100 rounded mt-1">
                  {localStorage.getItem('langara-current-schedule-id') || 'null'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDebugger;
