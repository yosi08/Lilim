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

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    // Notify parent component of schedule changes
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    if (onScheduleChange) {
      onScheduleChange(schedules[dateKey] || []);
    }
  }, [schedules, selectedDate, onScheduleChange]);

  const loadPlans = async () => {
    if (!apiService.isAuthenticated()) {
      const saved = localStorage.getItem('schedules');
      setSchedules(saved ? JSON.parse(saved) : {});
      return;
    }

    try {
      setLoading(true);
      const plans = await apiService.getPlans();

      const schedulesMap = {};
      plans.forEach(plan => {
        const dateKey = plan.date || format(new Date(plan.time), 'yyyy-MM-dd');
        if (!schedulesMap[dateKey]) {
          schedulesMap[dateKey] = [];
        }
        schedulesMap[dateKey].push({
          id: plan.planId || plan.id,
          title: plan.title,
          time: plan.time,
          date: dateKey,
          _planId: plan.planId
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
    if (!newEvent.title || !newEvent.time) return;

    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const time = `${dateKey}T${newEvent.time}`;

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

    setNewEvent({ title: '', time: '' });
  };

  const deleteEvent = async (dateKey, eventId, planId) => {
    if (apiService.isAuthenticated() && planId) {
      try {
        await apiService.deletePlan(planId);
        await loadPlans();
      } catch (error) {
        console.error('Error deleting plan:', error);
      }
    } else {
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
      <div className="calendar-container">
        <h2>일정 달력</h2>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileContent={tileContent}
          className="custom-calendar"
        />
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
  }, [schedules, onScheduleChange]);

  const loadPlans = async () => {
    if (!apiService.isAuthenticated()) {
      const saved = localStorage.getItem('schedules');
      setSchedules(saved ? JSON.parse(saved) : {});
      return;
    }

    try {
      const plans = await apiService.getPlans();
      const schedulesMap = {};
      plans.forEach(plan => {
        const dateKey = plan.date || format(new Date(plan.time), 'yyyy-MM-dd');
        if (!schedulesMap[dateKey]) {
          schedulesMap[dateKey] = [];
        }
        schedulesMap[dateKey].push({
          id: plan.planId || plan.id,
          title: plan.title,
          time: plan.time,
          date: dateKey,
          _planId: plan.planId
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
    if (apiService.isAuthenticated() && planId) {
      try {
        await apiService.deletePlan(planId);
        await loadPlans();
      } catch (error) {
        console.error('Error deleting plan:', error);
      }
    } else {
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
            .map(event => (
              <div key={event.id} className="event-item">
                <div className="event-info">
                  {event.time && (
                    <>
                      <Clock size={16} />
                      <span className="event-time">
                        {format(new Date(event.time), 'HH:mm')}
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
            ))
        )}
      </div>
    </div>
  );
}

export default CalendarSchedule;
