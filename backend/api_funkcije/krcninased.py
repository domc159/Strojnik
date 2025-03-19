from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from zveza_gred_pesto import *
from krcni_nased import preracun_naseda

router = APIRouter()

calculation_data: Dict[str, Any] = {}

class CalculationInput(BaseModel):
    vrsta_obremenitve: str
    materjal_pesto: Optional[str]
    materjal_gred: Optional[str]
    T: float
    D: float
    l_t: float
    mi_k: float
    d_n: float
    D_z: float
    R_zp: float
    R_zg: float
    v_pl: float = 1.2
    U_max: str
    U_min: str
    modul_elasticnosti_pesto: Optional[float] = None
    meja_plasticnosti_pesto: Optional[float] = None
    poissonovo_stevilo_pesto: Optional[float] = None
    temperaturni_razteznostni_koeficient_pesto: Optional[float] = None
    modul_elasticnosti_gred: Optional[float] = None
    meja_plasticnosti_gred: Optional[float] = None
    poissonovo_stevilo_gred: Optional[float] = None
    temperaturni_razteznostni_koeficient_gred: Optional[float] = None
    tip_obremenitve: Optional[str] = None
    U_max_preverba: Optional[float] = None
    U_min_preverba: Optional[float] = None

    
@router.get("/api/krcninasedrezultat")
async def rezultati():
    try:
        if not calculation_data:
            raise HTTPException(status_code=404, detail="Ni podatkov za izračun")

        p_min, p_min1, U_min, U_max, U_iz, U_min_k, U_max_k, F_m, theta_P, theta_G, najden_ujem, T_max, p_dop, F_dop, p_max = preracun_naseda(
            F_t=None,
            F_a=None,
            T=calculation_data['T'],
            D=calculation_data['D'],
            F_tr=None,
            l_t=calculation_data['l_t'],
            mi_k=calculation_data['mi_k'],
            d_n=calculation_data['d_n'],
            D_z=calculation_data['D_z'],
            materjal_pesto=calculation_data['materjal_pesto'],
            materjal_gred=calculation_data['materjal_gred'],
            R_zp=calculation_data['R_zp'],
            R_zg=calculation_data['R_zg'],
            v_pl=calculation_data['v_pl'],
            E_p=calculation_data['E_p'],
            R_ep=calculation_data['R_ep'],
            v_p=calculation_data['v_p'],
            A_p=calculation_data['A_p'],
            E_g=calculation_data['E_g'],
            R_eg=calculation_data['R_eg'],
            v_g=calculation_data['v_g'],
            A_g=calculation_data['A_g'],
            U_max=calculation_data['U_max_preverba'],
            U_min=calculation_data['U_min_preverba'],
            tip_obremenitve=calculation_data['tip_obremenitve']
        )

        return {
            "status": "success",
            "rezultati": {
                "p_min": round(p_min, 2),
                "p_min1": round(p_min1, 2),
                "p_max": round(p_max, 2),
                "U_min": round(U_min, 4),
                "U_max": round(U_max, 4),
                "U_iz": round(U_iz, 4),
                "U_min_k": round(U_min_k, 4),
                "U_max_k": round(U_max_k, 4),
                "F_m": round(F_m/1000, 2),
                "theta_P": round(theta_P, 2),
                "theta_G": round(theta_G, 2),
                "najden_ujem": najden_ujem,
                "T_max": round(T_max, 2),
                "p_dop": round(p_dop, 2),
                "F_dop": round(F_dop/1000, 2),
                "tip_obremenitve": calculation_data['tip_obremenitve']
                
            }
        }

    except Exception as e:
        print(f"Napaka pri izračunu: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/krcninasedvnos")
async def vnos_podatkov(data: CalculationInput):
    try:
        calculation = {
            'T': data.T,
            'D': data.D,
            'l_t': data.l_t,
            'mi_k': data.mi_k,
            'd_n': data.d_n,
            'D_z': data.D_z,
            'R_zp': data.R_zp,
            'R_zg': data.R_zg,
            'v_pl': data.v_pl,
            'U_max_preverba': float(data.U_max),
            'U_min_preverba': float(data.U_min),
            'tip_obremenitve': data.vrsta_obremenitve,
            'materjal_pesto': None if not data.materjal_pesto or data.materjal_pesto == '' else data.materjal_pesto,
            'materjal_gred': None if not data.materjal_gred or data.materjal_gred == '' else data.materjal_gred,
            'E_p': data.modul_elasticnosti_pesto,
            'R_ep': data.meja_plasticnosti_pesto,
            'v_p': data.poissonovo_stevilo_pesto,
            'A_p': data.temperaturni_razteznostni_koeficient_pesto,
            'E_g': data.modul_elasticnosti_gred,
            'R_eg': data.meja_plasticnosti_gred,
            'v_g': data.poissonovo_stevilo_gred,
            'A_g': data.temperaturni_razteznostni_koeficient_gred,
        }
        
        calculation_data.clear()
        calculation_data.update(calculation)
        
        return {"status": "success", "message": "Podatki uspešno sprejeti"}
        
    except Exception as e:
        print(f"Napaka pri vnosu: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
