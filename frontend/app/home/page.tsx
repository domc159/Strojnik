// app/page.tsx
'use client';

import { useEffect } from 'react';
import styles from './Home.module.css';

export default function Page() {


  const p = 3;
  const n = 9;
  const m = n * n;



  // Generate tiles for each face
  const generateTiles = (count: number) => {
    return Array.from({ length: count }, (_, index) => (
      <div key={index} className={styles.tile} />
    ));
  };

  // Generate faces
  const generateFaces = () => {
    return Array.from({ length: p }, (_, i) => (
      <div
        key={i}
        className={styles.face}
        style={i < p - 1 ? { '--f': i } as React.CSSProperties : undefined}
      >
        {generateTiles(m)}
      </div>
    ));
  };

  return (
    <body>
        <div className={styles.container}>
          <h1 className={styles.title}>DIGITALNI STROJNIK MIHA</h1>
          <div style={{zIndex: 3}}>
            <a href="/GredPesta" className={styles.element}>Zveza gred pesto</a>
            <br/>
            <br/>
            {/* <a href="/Vijaki" className={styles.element}>Vijaki</a>	*/}
            <br/>
            <br/>
            {/* <a href="/Lezaji" className={styles.element}>Lezaji</a>	*/}

	
          </div>
          <div className={styles.cube} style={{ '--n': n } as React.CSSProperties}>
            {generateFaces()}
          </div>
      <div>
      </div>
    </div>
    
    <script
      data-embed-id="db50c472-2d19-4e76-9b48-54ca861adc1d"
      data-base-api-url="https://ai.datanexus.si/api/embed"
      src="https://ai.datanexus.si/embed/anythingllm-chat-widget.min.js">
    </script>


    </body>
  );
}