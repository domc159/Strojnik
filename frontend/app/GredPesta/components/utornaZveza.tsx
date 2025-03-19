'use client';
import { useState, useRef, useEffect } from 'react';
import styles from '../GredPesta.module.css';

interface CalculationResults {
  p_lahka: number | null;
  p_srednja: number | null;
  p_dop: number | null;
  T_max_lahka: number | null;
  T_max_srednja: number | null;
}

interface FormData {
  vrsta_obremenitve: string;
  materjal_gred: string;
  T: string | '1';
  D: string | '1';
  centriranje: string;
  l_t: string | '1';

}

export default function Zagozda() {
  const [formData, setFormData] = useState<FormData>({
    vrsta_obremenitve: 'enosmerna_lahka',
    materjal_gred: 'C35',
    T: '1600',
    D: '80',
    centriranje: '1.35',
    l_t: '120',

  });

  const [results, setResults] = useState<CalculationResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showVariables, setShowVariables] = useState(true);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (results && resultsRef.current) {
      resultsRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [results]);

  const materials = [
    'S185', 'S235', 'S275', 'S355', 'E295', 'E335', 'E360',
    'C35', 'C45', 'C55', '30Mn5', '25CrMo4', '34CrMo4',
    '42CrMo4', '50CrMo4', '36CrNiMo4', '30CrNiMo8', 'C15',
    '15Cr3', '16MnCr5', '20MnCr5', '18CrNi8', 'GE200',
    'GE240', 'GE260', 'GE300'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (e.target.inputMode === 'decimal') {
      const processedValue = value.replace(/[^\d.,\-]/g, '');
      const finalValue = processedValue.replace(',', '.');
      if (finalValue === '' || finalValue === '-' || !isNaN(parseFloat(finalValue))) {
        setFormData(prev => ({
          ...prev,
          [name]: finalValue
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      
      const convertValue = (value: string) => {
        if (!value || value.trim() === '') return '0';
        return value.replace(',', '.');
      };
      
      const requestData = {
        vrsta_obremenitve: formData.vrsta_obremenitve,
        materjal_gred: formData.materjal_gred,
        T: parseFloat(convertValue(formData.T)),
        d: parseFloat(convertValue(formData.D)),
        l_t: parseFloat(convertValue(formData.l_t)),
        centriranje: parseFloat(formData.centriranje)
      };

      // Send data to FastAPI
      const submitResponse = await fetch('https://api.datanexus.dev/api/utornaZvezaVnos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!submitResponse.ok) {
        const errorText = await submitResponse.text();
        console.error('Napaka strežnika:', errorText);
        throw new Error('Napaka pri pošiljanju podatkov');
      }

      // Get results from FastAPI
      const resultsResponse = await fetch('https://api.datanexus.dev/api/utornaZvezaResult');
      
      if (!resultsResponse.ok) {
        const errorText = await resultsResponse.text();
        console.error('Napaka pri pridobivanju rezultatov:', errorText);
        throw new Error('Napaka pri pridobivanju rezultatov');
      }

      const data = await resultsResponse.json();
      
      if (data.status === 'success' && data.rezultati) {
        setResults(data.rezultati);
        setError(null);
      } else {
        throw new Error(data.message || 'Napaka pri izračunu');
      }

    } catch (error: any) {
      console.error('Napaka:', error);
      setError(error.message || 'Prišlo je do nepričakovane napake');
    }
  };

  const variables = [
    { symbol: "p", unit: "N/mm²", description: "površinski tlak med utori" },
    { symbol: "p<sub>dop</sub>", unit: "N/mm²", description: "dopustni površinski tlak" },
    { symbol: "T<sub>max</sub>", unit: "Nm", description: "maksimalni vrtilni moment" },
    { symbol: "T", unit: "Nm", description: "vrtilni moment" },	
    { symbol: "d", unit: "mm", description: "premer gredi" },
    { symbol: "l<sub>t</sub>", unit: "mm", description: "nosilna dolžina utorne zveze" },
  ];

  return (
    <div className={styles.componentContainer}>
      <div className={styles.layout}>
        <div className={styles.inputSection}>
          <table className={styles.inputTable}>
            <tbody>
              <tr>
                <td>Material:</td>
                <td>
                  <select
                    name="materjal_gred"
                    value={formData.materjal_gred}
                    onChange={handleInputChange}
                  >
                    {materials.map(mat => (
                      <option key={mat} value={mat}>{mat}</option>
                    ))}
                  </select>
                </td>
              </tr>

              <tr>
                <td>Obremenitev:</td>
                <td>
                  <select
                    name="vrsta_obremenitve"
                    value={formData.vrsta_obremenitve}
                    onChange={handleInputChange}
                  >
                    <option value="enosmerna_lahka">enosmerna lahka</option>
                    <option value="enosmerna_tezka">enosmerna težka</option>
                    <option value="izmenicna_lahka">izmenična lahka</option>
                    <option value="izmenicna_tezka">izmenična težka</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>Centriranje:</td>
                <td>
                  <select
                    name="centriranje"
                    value={formData.centriranje}
                    onChange={handleInputChange}
                  >
                    <option value="1.35">notranje</option>
                    <option value="1.05">aksialno</option>
                  </select>
                </td>
              </tr>

              <tr>
                <td>T [Nm]:</td>
                <td>
                  <input
                    type="number"
                    inputMode="decimal"
                    name="T"
                    value={formData.T}
                    onChange={handleInputChange}
                  />
                </td>
              </tr>

              <tr>
                <td>d [mm]:</td>
                <td>
                  <select
                    name="D"
                    value={formData.D}
                    onChange={handleInputChange}
                  >
                        <option value="11">11</option>
                        <option value="13">13</option>
                        <option value="16">16</option>
                        <option value="18">18</option>
                        <option value="21">21</option>
                        <option value="23">23</option>
                        <option value="26">26</option>
                        <option value="28">28</option>
                        <option value="32">32</option>
                        <option value="36">36</option>
                        <option value="42">42</option>
                        <option value="46">46</option>
                        <option value="56">56</option>
                        <option value="62">62</option>
                        <option value="72">72</option>
                        <option value="82">82</option>
                        <option value="92">92</option>
                        <option value="102">102</option>

                        
                        
                  </select>
                </td>
              </tr>


              <tr>
                <td>l<sub>t</sub> [mm]:</td>
                <td>
                  <input
                    type="number"
                    inputMode="decimal"
                    name="l_t"
                    value={formData.l_t}
                    onChange={handleInputChange}
                  />
                </td>
              </tr>

            
            </tbody>
          </table>

          <button className={styles.button} onClick={handleSubmit}>
            Izračunaj
          </button>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}
        </div>

        {results && (
          <div className={styles.resultsSection} ref={resultsRef}>
            <div className={styles.resultsPrint}>
              <table className={styles.resultsTable} >
                <thead>
                  <tr>
                    <th style={{border: '1px solid #8b7355'}}></th>
                    <th style={{border: '1px solid #8b7355'}}>Lahka izvedba</th>
                    <th style={{border: '1px solid #8b7355'}}>Srednja izvedba</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{border: '1px solid #8b7355'}}>p<sub>dop</sub> [N/mm²]:</td>
                    <td style={{border: '1px solid #8b7355'}} colSpan={2}>{results.p_dop}</td>
                  </tr>
                  <tr>
                    <td style={{border: '1px solid #8b7355'}}>p [N/mm²]:</td>
                    <td style={{border: '1px solid #8b7355'}}>{results.p_lahka}</td>
                    <td style={{border: '1px solid #8b7355'}}>{results.p_srednja}</td>
                  </tr>
                  <tr>
                    <td style={{border: '1px solid #8b7355'}}>T<sub>max</sub> [Nm]:</td>
                    <td style={{border: '1px solid #8b7355'}}>{results.T_max_lahka}</td>
                    <td style={{border: '1px solid #8b7355'}}>{results.T_max_srednja}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <div className={styles.variablesSection}>
      <button 
          className={`${styles.variablesToggle} ${showVariables ? styles.variablesToggleActive : styles.variablesToggleHide}`}
          onClick={() => setShowVariables(!showVariables)}
        >
          {showVariables ? 'Skrij spremenljivke' : 'Prikaži spremenljivke'}
        </button>
        {showVariables && (
          <div className={styles.variablesContainer}>
            {variables.map((variable, index) => (
              <div key={index} className={styles.variableItem}>
                <span className={styles.variableSymbol} 
                      dangerouslySetInnerHTML={{ __html: variable.symbol }} />
                <span className={styles.variableUnit}>[{variable.unit}]</span>
                <span className={styles.variableDescription}>- {variable.description}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
