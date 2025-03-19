'use client';
import { useState, useRef, useEffect } from 'react';
import styles from '../GredPesta.module.css';

interface CalculationResults {
  p_min: number;
  p_min1: number;
  U_min: number;
  U_max: number;
  U_iz: number;
  U_min_k: number;
  U_max_k: number;
  F_m: number;
  theta_P: number;
  theta_G: number;
  najden_ujem: string;
  T_max: number;
  p_dop: number;
  F_dop: number;
  p_max: number;
}

interface FormData {
  vrsta_obremenitve: string;
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
    vrsta_obremenitve: 'staticna',
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
  const [showVariables, setShowVariables] = useState(true);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Dodamo useEffect za scrollanje
  useEffect(() => {
    if (results && resultsRef.current) {
      resultsRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [results]);

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
      
      const convertValue = (value: string) => {
        if (!value || value.trim() === '') return '0';
        return value.replace(',', '.');
      };
      
      const requestData = {
        vrsta_obremenitve: formData.vrsta_obremenitve,
        materjal_pesto: formData.materjal_pesto === 'ročni vnos' ? '' : formData.materjal_pesto,
        materjal_gred: formData.materjal_gred === 'ročni vnos' ? '' : formData.materjal_gred,
        T: parseFloat(convertValue(formData.T)),
        D: parseFloat(convertValue(formData.D)),
        l_t: parseFloat(convertValue(formData.l_t)),
        mi_k: parseFloat(convertValue(formData.mi_k)),
        d_n: parseFloat(convertValue(formData.d_n)),
        D_z: parseFloat(convertValue(formData.D_z)),
        R_zp: parseFloat(convertValue(formData.R_zp)),
        R_zg: parseFloat(convertValue(formData.R_zg)),
        v_pl: parseFloat(convertValue(formData.v_pl)),
        U_max: convertValue(formData.U_max),
        U_min: convertValue(formData.U_min),
        ...(formData.materjal_pesto === 'ročni vnos' ? {
          modul_elasticnosti_pesto: parseFloat(convertValue(formData.modul_elasticnosti_pesto!)),
          meja_plasticnosti_pesto: parseFloat(convertValue(formData.meja_plasticnosti_pesto!)),
          poissonovo_stevilo_pesto: parseFloat(convertValue(formData.poissonovo_stevilo_pesto!)),
          temperaturni_razteznostni_koeficient_pesto: parseFloat(convertValue(formData.temperaturni_razteznostni_koeficient_pesto!))
        } : {}),
        ...(formData.materjal_gred === 'ročni vnos' ? {
          modul_elasticnosti_gred: parseFloat(convertValue(formData.modul_elasticnosti_gred!)),
          meja_plasticnosti_gred: parseFloat(convertValue(formData.meja_plasticnosti_gred!)),
          poissonovo_stevilo_gred: parseFloat(convertValue(formData.poissonovo_stevilo_gred!)),
          temperaturni_razteznostni_koeficient_gred: parseFloat(convertValue(formData.temperaturni_razteznostni_koeficient_gred!))
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

  const variables = [
    { symbol: "F", unit: "N", description: "sila trenja na kontaktnih površinah med gredjo in pestom" , displaySymbol: "F<sub>tr</sub>" },
    { symbol: "F<sub>t</sub>", unit: "N", description: "obodna sila = 2T/D" , displaySymbol: "F<sub>t</sub>" },
    { symbol: "F<sub>a</sub>", unit: "N", description: "aksialna sila"  , displaySymbol: "F<sub>a</sub>"},
    { symbol: "ν<sub>z</sub>", unit: " ", description: "varnostni koeficient proti zdru: 1.5 (statična), 1.8 (utripna), 2.2 (izmenična obremenitev)" , displaySymbol: "ν<sub>z</sub>" },
    { symbol: "p<sub>min</sub>", unit: "N/mm²", description: "najmanjši potrebni površinski tlak med gredjo in pestom"  , displaySymbol: "p<sub>min</sub>"},
    { symbol: "D", unit: "mm", description: "imenski premer krčnega naseda, " },
    { symbol: "l<sub>t</sub>", unit: "mm", description: "nosilna dolžina krčnega naseda (običajno dolžina pesta)"  , displaySymbol: "l<sub>t</sub>"},
    { symbol: "μ<sub>t</sub>", unit: " ", description: "koeficient trenja krčnega naseda"  , displaySymbol: "μ<sub>t</sub>"},
    { symbol: "Re<sub>P</sub>", unit: "N/mm²", description: "meja plastičnosti gradiva pesta; za krhka gradiva (siva litina) vzamemo ReP ≈ 0.5·Rm,P" , displaySymbol: "Re<sub>P</sub>"},
    { symbol: "Re<sub>G</sub>", unit: "N/mm²", description: "meja plastičnosti gradiva gredi" , displaySymbol: "Re<sub>G</sub>"},
    { symbol: "E<sub>P</sub>", unit: "N/mm²", description: "modul elastičnosti gradiva pesta" , displaySymbol: "E<sub>P</sub>"},
    { symbol: "E<sub>G</sub>", unit: "N/mm²", description: "modul elastičnosti gradiva gredi" , displaySymbol: "E<sub>G</sub>"},
    { symbol: "Q<sub>G</sub>", unit: " ", description: "razmerje premerov gredi" , displaySymbol: "Q<sub>G</sub>"},
    { symbol: "Q<sub>P</sub>", unit: " ", description: "razmerje premerov pesta" , displaySymbol: "Q<sub>P</sub>"},
    { symbol: "ν<sub>pl</sub>", unit: " ", description: "varnostni koeficient proti plastični deformaciji; νpl ≥ 1,2" , displaySymbol: "ν<sub>pl</sub>"},
    {  symbol: "U<sub>min</sub>", unit: "mm", description: "najmanjša potrebna teoretična nadmera" , displaySymbol: "U<sub>min</sub>"},
    { symbol: "U<sub>max</sub>", unit: "mm", description: "največja dovoljena teoretična nadmera" , displaySymbol: "U<sub>max</sub>"},
    { symbol: "U'<sub>min</sub>", unit: "mm", description: "najmanjša potrebna dejanska nadmera" , displaySymbol: "U'<sub>min</sub>"},
    { symbol: "U'<sub>max</sub>", unit: "mm", description: "največja dovoljena dejanska nadmera" , displaySymbol: "U'<sub>max</sub>"},
    { symbol: "U<sub>iz</sub>", unit: "mm", description: "izgubljena nadmera zaradi zgladitve površin" , displaySymbol: "U<sub>iz</sub>"},
    { symbol: "F<sub>d,dop</sub>", unit: "N", description: "dopustna aksialna sila" , displaySymbol: "F<sub>d,dop</sub>"},
    { symbol: "F<sub>t,dop</sub>", unit: "N", description: "dopustna obodna sila" , displaySymbol: "F<sub>t,dop</sub>"},
    { symbol: "p<sub>min_potr</sub>", unit: "N/mm²", description: "najmanjši potreben površinski tlak med gredjo in pestom"  , displaySymbol: "p<sub>min</sub>"},
    { symbol: "p<sub>min</sub>", unit: "N/mm²", description: "najmanjši zagotovljen površinski tlak med gredjo in pestom"  , displaySymbol: "p<sub>min</sub>"},
    { symbol: "p<sub>max</sub>", unit: "N/mm²", description: "maksimalni površinski tlak" , displaySymbol: "p<sub>max</sub>"},
    { symbol: "ϑ<sub>P</sub>", unit: "°C", description: "potrebna temperatura segrevanja pesta" , displaySymbol: "ϑ<sub>P</sub>"},
    { symbol: "ϑ<sub>G</sub>", unit: "°C", description: "potrebna temperatura podhladitve gredi" , displaySymbol: "ϑ<sub>G</sub>"},
    { symbol: "ϑ<sub>k</sub>", unit: "°C", description: "temperatura okolice; običajno ϑk = 20 °C" , displaySymbol: "ϑ<sub>k</sub>"},
    { symbol: "O<sub>m</sub>", unit: "mm", description: "potreben ohlap pri montaži; ≥ 0,001 D" , displaySymbol: "O<sub>m</sub>"},
    { symbol: "α<sub>P</sub>", unit: "K⁻¹", description: "temperaturni razteznostni koeficient pesta (segrevanje)" , displaySymbol: "α<sub>P</sub>"},
    { symbol: "α<sub>G</sub>", unit: "K⁻¹", description: "temperaturni razteznostni koeficient gredi (ohlajanje)" , displaySymbol: "α<sub>G</sub>"}
  ];

  return (
    <div className={styles.componentContainer}>
      <div className={styles.layout}>
        <div className={styles.inputSection}>
          <table className={styles.inputTable}>
            <tbody>
              <tr>
                <td>Pesto:</td>
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
                    <td>E<sub>P</sub> [MPa]:</td>
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
                    <td>Re<sub>P</sub> [MPa]:</td>
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
                    <td>&nu;:</td>
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
                    <td>α<sub>P</sub> [1/K]:</td>
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
                <td>Gred:</td>
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
                    <td>E<sub>G</sub> [MPa]:</td>
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
                    <td>Re<sub>G</sub> [MPa]:</td>
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
                    <td>&nu;:</td>
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
                    <td>α<sub>G</sub> [1/K]:</td>
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
                <td>Obremenitev:</td>
                <td>
                  <select
                    name="vrsta_obremenitve"
                    value={formData.vrsta_obremenitve}
                    onChange={handleInputChange}
                    style={{ width: 'auto' }}
                  >
                    <option value="statična">statična</option>
                    <option value="utripna">utripna</option>
                    <option value="izmenicna">izmenična</option>
                  </select>
                </td>
              </tr>

              <tr>
                <td>T [Nm]:</td>
                <td>
                  <input
                    type="number"
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
                <td>D [mm]:</td>
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
                <td>l<sub>t</sub> [mm]:</td>
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
                <td>μ<sub>k</sub>:</td>
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
                <td>d<sub>n</sub> [mm]:</td>
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
                <td>D<sub>z</sub> [mm]:</td>
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
                <td>R<sub>zp</sub> [μm]:</td>
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
                <td>R<sub>zg</sub> [μm]:</td>
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

              <tr>
                <td>ν<sub>pl</sub>:</td>
                <td>
                  <input
                    type="number"
                    inputMode="decimal"
                    pattern="^-?\d*[.,]?\d*$"
                    name="v_pl"
                    value={formData.v_pl}
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
                <td>U<sub>max</sub> [mm]:</td>
                <td>
                  <input
                    type="number"
                    inputMode="decimal"
                    pattern="^-?\d*[.,]?\d*$"
                    name="U_max"
                    value={formData.U_max}
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
                <td>U<sub>min</sub> [mm]:</td>
                <td>
                  <input
                    type="number"
                    inputMode="decimal"
                    pattern="^-?\d*[.,]?\d*$"
                    name="U_min"
                    value={formData.U_min}
                    onChange={handleInputChange}
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
          <div className={styles.resultsSection} ref={resultsRef}>
            <div className={styles.resultsPrint}>
              <table className={styles.resultsTable}>
                <tbody>
                  {results.p_min !== 0 && (
                    <tr>
                      <td>p<sub>min_potr</sub>:</td>
                      <td>{results.p_min}N/mm²</td>
                    </tr>
                  )}
                  {results.p_min1 !== 0 && (
                    <tr>
                      <td>p<sub>min</sub>:</td>
                      <td>{results.p_min1}N/mm²</td>
                    </tr>
                  )}
                  {results.p_max !== 0 && (
                    <tr>
                      <td>p<sub>max</sub>:</td>
                      <td>{results.p_max}N/mm²</td>
                    </tr>
                  )}
                  {results.p_dop !== 0 && (
                    <tr>
                      <td>p<sub>dop</sub>:</td>
                      <td>{results.p_dop}N/mm²</td>
                    </tr>
                  )}
                  {results.T_max !== 0 && (
                    <tr>
                      <td>T<sub>max</sub>:</td>
                      <td>{results.T_max}Nm</td>
                    </tr>
                  )}
                  {(!formData.U_min || formData.U_min === '0') && results.U_min !== 0 && (
                    <tr>
                      <td>U'<sub>min</sub>:</td>
                      <td>{results.U_min}mm</td>
                    </tr>
                  )}
                  {(!formData.U_max || formData.U_max === '0') && results.U_max !== 0 && (
                    <tr>
                      <td>U'<sub>max</sub>:</td>
                      <td>{results.U_max}mm</td>
                    </tr>
                  )}
                  {(!formData.U_min || formData.U_min === '0' || !formData.U_max || formData.U_max === '0') && (
                    <>
                      {results.U_min_k !== 0 && (
                        <tr>
                          <td>U<sub>min</sub>:</td>
                          <td>{results.U_min_k}mm</td>
                        </tr>
                      )}
                      {results.U_max_k !== 0 && (
                        <tr>
                          <td>U<sub>max</sub>:</td>
                          <td>{results.U_max_k}mm</td>
                        </tr>
                      )}
                      {results.U_iz !== 0 && (
                        <tr>
                          <td>U<sub>iz</sub>:</td>
                          <td>{results.U_iz}mm</td>
                        </tr>
                      )}
                    </>
                  )}
                  {results.F_m !== 0 && (
                    <tr>
                      <td>F<sub>m</sub>:</td>
                      <td>{results.F_m}KN</td>
                    </tr>
                  )}
                  {results.F_dop !== 0 && (
                    <tr>
                      <td>F<sub>dop</sub>:</td>
                      <td>{results.F_dop}KN</td>
                    </tr>
                  )}
                  {results.theta_P !== 0 && (
                    <tr>
                      <td>θ<sub>P</sub>:</td>
                      <td>{results.theta_P}°C</td>
                    </tr>
                  )}
                  {results.theta_G !== 0 && (
                    <tr>
                      <td>θ<sub>G</sub>:</td>
                      <td>{results.theta_G}°C</td>
                    </tr>
                  )}
                  {results.najden_ujem && (
                    <tr>
                      <td>Ujem:</td>
                      <td>Ø {formData.D} {results.najden_ujem}</td>
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
                  {variable.displaySymbol ? (
                    <span dangerouslySetInnerHTML={{ __html: variable.displaySymbol }} />
                  ) : (
                    variable.symbol
                  )}
                </span>
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
