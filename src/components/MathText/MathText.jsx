// src/components/MathText/MathText.jsx
import React, { useEffect, useRef } from 'react';

/**
 * Renders mathematical text (containing LaTeX formulas like $...$ or $$...$$)
 * and uses KaTeX auto-render extension to process it in React.
 */
export default function MathText({ children, className = '', as: Component = 'div' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && window.renderMathInElement) {
      try {
        window.renderMathInElement(containerRef.current, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false
        });
      } catch (err) {
        console.error('KaTeX rendering error:', err);
      }
    }
  }, [children]);

  return (
    <Component ref={containerRef} className={className}>
      {children}
    </Component>
  );
}
