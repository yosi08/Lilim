import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { Plus, Trash2, Clock } from 'lucide-react';
import { apiService } from '../../services/apiService';
import 'react-calendar/dist/Calendar.css';
import './CalendarSchedule.css';

function CalendarSchedule({ onScheduleChange }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedules, setSchedules] = useState({});
  const [newEvent, setNewEvent] = useState({ title: '', time: '' });
  const [loading, setLoading] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    // Notify parent component of schedule changes
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    if (onScheduleChange) {
      onScheduleChange(schedules[dateKey] || []);
    }
  }, [schedules, selectedDate]);

  const loadPlans = async () => {
    if (!apiService.isAuthenticated()) {
      const saved = localStorage.getItem('schedules');
      setSchedules(saved ? JSON.parse(saved) : {});
      return;
    }

    try {
      setLoading(true);
      const plans = await apiService.getPlans();
      console.log('Loaded plans from backend:', plans);

      const schedulesMap = {};
      plans.forEach(plan => {
        let dateKey;
        let timeValue;

        try {
          // Backend uses 'start_at' instead of 'time'
          timeValue = plan.start_at || plan.time;

          if (timeValue) {
            console.log('Processing plan time:', timeValue, 'type:', typeof timeValue);
          }
          dateKey = plan.date || (timeValue ? format(new Date(timeValue), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
        } catch (e) {
          console.error('Invalid date for plan:', plan, e);
          dateKey = format(new Date(), 'yyyy-MM-dd');
          timeValue = null;
        }

        if (!schedulesMap[dateKey]) {
          schedulesMap[dateKey] = [];
        }

        // Backend uses 'id', frontend expects it for deletion
        schedulesMap[dateKey].push({
          id: plan.id,
          title: plan.title,
          time: timeValue,
          date: dateKey,
          _planId: plan.id  // Store backend id as _planId for deletion
        });
      });

      setSchedules(schedulesMap);
      localStorage.setItem('schedules', JSON.stringify(schedulesMap));
    } catch (error) {
      console.error('Error loading plans:', error);
      const saved = localStorage.getItem('schedules');
      setSchedules(saved ? JSON.parse(saved) : {});
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const dateKey = format(date, 'yyyy-MM-dd');
    if (onScheduleChange) {
      onScheduleChange(schedules[dateKey] || []);
    }
  };

  const addEvent = async () => {
    if (!newEvent.title.trim()) return;

    // "테트리게이"일 때 테트리오로 이동
    if (newEvent.title === '테트리게이') {
      window.location.href = 'https://tetr.io/';
      return;
    }

    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const time = newEvent.time ? `${dateKey}T${newEvent.time}:00` : null;

    if (apiService.isAuthenticated()) {
      try {
        const planData = {
          title: newEvent.title,
          time: time,
          date: dateKey
        };
        await apiService.createPlan(planData);
        await loadPlans();
      } catch (error) {
        console.error('Error creating plan:', error);
      }
    } else {
      const event = {
        id: crypto.randomUUID(),
        title: newEvent.title,
        time: time,
        date: dateKey
      };

      const updatedDaySchedules = [...(schedules[dateKey] || []), event];
      const newSchedules = {
        ...schedules,
        [dateKey]: updatedDaySchedules
      };

      console.log('Adding event:', event);
      console.log('Updated schedules:', newSchedules);
      console.log('Events for today:', updatedDaySchedules);

      setSchedules(newSchedules);
      localStorage.setItem('schedules', JSON.stringify(newSchedules));
    }

    // "이민길"일 때 이미지 표시
    if (newEvent.title === '이민길') {
      setShowImage(true);
      setTimeout(() => {
        setShowImage(false);
      }, 3000);
    }

    setNewEvent({ title: '', time: '' });
  };

  const deleteEvent = async (dateKey, eventId, planId) => {
    console.log('deleteEvent called (CalendarSchedule):', { dateKey, eventId, planId, isAuthenticated: apiService.isAuthenticated() });

    if (apiService.isAuthenticated() && planId) {
      try {
        console.log('Deleting plan from backend with planId:', planId);
        await apiService.deletePlan(planId);
        console.log('Plan deleted successfully, reloading plans...');
        await loadPlans();
      } catch (error) {
        console.error('Error deleting plan from backend:', error);
      }
    } else {
      console.log('Deleting from localStorage (not authenticated or no planId)');
      const newSchedules = {
        ...schedules,
        [dateKey]: schedules[dateKey].filter(e => e.id !== eventId)
      };
      setSchedules(newSchedules);
      localStorage.setItem('schedules', JSON.stringify(newSchedules));
    }
  };

  const getTodaySchedules = () => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const result = schedules[dateKey] || [];
    console.log('getTodaySchedules - dateKey:', dateKey);
    console.log('getTodaySchedules - schedules:', schedules);
    console.log('getTodaySchedules - result:', result);
    return result;
  };

  const tileContent = ({ date }) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const daySchedules = schedules[dateKey];
    if (daySchedules && daySchedules.length > 0) {
      return <div className="calendar-dot">{daySchedules.length}</div>;
    }
    return null;
  };

  return (
    <div className="calendar-schedule">
      {showImage && (
        <div className="image-overlay">
          <img src="/src/assets/minrorong 복사본.png" alt="민로롱" />
        </div>
      )}

      <div className="calendar-container">
        <h2>일정 달력</h2>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileContent={tileContent}
          className="custom-calendar"
        />
      </div>

      <div className="schedule-container">
        <h3>{format(selectedDate, 'MMMM dd, yyyy')}</h3>

        <div className="add-event">
          <input
            type="text"
            placeholder="Event title"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isComposing) {
                e.preventDefault();
                addEvent();
              }
            }}
          />
          <input
            type="time"
            value={newEvent.time}
            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
          />
          <button onClick={addEvent} className="add-btn">
            <Plus size={20} />
            Add
          </button>
        </div>

        <div className="events-list">
          {getTodaySchedules().length === 0 ? (
            <p className="no-events">이 날에는 행사가 예정되어 있지 않습니다</p>
          ) : (
            getTodaySchedules()
              .sort((a, b) => {
                if (!a.time) return 1;
                if (!b.time) return -1;
                return a.time.localeCompare(b.time);
              })
              .map(event => {
                let formattedTime = '';
                if (event.time) {
                  try {
                    formattedTime = format(new Date(event.time), 'HH:mm');
                  } catch (e) {
                    console.error('Invalid time format:', event.time);
                  }
                }

                return (
                  <div key={event.id} className="event-item">
                    <div className="event-info">
                      {formattedTime && (
                        <>
                          <Clock size={16} />
                          <span className="event-time">
                            {formattedTime}
                          </span>
                        </>
                      )}
                      <span className="event-title">{event.title}</span>
                    </div>
                    <button
                      onClick={() => deleteEvent(event.date, event.id, event._planId)}
                      className="delete-btn"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}

export function ScheduleContainer({ onScheduleChange }) {
  const selectedDate = new Date();
  const [schedules, setSchedules] = useState({});
  const [newEvent, setNewEvent] = useState({ title: '', time: '' });
  const [showImage, setShowImage] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    if (onScheduleChange) {
      onScheduleChange(schedules[dateKey] || []);
    }
  }, [schedules]);

  const loadPlans = async () => {
    if (!apiService.isAuthenticated()) {
      const saved = localStorage.getItem('schedules');
      setSchedules(saved ? JSON.parse(saved) : {});
      return;
    }

    try {
      const plans = await apiService.getPlans();
      console.log('Loaded plans from backend:', plans);
      const schedulesMap = {};
      plans.forEach(plan => {
        let dateKey;
        let timeValue;

        try {
          // Backend uses 'start_at' instead of 'time'
          timeValue = plan.start_at || plan.time;

          if (timeValue) {
            console.log('Processing plan time:', timeValue, 'type:', typeof timeValue);
          }
          dateKey = plan.date || (timeValue ? format(new Date(timeValue), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
        } catch (e) {
          console.error('Invalid date for plan:', plan, e);
          dateKey = format(new Date(), 'yyyy-MM-dd');
          timeValue = null;
        }

        if (!schedulesMap[dateKey]) {
          schedulesMap[dateKey] = [];
        }

        // Backend uses 'id', frontend expects it for deletion
        schedulesMap[dateKey].push({
          id: plan.id,
          title: plan.title,
          time: timeValue,
          date: dateKey,
          _planId: plan.id  // Store backend id as _planId for deletion
        });
      });

      setSchedules(schedulesMap);
      localStorage.setItem('schedules', JSON.stringify(schedulesMap));
    } catch (error) {
      console.error('Error loading plans:', error);
      const saved = localStorage.getItem('schedules');
      setSchedules(saved ? JSON.parse(saved) : {});
    }
  };

  const addEvent = async () => {
    if (!newEvent.title) return;

    // "테트리게이"일 때 테트리오로 이동
    if (newEvent.title === '테트리게이') {
      window.location.href = 'https://tetr.io/';
      return;
    }

    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const time = newEvent.time ? `${dateKey}T${newEvent.time}` : null;

    if (apiService.isAuthenticated()) {
      try {
        const planData = {
          title: newEvent.title,
          time: time,
          date: dateKey
        };
        await apiService.createPlan(planData);
        await loadPlans();
      } catch (error) {
        console.error('Error creating plan:', error);
      }
    } else {
      const event = {
        id: crypto.randomUUID(),
        title: newEvent.title,
        time: time,
        date: dateKey
      };

      const newSchedules = {
        ...schedules,
        [dateKey]: [...(schedules[dateKey] || []), event]
      };

      setSchedules(newSchedules);
      localStorage.setItem('schedules', JSON.stringify(newSchedules));
    }

    // "이민길"일 때 이미지 표시
    if (newEvent.title === '이민길') {
      setShowImage(true);
      setTimeout(() => {
        setShowImage(false);
      }, 3000);
    }

    setNewEvent({ title: '', time: '' });
  };

  const deleteEvent = async (dateKey, eventId, planId) => {
    console.log('deleteEvent called (ScheduleContainer):', { dateKey, eventId, planId, isAuthenticated: apiService.isAuthenticated() });

    if (apiService.isAuthenticated() && planId) {
      try {
        console.log('Deleting plan from backend with planId:', planId);
        await apiService.deletePlan(planId);
        console.log('Plan deleted successfully, reloading plans...');
        await loadPlans();
      } catch (error) {
        console.error('Error deleting plan from backend:', error);
      }
    } else {
      console.log('Deleting from localStorage (not authenticated or no planId)');
      const newSchedules = {
        ...schedules,
        [dateKey]: schedules[dateKey].filter(e => e.id !== eventId)
      };
      setSchedules(newSchedules);
      localStorage.setItem('schedules', JSON.stringify(newSchedules));
    }
  };

  const getTodaySchedules = () => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return schedules[dateKey] || [];
  };

  return (
    <div className="schedule-container">
      {showImage && (
        <div className="image-overlay">
          <img src="/src/assets/minrorong 복사본.png" alt="민로롱" />
        </div>
      )}

      <h3>{format(selectedDate, 'MMMM dd, yyyy')}</h3>

      <div className="add-event">
        <input
          type="text"
          placeholder="Event title"
          value={newEvent.title}
          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isComposing) {
              e.preventDefault();
              addEvent();
            }
          }}
        />
        <input
          type="time"
          value={newEvent.time}
          onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
        />
        <button onClick={addEvent} className="add-btn">
          <Plus size={20} />
          Add
        </button>
      </div>

      <div className="events-list">
        {getTodaySchedules().length === 0 ? (
          <p className="no-events">이 날에는 행사가 예정되어 있지 않습니다</p>
        ) : (
          getTodaySchedules()
            .sort((a, b) => {
              if (!a.time) return 1;
              if (!b.time) return -1;
              return a.time.localeCompare(b.time);
            })
            .map(event => {
              let formattedTime = '';
              if (event.time) {
                try {
                  formattedTime = format(new Date(event.time), 'HH:mm');
                } catch (e) {
                  console.error('Invalid time format:', event.time);
                }
              }

              return (
                <div key={event.id} className="event-item">
                  <div className="event-info">
                    {formattedTime && (
                      <>
                        <Clock size={16} />
                        <span className="event-time">
                          {formattedTime}
                        </span>
                      </>
                    )}
                    <span className="event-title">{event.title}</span>
                  </div>
                  <button
                    onClick={() => deleteEvent(event.date, event.id, event._planId)}
                    className="delete-btn"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}

export default CalendarSchedule;
