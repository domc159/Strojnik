from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from zveza_gred_pesto import *

router = APIRouter()

calculation_data: Dict[str, Any] = {}

class UtornaZvezaInput(BaseModel):
    vrsta_obremenitve: Optional[str] = None
    materjal_gred: Optional[str] = None
    T: Optional[float] = None
    d: Optional[float] = None  # This matches the 'D' from frontend
    l_t: Optional[float] = None
    centriranje: Optional[float] = None


@router.get("/api/utornaZvezaResult")
async def utorna_zveza_result():
    try:
        if not calculation_data:
            raise HTTPException(status_code=404, detail="Ni podatkov za izračun")
            
        # Ensure all required parameters are present
        required_params = ['T', 'D', 'l_t', 'materjal_gred', 'tip_obremenitve', 'centriranje']
        for param in required_params:
            if param not in calculation_data or calculation_data[param] is None:
                raise HTTPException(status_code=400, detail=f"Manjka parameter: {param}")
            
        p_lahka, p_srednja, p_dop, T_max_lahka, T_max_srednja = utorne_zveze(
            materjal=calculation_data['materjal_gred'],
            T=calculation_data['T'],
            d=calculation_data['D'],
            l_t=calculation_data['l_t'],
            obremenitev=calculation_data['tip_obremenitve'],
            k=float(calculation_data['centriranje'])  # Spremenimo 'centriranje' v 'k'
        )
        
        return {
            "status": "success",
            "rezultati": {
                "p_lahka": p_lahka,
                "p_srednja": p_srednja,
                "p_dop": p_dop,
                "T_max_lahka": T_max_lahka,
                "T_max_srednja": T_max_srednja
            }
        }
    except Exception as e:
        print(f"Napaka pri izračunu: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/api/utornaZvezaVnos")
async def utorna_zveza_vnos(data: UtornaZvezaInput):
    try:
        calculation = {
            'T': data.T,
            'D': data.d,  # Note: frontend sends 'D' but backend uses 'd'
            'l_t': data.l_t,
            'centriranje': data.centriranje,
            'tip_obremenitve': data.vrsta_obremenitve,
            'materjal_gred': None if not data.materjal_gred or data.materjal_gred == '' else data.materjal_gred,
        }
        
        calculation_data.clear()
        calculation_data.update(calculation)
        
        return {"status": "success", "message": "Podatki uspešno sprejeti"}
        
    except Exception as e:
        print(f"Napaka pri vnosu: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
