'use client';

import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import type { EventClickArg, DatesSetArg, DateSelectArg } from '@fullcalendar/core';

interface CalendarioEvento {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
  extendedProps?: Record<string, unknown>;
}

interface Props {
  eventos: CalendarioEvento[];
  onMesChange?: (data: Date) => void;
}

export default function Calendario({ eventos, onMesChange }: Props) {
  const router = useRouter();

  function handleDatesSet(arg: DatesSetArg) {
    onMesChange?.(arg.view.currentStart);
  }

  function handleEventClick(arg: EventClickArg) {
    const consulta = arg.event.extendedProps?.consulta as { id: number } | undefined;
    if (consulta) {
      router.push(`/consultas/${consulta.id}`);
    }
  }

  function handleDateSelect(arg: DateSelectArg) {
    const inicio = arg.startStr.slice(0, 16);
    router.push(`/agenda/nova-consulta?data=${encodeURIComponent(inicio)}`);
  }

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      locale={ptBrLocale}
      headerToolbar={{
        left:   'prev,next today',
        center: 'title',
        right:  'dayGridMonth,timeGridWeek,timeGridDay',
      }}
      events={eventos}
      datesSet={handleDatesSet}
      eventClick={handleEventClick}
      select={handleDateSelect}
      selectable
      slotMinTime="07:00:00"
      slotMaxTime="21:00:00"
      allDaySlot={false}
      height="auto"
      eventDisplay="block"
      eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
    />
  );
}
