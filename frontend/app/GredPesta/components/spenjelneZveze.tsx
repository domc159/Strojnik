'use client';
import { useState, useRef, useEffect } from 'react';
import styles from '../GredPesta.module.css';

interface CalculationResults {
  p: number;
  p_dop: number;
  o_u: number;
  F_p: number;
  o_dop: number;
}

interface FormData {
  vrsta_obremenitve: string;
  materjal_gred: string;
  T: string;
  D: string;
  l_t: string;
  type: string;
  u: string;
  i: string;
  a: string;
  l_u: string;
  V_z: string;
}

export default function SpenjalneZveze() {
  const [formData, setFormData] = useState<FormData>({
    vrsta_obremenitve: 'enosmerna_lahka',
    materjal_gred: 'C35',
    T: '1600',
    D: '80',
    l_t: '120',
    type: 'deljen_pesto',
    u: '0.1',
    i: '1',
    a: '10',
    l_u: '20',
    V_z: '1.5'
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
        D: parseFloat(convertValue(formData.D)),
        l_t: parseFloat(convertValue(formData.l_t)),
        type: formData.type,
        u: parseFloat(convertValue(formData.u)),
        i: parseInt(convertValue(formData.i)),
        a: parseFloat(convertValue(formData.a)),
        l_u: parseFloat(convertValue(formData.l_u)),
        V_z: parseFloat(convertValue(formData.V_z))
      };

      // Send data to FastAPI
      const submitResponse = await fetch('https://api.datanexus.dev/api/spenjalneZvezeVnos', {
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
      const resultsResponse = await fetch('https://api.datanexus.dev/api/spenjalneZvezeResult');
      
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
    { symbol: "p", unit: "N/mm²", description: "površinski tlak" },
    { symbol: "p<sub>dop</sub>", unit: "N/mm²", description: "dopustni površinski tlak" },
    { symbol: "σ<sub>u</sub>", unit: "N/mm²", description: "upogibna napetost" },
    { symbol: "F<sub>p</sub>", unit: "N", description: "sila prednapetja" },
    { symbol: "σ<sub>dop</sub>", unit: "N/mm²", description: "dopustna napetost" },
    { symbol: "d", unit: "mm", description: "premer gredi" },
    { symbol: "l<sub>t</sub>", unit: "mm", description: "nosilna dolžina" },
    { symbol: "μ", unit: "", description: "koeficient trenja" },
    { symbol: "i", unit: "", description: "število vijakov" },
    { symbol: "a", unit: "mm", description: "širina objemke" },
    { symbol: "l<sub>u</sub>", unit: "mm", description: "razdalja med vijakoma" }
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
                <td>Tip zveze:</td>
                <td>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="deljen_pesto">Deljen pesto</option>
                    <option value="drugo">Drugo</option>
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
                  <input
                    type="number"
                    inputMode="decimal"
                    name="D"
                    value={formData.D}
                    onChange={handleInputChange}
                  />
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

              <tr>
                <td>μ:</td>
                <td>
                  <input
                    type="number"
                    inputMode="decimal"
                    name="u"
                    value={formData.u}
                    step="0.01"
                    onChange={handleInputChange}
                  />
                </td>
              </tr>

              <tr>
                <td>Število vijakov:</td>
                <td>
                  <input
                    type="number"
                    inputMode="decimal"
                    name="i"
                    value={formData.i}
                    min="1"
                    onChange={handleInputChange}
                  />
                </td>
              </tr>

              <tr>
                <td>a [mm]:</td>
                <td>
                  <input
                    type="number"
                    inputMode="decimal"
                    name="a"
                    value={formData.a}
                    onChange={handleInputChange}
                  />
                </td>
              </tr>

              <tr>
                <td>l<sub>u</sub> [mm]:</td>
                <td>
                  <input
                    type="number"
                    inputMode="decimal"
                    name="l_u"
                    value={formData.l_u}
                    onChange={handleInputChange}
                  />
                </td>
              </tr>

              <tr>
                <td>V<sub>z</sub>:</td>
                <td>
                  <input
                    type="number"
                    inputMode="decimal"
                    name="V_z"
                    value={formData.V_z}
                    step="0.1"
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
              <table className={styles.resultsTable}>
                <tbody>
                  <tr>
                    <td style={{border: '1px solid #8b7355'}}>p [N/mm²]:</td>
                    <td style={{border: '1px solid #8b7355'}}>{results.p}</td>
                  </tr>
                  <tr>
                    <td style={{border: '1px solid #8b7355'}}>p<sub>dop</sub> [N/mm²]:</td>
                    <td style={{border: '1px solid #8b7355'}}>{results.p_dop}</td>
                  </tr>
                  <tr>
                    <td style={{border: '1px solid #8b7355'}}>σ<sub>u</sub> [N/mm²]:</td>
                    <td style={{border: '1px solid #8b7355'}}>{results.o_u}</td>
                  </tr>
                  <tr>
                    <td style={{border: '1px solid #8b7355'}}>F<sub>p</sub> [N]:</td>
                    <td style={{border: '1px solid #8b7355'}}>{results.F_p}</td>
                  </tr>
                  <tr>
                    <td style={{border: '1px solid #8b7355'}}>σ<sub>dop</sub> [N/mm²]:</td>
                    <td style={{border: '1px solid #8b7355'}}>{results.o_dop}</td>
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
