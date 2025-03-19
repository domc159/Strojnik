import pandas as pd	
import math


def materijali(materjal):
    file = "./tabele/material-properties.csv"
    materjal_tabela = pd.read_csv(file)
    if materjal is not None :
        material = materjal_tabela[materjal_tabela["SIST_EN"] == materjal]
        R_e = material["R_e"].values[0]
        R_m = material["R_m"].values[0]
        return R_e, R_m
    else:
        return -1, -1

def p_dopustni(pesto, obremenitev):
    varnostni_kof_zilav = {
        'enosmerna_lahka':2.5,
        'enosmerna_tezka':2.75,
        'izmenicna_lahka':2.75,
        'izmenicna_tezka':3.0
    }
    varnostni_kof_krhek = {
        'enosmerna_lahka':2.5,
        'enosmerna_tezka':2.75,
        'izmenicna_lahka':2.75,
        'izmenicna_tezka':3.0
    }

    R_e, R_m = materijali(pesto)

    if R_e != -1:  # Changed from != '' to != -1 since materijali returns -1, -1 for invalid material
        V = varnostni_kof_zilav[obremenitev]
        R = R_e
    else:
        V = varnostni_kof_krhek[obremenitev]
        R = R_m
    return R/V

def zagozda(T=None, d=None, t_2=None, l_t=None, i=1, materjal=None, obremenitev=None):
    # Validate required parameters
    if None in [T, d, t_2, l_t, materjal, obremenitev]:
        raise ValueError("Manjkajo obvezni parametri za izračun")
        
    # Ensure i is at least 1
    i = max(1, i)

    varnostni_kof_zilav = {
        'enosmerna_lahka':1.5,
        'enosmerna_tezka':2.0,
        'izmenicna_lahka':2.5,
        'izmenicna_tezka':3.0
    }
    varnostni_kof_krhek = {
        'enosmerna_lahka':2.0,
        'enosmerna_tezka':2.5,
        'izmenicna_lahka':2.75,
        'izmenicna_tezka':3.0
    }

    R_e, R_m = materijali(materjal)

    if R_e != -1:  # Changed from != '' to != -1 since materijali returns -1, -1 for invalid material
        V = varnostni_kof_zilav[obremenitev]
        R = R_e
    else:
        V = varnostni_kof_krhek[obremenitev]
        R = R_m

    p = ((2*T) / (d * t_2 * l_t * i))*1000  # pretvorba N/mm v N/m
    p_dop = R/V
    
    # Calculate required number of keys
    if p <= p_dop:
        j = i  # Use provided number of keys if pressure is acceptable
    else:
        j = math.ceil((2*T) / (d * t_2 * l_t * (p_dop/1000)))  # Calculate minimum required keys

    # Recalculate T_max with the final number of keys
    T_max = ((p_dop/1000) * d * t_2 * l_t * j) / 2

    return round(p, 3), round(p_dop, 3), round(j, 1), round(T_max, 3)


def mozniki(materjal = None, T = None, d = None, l_p = None, i = 1, obremenitev = None):
    # Validate required parameters
    if None in [T, d, l_p, materjal, obremenitev]:
        raise ValueError("Manjkajo obvezni parametri za izračun")
        
    # Ensure i is at least 1
    i = max(1, i)  # This prevents division by zero

    l_standard = [6, 8, 10, 12, 14, 16, 18, 20, 22, 25, 28, 32, 36, 40, 45, 50, 56, 63, 70, 80, 90, 100, 110, 125, 140, 160, 180, 200, 220, 250, 280, 320, 360, 400]
    varnostni_kof_zilav = {
        'enosmerna_lahka':1.5,
        'enosmerna_tezka':2.0,
        'izmenicna_lahka':2.5,
        'izmenicna_tezka':3.0
    }
    varnostni_kof_krhek = {
        'enosmerna_lahka':2.5,
        'enosmerna_tezka':3.0,
        'izmenicna_lahka':3.5,
        'izmenicna_tezka':4.0
    }
    
    R_e, R_m = materijali(materjal)

    if R_e != -1:  # Changed from != '' to != -1 since materijali returns -1, -1 for invalid material
        V = varnostni_kof_zilav[obremenitev]
        R = R_e
    else:
        V = varnostni_kof_krhek[obremenitev]
        R = R_m

    p_dop = R / V

    # Get moznik dimensions
    mozniki_visoki = pd.read_csv("./tabele/visoki_moznik.csv", sep=';')
    mozniki_nizki = pd.read_csv("./tabele/nizki_moznik.csv", sep=';')

    moznik_vis = mozniki_visoki[(mozniki_visoki["d_min"] <= d) & (mozniki_visoki["d_max"] > d)]
    try:
        moznik_niz = mozniki_nizki[(mozniki_nizki["d_min"] <= d) & (mozniki_nizki["d_max"] > d)]
    except:
        moznik_niz = None

    if moznik_vis.empty:
        raise ValueError(f"Ni najdenih podatkov za premer {d} v visokih moznikih")

    k = 1.35 if i > 1 else 1

    l = max([x for x in l_standard if x <= l_p])
    
    bxh = moznik_vis["bxh"].values[0].split("x")
    t_1_vis = moznik_vis["t1"].values[0]
    t_2_vis = moznik_vis["t2"].values[0]
    b = int(bxh[0])
    h_vis = int(bxh[1])
    
    if moznik_niz is not None and not moznik_niz.empty:
        bxh_niz = moznik_niz["bxh"].values[0].split("x")
        h_niz = int(bxh_niz[1])
        t_1_niz = moznik_niz["t1"].values[0]
        t_2_niz = moznik_niz["t2"].values[0]
    else:
        h_niz = h_vis
        t_1_niz = t_1_vis
        t_2_niz = t_2_vis

    l_t = l - b

    # Calculate pressures
    p_a_vis = k * ((2 * T) / (d * (h_vis - t_1_vis) * l_t * i)) * 1000
    p_b_vis = k * ((2 * T) / (d * (h_vis - t_1_vis) * l * i)) * 1000
    p_a_niz = k * ((2 * T) / (d * (h_niz - t_1_niz) * l_t * i)) * 1000
    p_b_niz = k * ((2 * T) / (d * (h_niz - t_1_niz) * l * i)) * 1000

    # Calculate required number of keys
    j_a_vis = math.ceil((2 * T * k) / (d * (h_vis - t_1_vis) * l_t * (p_dop/1000))) if p_a_vis > p_dop else i
    j_a_niz = math.ceil((2 * T * k) / (d * (h_niz - t_1_niz) * l_t * (p_dop/1000))) if p_a_niz > p_dop else i
    j_b_vis = math.ceil((2 * T * k) / (d * (h_vis - t_1_vis) * l * (p_dop/1000))) if p_b_vis > p_dop else i
    j_b_niz = math.ceil((2 * T * k) / (d * (h_niz - t_1_niz) * l * (p_dop/1000))) if p_b_niz > p_dop else i

    # Calculate maximum torques
    T_max_a_vis = ((p_dop/1000) * d * (h_vis - t_1_vis) * l_t * j_a_vis) / (2 * k)
    T_max_b_vis = ((p_dop/1000) * d * (h_vis - t_1_vis) * l * j_b_vis) / (2 * k)
    T_max_a_niz = ((p_dop/1000) * d * (h_niz - t_1_niz) * l_t * j_a_niz) / (2 * k)
    T_max_b_niz = ((p_dop/1000) * d * (h_niz - t_1_niz) * l * j_b_niz) / (2 * k)

    return (round(j_a_vis, 1), round(j_a_niz, 1), round(j_b_vis, 1), round(j_b_niz, 1),
            round(p_a_vis, 3), round(p_a_niz, 3), round(p_b_vis, 3), round(p_b_niz, 3),
            round(p_dop, 3), round(T_max_a_vis, 3), round(T_max_b_vis, 3),
            round(T_max_a_niz, 3), round(T_max_b_niz, 3))


def utorne_zveze(materjal, T, d, l_t, obremenitev, k):
    utorna_zveza_lahka = pd.read_csv("./tabele/lahke_utorne_zveze.csv", sep=';')
    utorna_zveza_srednja = pd.read_csv("./tabele/srednja_utorne_zveze.csv", sep=';')

    varnostni_kof_zilav = {
        'enosmerna_lahka':1.5,
        'enosmerna_tezka':2.0,
        'izmenicna_lahka':3.0,
        'izmenicna_tezka':4.0
    }
    varnostni_kof_krhek = {
        'enosmerna_lahka':2.0,
        'enosmerna_tezka':3.0,
        'izmenicna_lahka':3.0,
        'izmenicna_tezka':5.0
    }

    R_e, R_m = materijali(materjal)

    if R_e != -1:
        V = varnostni_kof_zilav[obremenitev]
        R = R_e
    else:
        V = varnostni_kof_krhek[obremenitev]
        R = R_m

    p_dop = R / V

    # Pretvorimo d v int za primerjavo s tabelo
    d = int(float(d))
    
    # Najprej preverimo srednjo utorno zvezo, ker mora vedno obstajati
    srednja = utorna_zveza_srednja[utorna_zveza_srednja["d"] == d]
    if not srednja.empty:
        d_srednja = int(srednja["d"].values[0])
        ixdxD_srednja = str(srednja["ixdxD"].values[0]).split("x")
        i_srednja = int(ixdxD_srednja[0])
        D_srednja = int(ixdxD_srednja[2])
        d_sr_srednje = (D_srednja + d_srednja) / 2
        h_srednje = (D_srednja - d_srednja) / 2
        p_srednja = ((k * T * 2) / (d_sr_srednje * h_srednje * l_t * i_srednja)) * 1000
        T_max_srednja = ((p_dop/1000) * d_sr_srednje * h_srednje * l_t * i_srednja) / (2 * k)
    else:
        raise ValueError(f"Ni najdenih podatkov za premer {d} v srednji utorni zvezi")

    # Nato preverimo lahko utorno zvezo
    lahka = utorna_zveza_lahka[utorna_zveza_lahka["d"] == d]
    if not lahka.empty and not pd.isna(lahka["ixdxD"].values[0]):
        d_lahka = int(lahka["d"].values[0])
        ixdxD_lahka = str(lahka["ixdxD"].values[0]).split("x")
        i_lahka = int(ixdxD_lahka[0])
        D_lahka = int(ixdxD_lahka[2])
        d_sr_lahki = (D_lahka + d_lahka) / 2
        h_lahki = (D_lahka - d_lahka) / 2
        p_lahka = ((k * T * 2) / (d_sr_lahki * h_lahki * l_t * i_lahka)) * 1000
        T_max_lahka = ((p_dop/1000) * d_sr_lahki * h_lahki * l_t * i_lahka) / (2 * k)
    else:
        # Če ni podatkov za lahko utorno zvezo, vrnemo 0
        p_lahka = 0
        T_max_lahka = 0

    return round(p_lahka, 4), round(p_srednja, 4), round(p_dop, 4), round(T_max_lahka, 4), round(T_max_srednja, 2)



def zobate_zveze(materjal, T, d, l_t, obremenitev, ty):
    # Pravilno preberemo datoteke in nastavimo decimalno ločilo na vejico
    evolventni_profil = pd.read_csv("./tabele/zobat_evolventni_profil_DIN5480.csv", sep=';', decimal=',')
    trikotni_profil = pd.read_csv("./tabele/zobat_trikotni_profil_DIN5481.csv", sep=';', decimal=',')

    varnostni_kof_zilav = {
        'enosmerna_lahka':1.5,
        'enosmerna_tezka':2.0,
        'izmenicna_lahka':3.0,
        'izmenicna_tezka':4.0
    }
    varnostni_kof_krhek = {
        'enosmerna_lahka':2.0,
        'enosmerna_tezka':3.0,
        'izmenicna_lahka':3.0,
        'izmenicna_tezka':5.0
    }

    R_e, R_m = materijali(materjal)

    if R_e != -1:
        V = varnostni_kof_zilav[obremenitev]
        R = R_e
    else:
        V = varnostni_kof_krhek[obremenitev]
        R = R_m

    p_dop = R / V
    d = float(d)

    if ty == 'evolventni':
        profil = evolventni_profil[evolventni_profil["d"] == d]
        if not profil.empty:
            d2 = float(profil["d2"].values[0])
            d3 = float(profil["d3"].values[0])
            z = float(profil["z"].values[0])
            k = 2
            
            d_sr = (d2 + d3) / 2
            h = (d3 - d2) / 2
            p = ((k * T * 2) / (d_sr * h * l_t * z)) * 1000
            T_max = ((p_dop/1000) * d * h * l_t * z) / (2 * k)
            
            return round(p, 4), round(p_dop, 4), round(T_max, 4)
    else:  # trikotni
        profil = trikotni_profil[trikotni_profil["d"] == d]
        if not profil.empty:
            d2 = float(profil["d2"].values[0])
            d3 = float(profil["d3"].values[0])
            z = float(profil["z"].values[0])
            k = 2
            
            d_sr = (d2 + d3) / 2
            h = (d3 - d2) / 2
            p = ((k * T * 2) / (d_sr * h * l_t * z)) * 1000
            T_max = ((p_dop/1000) * d * h * l_t * z) / (2 * k)
            
            return round(p, 4), round(p_dop, 4), round(T_max, 4)
            
    raise ValueError(f"Ni najdenih podatkov za premer {d} v {'evolventni' if ty == 'evolventni' else 'trikotni'} zobati zvezi")


def poligonalne_zveze(materjal, T, d, l_t, obremenitev):
    # Pravilno preberemo datoteke in nastavimo decimalno ločilo na vejico
    poligonalni_P3G = pd.read_csv("./tabele/poligonalni_P3G.csv", sep=';', decimal=',')
    poligonalni_P4G = pd.read_csv("./tabele/poligonalni_P4G.csv", sep=';', decimal=',')
    


    varnostni_kof_zilav = {
        'enosmerna_lahka':1.5,
        'enosmerna_tezka':1.75,
        'izmenicna_lahka':1.75,
        'izmenicna_tezka':2.0
    }
    varnostni_kof_krhek = {
        'enosmerna_lahka':2.0,
        'enosmerna_tezka':2.5,
        'izmenicna_lahka':2.75,
        'izmenicna_tezka':3.0
    }

    R_e, R_m = materijali(materjal)

    if R_e != '':
        V = varnostni_kof_zilav[obremenitev]
        R = R_e
    else:
        V = varnostni_kof_krhek[obremenitev]
        R = R_m

    p_dop = R / V

    P3G = poligonalni_P3G[poligonalni_P3G["d1"] == d]
    if not P3G.empty:
        d1_P3G = float(P3G["d1"].values[0])
        d2_P3G = float(P3G["d2"].values[0])
        d3_P3G = float(P3G["d3"].values[0])
        e1_P3G = float(P3G["e1"].values[0])
    else:
        raise ValueError(f"Ni najdenih podatkov za premer {d} v poligonalni P3G")
    
    d_r = d2_P3G + 2 * e1_P3G

    p_p3g = (T / (l_t * ((0.75 * math.pi * d1_P3G * e1_P3G) + (0.05 * d1_P3G * d1_P3G))))
    T_max_p3g = ((p_dop) * (l_t * ((0.75 * math.pi * d1_P3G * e1_P3G) + (0.05 * d1_P3G * d1_P3G))))
    


    P4G = poligonalni_P4G[poligonalni_P4G["d1"] == d]
    if not P4G.empty:
        d1_P4G = float(P4G["d1"].values[0])
        d2_P4G = float(P4G["d2"].values[0])
        e_P4G = float(P4G["e"].values[0])
        er_P4G = float(P4G["er"].values[0])
    else:
        raise ValueError(f"Ni najdenih podatkov za premer {d} v poligonalni P4G")
    
    d_r = d2_P4G + 2 * er_P4G
    p_p4g = (T / (l_t * ((math.pi * d_r * er_P4G) + (0.05 * d_r * d_r))))
    T_max_p4g = ((p_dop) * (l_t * ((math.pi * d_r * er_P4G) + (0.05 * d_r * d_r))))
    return round(p_p4g*1000, 2), round(p_dop, 2), round(T_max_p4g, 2) , round(p_p3g*1000, 2), round(T_max_p3g, 2)





