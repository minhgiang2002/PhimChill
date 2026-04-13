import { useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

export default function CustomCodeInjector() {
  useEffect(() => {
    // Allow disabling custom code for troubleshooting
    const params = new URLSearchParams(window.location.search);
    if (params.get('disable_custom') === 'true') {
      console.warn("Custom code injection disabled via query param.");
      return;
    }

    const configRef = doc(db, 'configs', 'appearance');
    let lastCss = '';
    let lastJs = '';
    
    const unsubscribe = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        const { customCss, customJs } = docSnap.data();
        
        // Handle CSS
        if (customCss !== lastCss) {
          let styleTag = document.getElementById('custom-injected-css');
          if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'custom-injected-css';
            document.head.appendChild(styleTag);
          }
          styleTag.innerHTML = customCss || '';
          lastCss = customCss || '';
        }
        
        // Handle JS
        if (customJs !== lastJs) {
          const oldScript = document.getElementById('custom-injected-js');
          if (oldScript) {
            oldScript.remove();
          }
          
          if (customJs) {
            const newScript = document.createElement('script');
            newScript.id = 'custom-injected-js';
            newScript.innerHTML = `
              try {
                ${customJs}
              } catch (e) {
                console.error('Error in custom injected JS:', e);
              }
            `;
            document.body.appendChild(newScript);
          }
          lastJs = customJs || '';
        }
      }
    }, (error) => {
      console.error("CustomCodeInjector error:", error);
    });

    return () => unsubscribe();
  }, []);

  return null; // This component doesn't render anything
}
