'use client'

import { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Section } from '../../types/Section';
import { convertScheduleToEvents, generateHiddenDays, generateSlotTimes } from '@/utils/calendarHelper';

interface CalendarProps {
  currentTimetable: Section[];
}

const Calendar = ({ currentTimetable }: CalendarProps) => {
  const calendarRef = useRef<FullCalendar>(null);
  const events = convertScheduleToEvents(currentTimetable);
  const hiddenDays = generateHiddenDays(currentTimetable);
  const { slotMinTime, slotMaxTime } = generateSlotTimes(currentTimetable);

  return (
    <>
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin]}
        // makes calendar flicker because we are destroying and recreating the calendar on each render
        // rerenderDelay={5} 
        height={"100%"}
        timeZone='America/Vancouver'
        initialView="timeGridWeek"
        slotMinTime={slotMinTime}
        slotMaxTime={slotMaxTime}
        displayEventTime={true}
        hiddenDays={hiddenDays}
        allDaySlot={false}
        headerToolbar={false}
        slotDuration={'00:60:00'}
        expandRows={true}
        dayHeaderFormat={{ weekday: 'long' }}
        events={events}
        eventContent={(eventInfo) => {
          return (
            <>
              <div className="fc-event-main-frame">
                <div className="fc-event-title-container">
                  <div className="fc-event-title"><strong>{eventInfo.event.title}</strong></div>
                  <div className="text-xs">
                    {eventInfo.event.extendedProps.instructor}
                  </div>
                </div>
              </div>
            </>
          )
        }}
      />
    </>
  );
}

export default Calendar;