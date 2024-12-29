import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect} from 'react';
import { List, Calendar, Users } from 'lucide-react';
import backgroundImage from './image.jpg' // if it's in your src folder
import yinYang from './image.png'
import { Dialog, DialogTitle, DialogContent, IconButton, Typography } from '@mui/material';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { ChevronLeft, ChevronRight, X, UserCheck, Check, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useLocation, Navigate } from 'react-router-dom';
import { User, Clock, Info, AlertCircle, Plus } from 'lucide-react';


const fontGlobal="'Poppins'";

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Empty string for relative URLs in production
  : 'http://127.0.0.1:5000';

var loginName="";

const LoginButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!loginName) {
      navigate('/login');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-32 flex items-center justify-end gap-2 text-black opacity-60 hover:opacity-100 transition-opacity duration-300"
    >
      <span className="text-lg">
        {loginName || 'Login'}
      </span>
      {loginName ? (
        <User size={20} className="stroke-black" />
      ) : (
        <LogIn size={20} className="stroke-black" />
      )}
    </button>
  );
};

const defaultTheme = {
  // Card styling
  cardBg: 'bg-beige',
  cardShadow: 'shadow-lg',
  // Header styling
  headerBg: 'bg-custom-blue-2',
  headerText: 'text-beige',
  headerFont: 'font-bold',
  // Content styling
  contentBg: 'bg-beige',
  contentText: 'text-custom-blue-2',
  contentFont: 'font-normal',
  // Alert box styling
  alertBg: 'bg-custom-blue-2',
  alertText: 'text-beige',
  // Button styling
  primaryButtonBg: 'bg-blue-600',
  primaryButtonHover: 'hover:bg-blue-700',
  primaryButtonText: 'text-white',
  secondaryButtonBg: 'bg-green-600',
  secondaryButtonHover: 'hover:bg-green-700',
  secondaryButtonText: 'text-white',
  buttonFont: 'font-medium',
  // Icon styling
  iconColor: 'text-custom-blue-2',
  // Footer styling
  footerBg: 'bg-gray-50'
};

const TaijiClassCard = ({ 
  classData, 
  onEventClick,
  theme = {}
}) => {
  const { title, days, times, date, info } = classData;
  
  // Merge default theme with custom theme
  const activeTheme = { ...defaultTheme, ...theme };

  const formatTime = (timeStr) => {
    const time = new Date(`1970-01-01T${timeStr}`);
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const getDayLabel = (daysStr) => {
    const dayMap = {
      'M': 'Monday',
      'T': 'Tuesday',
      'W': 'Wednesday',
      'R': 'Thursday',
      'F': 'Friday',
      'S': 'Saturday',
      'U': 'Sunday'
    };
    return daysStr.split('').map(day => dayMap[day]).join(', ');
  };

  const formatDate = (dateStr) => {
    const eventDate = new Date(dateStr);
    return eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`w-full max-w-md rounded-lg overflow-hidden ${activeTheme.cardShadow} ${activeTheme.cardBg}`} style={{ fontFamily: fontGlobal}}>
      {/* Header */}
      <div className={`p-6 ${activeTheme.headerBg}`}>
        <h2 className={`text-xl ${activeTheme.headerFont} ${activeTheme.headerText}`}>
          {title}
        </h2>
      </div>
      
      {/* Content */}
      <div className={`p-6 space-y-4 ${activeTheme.contentBg}`}>
        <div className={`flex items-center gap-2 ${activeTheme.contentText}`}>
          <Calendar className={`w-5 h-5 ${activeTheme.iconColor}`} />
          <span className={activeTheme.contentFont}>{getDayLabel(days)}</span>
        </div>

        <div className={`flex items-center gap-2 ${activeTheme.contentText}`}>
          <Clock className={`w-5 h-5 ${activeTheme.iconColor}`} />
          <span className={activeTheme.contentFont}>
            {times[0] && `${formatTime(times[0][0])} - ${formatTime(times[0][1])}`}
          </span>
        </div>

        <div className={`flex items-center gap-2 ${activeTheme.contentText}`}>
          <Info className={`w-5 h-5 ${activeTheme.iconColor}`} />
          <span className={activeTheme.contentFont}>{info}</span>
        </div>

        <div className={`mt-4 p-3 rounded-md ${activeTheme.alertBg}`}>
          <p className={`text-sm ${activeTheme.alertText}`}>
            Next class: {formatDate(date)}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className={`flex flex-col gap-3 p-6 mt-4 ${activeTheme.footerBg}`}>
        <button 
          className={`w-full py-2 px-4 rounded-md ${activeTheme.primaryButtonBg} ${activeTheme.primaryButtonHover} ${activeTheme.primaryButtonText} ${activeTheme.buttonFont} transition-colors`}
          onClick={() => onEventClick({
            type: 'single',
            date,
            title
          })}
        >
          Sign up for single class
        </button>
        <button 
          className={`w-full py-2 px-4 rounded-md ${activeTheme.secondaryButtonBg} ${activeTheme.secondaryButtonHover} ${activeTheme.secondaryButtonText} ${activeTheme.buttonFont} transition-colors`}
          onClick={() => onEventClick({
            type: 'series',
            days,
            times,
            title
          })}
        >
          Sign up for class series
        </button>
      </div>
    </div>
  );
};

