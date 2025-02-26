import { Schedule, Section } from '../types/Section';

// ASSUMPTION: sunday doesn't exist
const DAYS_MAP: { [key: string]: number } = {
  'M': 1, // Monday
  'T': 2, // Tuesday
  'W': 3, // Wednesday
  'R': 4, // Thursday
  'F': 5, // Friday
  'S': 6, // Saturday
};

// Function to generate a color based on the course subject and course code
export function generateColor(subject: string, courseCode: string): string {
  const input = `${subject}${courseCode}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360; // Use the hash to generate a hue value between 0 and 360
  const saturation = 70; // Fixed saturation value
  const lightness = 70; // Fixed lightness value
  return `hsl(${hue},${saturation}%,${lightness}%)`;
}

export function convertScheduleToEvents(sections: Section[]) {
  const events: {
    title: string;
    startTime?: string;
    endTime?: string;
    daysOfWeek: number[];
    backgroundColor: string;
    borderColor: string;
    start?: string;
    end?: string;
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

export function generateHiddenDays(sections: Section[]) {
  
  let hasSaturday = false;
  sections.forEach(section => {
    section.schedule.forEach(schedule => {
      if (schedule.days.includes('S')) {
        hasSaturday = true;
      }
    });
  });
  
  return hasSaturday ? [0] : [0, 6];
}

// generate calendar start and end time
// default is 8 am to 10 pm but it automagically updates hours to fit all sections
// e.g. if there is a class that starts at 7:30 am, the calendar will start at 7 am
// and if there is a class that ends at 10:30 pm, the calendar will end at 11 pm
export function generateSlotTimes(sections: Section[]) {
  let earliestTime = 830;  // Default to 8 AM
  let latestTime = 2230;   // Default to 10 PM

  sections.forEach(section => {
    section.schedule.forEach(schedule => {
      if (!schedule.time) return;
      
      const [start, end] = schedule.time.split('-').map(t => parseInt(t || '1830'));
      
      if (start && !isNaN(start)) {
        earliestTime = Math.min(earliestTime, start);
      }
      if (end && !isNaN(end)) {
        latestTime = Math.max(latestTime, end);
      }
    });
  });

  // Convert to HH:mm format and adjust by 30 minutes
  let minTime = formatTime(adjustTime(earliestTime.toString().padStart(4, '0'), -30));
  let maxTime = formatTime(adjustTime(latestTime.toString().padStart(4, '0'), 30));

  // If minTime ends in 30, subtract another 30 minutes and add an hour
  if (minTime.includes(':30')) {
    const adjusted = new Date(`2000-01-01T${minTime}`);
    adjusted.setHours(adjusted.getHours() + 1);
    adjusted.setMinutes(0);
    minTime = adjusted.toTimeString().slice(0, 8);
  }

  // If maxTime ends in 30, substract 30 minutes and add an hour
  if (maxTime.includes(':30')) {
    const adjusted = new Date(`2000-01-01T${maxTime}`);
    adjusted.setHours(adjusted.getHours() + 1);
    adjusted.setMinutes(0);
    maxTime = adjusted.toTimeString().slice(0, 8);
  }

  return {
    slotMinTime: minTime,
    slotMaxTime: maxTime
  };
}

function adjustTime(time: string, minutes: number): string {
  const hour = parseInt(time.slice(0, 2));
  const minute = parseInt(time.slice(2));
  const date = new Date(0, 0, 0, hour, minute + minutes);
  
  return `${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}`;
}



function createEventsFromSchedule(schedule: Schedule, section: Section) {
  const events: {
    title: string;
    startTime?: string;
    endTime?: string;
    daysOfWeek: number[];
    backgroundColor: string;
    borderColor: string;
    start?: string;
    end?: string;
    extendedProps: {
      instructor: string;
      type: string;
      section: string;
    };
  }[] = [];
  const days = schedule.days.split('');
  const [startTime, endTime] = schedule.time.split('-');
  const color = generateColor(section.subject, section.course_code);

  days.forEach((day) => {
    if (day !== '-' && DAYS_MAP[day]) {
      const event: {
        title: string;
        startTime?: string;
        endTime?: string;
        daysOfWeek: number[];
        backgroundColor: string;
        borderColor: string;
        textColor: string; 
        start?: string;
        end?: string;
        extendedProps: {
          instructor: string;
          type: string;
          section: string;
        };
      } = {
        title: `${section.subject} ${section.course_code}\n${schedule.type}`,
        daysOfWeek: [DAYS_MAP[day]],
        backgroundColor: color,
        borderColor: color,
        textColor: 'black',
        extendedProps: {
          instructor: schedule.instructor,
          type: schedule.type,
          section: section.section
        },
      };


      // not technically correct, but its close enough
      // if you set a recuring time fullcalendar breaks and renders exams every week
      // even if start and end are defined?
      // honestly not sure whats happening here
      const event_is_one_day = schedule.start !== null && schedule.end !== null && schedule.start === schedule.end;

      if (!event_is_one_day) {
        event.startTime = formatTime(startTime);
        event.endTime = formatTime(endTime);
      }

      if (schedule.start) {
        event.start = `${schedule.start}`;
      }

      if (schedule.end) {
        event.end = `${schedule.end}`;
      }

      events.push(event);
    }
  });

  return events;
}

function formatTime(time: string): string {
  return `${time.slice(0, 2)}:${time.slice(2)}:00`;
}