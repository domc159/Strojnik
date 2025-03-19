'use client';
import { useState, useRef, useEffect } from 'react';
import styles from '../GredPesta.module.css';

interface CalculationResults {
  konus: number;
  Fp_nor: number;
  F_nor: number;
  Fn: number;
  Ftr: number;
  p_nor: number;
  Fp_rad: number;
  F_rad: number;
  Fr: number;
  Fa: number;
  p_rad: number;
  T: number;
  p_dop: number;
}

interface FormData {
  T: string;
  D: string;
  d: string;
  a: string;
  L: string;
  mi_k: string;
  z_moznik: boolean;
  konus_naseda: string;
  P: string;
  n: string;
  pesto: string;
  obremenitev: string;
}

export default function Konus() {
  const [formData, setFormData] = useState<FormData>({
    T: '1600',
    D: '80',
    d: '150',
    a: '5.725',
    L: '120',
    mi_k: '0.18',
    z_moznik: false,
    konus_naseda: '10',
    P: '7500',
    n: '80',
    pesto: 'C35',
    obremenitev: 'enosmerna_lahka'
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
        T: parseFloat(convertValue(formData.T)),
        D: parseFloat(convertValue(formData.D)),
        d: parseFloat(convertValue(formData.d)),
        a: parseFloat(convertValue(formData.a)),
        L: parseFloat(convertValue(formData.L)),
        mi_k: parseFloat(convertValue(formData.mi_k)),
        P: parseFloat(convertValue(formData.P)),
        n: parseFloat(convertValue(formData.n)),
        z_moznik: formData.z_moznik,
        konus_naseda: formData.konus_naseda,
        pesto: formData.pesto,
        obremenitev: formData.obremenitev
      };

      const submitResponse = await fetch('https://api.datanexus.dev/api/stozcastiNasedVnos', {
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

      const resultsResponse = await fetch('https://api.datanexus.dev/api/stozcastiNasedResult');
      
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
    { symbol: "konus", unit: "", description: "Konus" },
    { symbol: "F<sub>p</sub>", unit: "N", description: "potrebna osna sila pri montaži" },
    { symbol: "F", unit: "N", description: "Glej sliko" },
    { symbol: "F<sub>n</sub>", unit: "N", description: "Glej sliko" },
    { symbol: "F<sub>tr</sub>", unit: "N", description: "Glej sliko" },
    { symbol: "F<sub>p,rad</sub>", unit: "N", description: "Glej sliko" },
    { symbol: "F<sub>rad</sub>", unit: "N", description: "Glej sliko" },
    { symbol: "F<sub>r</sub>", unit: "N", description: "Glej sliko" },
    { symbol: "F<sub>a</sub>", unit: "N", description: "Glej sliko" },
    { symbol: "p", unit: "N/mm²", description: "površinski tlak" },
    { symbol: "p<sub>dop</sub>", unit: "N/mm²", description: "dopustni površinski tlak" }

  ];

  const materials = [
    'S185', 'S235', 'S275', 'S355', 'E295', 'E335', 'E360',
    'C35', 'C45', 'C55', '30Mn5', '25CrMo4', '34CrMo4',
    '42CrMo4', '50CrMo4', '36CrNiMo4', '30CrNiMo8', 'C15',
    '15Cr3', '16MnCr5', '20MnCr5', '18CrNi8', 'GE200',
    'GE240', 'GE260', 'GE300'
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
                    name="pesto"
                    value={formData.pesto}
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
                    name="obremenitev"
                    value={formData.obremenitev}
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
                <td>D [mm]:</td>
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
                <td>d [mm]:</td>
                <td>
                  <input
                    type="number"
                    inputMode="decimal"
                    name="d"
                    value={formData.d}
                    onChange={handleInputChange}
                  />
                </td>
              </tr>

              <tr>
                <td>P [W]:</td>
                <td>
                  <input
                    type="number"
                    inputMode="decimal"
                    name="P"
                    value={formData.P}
                    onChange={handleInputChange}
                  />
                </td>
              </tr>

              <tr>
                <td>n [min<sup>-1</sup>]:</td>
                <td>
                  <input
                    type="number"
                    inputMode="decimal"
                    name="n"
                    value={formData.n}
                    onChange={handleInputChange}
                  />
                </td>
              </tr>

              <tr>
                <td>α [°]:</td>
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
                <td>L [mm]:</td>
                <td>
                  <input
                    type="number"
                    inputMode="decimal"
                    name="L"
                    value={formData.L}
                    onChange={handleInputChange}
                  />
                </td>
              </tr>

              <tr>
                <td>μ<sub>k</sub>:</td>
                <td>
                  <input
                    type="number"
                    inputMode="decimal"
                    name="mi_k"
                    value={formData.mi_k}
                    onChange={handleInputChange}
                  />
                </td>
              </tr>

              <tr>
                <td>Moznik:</td>
                <td>
                  <input
                    type="checkbox"
                    name="z_moznik"
                    checked={formData.z_moznik}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      z_moznik: e.target.checked
                    }))}
                  />
                </td>
              </tr>

              <tr>
                <td>Konus:</td>
                <td>
                  1:<input
                    type="number"
                    inputMode="decimal"
                    name="konus_naseda"
                    value={formData.konus_naseda}
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
          <div className={styles.resultsContainer}>
            <div className={styles.tableWrapper}>
              <table className={styles.resultsTable} style={{borderCollapse: 'collapse'}}>
                <thead>
                  <tr>
                    <th style={{border: '1px solid #8b7355'}}></th>
                    <th style={{border: '1px solid #8b7355'}}>Normalna sila</th>
                    <th style={{border: '1px solid #8b7355'}}>Radialna sila</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{border: '1px solid #8b7355'}}>Konus</td>
                    <td style={{textAlign: 'center', border: '1px solid #8b7355'}} colSpan={2}>1:{results.konus}</td>
                  </tr>
                  <tr>
                    <td style={{border: '1px solid #8b7355'}}>T:</td>
                    <td style={{textAlign: 'center', border: '1px solid #8b7355'}} colSpan={2}>{results.T} Nmm</td>
                  </tr>
                  {results.p_nor !== 0 && (
                    <tr>
                      <td style={{border: '1px solid #8b7355'}}>p<sub>dop</sub>:</td>
                      <td style={{border: '1px solid #8b7355'}} colSpan={2}>{results.p_dop}N/mm²</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{border: '1px solid #8b7355'}}>F<sub>p</sub></td>
                    <td style={{border: '1px solid #8b7355'}}>{results.Fp_nor} N</td>
                    <td style={{border: '1px solid #8b7355'}}>{results.Fp_rad} N</td>
                  </tr>
                  {results.F_nor !== 0 && (
                    <tr>
                      <td style={{border: '1px solid #8b7355'}}>F:</td>
                      <td style={{border: '1px solid #8b7355'}}>{results.F_nor}N</td>
                      <td style={{border: '1px solid #8b7355'}}>{results.F_rad}N</td>
                    </tr>
                  )}

                  {results.Fn !== 0 && (
                    <tr>
                      <td style={{border: '1px solid #8b7355'}}>F<sub>n</sub>:</td>
                      <td style={{border: '1px solid #8b7355'}}>{results.Fn}N</td>
                      <td style={{border: '1px solid #8b7355'}}></td>

                    </tr>
                  )}
                  {results.Ftr !== 0 && (
                    <tr>
                      <td style={{border: '1px solid #8b7355'}}>F<sub>tr</sub>:</td>
                      <td style={{border: '1px solid #8b7355'}}>{results.Ftr}N</td>
                      <td style={{border: '1px solid #8b7355'}}></td>

                    </tr>
                  )}

                  {results.Fr !== 0 && (
                    <tr>
                      <td style={{border: '1px solid #8b7355'}}>F<sub>r</sub>:</td>
                      <td style={{border: '1px solid #8b7355'}}></td>
                      <td style={{border: '1px solid #8b7355'}}>{results.Fr}N</td>
                    </tr>
                  )}
                  {results.Fa !== 0 && (
                    <tr>
                      <td style={{border: '1px solid #8b7355'}}>F<sub>a</sub>:</td>
                      <td style={{border: '1px solid #8b7355'}}></td>
                      <td style={{border: '1px solid #8b7355'}}>{results.Fa}N</td>
                    </tr>
                  )}

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
                <span className={styles.variableSymbol}>
                  <span dangerouslySetInnerHTML={{ __html: variable.symbol }} />
                </span>
                <span className={styles.variableUnit}>[{variable.unit}]</span>
                <span className={styles.variableDescription}>- {variable.description}</span>
              </div>
            ))}
          </div>
        )}
        <div className={styles.imageContainer}>
          <img 
            src="/pictures/konus.png" 
            alt="Konus"
            className={styles.schemaImage}
          />
        </div>
      </div>
    </div>
  );
}
