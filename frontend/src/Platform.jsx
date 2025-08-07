import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Profile from './components/Profile';
import Feed from './components/Feed';
import Events from './components/Events';
import Chatbot from './components/Chatbot';
import FeedbackSurvey from './components/FeedbackSurvey';
import Networking from './components/Networking';
import MentorshipPortal from './components/MentorshipPortal';
import DiscussionForum from './components/DiscussionForum';
import About from './components/About';
import Setting from './components/Setting';

function Platform() {
  return (
    <Routes>
      <Route path="" element={<Home />} />
      <Route path="profile" element={<Profile />} />
      <Route path="feed" element={<Feed />} />
      <Route path="events" element={<Events />} />
      <Route path="chatbot" element={<Chatbot />} />
      <Route path="feedback" element={<FeedbackSurvey />} />
      <Route path="discussion" element={<DiscussionForum />} />
      <Route path="networking" element={<Networking />} />
      <Route path="about" element={<About />} />
      <Route path="setting" element={<Setting />} />
      <Route path="mentoring" element={<MentorshipPortal />} />
    </Routes>
  );
}

export default Platform;