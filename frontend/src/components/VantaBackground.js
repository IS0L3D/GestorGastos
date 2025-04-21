import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import WAVES from 'vanta/dist/vanta.waves.min';
import { useLocation } from 'react-router-dom';

const VantaBackground = () => {
  const refContainer = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (vantaEffect) {
      vantaEffect.destroy();
    }

    const pathColors = {
      '/dashboard': 0x4e8d7c,
      '/setup': 0xc49f47,
    };

    const colorForPath = pathColors[location.pathname] || 0x3a6ea5;

    const newEffect = WAVES({
      THREE,
      el: refContainer.current,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      color: colorForPath,
    });

    setVantaEffect(newEffect);

    return () => {
      if (newEffect) newEffect.destroy();
    };
  }, [location.pathname]);

  return (
    <div
      ref={refContainer}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
      }}
    />
  );
};

export default VantaBackground;
