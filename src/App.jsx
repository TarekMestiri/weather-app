import React, { useEffect } from 'react'
import Weather from './components/Weather'
import './index.css'

const App = () => {
  // Add the particle and star effects
  useEffect(() => {
    const app = document.querySelector('.app');
    
    // Create particles
    const particleCount = 25;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      // Random properties
      const size = Math.random() * 3 + 1;
      const posX = Math.random() * 100;
      const delay = Math.random() * 20;
      const duration = Math.random() * 15 + 15;
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${posX}vw`;
      particle.style.animationDelay = `${delay}s`;
      particle.style.animationDuration = `${duration}s`;
      
      app.appendChild(particle);
    }
    
    // Create stars
    const starCount = 40;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.classList.add('star');
      
      const size = Math.random() * 2 + 1;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = 3 + Math.random() * 4;
      
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${posX}vw`;
      star.style.top = `${posY}vh`;
      star.style.animationDelay = `${delay}s`;
      star.style.animationDuration = `${duration}s`;
      
      app.appendChild(star);
    }
    
    // Clean up function
    return () => {
      const particles = document.querySelectorAll('.particle');
      particles.forEach(particle => particle.remove());
      
      const stars = document.querySelectorAll('.star');
      stars.forEach(star => star.remove());
    };
  }, []);

  return (
    <div className='app'>
      {/* Add the background elements */}
      <div className="light-ray"></div>
      <div className="weather-element"></div>
      <div className="weather-element"></div>
      <div className="weather-element"></div>
      
      <Weather />
    </div>
  )
}

export default App