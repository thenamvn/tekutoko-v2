// hooks/useIsMobile.js
import { useState, useEffect } from 'react';

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768); // You can adjust this breakpoint
        };

        handleResize(); // Set initial value
        window.addEventListener('resize', handleResize); // Update on resize

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isMobile;
};

export default useIsMobile;