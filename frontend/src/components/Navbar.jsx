import React from 'react';
import './Navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faSearch, 
  faHome, 
  faRss, 
  faChalkboardTeacher, 
  faComments, 
  faNetworkWired, 
  faCalendarAlt, 
  faRobot, 
  faCommentDots, 
  faCog,
  faInfoCircle  // Importing an icon for the About button
} from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  return (
    <nav className='navbar'>
      <NavLink icon={faUser} text="Profile" to='/platform/profile' />
      <NavLink icon={faSearch} text="Search" />
      <NavLink icon={faHome} text="Home" to='/platform'/>
      <NavLink icon={faRss} text="Feed" to='/platform/feed' />
      <NavLink icon={faChalkboardTeacher} text="Mentoring" to='/platform/mentoring' />
      <NavLink icon={faComments} text="Discussion" to='/platform/discussion' />
      <NavLink icon={faNetworkWired} text="Networking" to='/platform/networking' />
      <NavLink icon={faCalendarAlt} text="Events and Reunion" to='/platform/events' />
      <NavLink icon={faRobot} text="Chat Bot" to='/platform/chatbot' />
      <NavLink icon={faCommentDots} text="Feedback and Survey" to='/platform/feedback' />
      <NavLink icon={faInfoCircle} text="About" to='/platform/about' />  
      <NavLink icon={faCog} text="Settings" to='/platform/setting' />
    </nav>
  );
};

const NavLink = ({ icon, text, to }) => {
  return (
    <a href={to} className="nav-link">
      <FontAwesomeIcon icon={icon} />
      <span>{text}</span>
    </a>
  );
};

export default Navbar;