// src/pages/Home.jsx
import React from 'react';
import HomeHeader from '../components/HomeHeader';
import HomeBlogList from '../components/HomeBlogList';

const Home = () => {
  return (
    <div>
      <HomeHeader/>
      <HomeBlogList/>
    </div>
  );
};

export default Home;