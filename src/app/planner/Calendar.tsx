'use client'

import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid'; 
import timeGridPlugin from '@fullcalendar/timegrid';

const Calendar = () => {
  return (
    <FullCalendar
      plugins={[ timeGridPlugin ]}
    //   schedulerLicenseKey='CC-Attribution-NonCommercial-NoDerivatives'
      rerenderDelay={5}
      height={"100%"}
      timeZone='America/Vancouver'
      initialView="timeGridWeek"
      slotMinTime="07:00"
      slotMaxTime="19:00"
      displayEventTime={false}
      hiddenDays={[ 0, 6 ]}
      allDaySlot={false}
      events={[
        { title: 'event 1', date: '2024-12-11' },
        { title: 'event 2', date: '2024-12-14' }
      ]}
    />
  );
}

export default Calendar;


