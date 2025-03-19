from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from zveza_gred_pesto import spenjalne_zveze

router = APIRouter()

# Storage for calculation data
calculation_data: Dict[str, Any] = {}

class SpenjalneZvezeInput(BaseModel):
    vrsta_obremenitve: Optional[str] = None
    materjal_gred: Optional[str] = None
    T: Optional[float] = None
    D: Optional[float] = None  # This matches 'd' in backend
    l_t: Optional[float] = None
    type: Optional[str] = None  # 'deljen_pesto' ali drugo
    u: Optional[float] = None  # koeficient trenja
    i: Optional[float] = None  # število vijakov
    a: Optional[float] = None  # širina objemke
    l_u: Optional[float] = None  # razdalja med vijakoma
    V_z: Optional[float] = None  # varnostni faktor

@router.post("/api/spenjalneZvezeVnos")
async def spenjalne_zveze_vnos(data: SpenjalneZvezeInput):
    try:
        calculation = {
            'T': data.T,
            'D': data.D,  # frontend 'D' -> backend 'd'
            'l_t': data.l_t,
            'type': data.type,
            'u': data.u if data.u is not None else 0.1,  # default vrednost
            'i': data.i if data.i is not None else 1,  # default vrednost
            'a': data.a if data.a is not None else 10,  # default vrednost
            'l_u': data.l_u if data.l_u is not None else 20,  # default vrednost
            'V_z': data.V_z if data.V_z is not None else 1.5,  # default vrednost
            'tip_obremenitve': data.vrsta_obremenitve,
            'materjal_gred': None if not data.materjal_gred or data.materjal_gred == '' else data.materjal_gred,
        }
        
        calculation_data.clear()
        calculation_data.update(calculation)
        
        return {"status": "success", "message": "Podatki uspešno sprejeti"}
        
    except Exception as e:
        print(f"Napaka pri vnosu: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/api/spenjalneZvezeResult")
async def spenjalne_zveze_result():
    try:
        if not calculation_data:
            raise HTTPException(status_code=404, detail="Ni podatkov za izračun")
            
        p, p_dop, o_u, F_p, o_dop = spenjalne_zveze(
            materjal=calculation_data['materjal_gred'],
            T=calculation_data['T'],
            d=calculation_data['D'],
            l=calculation_data['l_t'],
            obremenitev=calculation_data['tip_obremenitve'],
            type=calculation_data.get('type', 'deljen_pesto'),
            u=calculation_data.get('u', 0.1),
            i=calculation_data.get('i', 1),
            a=calculation_data.get('a', 10),
            l_u=calculation_data.get('l_u', 20),
            V_z=calculation_data.get('V_z', 1.5)
        )
        
        return {
            "status": "success",
            "rezultati": {
                "p": round(p, 4),
                "p_dop": round(p_dop, 4),
                "o_u": round(o_u, 4),
                "F_p": round(F_p, 4),
                "o_dop": round(o_dop, 4)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