const TaijiClassCardRoot = ({ 
  classData,
  theme = {}
}) => {
  const initialStudents = React.useMemo(() => {
    return (classData.students_signed_up || []).map((student, index) => {
      if (typeof student === 'string') {
        return { id: `student-${index}`, name: student };
      }
      return student;
    });
  }, [classData.students_signed_up]);

  const [students, setStudents] = useState(initialStudents);
  const [newStudentName, setNewStudentName] = useState('');
  const { title, days, times, date, info } = classData;
  
  const activeTheme = { ...defaultThemeRoot, ...theme };

  const formatTime = (timeStr) => {
    const time = new Date(`1970-01-01T${timeStr}`);
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const getDayLabel = (daysStr) => {
    const dayMap = {
      'M': 'Monday',
      'T': 'Tuesday',
      'W': 'Wednesday',
      'R': 'Thursday',
      'F': 'Friday',
      'S': 'Saturday',
      'U': 'Sunday'
    };
    return daysStr.split('').map(day => dayMap[day]).join(', ');
  };

  const formatDate = (dateStr) => {
    const eventDate = new Date(dateStr);
    return eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleRemoveStudent = (studentId) => {
    setStudents(currentStudents => 
      currentStudents.filter(student => student.id !== studentId)
    );

    if (classData.students_signed_up) {
      classData.students_signed_up = classData.students_signed_up.filter(student => 
        typeof student === 'string' ? student !== studentId : student.id !== studentId
      );
    }

    fetch('api/removeuser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId,
        classId: classData.id
      }),
    }).catch(error => {
      console.error('Error removing student:', error);
    });
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newStudent = {
      id: `student-${students.length}`,
      name: newStudentName.trim()
    };

    // Update local state
    setStudents(current => [...current, newStudent]);
    
    // Update the original object
    if (classData.students_signed_up) {
      classData.students_signed_up.push(newStudent);
    } else {
      classData.students_signed_up = [newStudent];
    }

    // Reset input
    setNewStudentName('');

    // Make API call to add student
    fetch('api/adduser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student: newStudent,
        classId: classData.id
      }),
    }).catch(error => {
      console.error('Error adding student:', error);
    });
  };

  return (
    <div className={`w-full max-w-md rounded-lg overflow-hidden ${activeTheme.cardShadow} ${activeTheme.cardBg}`}>
      {/* Header */}
      <div className={`p-6 ${activeTheme.headerBg}`}>
        <h2 className={`text-xl ${activeTheme.headerFont} ${activeTheme.headerText}`}>
          {title}
        </h2>
      </div>
      
      {/* Content */}
      <div className={`p-6 space-y-4 ${activeTheme.contentBg}`}>
        <div className={`flex items-center gap-2 ${activeTheme.contentText}`}>
          <Calendar className={`w-5 h-5 ${activeTheme.iconColor}`} />
          <span className={activeTheme.contentFont}>{getDayLabel(days)}</span>
        </div>

        <div className={`flex items-center gap-2 ${activeTheme.contentText}`}>
          <Clock className={`w-5 h-5 ${activeTheme.iconColor}`} />
          <span className={activeTheme.contentFont}>
            {times[0] && `${formatTime(times[0][0])} - ${formatTime(times[0][1])}`}
          </span>
        </div>

        <div className={`flex items-center gap-2 ${activeTheme.contentText}`}>
          <Info className={`w-5 h-5 ${activeTheme.iconColor}`} />
          <span className={activeTheme.contentFont}>{info}</span>
        </div>

        <div className={`mt-4 p-3 rounded-md ${activeTheme.alertBg}`}>
          <p className={`text-sm ${activeTheme.alertText}`}>
            Next class: {formatDate(date)}
          </p>
        </div>

        {/* Students List */}
        <div className="mt-6">
          <h3 className={`text-lg mb-3 ${activeTheme.headerText}`}>Enrolled Students</h3>
          
          {/* Add Student Form */}
          <form onSubmit={handleAddStudent} className="mb-4 flex gap-2">
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="Enter student name"
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1"
              disabled={!newStudentName.trim()}
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </form>

          {students.length === 0 ? (
            <p className={`text-sm ${activeTheme.contentText}`}>No students enrolled yet</p>
          ) : (
            <ul className="space-y-2">
              {students.map((student) => (
                <li 
                  key={student.id}
                  className={`flex items-center justify-between p-2 rounded-md ${activeTheme.contentBg} border border-gray-200`}
                >
                  <span className={activeTheme.contentText}>{student.name}</span>
                  <button
                    onClick={() => handleRemoveStudent(student.id)}
                    className={`p-1 rounded-full hover:bg-red-100 text-red-500 transition-colors`}
                    aria-label={`Remove ${student.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

const defaultThemeRoot = {
  // Card styling
  cardBg: 'bg-beige',
  cardShadow: 'shadow-lg',
  // Header styling
  headerBg: 'bg-custom-blue-2',
  headerText: 'text-beige',
  headerFont: 'font-bold',
  // Content styling
  contentBg: 'bg-beige',
  contentText: 'text-custom-blue-2',
  contentFont: 'font-normal',
  // Alert box styling
  alertBg: 'bg-custom-blue-2',
  alertText: 'text-beige',
  // Button styling
  primaryButtonBg: 'bg-blue-600',
  primaryButtonHover: 'hover:bg-blue-700',
  primaryButtonText: 'text-white',
  secondaryButtonBg: 'bg-green-600',
  secondaryButtonHover: 'hover:bg-green-700',
  secondaryButtonText: 'text-white',
  buttonFont: 'font-medium',
  // Icon styling
  iconColor: 'text-custom-blue-2',
  // Footer styling
  footerBg: 'bg-gray-50',
};


const popupRoot = document.createElement('div');
document.body.appendChild(popupRoot);

const RotatingYinYang = () => {
  const [rotation, setRotation] = React.useState(0);
  
  React.useEffect(() => {
      const handleScroll = () => {
          const scrollPosition = window.scrollY;
          setRotation(scrollPosition / 2);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
      <img 
          src={yinYang}
          alt="Rotating image"
          width="250" 
          height="250"
          style={{ transform: `rotate(${rotation}deg)` }}
          className="transition-transform duration-100 ease-linear"
      />
  );
};

const ArtisticNav = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'list', icon: List, label: 'List View' },
    { id: 'calendar', icon: Calendar, label: 'Calendar View' },
    { id: 'contact', icon: Users, label: 'Contact' }
  ];

  return (
    <nav className="relative w-full p-6 bg-beige">
      {/* Decorative Lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-black opacity-20"></div>
      <div className="absolute top-2 left-0 w-full h-px bg-black opacity-10"></div>
      
      {/* Container for both nav items and auth button */}
      <div className="flex justify-between items-center">
        {/* Left spacer for centering nav items */}
        <div className="w-32"></div>
        
        {/* Centered navigation items */}
        <div className="flex justify-center items-center gap-12">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`group flex flex-col items-center transition-all duration-300 text-black ${
                activeTab === id ? 'opacity-100' : 'opacity-60 hover:opacity-80'
              }`}
            >
              <Icon 
                size={24}
                className={`mb-2 transition-transform duration-300 stroke-black ${
                  activeTab === id ? 'scale-110' : 'group-hover:scale-105'
                }`}
              />
              <span className="text-lg tracking-wide text-black font-normal">
                {label}
              </span>
              
              {/* Underline Effect */}
              <div className="relative w-full h-0.5 mt-1">
                <div className={`absolute inset-0 bg-black transition-all duration-300
                  ${activeTab === id ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-30'}`}>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        {/* Login/Signup button */}
        <LoginButton/>
      </div>
      
      {/* Bottom Decorative Lines */}
      <div className="absolute bottom-2 left-0 w-full h-px bg-black opacity-10"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-black opacity-20"></div>
    </nav>
  );
};


const SubPage = ({ children, isVisible, config }) => (
  <div 
    className={`
      ${config.width} 
      mx-auto 
      ${config.padding}
      ${config.rounded}
      ${config.bgColor}
      transition-opacity duration-300
      ${isVisible ? 'opacity-100' : 'opacity-0 hidden'}
    `}
  >
    <div 
      className={`${config.textColor}`}
      style={{ fontFamily: config.fontFamily }}
    >
      {children}
    </div>
  </div>
);

const CalendarSubPage = ({
  children,
  isVisible,
  config,
  highlightColor = 'bg-custom-blue text-beige',
  selected_event = 'bg-accent text-white',
  selected_event_II = 'bg-beige text-custom-blue-2 hover:bg-accent hover:text-custom-blue-2',
  initialDate = new Date(),
  events = [], // New prop for events
  onDateSelect = () => {}
}) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [view, setView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(null);

  // In your existing component
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper function to get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear();
    });
  };

  const getStartDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getWeekDates = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      weekDates.push(new Date(date.getFullYear(), date.getMonth(), diff + i));
    }
    return weekDates;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + direction,
      1
    ));
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const startDay = getStartDayOfMonth(currentDate);
    const days = [];

    // Previous month days
    const prevMonthDays = startDay;
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonth.getDate() - i);
      const dateEvents = getEventsForDate(date);
      days.push(
        <div
          key={`prev-${i}`}
          onClick={() => handleDateSelect(date)}
          className="p-2 text-gray-400 rounded-lg min-h-20 flex flex-col transition-colors"
        >
          <span className="text-center">{prevMonth.getDate() - i}</span>
          <div className="mt-1 space-y-1">
            {dateEvents.map((event, index) => (
              <div
                key={index}
                className="text-xs p-1 rounded truncate bg-gray-100 text-gray-100"
                title={event.title}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateEvents = getEventsForDate(date);
      days.push(
        <div
          onClick={() => handleDateSelect(date)}
          className={`min-h-20 p-2 flex flex-col rounded-lg transition-colors relative
            ${isSelected(date) ? highlightColor : ''}
            ${isToday(date) ? highlightColor : ''}
            ${!isSelected(date) && !isToday(date) ? 'hover:bg-custom-blue' : ''}
            ${!isSelected(date) && isToday(date) ? 'bg-custom-blue text-beige' : ''}
          `}
        >
          <span className="text-center">{day}</span>
          <div className="mt-1 space-y-1">
            {dateEvents.map((event, index) => (
              <div
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventClick(event);
                }}
                className={`relative text-xs p-1 rounded truncate ${
                  event.registered ? 'bg-green-500 text-white hover:bg-green-600' : isSelected(date) ? selected_event_II : selected_event_II
                }`}
              >   
                {/* Event Container with Two Layers */}
                <div className="flex items-center gap-1 pt-2">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {event.registered ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : event.full ? (
                      <Users className="w-4 h-4 text-red-500" />
                    ) : (
                      <UserCheck className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex-grow truncate">
                    {event.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
      const dateEvents = getEventsForDate(date);
      days.push(
        <div
          key={`next-${i}`}
          onClick={() => handleDateSelect(date)}
          className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg min-h-20 flex flex-col transition-colors"
        >
          <span className="text-center">{i}</span>
          <div className="mt-1 space-y-1">
            {dateEvents.map((event, index) => (
              <div
                key={index}
                className="text-xs p-1 rounded truncate bg-blue-100 text-blue-800"
                title={event.title}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    return weekDates.map((date, index) => {
      const dateEvents = getEventsForDate(date);
      return (
        <div
          key={index}
          onClick={() => handleDateSelect(date)}
          className={`p-4 min-h-96 flex flex-col rounded-lg transition-colors
            ${isSelected(date) ? highlightColor : ''}
            ${isToday(date) ? highlightColor : ''}
            ${!isSelected(date) && !isToday(date) ? 'hover:bg-custom-blue' : ''}
            ${!isSelected(date) && isToday(date) ? 'bg-custom-blue text-beige' : ''}
          `}
        >
          <div className="text-sm mb-1">
            {date.toLocaleDateString('en-US', { weekday: 'short' })}
          </div>
          <div className="mb-2">
            {date.getDate()}
          </div>
          <div className="space-y-1 flex-1">
            {dateEvents.map((event, index) => {
              const eventDate = new Date(event.date);
              const hours = eventDate.getHours();
              const minutes = eventDate.getMinutes();
              const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
              
              return (
                <div
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(event);
                  }}
                  className={`text-xs p-2 rounded transition-colors ${
                    event.registered 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : isSelected(date) 
                        ? selected_event_II 
                        : selected_event_II
                  }`}
                  style={{
                    position: 'relative',
                    marginTop: `${(hours * 60 + minutes) / 15}px`
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{timeString}</div>
                    <div className="flex-shrink-0">
                      {event.registered ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : event.full ? (
                        <Users className="w-3 h-3 text-red-500" />
                      ) : (
                        <UserCheck className="w-3 h-3 text-green-500" />
                      )}
                    </div>
                  </div>
                  <div className="truncate mt-1" title={event.title}>
                    {event.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <div 
      className={`
        ${config.width} 
        mx-auto 
        ${config.padding}
        ${config.rounded}
        ${config.bgColor}
        transition-opacity duration-300
        ${isVisible ? 'opacity-100' : 'opacity-0 hidden'}
      `}
    >
      <div 
        className={`${config.textColor}`}
        style={{ fontFamily: config.fontFamily }}
      >
        {children}
        
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => view === 'month' ? navigateMonth(-1) : navigateWeek(-1)}
            className="p-2 hover:bg-custom-blue rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex gap-4 items-center">
            <h2 className="text-xl font-semibold">
              {currentDate.toLocaleDateString('en-US', { 
                month: 'long',
                year: 'numeric'
              })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  view === 'month' ? highlightColor : 'hover:bg-custom-blue'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  view === 'week' ? highlightColor : 'hover:bg-custom-blue'
                }`}
              >
                Week
              </button>
            </div>
          </div>

          <button
            onClick={() => view === 'month' ? navigateMonth(1) : navigateWeek(1)}
            className="p-2 hover:bg-custom-blue rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className={`grid grid-cols-7 gap-1`}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-gray-500 text-sm">
              {day}
            </div>
          ))}
          {view === 'month' ? renderMonthView() : renderWeekView()}
        </div>
      </div>
      {/* Add this modal overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
          <div className="relative z-50">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1"
            >
              ✕
            </button>

            {loginName==="root" ? 
            (<TaijiClassCardRoot 
              classData={selectedEvent}
              onEventClick={() => setIsModalOpen(false)}
            />) : 
            (<TaijiClassCard 
              classData={selectedEvent}
              onEventClick={() => setIsModalOpen(false)}
            />)}

          </div>
        </div>
      )}
    </div>
  );
};

const TabbedViews = ({ activeTab, config, events}) => {

  // Define the default config first
  const defaultConfig = {
    width: 'w-1/2',
    padding: 'p-6',
    rounded: 'rounded-lg',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800'
  };

  // Merge passed config with default config
  const finalConfig = { ...defaultConfig, ...(config || {}) };

  return (
    <div className="w-full min-h-screen">
      <SubPage isVisible={activeTab === 'list'} config={finalConfig}>
        <h2 className="text-2xl font-bold mb-4">Page 1 - List View</h2>
        {/* Content for List view */}
      </SubPage>

      <CalendarSubPage isVisible={activeTab === 'calendar'} config={finalConfig} events={events}>
        <h2 className="text-2xl font-bold mb-4">Page 2 - Calendar View</h2>
        {/* Content for Calendar view */}
      </CalendarSubPage>

      <SubPage isVisible={activeTab === 'contact'} config={finalConfig}>
        <h2 className="text-2xl font-bold mb-4">Page 3 - Contact View</h2>
        {/* Content for Contact view */}
      </SubPage>
    </div>
  );
};

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin ? `${BASE_URL}/api/login` : `${BASE_URL}/api/signup`;
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
      }

      console.log('Login successful, token received');
      // Save token to session storage
      sessionStorage.setItem('token', data.token);
      navigate('/');
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 border border-red-500 rounded bg-red-100 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="truncate">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLogin ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Move the main content to a separate component
const MainContent = ({ activeTab, setActiveTab, viewConfig }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      // Check for existing token
      const token = sessionStorage.getItem('token');
      
      try {
        let response;
        
        if (token) {
          // Try authenticated endpoint first
          response = await fetch(`${BASE_URL}/api/user`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            // If token is invalid, clear it
            sessionStorage.removeItem('token');
            // Fall back to default API
            response = await fetch(`${BASE_URL}/api/default`);
            console.log(response);
          }
        } else {
          // No token, use default API
          response = await fetch(`${BASE_URL}/api/default`);
          console.log(response);
        }

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        //see if the response is for a specific user acount - if it is, than uname is in there
        var events = await response.json();
        if (typeof events === 'object' && !Array.isArray(events) && 'uname' in events) {
          [events, loginName] = [events.items, events.uname];
        }
        
        //setEvents(data.events || []); // Assuming both APIs return events in the same format
        console.log(events);
        setEvents(events);

      } catch (err) {
        setError(err.message);
        if (token) sessionStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Run once on component mount

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto relative" style={{ aspectRatio: '16/9' }}>
        <img 
          src={backgroundImage}
          alt="Background" 
          className="absolute inset-0 w-full h-full object-contain -z-10"
        />
        <div className="w-full h-full flex items-center justify-center" 
             style={{transform: `scale(.68) translateY(-128px) translateX(8px)`}}>
          <RotatingYinYang />
        </div>
      </div>
      <ArtisticNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="mt-8">
        <TabbedViews 
          activeTab={activeTab}
          config={viewConfig}
          events={events}
        />
      </div>
    </>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('list');
  
  const viewConfig = {
    width: 'w-2/3',            
    padding: 'p-8',            
    rounded: 'rounded-2xl',    
    bgColor: 'bg-[#1f2937]',    
    textColor: 'text-[#e9e8d2]',
    fontFamily: fontGlobal,
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="*" 
            element={
              <MainContent 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                viewConfig={viewConfig}
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
