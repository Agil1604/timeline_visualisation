import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FiX } from 'react-icons/fi';

import TimelineControls from './TimelineControls';
import EditForm from './EditForm';
import { projectService } from '../../services/ProjectService';
import styles from './LinearProjectPage.module.css';
import HelpButton from '../../components/HelpButton/HelpButton';
import HelpContent from './HelpContent';
import ProjectTitle from '../../components/ProjectTitle/ProjectTitle';
import { useProjectSave } from '../../hooks/useProjectSave';
import { useProjectUpdate } from '../../hooks/useUpdateProjectTitle';

const LinearProjectPage = () => {
  const { project: projectId } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [originalMilestones, setOriginalMilestones] = useState([]);
  const [originalLineSize, setOriginalLineSize] = useState(2);
  const [originalBallSize, setOriginalBallSize] = useState(60);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedBall, setSelectedBall] = useState(null);
  const [selectedReadOnlyBall, setSelectedReadOnlyBall] = useState(null);
  const [lineSize, setLineSize] = useState(2);
  const [ballSize, setBallSize] = useState(60);
  const [years, setYears] = useState([]);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const projectContainerRef = useRef(null);
  const clickTimer = useRef(null);

  const [editPosition, setEditPosition] = useState({ x: 0, y: 0 });
  const [readOnlyPosition, setReadOnlyPosition] = useState({ x: 0, y: 0 });
  const popupRef = useRef(null);
  const readOnlyPopupRef = useRef(null);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const projectData = await projectService.getProject(projectId);
        const milestones = projectData.milestones.map(m => ({
          id: m.id,
          year: m.year,
          color: m.color,
          events: m.description,
        }));

        setTitle(projectData.title);
        setDescription(projectData.description);
        setYears(milestones);
        setOriginalMilestones(milestones);
        setBallSize(projectData.balls_size);
        setLineSize(projectData.line_width);
        setOriginalBallSize(projectData.balls_size);
        setOriginalLineSize(projectData.line_width);

        if (milestones.length > 0) {
          const yearsArray = milestones.map(m => m.year);
          setVisibleRange({
            start: Math.min(...yearsArray) - 1,
            end: Math.max(...yearsArray) + 1,
          });
        }
      } catch (error) {
        console.error('Ошибка загрузки проекта:', error);
      }
    };

    if (projectId) loadProject();
  }, [projectId]);

  const { updateTitle } = useProjectUpdate(projectId, description);
  const handleTitleChange = (newTitle) => updateTitle(newTitle, setTitle);

  const hasUnsavedChanges = useCallback(() => {
    const hasNewMilestones = years.some(m => !m.id);
    
    const hasUpdatedMilestones = years.some(m => {
      const original = originalMilestones.find(om => om.id === m.id);
      return original && (
        original.year !== m.year ||
        original.color !== m.color ||
        original.events !== m.events
      );
    });
    
    const hasDeletedMilestones = originalMilestones.some(om => 
      !years.some(m => m.id === om.id)
    );
    
    const hasSettingsChanges = 
      originalLineSize !== lineSize || 
      originalBallSize !== ballSize;

    return hasNewMilestones || hasUpdatedMilestones || hasDeletedMilestones || hasSettingsChanges;
  }, [years, originalMilestones, lineSize, ballSize, originalLineSize, originalBallSize]);

  const handleSave = useCallback(async () => {
    if (!projectId) return;

    const payload = {
      created: years
        .filter(m => !m.id)
        .map(m => ({
          year: m.year,
          color: m.color,
          description: m.events,
        })),
      updated: years
        .filter(m => m.id)
        .filter(m => {
          const original = originalMilestones.find(om => om.id === m.id);
          return original && (
            original.year !== m.year ||
            original.color !== m.color ||
            original.events !== m.events
          );
        })
        .map(m => ({
          id: m.id,
          year: m.year,
          color: m.color,
          description: m.events,
        })),
      deleted: originalMilestones
        .filter(om => !years.some(m => m.id === om.id))
        .map(om => ({ id: om.id })),
      line_width: lineSize,
      balls_size: ballSize
    };

    try {
      await projectService.update("linear", projectId, payload);

      const projectData = await projectService.getProject(projectId);
      const updatedMilestones = projectData.milestones.map(m => ({
        id: m.id,
        year: m.year,
        color: m.color,
        events: m.description,
      }));

      setYears(updatedMilestones);
      setOriginalMilestones(updatedMilestones);
      setBallSize(projectData.balls_size);
      setLineSize(projectData.line_width);
      setOriginalBallSize(projectData.balls_size);
      setOriginalLineSize(projectData.line_width);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  }, [projectId, years, originalMilestones, lineSize, ballSize]);

  const { handleSave: triggerSave } = useProjectSave(projectId, handleSave, hasUnsavedChanges);

  const handleDeleteBall = useCallback((ballToDelete) => {
    setYears(prev => prev.filter(item => item !== ballToDelete));
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

  const calculatePosition = useCallback((year) => {
    if (!visibleRange.start || !visibleRange.end) return 5;
    const range = visibleRange.end - visibleRange.start;
    return Math.max(0, Math.min(100, ((year - visibleRange.start) / range) * 100));
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
    const isYearExist = years.some(y =>
      y !== selectedBall && y.year === updatedBall.year
    );
    if (isYearExist) {
      alert('Шарик с таким годом уже существует!');
      return;
    }
    setYears(prev =>
      prev.map(item =>
        item.year === selectedBall.year ? updatedBall : item
      ).sort((a, b) => a.year - b.year)
    );
    setSelectedBall(null);
  };

  const handleAddYear = (newYear) => {
    const isYearExist = years.some(y => y.year === newYear.year);
    if (isYearExist) {
      alert('Шарик с таким годом уже существует!');
      return;
    }
    setYears(prev => [...prev, {
      ...newYear,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    }].sort((a, b) => a.year - b.year));
  };

  const ReadOnlyPopup = ({ ball, onClose }) => (
    <div className={styles.readOnlyPopup}>
      <h3>{ball.year}</h3>
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

        const yearAtCursor = currentStart + cursorPositionFraction * currentRange;

        const newRange = delta > 0
          ? currentRange * (1 + ZOOM_SPEED)
          : currentRange * (1 - ZOOM_SPEED);

        const newStart = yearAtCursor - cursorPositionFraction * newRange;
        const newEnd = yearAtCursor + (1 - cursorPositionFraction) * newRange;

        return {
          start: Math.round(newStart * 100) / 100,
          end: Math.round(newEnd * 100) / 100
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
      <ProjectTitle
        initialTitle={title}
        onTitleChange={handleTitleChange}
      />
      <TimelineControls
        lineSize={lineSize}
        onLineSizeChange={setLineSize}
        ballSize={ballSize}
        onBallSizeChange={setBallSize}
        onAddYear={handleAddYear}
        isPanelOpen={isPanelOpen}
        onTogglePanel={() => setIsPanelOpen(!isPanelOpen)}
        onZoomRangeReset={() => {
          if (years.length > 0) {
            const yearsArray = years.map(m => m.year);
            setVisibleRange({
              start: Math.min(...yearsArray) - 1,
              end: Math.max(...yearsArray) + 1,
            });
          }
        }}
        visibleRange={visibleRange}
        onSave={triggerSave}
      />
      <HelpButton children={<HelpContent />} />
      <div className={styles.projectMainContent}>
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
              {years
                .filter(item => item.year >= visibleRange.start && item.year <= visibleRange.end)
                .map((item) => (
                  <div
                    key={item.year}
                    className={styles.timelineItem}
                    style={{
                      left: `${calculatePosition(item.year)}%`,
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
                      {item.year}
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

export default LinearProjectPage;