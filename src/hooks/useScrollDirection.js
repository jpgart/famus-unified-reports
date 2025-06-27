import { useState, useEffect } from 'react';

/**
 * Custom hook to detect scroll direction and manage navigation visibility
 * @param {number} threshold - Minimum scroll distance to trigger direction change
 * @returns {Object} - { scrollDirection, isVisible, scrollY }
 */
const useScrollDirection = (threshold = 10) => {
  const [scrollDirection, setScrollDirection] = useState('up');
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateScrollDirection = () => {
      const currentScrollY = window.scrollY;
      
      setScrollY(currentScrollY);

      // Always show navigation at the top of the page
      if (currentScrollY < 50) {
        setIsVisible(true);
        setScrollDirection('up');
        setPrevScrollY(currentScrollY);
        ticking = false;
        return;
      }

      if (Math.abs(currentScrollY - prevScrollY) < threshold) {
        ticking = false;
        return;
      }

      const direction = currentScrollY > prevScrollY ? 'down' : 'up';
      
      setScrollDirection(direction);
      setIsVisible(direction === 'up');
      setPrevScrollY(currentScrollY);
      
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [prevScrollY, threshold]);

  return {
    scrollDirection,
    isVisible,
    scrollY
  };
};

export default useScrollDirection;
