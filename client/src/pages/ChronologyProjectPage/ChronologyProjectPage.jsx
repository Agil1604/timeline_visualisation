import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import styles from './ChronologyProjectPage.module.css';
import { projectService } from '../../services/ProjectService';
import ProjectTitle from '../../components/ProjectTitle/ProjectTitle';
import { useProjectUpdate } from '../../hooks/useUpdateProjectTitle';
import { useProjectSave } from '../../hooks/useProjectSave';

import HelpButton from '../../components/HelpButton/HelpButton';
import HelpContent from './HelpContent';
import Toolbar from './Toolbar';
import EventToolbar from './EventToolbar';

const ChronologyProjectPage = () => {
  const { project: projectId } = useParams();
  const [title, setTitle] = useState('История развития проекта');
  const [events, setEvents] = useState([]);
  const [originalEvents, setOriginalEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const eventsWithMoveInfo = events.map((event, index, array) => {
    const eventsInSameYear = array.filter(e => e.year === event.year);
    const currentIndexInYear = eventsInSameYear.findIndex(e => e.id === event.id);

    return {
      ...event,
      canMoveUp: currentIndexInYear > 0,
      canMoveDown: currentIndexInYear < eventsInSameYear.length - 1
    };
  });

  const sortedEvents = eventsWithMoveInfo.sort((a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    }
    return a.order - b.order;
  });

  useEffect(() => {
    const loadProject = async () => {
      try {
        const projectData = await projectService.getProject(projectId);
        setTitle(projectData.title);
        setEvents(projectData.milestones);
        setOriginalEvents(projectData.milestones);
      } catch (error) {
        console.error('Ошибка загрузки проекта:', error);
      }
    };

    if (projectId) loadProject();
  }, [projectId]);

  const { updateTitle } = useProjectUpdate(projectId);
  const handleTitleChange = (newTitle) => updateTitle(newTitle, setTitle);

  const hasUnsavedChanges = useCallback(() => {
    if (!projectId) return false;

    const hasNewEvents = events.some(event =>
      !originalEvents.find(oe => oe.id === event.id)
    );

    const hasUpdatedEvents = events.some(event => {
      const original = originalEvents.find(oe => oe.id === event.id);
      return original && (
        original.year !== event.year ||
        original.title !== event.title ||
        original.description !== event.description ||
        original.order !== event.order
      );
    });

    const hasDeletedEvents = originalEvents.some(oe =>
      !events.find(event => event.id === oe.id)
    );

    return hasNewEvents || hasUpdatedEvents || hasDeletedEvents;
  }, [projectId, events, originalEvents]);

  const handleSave = useCallback(async () => {
    if (!projectId) return;

    const payload = {
      created: events
        .filter(event => (event.id <= 0))
        .map(event => ({
          year: event.year,
          title: event.title,
          description: event.description,
          order: event.order,
        })),
      updated: events
        .filter(event => (event.id >= 0))
        .filter(event => {
          const original = originalEvents.find(oe => oe.id === event.id);
          return original && (
            original.year !== event.year ||
            original.title !== event.title ||
            original.description !== event.description ||
            original.order !== event.order
          );
        })
        .map(event => ({
          id: event.id,
          year: event.year,
          title: event.title,
          description: event.description,
          order: event.order,
        })),
      deleted: originalEvents
        .filter(oe => !events.find(event => event.id === oe.id))
        .map(oe => ({ id: oe.id })),
      settings: { type: "type1" }
    };

    try {
      await projectService.updateProject(projectId, payload);

      const projectData = await projectService.getProject(projectId);
      setEvents(projectData.milestones);
      setOriginalEvents(projectData.milestones);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  }, [projectId, events, originalEvents]);

  useProjectSave(projectId, handleSave, hasUnsavedChanges);

  const onAddEvent = (newEvent) => {
    const sameYearEvents = events.filter(event => event.year === newEvent.year);
    const newOrder = sameYearEvents.length === 0
      ? 1
      : Math.max(...sameYearEvents.map(event => event.order)) + 1;

    const eventToAdd = {
      id: -Math.max(0, ...events.map(event => Math.abs(event.id))) - 1,
      order: newOrder,
      ...newEvent
    };

    setEvents(prevEvents => [...prevEvents, eventToAdd]);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseEventToolbar = () => {
    setSelectedEvent(null);
  };

  const handleUpdateEvent = (updatedEvent) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(prevEvents =>
      prevEvents.filter(event => event.id !== eventId)
    );
  };

  const handleMoveEvent = (eventId, direction) => {
    setEvents(prevEvents => {
      const eventsCopy = prevEvents.map(event => ({ ...event }));
      const eventIndex = eventsCopy.findIndex(e => e.id === eventId);

      if (eventIndex === -1) return prevEvents;

      const event = eventsCopy[eventIndex];
      const eventsInSameYear = eventsCopy.filter(e => e.year === event.year)
        .sort((a, b) => a.order - b.order);

      const currentIndexInYear = eventsInSameYear.findIndex(e => e.id === eventId);

      if (direction === 'up' && currentIndexInYear > 0) {
        const prevEvent = eventsInSameYear[currentIndexInYear - 1];
        const updatedEvent = { ...event, order: prevEvent.order };
        const updatedPrevEvent = { ...prevEvent, order: event.order };

        return eventsCopy.map(e =>
          e.id === updatedEvent.id ? updatedEvent :
            e.id === updatedPrevEvent.id ? updatedPrevEvent : e
        );
      } else if (direction === 'down' && currentIndexInYear < eventsInSameYear.length - 1) {
        const nextEvent = eventsInSameYear[currentIndexInYear + 1];
        const updatedEvent = { ...event, order: nextEvent.order };
        const updatedNextEvent = { ...nextEvent, order: event.order };

        return eventsCopy.map(e =>
          e.id === updatedEvent.id ? updatedEvent :
            e.id === updatedNextEvent.id ? updatedNextEvent : e
        );
      }

      return eventsCopy;
    });
  };

  return (
    <div className={styles.projectPage}>
      <Toolbar onAddEvent={onAddEvent} />
      <HelpButton children={<HelpContent />} />

      {selectedEvent && (
        <EventToolbar
          event={selectedEvent}
          onClose={handleCloseEventToolbar}
          onUpdateEvent={handleUpdateEvent}
          onDeleteEvent={handleDeleteEvent}
          onMoveEvent={handleMoveEvent}
        />
      )}

      <div className={styles.timelineContainer}>
        <ProjectTitle
          initialTitle={title}
          onTitleChange={handleTitleChange}
        />
        <div className={styles.timeline}>
          {sortedEvents.map((event) => (
            <div
              key={event.id}
              className={styles.timelineItem}
              onClick={() => handleEventClick(event)}
            >
              <div className={styles.timelineLine}></div>
              <div className={styles.timelineYear}>{event.year}</div>
              <div className={styles.timelineContent}>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChronologyProjectPage;