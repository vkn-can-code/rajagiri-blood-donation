// This file is src/hooks/useIntersectionObserver.js
// This is a custom hook to detect when an element scrolls into view

import { useState, useEffect, useRef } from 'react';

const useIntersectionObserver = (options) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      // When the element is in view, update the state
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        // We only want it to animate once, so we disconnect
        observer.disconnect();
      }
    }, options);

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    // Clean up the observer
    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [options]);

  return [elementRef, isIntersecting];
};

export default useIntersectionObserver;