import { Schedule, Section } from '../types/Section';

const DAYS_MAP: { [key: string]: number } = {
  'M': 1, // Monday
  'T': 2, // Tuesday
  'W': 3, // Wednesday
  'R': 4, // Thursday
  'F': 5, // Friday
};

const TYPE_COLORS: { [key: string]: string } = {
  'LEC': '#3788d8',
  'LAB': '#38b000',
  'TUT': '#9d4edd',
  'SEM': '#ff6b6b',
};

export function convertScheduleToEvents(sections: Section[]) {
  const events: {
    title: string;
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
    backgroundColor: string;
    borderColor: string;
    extendedProps: {
      instructor: string;
      type: string;
      section: string;
    };
  }[] = [];

  sections.forEach(section => {
    section.schedule.forEach(schedule => {
      const scheduleEvents = createEventsFromSchedule(schedule, section);
      events.push(...scheduleEvents);
    });
  });

  return events;
}

function createEventsFromSchedule(schedule: Schedule, section: Section) {
  const events: {
    title: string;
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
    backgroundColor: string;
    borderColor: string;
    extendedProps: {
      instructor: string;
      type: string;
      section: string;
    };
  }[] = [];
  const days = schedule.days.split('');
  const [startTime, endTime] = schedule.time.split('-');

  days.forEach((day) => {
    if (day !== '-' && DAYS_MAP[day]) {
      events.push({
        title: `${section.subject} ${section.course_code}\n${schedule.type}`,
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
        daysOfWeek: [DAYS_MAP[day]],
        backgroundColor: TYPE_COLORS[schedule.type] || '#666',
        borderColor: TYPE_COLORS[schedule.type] || '#666',
        extendedProps: {
          instructor: schedule.instructor,
          type: schedule.type,
          section: section.section
        }
      });
    }
  });

  return events;
}

function formatTime(time: string): string {
  return `${time.slice(0, 2)}:${time.slice(2)}:00`;
}