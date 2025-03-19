'use client';
import { useState } from 'react';
import styles from './GredPesta.module.css';
import KrcniNased from './components/krcni-nased';
import StozcastiNased from './components/konus';
import Zagozda from './components/zagozda';
import Moznik from './components/moznik';
import UtorneZveze from './components/utornaZveza';
import ZobateZveze from './components/zobateZveze';
import PoligonalneZveze from './components/poligonalnaZveza';	
import SpenjalneZveze from './components/spenjelneZveze';
// Uvozite ostale komponente na podoben način

const GredPesta = () => {
  const [selectedComponent, setSelectedComponent] = useState<string>('');

  const navigationItems = [
    'Zagozda',
    'Moznik',
    'UtorneZveze',
    'ZobateZveze',
    'PoligonalneZveze',
    'SpenjalneZveze',
    'StožčastiNased',
    'ElastičniVezniElementi',
    'KrčniNased'
  ];

  const renderComponent = () => {
    switch (selectedComponent) {
      case 'Zagozda':
        return <Zagozda />;
      case 'Moznik':
        return <Moznik />;
      case 'KrčniNased':
        return <KrcniNased />;
      case 'StožčastiNased':
        return <StozcastiNased />;
      case 'UtorneZveze':
        return <UtorneZveze />;
      case 'ZobateZveze':
        return <ZobateZveze />;
      case 'PoligonalneZveze':
        return <PoligonalneZveze />;
      case 'SpenjalneZveze':
        return <SpenjalneZveze />;

      // Dodajte ostale primere
      default:
        return null;
    }
  };
  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        {navigationItems.map((item) => (
          <button
            key={item}
            className={`${styles.navButton} ${selectedComponent === item ? styles.active : ''}`}
            onClick={() => setSelectedComponent(item)}
          >
            {item}
          </button>
        ))}
        <a href="/home" className={styles.navButton} style={{marginLeft: 'auto', marginRight: '25px'}}>
          Home
        </a>
      </nav>
      <main className={styles.content}>
        {renderComponent()}
      </main>
    </div>
  );
};

export default GredPesta;
