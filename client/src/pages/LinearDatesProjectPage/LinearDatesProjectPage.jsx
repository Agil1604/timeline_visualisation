import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FiX } from 'react-icons/fi';

import Toolbar from './Toolbar';
import EditForm from './EditForm';
import { projectService } from '../../services/ProjectService';
import styles from './LinearDatesProjectPage.module.css';
import HelpButton from '../../components/HelpButton/HelpButton';
import HelpContent from '../../components/HelpContent/LinearDatesHelpContent';
import ProjectTitle from '../../components/ProjectTitle/ProjectTitle';
import { useProjectSave } from '../../hooks/useProjectSave';
import { useProjectUpdate } from '../../hooks/useUpdateProjectTitle';

const LinearDatesProjectPage = () => {
  const { project: projectId } = useParams();
  const [title, setTitle] = useState('');
  const [originalMilestones, setOriginalMilestones] = useState([]);
  const [originalLineSize, setOriginalLineSize] = useState(2);
  const [originalBallSize, setOriginalBallSize] = useState(60);

  const [selectedBall, setSelectedBall] = useState(null);
  const [selectedReadOnlyBall, setSelectedReadOnlyBall] = useState(null);
  const [lineSize, setLineSize] = useState(2);
  const [ballSize, setBallSize] = useState(60);
  const [dates, setDates] = useState([]);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const projectContainerRef = useRef(null);
  const clickTimer = useRef(null);

  const [editPosition, setEditPosition] = useState({ x: 0, y: 0 });
  const [readOnlyPosition, setReadOnlyPosition] = useState({ x: 0, y: 0 });
  const popupRef = useRef(null);
  const readOnlyPopupRef = useRef(null);

  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  useEffect(() => {
    const loadProject = async () => {
      try {
        const projectData = await projectService.getProject(projectId);
        const milestones = projectData.milestones.map(m => ({
          id: m.id,
          date: new Date(m.date),
          color: m.color,
          events: m.description,
        }));

        setTitle(projectData.title);
        setDates(milestones);
        setOriginalMilestones(milestones);
        setBallSize(projectData.balls_size);
        setLineSize(projectData.line_width);
        setOriginalBallSize(projectData.balls_size);
        setOriginalLineSize(projectData.line_width);

        if (milestones.length > 0) {
          const timestamps = milestones.map(m => m.date.getTime());
          setVisibleRange({
            start: Math.min(...timestamps) - (365 * 24 * 60 * 60 * 1000),
            end: Math.max(...timestamps) + (365 * 24 * 60 * 60 * 1000),
          });
        }
      } catch (error) {
        console.error('Ошибка загрузки проекта:', error);
      }
    };

    if (projectId) loadProject();
  }, [projectId]);

  const { updateTitle } = useProjectUpdate(projectId);
  const handleTitleChange = (newTitle) => updateTitle(newTitle, setTitle);

  const hasUnsavedChanges = useCallback(() => {
    const hasNewMilestones = dates.some(m => !m.id);

    const hasUpdatedMilestones = dates.some(m => {
      const original = originalMilestones.find(om => om.id === m.id);
      return original && (
        original.date.getTime() !== m.date.getTime() ||
        original.color !== m.color ||
        original.events !== m.events
      );
    });

    const hasDeletedMilestones = originalMilestones.some(om =>
      !dates.some(m => m.id === om.id)
    );

    const hasSettingsChanges =
      originalLineSize !== lineSize ||
      originalBallSize !== ballSize;

    return hasNewMilestones || hasUpdatedMilestones || hasDeletedMilestones || hasSettingsChanges;
  }, [dates, originalMilestones, lineSize, ballSize, originalLineSize, originalBallSize]);

  const handleSave = useCallback(async () => {
    if (!projectId) return;

    const payload = {
      created: dates
        .filter(m => !m.id)
        .map(m => ({
          date: m.date.toISOString().split('T')[0],
          color: m.color,
          description: m.events,
        })),
      updated: dates
        .filter(m => m.id)
        .filter(m => {
          const original = originalMilestones.find(om => om.id === m.id);
          return original && (
            original.date.getTime() !== m.date.getTime() ||
            original.color !== m.color ||
            original.events !== m.events
          );
        })
        .map(m => ({
          id: m.id,
          date: m.date.toISOString().split('T')[0],
          color: m.color,
          description: m.events,
        })),
      deleted: originalMilestones
        .filter(om => !dates.some(m => m.id === om.id))
        .map(om => ({ id: om.id })),
      settings: {
        line_width: lineSize,
        balls_size: ballSize
      }
    };

    try {
      await projectService.updateProject(projectId, payload);

      const projectData = await projectService.getProject(projectId);
      const updatedMilestones = projectData.milestones.map(m => ({
        id: m.id,
        date: new Date(m.date),
        color: m.color,
        events: m.description,
      }));

      setDates(updatedMilestones);
      setOriginalMilestones(updatedMilestones);
      setBallSize(projectData.balls_size);
      setLineSize(projectData.line_width);
      setOriginalBallSize(projectData.balls_size);
      setOriginalLineSize(projectData.line_width);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  }, [projectId, dates, originalMilestones, lineSize, ballSize]);

  const { handleSave: triggerSave } = useProjectSave(projectId, handleSave, hasUnsavedChanges);

  const handleDeleteBall = useCallback((ballToDelete) => {
    setDates(prev => prev.filter(item => item !== ballToDelete));
    setSelectedBall(null);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target) && !e.target.closest('.timeline-ball')) {
        setSelectedBall(null);
      }

      if (readOnlyPopupRef.current &&
        !readOnlyPopupRef.current.contains(e.target) &&
        !e.target.closest('.timeline-ball')) {
        setSelectedReadOnlyBall(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const calculatePosition = useCallback((date) => {
    if (!visibleRange.start || !visibleRange.end) return 5;
    const range = visibleRange.end - visibleRange.start;
    const timestamp = date.getTime();
    return Math.max(0, Math.min(100, ((timestamp - visibleRange.start) / range) * 100));
  }, [visibleRange]);

  const handleBallClick = (ball, e) => {
    if (clickTimer.current) clearTimeout(clickTimer.current);

    clickTimer.current = setTimeout(() => {
      if (!selectedBall) {
        const container = projectContainerRef.current;
        const rect = container.getBoundingClientRect();
        const scrollLeft = container.scrollLeft;
        const scrollTop = container.scrollTop;

        const x = (e.clientX - rect.left + scrollLeft);
        const y = (e.clientY - rect.top + scrollTop);

        setSelectedReadOnlyBall(ball);
        setReadOnlyPosition({ x: x + 20, y: y - 50 });
      }
    }, 350);
  };

  const handleDoubleClick = (ball, e) => {
    clearTimeout(clickTimer.current);
    clickTimer.current = null;

    const container = projectContainerRef.current;
    const rect = container.getBoundingClientRect();
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;

    const x = (e.clientX - rect.left + scrollLeft);
    const y = (e.clientY - rect.top + scrollTop);

    setSelectedReadOnlyBall(null);
    setSelectedBall(ball);
    setEditPosition({
      x: x + 20,
      y: y - 50
    });
  };

  const handleUpdateBall = (updatedBall) => {
    const isDateExist = dates.some(d =>
      d !== selectedBall && d.date.getTime() === updatedBall.date.getTime()
    );
    if (isDateExist) {
      alert('Событие с такой датой уже существует!');
      return;
    }
    setDates(prev =>
      prev.map(item =>
        item.date.getTime() === selectedBall.date.getTime() ? updatedBall : item
      ).sort((a, b) => a.date - b.date)
    );
    setSelectedBall(null);
  };

  const handleAddDate = (newDate) => {
    const isDateExist = dates.some(d => d.date.getTime() === newDate.date.getTime());
    if (isDateExist) {
      alert('Событие с такой датой уже существует!');
      return;
    }
    setDates(prev => [...prev, {
      ...newDate,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    }].sort((a, b) => a.date - b.date));
  };

  const ReadOnlyPopup = ({ ball, onClose }) => (
    <div className={styles.readOnlyPopup}>
      <h3>{formatDate(ball.date)}</h3>
      <div className={styles.events}>
        <p>{ball.events}</p>
      </div>
      <button className={styles.closeButton} onClick={onClose}>
        <FiX />
      </button>
    </div>
  );

  useEffect(() => {
    const container = projectContainerRef.current;
    if (!container) return;

    const wheelHandler = (e) => {
      e.preventDefault();
      const ZOOM_SPEED = 0.1;
      const delta = e.deltaY > 0 ? 1 : -1;

      const timelineRect = container.getBoundingClientRect();
      const localX = e.clientX - timelineRect.left;
      const cursorPositionFraction = localX / timelineRect.width;

      if (cursorPositionFraction < 0 || cursorPositionFraction > 1) return;

      setVisibleRange(prev => {
        const currentStart = prev.start;
        const currentEnd = prev.end;
        const currentRange = currentEnd - currentStart;

        const timestampAtCursor = currentStart + cursorPositionFraction * currentRange;

        const newRange = delta > 0
          ? currentRange * (1 + ZOOM_SPEED)
          : currentRange * (1 - ZOOM_SPEED);

        const newStart = timestampAtCursor - cursorPositionFraction * newRange;
        const newEnd = timestampAtCursor + (1 - cursorPositionFraction) * newRange;

        return {
          start: Math.round(newStart),
          end: Math.round(newEnd)
        };
      });
    };

    container.addEventListener('wheel', wheelHandler, { passive: false });

    return () => {
      container.removeEventListener('wheel', wheelHandler);
    };
  }, []);

  return (
    <div className={styles.projectPage}>
      <Toolbar
        lineSize={lineSize}
        onLineSizeChange={setLineSize}
        ballSize={ballSize}
        onBallSizeChange={setBallSize}
        onAddDate={handleAddDate}
        onZoomRangeReset={() => {
          if (dates.length > 0) {
            const timestamps = dates.map(m => m.date.getTime());
            setVisibleRange({
              start: Math.min(...timestamps) - (365 * 24 * 60 * 60 * 1000),
              end: Math.max(...timestamps) + (365 * 24 * 60 * 60 * 1000),
            });
          }
        }}
        visibleRange={visibleRange}
        onSave={triggerSave}
      />
      <HelpButton children={<HelpContent />} />
      <div className={styles.projectMainContent}>
        <ProjectTitle
          initialTitle={title}
          onTitleChange={handleTitleChange}
        />
        <div
          className={styles.projectContainerWrapper}
          ref={projectContainerRef}
        >
          <div className={styles.projectContainer}>
            <div
              className={styles.timelineLine}
              style={{ height: `${lineSize}px` }}
            >
              <div className={`${styles.timelineBorderHandle} ${styles.left}`} />
              <div className={`${styles.timelineBorderHandle} ${styles.right}`} />
            </div>
            <div className={styles.timelineItems}>
              {dates
                .filter(item => {
                  const itemTimestamp = item.date.getTime();
                  return itemTimestamp >= visibleRange.start && itemTimestamp <= visibleRange.end;
                })
                .map((item) => (
                  <div
                    key={item.date.getTime()}
                    className={styles.timelineItem}
                    style={{
                      left: `${calculatePosition(item.date)}%`,
                      pointerEvents: 'auto'
                    }}
                  >
                    <div
                      className={styles.timelineBall}
                      style={{
                        width: `${ballSize}px`,
                        height: `${ballSize}px`,
                        backgroundColor: item.color
                      }}
                      onClick={(e) => handleBallClick(item, e)}
                      onDoubleClick={(e) => handleDoubleClick(item, e)}
                    >
                      {formatDate(item.date)}
                    </div>
                  </div>
                ))}
            </div>

            {selectedBall && (
              <div
                className={styles.editPopup}
                ref={popupRef}
                style={{
                  left: `${editPosition.x}px`,
                  top: `${editPosition.y}px`
                }}
              >
                <EditForm
                  ball={selectedBall}
                  onUpdate={handleUpdateBall}
                  onDelete={handleDeleteBall}
                  onClose={() => setSelectedBall(null)}
                />
              </div>
            )}

            {selectedReadOnlyBall && (
              <div
                className={styles.editPopup}
                ref={readOnlyPopupRef}
                style={{
                  left: `${readOnlyPosition.x}px`,
                  top: `${readOnlyPosition.y}px`
                }}
              >
                <ReadOnlyPopup
                  ball={selectedReadOnlyBall}
                  onClose={() => setSelectedReadOnlyBall(null)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinearDatesProjectPage;