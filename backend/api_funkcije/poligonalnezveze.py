from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from zveza_gred_pesto import *

router = APIRouter()

calculation_data: Dict[str, Any] = {}

class PoligonalneZvezeInput(BaseModel):
    vrsta_obremenitve: Optional[str] = None
    materjal_gred: Optional[str] = None
    T: Optional[float] = None
    d: Optional[float] = None  # This matches the 'D' from frontend
    l_t: Optional[float] = None

@router.get("/api/poligonalneZvezeResult")
async def poligonalne_zveze_result():
    try:
        if not calculation_data:
            raise HTTPException(status_code=404, detail="Ni podatkov za izračun")
            
        p_p3g, p_dop, T_max_p3g, p_p4g, T_max_p4g = poligonalne_zveze(
            materjal=calculation_data['materjal_gred'],
            T=calculation_data['T'],
            d=calculation_data['D'],
            l_t=calculation_data['l_t'],
            obremenitev=calculation_data['tip_obremenitve']
        )
        
        return {
            "status": "success",
            "rezultati": {
                "p_p3g": p_p3g,
                "p_p4g": p_p4g,
                "p_dop": p_dop,
                "T_max_p3g": T_max_p3g,
                "T_max_p4g": T_max_p4g
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/poligonalneZvezeVnos")
async def poligonalne_zveze_vnos(data: PoligonalneZvezeInput):
    try:
        calculation = {
            'T': data.T,
            'D': data.d,  # Note: frontend sends 'D' but backend uses 'd'
            'l_t': data.l_t,
            'tip_obremenitve': data.vrsta_obremenitve,
            'materjal_gred': None if not data.materjal_gred or data.materjal_gred == '' else data.materjal_gred,
        }
        
        calculation_data.clear()
        calculation_data.update(calculation)
        
        return {"status": "success", "message": "Podatki uspešno sprejeti"}
        
    except Exception as e:
        print(f"Napaka pri vnosu: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
