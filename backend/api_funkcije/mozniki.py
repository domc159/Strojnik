from krcni_nased import preracun_naseda
from fastapi import APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from fastapi.responses import JSONResponse
from zveza_gred_pesto import mozniki

router = APIRouter()

# Storage for calculation data
calculation_data: Dict[str, Any] = {}

class MoznikInput(BaseModel):
    vrsta_obremenitve: Optional[str] = None
    materjal_gred: Optional[str] = None
    T: Optional[float] = None
    d: Optional[float] = None  # This matches the 'D' from frontend
    t_2: Optional[float] = None
    l_t: Optional[float] = None
    i: Optional[float] = None

@router.get("/api/moznikiResult")
async def mozniki_result():
    try:
        if not calculation_data:
            raise HTTPException(status_code=404, detail="Ni podatkov za izračun")
            
        j_a_vis, j_a_niz, j_b_vis, j_b_niz, p_a_vis, p_a_niz, p_b_vis, p_b_niz, p_dop, T_max_a_vis, T_max_b_vis, T_max_a_niz, T_max_b_niz = mozniki(
            materjal=calculation_data['materjal_gred'],
            T=calculation_data['T'],
            d=calculation_data['D'],
            l_p=calculation_data['l_t'],
            i=calculation_data.get('i', 1),
            obremenitev=calculation_data['tip_obremenitve']
        )
        
        return {
            "status": "success",
            "rezultati": {
                "j_a_vis": round(j_a_vis, 2),
                "j_a_niz": round(j_a_niz, 2),
                "j_b_vis": round(j_b_vis, 2),
                "j_b_niz": round(j_b_niz, 2),
                "p_a_vis": round(p_a_vis, 2),
                "p_a_niz": round(p_a_niz, 2),
                "p_b_vis": round(p_b_vis, 2),
                "p_b_niz": round(p_b_niz, 2),
                "p_dop": round(p_dop, 2),
                "T_max_a_vis": round(T_max_a_vis, 2),
                "T_max_b_vis": round(T_max_b_vis, 2),
                "T_max_a_niz": round(T_max_a_niz, 2),
                "T_max_b_niz": round(T_max_b_niz, 2)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/api/moznikiVnos")
async def mozniki_vnos(data: MoznikInput):
    try:
        calculation = {
            'T': data.T,
            'D': data.d,  # Note: frontend sends 'D' but backend uses 'd'
            't_2': data.t_2,
            'l_t': data.l_t,
            'i': data.i,
            'tip_obremenitve': data.vrsta_obremenitve,
            'materjal_gred': None if not data.materjal_gred or data.materjal_gred == '' else data.materjal_gred,
        }
        
        calculation_data.clear()
        calculation_data.update(calculation)
        
        return {"status": "success", "message": "Podatki uspešno sprejeti"}
        
    except Exception as e:
        print(f"Napaka pri vnosu: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
