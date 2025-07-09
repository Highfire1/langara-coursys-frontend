'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CoursePlanner from "./CoursePlanner";
import { plannerApi } from '@/lib/planner-api';
import { SavedSchedule } from '@/types/Planner2';

const PlannerClient = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [initialState, setInitialState] = useState<{
    year?: number;
    term?: number;
    selectedSections?: Set<string>;
    scheduleId?: string;
  } | null>(null);
  const [isProcessingUrl, setIsProcessingUrl] = useState(true);

  useEffect(() => {
    const processUrlParams = async () => {
      const urlYear = searchParams.get('y');
      const urlTerm = searchParams.get('t');
      const urlCrns = searchParams.get('crns');

      if (urlYear && urlTerm && urlCrns) {
        try {
          const year = parseInt(urlYear);
          const term = parseInt(urlTerm);
          const crns = urlCrns.split(',').filter(Boolean);
          
          console.log('Processing shared link:', { year, term, crns });
          
          // Load courses for the specified semester
          const coursesData = await plannerApi.getCoursesForSemester(year, term);
          
          // Find sections by CRN
          const foundSections = new Set<string>();
          coursesData.courses.forEach(course => {
            course.sections.forEach(section => {
              if (crns.includes(section.crn.toString())) {
                console.log('Found matching section:', section.crn, section.id);
                foundSections.add(section.id);
              }
            });
          });
          
          console.log('Found sections to select:', foundSections);
          
          // Create a new schedule for the shared link
          const newSchedule: SavedSchedule = {
            id: `shared-${Date.now()}`,
            name: `Shared Schedule`,
            year,
            term,
            crns,
            createdAt: Date.now()
          };
          
          // Save the new schedule to localStorage
          const saved = localStorage.getItem('langara-saved-schedules');
          let schedules: SavedSchedule[] = [];
          if (saved) {
            try {
              schedules = JSON.parse(saved);
            } catch (e) {
              console.error('Failed to load saved schedules:', e);
            }
          }
          
          schedules.push(newSchedule);
          localStorage.setItem('langara-saved-schedules', JSON.stringify(schedules));
          
          // Set initial state for CoursePlanner
          setInitialState({
            year,
            term,
            selectedSections: foundSections,
            scheduleId: newSchedule.id
          });
          
          // Clean up URL parameters
          router.replace('/planner', { scroll: false });
          
          console.log('Shared schedule processed successfully with', foundSections.size, 'sections');
          
        } catch (error) {
          console.error('Failed to process shared schedule:', error);
          setInitialState(null);
        }
      } else {
        setInitialState(null);
      }
      
      setIsProcessingUrl(false);
    };

    processUrlParams();
  }, [searchParams, router]);

  // Show loading state while processing URL params
  if (isProcessingUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-lg">Loading shared schedule...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <div>
        <CoursePlanner initialState={initialState} />
      </div>
    </div>
  );
};

export default PlannerClient;
