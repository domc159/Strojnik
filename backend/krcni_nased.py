import math
import pandas as pd


#oba koeficienta bota prišla direkt preko API-ja
ko_trenja_mehansko = {
    "jeklo": 0.10,
    "jeklo-mazano": 0.08,
    "siva_litina": 0.12,
    "siva_litina-mazano": 0.06,
    "aluminij": 0.06,
    "aluminij-mazano": 0.04,
    "broni": 0.06,
    "broni-mazano": 1
}

ko_trenja_termicno = {
    "jeklo": 0.18,
    "jeklo-mazano": 0.12,
    "siva_litina": 0.16,
    "siva_litina-mazano": 0.10,
    "aluminij": 0.13,
    "aluminij-mazano": 1,
    "broni": 0.20,
    "broni-mazano": 1
}

def materijali(materjal):
    file = "./tabele/material-properties.csv"
    materjal_tabela = pd.read_csv(file)
    if materjal is not None :
        material = materjal_tabela[materjal_tabela["SIST_EN"] == materjal]
        E = material["E"].values[0]
        R_e = material["R_e"].values[0]
        v= material["V"].values[0]
        A = material["a"].values[0]

    
    return E, R_e, v, A
    

def preracun_naseda(F_t=None, F_a=None, T=None, D=None, F_tr=None, l_t=None, mi_k=None, d_n=None, D_z=None, materjal_pesto=None, materjal_gred=None, R_zp=None, R_zg=None,
                   v_pl=1.2, theta_0=20, 
                   E_p=None, R_ep=None, v_p=None, A_p=None, 
                   E_g=None, R_eg=None, v_g=None, A_g=None,
                   U_max=None, U_min=None, tip_obremenitve=None):
    
    # Pridobi vrednosti za pesto
    if materjal_pesto is not None:
        E_p, R_ep, v_p, A_p = materijali(materjal_pesto)
    elif None in [E_p, R_ep, v_p, A_p]:
        raise ValueError("Manjkajo podatki o materialu pesta")

    # Pridobi vrednosti za gred
    if materjal_gred is not None:
        E_g, R_eg, v_g, A_g = materijali(materjal_gred)
    elif None in [E_g, R_eg, v_g, A_g]:
        raise ValueError("Manjkajo podatki o materialu gredi")

    varnostni_koeficienti = {
        "staticna": 1.5,
        "utripna": 1.8,
        "izmenicna": 2.2
    }
    v_z = varnostni_koeficienti.get(tip_obremenitve, 1.5)
    
    # Izračunaj obodno silo, če ni podana
    if F_t is None and T is not None and D is not None:
        F_t = 2 * T / D
    
    # Izračunaj potrebno silo trenja (večja od obeh vrednosti)
    if F_t is not None and F_a is not None:
        F_tr = max(F_t * v_z, F_a * v_z)
    elif F_t is not None:
        F_tr = F_t * v_z
    elif F_a is not None:
        F_tr = F_a * v_z
    else:
        raise ValueError("Potrebno je podati vsaj F_t (ali T in D) ali F_a")
    
    Q_g = d_n / D
    Q_p = D / D_z
    
    K = (E_p / E_g) * ((1 + Q_g**2)/(1 - Q_g**2) - v_g) + ((1 + Q_p**2)/(1 - Q_p**2) + v_p)
    
    A = math.pi * D * l_t
    
    # Izračun najmanjšega potrebnega površinskega tlaka
    p_min = (F_tr / (A * mi_k))*1000
     
    U_min = (K * D * p_min) / E_p
    
        # Izračun za pesto
    U_max_pesto = (K * D * R_ep * (1 - Q_p**2)) / (3**0.5 * v_pl * E_p)
    
    # Izračun za gred
    U_max_gred = (K * D * R_eg * (1 - Q_g**2)) / (3**0.5 * v_pl * E_p)
    
    # Vrne manjšo od obeh vrednosti
    U_max = min(U_max_pesto, U_max_gred)


    
            
    U_iz = 0.0008 * (R_zp + R_zg)
    U_min_k = U_min + U_iz
    U_max_k = U_max + U_iz

    najden_ujem, max_val, min_val= ujem_tabela(D, U_max_k, U_min_k)

    try:
        O_m = 0.001*D
        X = abs(max_val) + O_m
        Y = A_p * D
        # Izračun temperature segrevanja pesta
        theta_P = (X/Y) + theta_0

        
        # Izračun temperature hlajene gredi
        theta_G = ((abs(min_val + O_m)/(A_g * D))*(-1)) + theta_0

        p_max = (max_val * E_p) / (K * D)
        F_m = 0.25 * math.pi * D * l_t * mi_k * p_max

    except:
        theta_P = -1
        theta_G = -1
        F_m = -1
        p_max = -1

    p_dop_gred = ((1-Q_g**2)*R_eg)/((3**0.5)*v_pl)
    p_dop_pesto = ((1-Q_p**2)*R_ep)/((3**0.5)*v_pl)
    p_dop = min(p_dop_gred, p_dop_pesto)

    p_min1 = (min_val * E_p) / (K * D)

    F_dop = ((p_min1 * math.pi * D * l_t * mi_k) / (v_z))
    T_max = ((F_dop * D) / 2)/1000
    print(F_dop)
    print(T_max)
    return p_min, p_min1, U_min, U_max, U_iz, U_min_k, U_max_k, F_m, theta_P, theta_G, najden_ujem, T_max, p_dop, F_dop, p_max


def ujem_tabela(D, U_max_k, U_min_k):
    file = "./tabele/tolerance.csv"
    tolerance_tabela = pd.read_csv(file, sep=';')
    
    # Najdi ustrezno vrstico glede na premer
    vrstica = tolerance_tabela[(tolerance_tabela["D_min"] < D) & (tolerance_tabela["D_max"] >= D)]
    
    # Initialize result variable
    najden_ujem = None
    max_val = None
    
    # Seznam vseh možnih ujemov iz CSV
    ujemi = ['r6', 's6', 't6', 'u6', 'v6', 'x6', 'z6', 'za6', 'zb6', 'zc6']
    
    print(f"\nIščem ujem za D={D}mm, U_min_k={U_min_k}mm in U_max_k={U_max_k}mm")
    print(f"Vrstica za ta premer:")
    print(vrstica)
    
    # Preveri vsak možen ujem
    for ujem in ujemi:
        column_min = f'H7/{ujem}_Umin'
        column_max = f'H7/{ujem}_Umax'
        
        # Preskoči, če stolpec ne obstaja
        if column_min not in vrstica.columns or column_max not in vrstica.columns:
            continue
            
        min_val = abs(vrstica[column_min].iloc[0])  # Pretvorba v absolutno vrednost
        max_val = abs(vrstica[column_max].iloc[0])  # Pretvorba v absolutno vrednost
        
        print(f"\nPreverjam {ujem}:")
        print(f"Interval: {min_val} do {max_val}")
        print(f"Ali {abs(U_min_k)} < {min_val} in {abs(U_max_k)} > {max_val}?")
        
        # Preveri oba pogoja
        if abs(U_min_k) < min_val and abs(U_max_k) > max_val:
            najden_ujem = ujem
            break
                
    if najden_ujem:
        print(f"Primeren ujem: H7/{najden_ujem}")
        print(f"Interval: {min_val} do {max_val}")
    else:
        print("Ni najden primeren ujem v tabeli")
        
    ujem = 'H7/'+najden_ujem if najden_ujem else None
    return ujem, max_val, min_val

