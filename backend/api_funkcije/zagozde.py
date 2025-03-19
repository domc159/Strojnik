from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from zveza_gred_pesto import zagozda

router = APIRouter()

# Storage for calculation data
calculation_data: Dict[str, Any] = {}

class ZagozdaInput(BaseModel):
    vrsta_obremenitve: Optional[str] = None
    materjal_gred: Optional[str] = None
    T: Optional[float] = None
    d: Optional[float] = None  # This matches the 'D' from frontend
    t_2: Optional[float] = None
    l_t: Optional[float] = None
    i: Optional[float] = None

@router.get("/api/zagozdaResult")
async def zagozda_result():
    try:
        if not calculation_data:
            raise HTTPException(status_code=404, detail="Ni podatkov za izračun")
            
        # Ensure all required parameters are present
        required_params = ['T', 'D', 't_2', 'l_t', 'materjal_gred', 'tip_obremenitve']
        for param in required_params:
            if param not in calculation_data or calculation_data[param] is None:
                raise HTTPException(status_code=400, detail=f"Manjka parameter: {param}")
        
        # Set default value for i if not provided
        i = calculation_data.get('i', 1)  # Default to 1 if not provided
            
        p, p_dop, j, T_max = zagozda(
            T=calculation_data['T'],
            d=calculation_data['D'],
            t_2=calculation_data['t_2'],
            l_t=calculation_data['l_t'],
            i=i,
            materjal=calculation_data['materjal_gred'],
            obremenitev=calculation_data['tip_obremenitve']
        )
        
        return {
            "status": "success",
            "rezultati": {
                "p": p,
                "p_dop": p_dop,
                "j": j,
                "T_max": T_max
            }
        }
    except Exception as e:
        print(f"Napaka pri izračunu: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/api/zagozdaVnos")
async def zagozda_vnos(data: ZagozdaInput):
    try:
        calculation = {
            'T': data.T,
            'D': data.d,
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