def spenjalne_zveze(materjal, T, d, l, obremenitev, type, u, i, a, l_u, V_z):
    varnostni_kof_zilav = {
        'enosmerna_lahka':2.5,
        'enosmerna_tezka':2.75,
        'izmenicna_lahka':2.75,
        'izmenicna_tezka':3.0
    }
    varnostni_kof_krhek = {
        'enosmerna_lahka':2.5,
        'enosmerna_tezka':2.75,
        'izmenicna_lahka':2.75,
        'izmenicna_tezka':3.0
    }

    R_e, R_m = materijali(materjal)

    if R_e != '':
        V = varnostni_kof_zilav[obremenitev]
        R = R_e
    else:
        V = varnostni_kof_krhek[obremenitev]
        R = R_m

    if R_e != '':
        V = varnostni_kof_zilav[obremenitev]
        R = R_e
        X = 0.7
    else:
        V = varnostni_kof_krhek[obremenitev]
        R = R_m
        X = 0.5


    o_dop = X * R
    p_dop = R / V

    if type == 'deljen_pesto':
        k0 = 1.2
        k_t = 0.2
        m = i / 2
    else:
        k0 = 1.5
        k_t = 0.3
        m = i

    F_p = ((2 * (T * 1000) * V) / (k0 * math.pi * d * i * u))/2
 
    
    p =  ((k0 * F_p * i) / (l * d))

    o_u = ((k_t * 6 * F_p * m * l_u) / (l * a * a))

    return round(p, 4), round(p_dop, 4), round(o_u, 4), round(F_p, 4), round(o_dop, 4)

def stozcasti_nased(T=None, d=None, D=None, a=None,
                    z_moznik=None, mu=None, l=None, konus_naseda=None, n=None, P=None):
    try:
        # Calculate torque if not provided
        if T is None or T == 0:
            if P is not None and n is not None:
                T = (9550 * ((P / 1000)/n)) * 1000
            elif P is None and n is None:
                T = 0
        
        # Calculate cone ratio
        if konus_naseda is not None:
            konus = 1 / float(konus_naseda)  # Ensure konus_naseda is converted to float
        elif D is not None and d is not None and l is not None:
            konus = (D-d)/l
        elif a is not None:
            konus = 2 * math.tan(math.radians(a/2))
        else:
            raise ValueError("Ni dovolj podatkov za izračun konusa")

        a_deg = 2 * math.degrees(math.atan(konus/2))
        if a_deg <= 0:
            raise ValueError("Izračunan kot alfa je negativen ali enak 0!")

        a_rad = math.radians(a_deg)
        
        # Safety factor
        Vz = 1 if z_moznik else 1.3

        torni_rad = math.atan(mu)

        d = D - (konus * l)
        Dsr = (D + d)/2
 
        Fp_nor = ((2 * T * Vz) / Dsr) * (math.sin(a_rad/2 + torni_rad) / math.sin(torni_rad))
        
        Fp_rad = ((2 * T * Vz) / Dsr) * (
            math.sin(a_rad/2 + (torni_rad + a_rad/2)) / 
            math.sin(torni_rad + a_rad/2)
        )
        
        # Pressure calculations
        p_nor = ((4 * Fp_nor) / (math.pi * (D**2 - d**2))) * (
            math.sin(a_rad/2) * math.cos(torni_rad) / 
            math.sin(a_rad/2 + torni_rad)
        )
        
        p_rad = ((4 * Fp_rad) / (math.pi * (D**2 - d**2))) * (
            math.sin(a_rad/2) * math.sin(torni_rad + a_rad/2) / 
            math.sin(a_rad/2 + torni_rad + a_rad/2)
        )

        An = ((math.pi * (D**2 - d**2)) / 4) * math.sin(a_rad/2)

        Fn = p_nor * An
        F_nor = Fn / math.cos(torni_rad)
        Ftr = Fp_nor
        Fa = Fp_rad
        F_rad = Fa / math.sin(a_rad/2 + torni_rad)
        Fr = F_rad * math.sin(a_rad/2 + torni_rad)
        
        return (
            konus**-1,
            round(Fp_nor, 2),
            round(F_nor, 2),
            round(Fn, 2),
            round(Ftr, 2),
            round(p_nor, 2),
            round(Fp_rad, 2),
            round(F_rad, 2),
            round(Fr, 2),
            round(Fa, 2),
            round(p_rad, 2),
            round(T, 2)
        )
        
    except Exception as e:
        print(f"Error in calculation: {str(e)}")
        return (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)


def izracun_elasticnega_obroca(d, T, n, material):
    csv_elasticni='./tabele/elasticni_obroci.csv'
    csv_material='./tabele/material-properties.csv'
        
    # Branje CSV datotek
    df_elasticni = pd.read_csv(csv_elasticni, sep=';')
    df_material = pd.read_csv(csv_material, sep=';')
    
    # Pridobitev lastnosti materiala
    