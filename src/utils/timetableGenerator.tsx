import { CourseInternal } from '../types/Course';
import { Section, Schedule } from '../types/Section';

// Convert day string (M------) to array of day numbers (0 = Monday)
function getDays(dayStr: string): number[] {
  const days: number[] = [];
  // const dayMap = ['M', 'T', 'W', 'R', 'F', 'S', 'U'];
  for (let i = 0; i < dayStr.length; i++) {
    if (dayStr[i] !== '-') {
      days.push(i);
    }
  }
  return days;
}

// Convert time string (1830-2120) to minutes from midnight
function timeToMinutes(time: string): { start: number; end: number } {
  const [start, end] = time.split('-');
  return {
    start: parseInt(start.slice(0, 2)) * 60 + parseInt(start.slice(2)),
    end: parseInt(end.slice(0, 2)) * 60 + parseInt(end.slice(2))
  };
}

// Check if two schedules conflict
function hasConflict(schedule1: Schedule, schedule2: Schedule): boolean {
  // If either schedule is an exam, there is no conflict
  if (schedule1.type === "Exam" || schedule2.type === "Exam") {
    return false;
  }

  const days1 = getDays(schedule1.days);
  const days2 = getDays(schedule2.days);
  
  const time1 = timeToMinutes(schedule1.time);
  const time2 = timeToMinutes(schedule2.time);

  // Check if schedules share any days
  const commonDays = days1.filter(day => days2.includes(day));
  if (commonDays.length === 0) return false;

  // Check if times overlap
  return !(time1.end <= time2.start || time2.end <= time1.start);
}

// Check if a section conflicts with selected sections
function sectionConflicts(section: Section, selectedSections: Section[]): boolean {
  for (const selected of selectedSections) {
    for (const schedule1 of section.schedule) {
      for (const schedule2 of selected.schedule) {
        if (hasConflict(schedule1, schedule2)) {
          return true;
        }
      }
    }
  }
  return false;
}

export function generateTimetables(courses: CourseInternal[], maxTimetables: number = 999): Section[][] {
  const timetables: Section[][] = [];
  // Filter out hidden courses and sections
  const visibleCourses: CourseInternal[] = JSON.parse(JSON.stringify(courses.filter(course => !course.hidden)));
  visibleCourses.forEach(course => {
    course.sections_enhanced = course.sections_enhanced.filter(
      section => !section.hidden && !section.hidden_by_pin && !(section.seats === "Cancel")
    );
  });
  // Remove the filtering here (leave this empty)
  
  if (visibleCourses.length === 0) return timetables;
  
  function backtrack(courseIndex: number, currentTimetable: Section[]) {
    if (timetables.length >= maxTimetables) return;
    if (courseIndex === visibleCourses.length) {
      timetables.push([...currentTimetable]);
      return;
    }

    const course = visibleCourses[courseIndex];
    for (const section of course.sections_enhanced) {
      if (!sectionConflicts(section, currentTimetable)) {
        currentTimetable.push(section);
        backtrack(courseIndex + 1, currentTimetable);
        currentTimetable.pop();
      }
    }
  }

  backtrack(0, []);
  return timetables;
}