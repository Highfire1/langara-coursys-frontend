'use client'

import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Section } from '../../types/Section';
import { convertScheduleToEvents } from '@/utils/calendarHelper';

interface CalendarProps {
  currentTimetable: Section[];
}

const Calendar = ({ currentTimetable }: CalendarProps) => {
  const events = convertScheduleToEvents(currentTimetable);

  return (
    <FullCalendar
      plugins={[timeGridPlugin]}
      rerenderDelay={5}
      height={"100%"}
      timeZone='America/Vancouver'
      initialView="timeGridWeek"
      slotMinTime="07:00"
      slotMaxTime="22:00"
      displayEventTime={true}
      hiddenDays={[0, 6]}
      allDaySlot={false}
      events={events}
      eventContent={(eventInfo) => {
        return (
          <>
            <div className="fc-event-main-frame">
              <div className="fc-event-title-container">
                <div className="fc-event-title">{eventInfo.event.title}</div>
                <div className="text-xs">
                  {eventInfo.event.extendedProps.instructor}
                </div>
              </div>
            </div>
          </>
        )
      }}
    />
  );
}

export default Calendar;