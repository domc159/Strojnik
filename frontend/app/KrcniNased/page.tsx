'use client';
import { useState } from 'react';
import styles from './KrcniNased.module.css';

interface CalculationResults {
  p_min: number;
  U_min: number;
  U_max: number;
  U_iz: number;
  U_min_k: number;
  U_max_k: number;
  F_m: number;
  theta_P: number;
  theta_G: number;
  najden_ujem: string;
}

interface FormData {
  materjal_pesto: string;
  materjal_gred: string;
  T: string;
  D: string;
  l_t: string;
  mi_k: string;
  d_n: string;
  D_z: string;
  R_zp: string;
  R_zg: string;
  v_pl: string;
  U_max: string;
  U_min: string;
  modul_elasticnosti_pesto?: string;
  meja_plasticnosti_pesto?: string;
  poissonovo_stevilo_pesto?: string;
  temperaturni_razteznostni_koeficient_pesto?: string;
  modul_elasticnosti_gred?: string;
  meja_plasticnosti_gred?: string;
  poissonovo_stevilo_gred?: string;
  temperaturni_razteznostni_koeficient_gred?: string;
}

export default function KrcniNased() {
  const [formData, setFormData] = useState<FormData>({
    materjal_pesto: 'C35',
    materjal_gred: 'E360',
    T: '1600',
    D: '80',
    l_t: '120',
    mi_k: '0.18',
    d_n: '0',
    D_z: '150',
    R_zp: '1.6',
    R_zg: '0.8',
    v_pl: '1.2',
    U_max: '0.1',
    U_min: '0.05',
    modul_elasticnosti_pesto: '210000',
    meja_plasticnosti_pesto: '370',
    poissonovo_stevilo_pesto: '0.3',
    temperaturni_razteznostni_koeficient_pesto: '0.000011',
    modul_elasticnosti_gred: '210000',
    meja_plasticnosti_gred: '355',
    poissonovo_stevilo_gred: '0.3',
    temperaturni_razteznostni_koeficient_gred: '0.000011',
  });

  const [results, setResults] = useState<CalculationResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const materials = [
    'ročni vnos',
    'S185', 'S235', 'S275', 'S355', 'E295', 'E335', 'E360',
    'C35', 'C45', 'C55', '30Mn5', '25CrMo4', '34CrMo4',
    '42CrMo4', '50CrMo4', '36CrNiMo4', '30CrNiMo8', 'C15',
    '15Cr3', '16MnCr5', '20MnCr5', '18CrNi8', 'GE200',
    'GE240', 'GE260', 'GE300'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Preveri, če je številsko polje
    if (e.target.inputMode === 'decimal') {
      // Dovoli samo številke, decimalne pike/vejice in minus
      const processedValue = value.replace(/[^\d.,\-]/g, '');
      // Zamenjaj vejico s piko
      const finalValue = processedValue.replace(',', '.');
      // Preveri, če je vrednost veljavno število
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
      // Dodamo preverjanje obveznih vrednosti
      if (formData.materjal_pesto === 'ročni vnos' && (
        !formData.modul_elasticnosti_pesto ||
        !formData.meja_plasticnosti_pesto ||
        !formData.poissonovo_stevilo_pesto ||
        !formData.temperaturni_razteznostni_koeficient_pesto
      )) {
        throw new Error('Prosim vnesite vse vrednosti za material pesta');
      }

      if (formData.materjal_gred === 'ročni vnos' && (
        !formData.modul_elasticnosti_gred ||
        !formData.meja_plasticnosti_gred ||
        !formData.poissonovo_stevilo_gred ||
        !formData.temperaturni_razteznostni_koeficient_gred
      )) {
        throw new Error('Prosim vnesite vse vrednosti za material gredi');
      }

      setError(null);
      
      // Funkcija za pretvorbo vrednosti
      const convertValue = (value: string) => {
        if (!value) return '0';
        return value.toString().replace(',', '.');
      };
      
      const requestData = {
        materjal_pesto: formData.materjal_pesto === 'ročni vnos' ? '' : formData.materjal_pesto,
        materjal_gred: formData.materjal_gred === 'ročni vnos' ? '' : formData.materjal_gred,
        T: parseFloat(convertValue(formData.T)) || 0,
        D: parseFloat(convertValue(formData.D)) || 0,
        l_t: parseFloat(convertValue(formData.l_t)) || 0,
        mi_k: parseFloat(convertValue(formData.mi_k)) || 0,
        d_n: parseFloat(convertValue(formData.d_n)) || 0,
        D_z: parseFloat(convertValue(formData.D_z)) || 0,
        R_zp: parseFloat(convertValue(formData.R_zp)) || 0,
        R_zg: parseFloat(convertValue(formData.R_zg)) || 0,
        v_pl: parseFloat(convertValue(formData.v_pl)) || 0,
        U_max: convertValue(formData.U_max),
        U_min: convertValue(formData.U_min),
        ...(formData.materjal_pesto === 'ročni vnos' ? {
            modul_elasticnosti_pesto: parseFloat(convertValue(formData.modul_elasticnosti_pesto!)) || 0,
            meja_plasticnosti_pesto: parseFloat(convertValue(formData.meja_plasticnosti_pesto!)) || 0,
            poissonovo_stevilo_pesto: parseFloat(convertValue(formData.poissonovo_stevilo_pesto!)) || 0,
            temperaturni_razteznostni_koeficient_pesto: parseFloat(convertValue(formData.temperaturni_razteznostni_koeficient_pesto!)) || 0
        } : {}),
        ...(formData.materjal_gred === 'ročni vnos' ? {
            modul_elasticnosti_gred: parseFloat(convertValue(formData.modul_elasticnosti_gred!)) || 0,
            meja_plasticnosti_gred: parseFloat(convertValue(formData.meja_plasticnosti_gred!)) || 0,
            poissonovo_stevilo_gred: parseFloat(convertValue(formData.poissonovo_stevilo_gred!)) || 0,
            temperaturni_razteznostni_koeficient_gred: parseFloat(convertValue(formData.temperaturni_razteznostni_koeficient_gred!)) || 0
        } : {})
      };

      console.log('Sending data:', requestData); // Za debugiranje

      // Pošlji podatke direktno na FastAPI
      const submitResponse = await fetch('https://api.datanexus.dev/api/krcninasedvnos', {
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

      // Pridobi rezultate direktno iz FastAPI
      const resultsResponse = await fetch('https://api.datanexus.dev/api/krcninasedrezultat');
      
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

  return (
    <div className={styles.container}>
       
        <div className={styles.layout}>
            <div className={styles.inputSection}>
            <h1>IZRAČUN KRČNEGA NASEDA</h1>
            
            <table className={styles.resultsTable}>
                <tbody>
                <tr>
                    <td>Material pesta:</td>
                    <td>
                    <select
                        name="materjal_pesto"
                        value={formData.materjal_pesto}
                        onChange={handleInputChange}
                    >
                        {materials.map(mat => (
                        <option key={mat} value={mat}>{mat}</option>
                        ))}
                    </select>
                    </td>
                </tr>

                {formData.materjal_pesto === 'ročni vnos' && (
                  <>
                    <tr>
                      <td>Modul elastičnosti pesta [MPa]:</td>
                      <td>
                        <input
                          type="number"
                          inputMode="decimal"
                          pattern="^-?\d*[.,]?\d*$"
                          name="modul_elasticnosti_pesto"
                          value={formData.modul_elasticnosti_pesto}
                          onChange={handleInputChange}
                          onKeyPress={(e) => {
                            if (!/[-0-9.,]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Meja plastičnosti pesta [MPa]:</td>
                      <td>
                        <input
                          type="number"
                          inputMode="decimal"
                          pattern="^-?\d*[.,]?\d*$"
                          name="meja_plasticnosti_pesto"
                          value={formData.meja_plasticnosti_pesto}
                          onChange={handleInputChange}
                          onKeyPress={(e) => {
                            if (!/[-0-9.,]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Poissonovo število pesta:</td>
                      <td>
                        <input
                          type="number"
                          inputMode="decimal"
                          pattern="^-?\d*[.,]?\d*$"
                          name="poissonovo_stevilo_pesto"
                          value={formData.poissonovo_stevilo_pesto}
                          onChange={handleInputChange}
                          step="0.01"
                          onKeyPress={(e) => {
                            if (!/[-0-9.,]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Temperaturni razteznostni koeficient pesta [1/K]:</td>
                      <td>
                        <input
                          type="number"
                          inputMode="decimal"
                          pattern="^-?\d*[.,]?\d*$"
                          name="temperaturni_razteznostni_koeficient_pesto"
                          value={formData.temperaturni_razteznostni_koeficient_pesto}
                          onChange={handleInputChange}
                          step="0.000001"
                          onKeyPress={(e) => {
                            if (!/[-0-9.,]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </td>
                    </tr>
                  </>
                )}

                <tr>
                    <td>Material gredi:</td>
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

                {formData.materjal_gred === 'ročni vnos' && (
                  <>
                    <tr>
                      <td>Modul elastičnosti gredi [MPa]:</td>
                      <td>
                        <input
                          type="number"
                          inputMode="decimal"
                          pattern="^-?\d*[.,]?\d*$"
                          name="modul_elasticnosti_gred"
                          value={formData.modul_elasticnosti_gred}
                          onChange={handleInputChange}
                          onKeyPress={(e) => {
                            if (!/[-0-9.,]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Meja plastičnosti gredi [MPa]:</td>
                      <td>
                        <input
                          type="number"
                          inputMode="decimal"
                          pattern="^-?\d*[.,]?\d*$"
                          name="meja_plasticnosti_gred"
                          value={formData.meja_plasticnosti_gred}
                          onChange={handleInputChange}
                          onKeyPress={(e) => {
                            if (!/[-0-9.,]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Poissonovo število gredi:</td>
                      <td>
                        <input
                          type="number"
                          inputMode="decimal"
                          pattern="^-?\d*[.,]?\d*$"
                          name="poissonovo_stevilo_gred"
                          value={formData.poissonovo_stevilo_gred}
                          onChange={handleInputChange}
                          step="0.01"
                          onKeyPress={(e) => {
                            if (!/[-0-9.,]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Temperaturni razteznostni koeficient gredi [1/K]:</td>
                      <td>
                        <input
                          type="number"
                          inputMode="decimal"
                          pattern="^-?\d*[.,]?\d*$"
                          name="temperaturni_razteznostni_koeficient_gred"
                          value={formData.temperaturni_razteznostni_koeficient_gred}
                          onChange={handleInputChange}
                          step="0.000001"
                          onKeyPress={(e) => {
                            if (!/[-0-9.,]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </td>
                    </tr>
                  </>
                )}

                <tr>
                    <td>Vrtilni moment [Nm]:</td>
                    <td>
                    <input
                        type="text"
                        inputMode="decimal"
                        pattern="^-?\d*[.,]?\d*$"
                        name="T"
                        value={formData.T}
                        onChange={handleInputChange}
                        onKeyPress={(e) => {
                          if (!/[-0-9.,]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                    />
                    </td>
                </tr>

                <tr>
                    <td>Imenski premer krčnega naseda [mm]:</td>
                    <td>
                    <input
                        type="number"
                        inputMode="decimal"
                        pattern="^-?\d*[.,]?\d*$"
                        name="D"
                        value={formData.D}
                        onChange={handleInputChange}
                        onKeyPress={(e) => {
                          if (!/[-0-9.,]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                    />
                    </td>
                </tr>

                <tr>
                    <td>Dolžina naseda [mm]:</td>
                    <td>
                    <input
                        type="number"
                        inputMode="decimal"
                        pattern="^-?\d*[.,]?\d*$"
                        name="l_t"
                        value={formData.l_t}
                        onChange={handleInputChange}
                        onKeyPress={(e) => {
                          if (!/[-0-9.,]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                    />
                    </td>
                </tr>

                <tr>
                    <td>Koeficient trenja:</td>
                    <td>
                    <input
                        type="number"
                        inputMode="decimal"
                        pattern="^-?\d*[.,]?\d*$"
                        name="mi_k"
                        value={formData.mi_k}
                        onChange={handleInputChange}
                        step="0.01"
                        onKeyPress={(e) => {
                          if (!/[-0-9.,]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                    />
                    </td>
                </tr>

                <tr>
                    <td>Premer odprtine [mm]:</td>
                    <td>
                    <input
                        type="number"
                        inputMode="decimal"
                        pattern="^-?\d*[.,]?\d*$"
                        name="d_n"
                        value={formData.d_n}
                        onChange={handleInputChange}
                        onKeyPress={(e) => {
                          if (!/[-0-9.,]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                    />
                    </td>
                </tr>

                <tr>
                    <td>Zunanji premer pesta [mm]:</td>
                    <td>
                    <input
                        type="number"
                        inputMode="decimal"
                        pattern="^-?\d*[.,]?\d*$"
                        name="D_z"
                        value={formData.D_z}
                        onChange={handleInputChange}
                        onKeyPress={(e) => {
                          if (!/[-0-9.,]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                    />
                    </td>
                </tr>

                <tr>
                    <td>Hrapavost pesta [μm]:</td>
                    <td>
                    <input
                        type="number"
                        inputMode="decimal"
                        pattern="^-?\d*[.,]?\d*$"
                        name="R_zp"
                        value={formData.R_zp}
                        onChange={handleInputChange}
                        step="0.1"
                        onKeyPress={(e) => {
                          if (!/[-0-9.,]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                    />
                    </td>
                </tr>

                <tr>
                    <td>Hrapavost gredi [μm]:</td>
                    <td>
                    <input
                        type="number"
                        inputMode="decimal"
                        pattern="^-?\d*[.,]?\d*$"
                        name="R_zg"
                        value={formData.R_zg}
                        onChange={handleInputChange}
                        step="0.1"
                        onKeyPress={(e) => {
                          if (!/[-0-9.,]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
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
            <div className={styles.resultsSection}>
                <h2>Rezultati izračuna</h2>
                <table className={styles.resultsTable}>
                <tbody>
                    <tr>
                    <td>Minimalni tlak (p_min)</td>
                    <td>{results.p_min} N/mm2</td>
                    </tr>
                    <tr>
                    <td>Minimalna nadmera (U_min)</td>
                    <td>{results.U_min} mm</td>
                    </tr>
                    <tr>
                    <td>Maksimalna nadmera (U_max)</td>
                    <td>{results.U_max} mm</td>
                    </tr>
                    <tr>
                    <td>Izgubljena nadmera (U_iz)</td>
                    <td>{results.U_iz} mm</td>
                    </tr>
                    <tr>
                    <td>Najmanjša potrebna teoretična nadmera (U_min_k)</td>
                    <td>{results.U_min_k} mm</td>
                    </tr>
                    <tr>
                    <td>Največja potrebna teoretična nadmera (U_max_k)</td>
                    <td>{results.U_max_k} mm</td>
                    </tr>
                    <tr>
                    <td>Sila za mehansko montažo (F_m)</td>
                    <td>{results.F_m} N</td>
                    </tr>
                    <tr>
                    <td>Temperatura pesta (θ_P)</td>
                    <td>{results.theta_P} °C</td>
                    </tr>
                    <tr>
                    <td>Temperatura gredi (θ_G)</td>
                    <td>{results.theta_G} °C</td>
                    </tr>
                    <tr>
                    <td>Najden ujem (najden_ujem)</td>
                    <td>Ø {formData.D} {results.najden_ujem}</td>
                    </tr>
                </tbody>
                </table>

            </div>
            )}
        </div>
        <div>
            <h2>Kalkulator krčnega naseda</h2>
        </div>
    </div>
  );
}
