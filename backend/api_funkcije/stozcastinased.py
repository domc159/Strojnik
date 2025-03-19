from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from api_funkcije.zveza_gred_pesto import *

router = APIRouter()

# Storage for calculation data
calculation_data: Dict[str, Any] = {}

class StozcastiNasedInput(BaseModel):
    T: Optional[float] = None
    D: Optional[float] = None
    d: Optional[float] = None
    a: Optional[float] = None
    L: Optional[float] = None
    mi_k: Optional[float] = 0.1
    z_moznik: Optional[bool] = False
    konus_naseda: Optional[float] = None
    n: Optional[float] = None
    P: Optional[float] = None
    pesto: Optional[str] = None
    obremenitev: Optional[str] = None

@router.get("/api/stozcastiNasedResult")
async def stozcasti_nased_result():
    try:
        if not calculation_data:
            raise HTTPException(status_code=404, detail="Ni podatkov za izračun")
            
        print("Function signature:", stozcasti_nased.__code__.co_varnames)
        print("Calculation data:", calculation_data)
        
        try:
            konus, Fp_nor, F_nor, Fn, Ftr, p_nor, Fp_rad, F_rad, Fr, Fa, p_rad, T = stozcasti_nased(
                T=calculation_data['T'],
                d=calculation_data['d'],
                D=calculation_data['D'],
                a=calculation_data.get('a'),
                z_moznik=calculation_data.get('z_moznik', False),
                mu=calculation_data.get('mi_k', 0.1),
                l=calculation_data['L'],
                konus_naseda=float(calculation_data.get('konus_naseda')) if calculation_data.get('konus_naseda') else None,
                n=calculation_data.get('n'),
                P=calculation_data.get('P')
            )

            p_dop = p_dopustni(pesto=calculation_data.get('pesto'), obremenitev=calculation_data.get('obremenitev'))
            
            return {
                "status": "success",
                "rezultati": {
                    "konus": konus,
                    "Fp_nor": Fp_nor,
                    "F_nor": F_nor,
                    "Fn": Fn,
                    "Ftr": Ftr,
                    "p_nor": p_nor,
                    "Fp_rad": Fp_rad,
                    "F_rad": F_rad,
                    "Fr": Fr,
                    "Fa": Fa,
                    "p_rad": p_rad,
                    "T": T,
                    "p_dop": p_dop
                }
            }
        except Exception as e:
            print(f"Calculation error: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
            
    except Exception as e:
        print(f"API error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/stozcastiNasedVnos")
async def stozcasti_nased_vnos(data: StozcastiNasedInput):
    try:
        calculation = {
            'T': data.T,
            'D': data.D,
            'd': data.d,
            'a': data.a,
            'L': data.L,
            'mi_k': data.mi_k,
            'z_moznik': data.z_moznik,
            'konus_naseda': data.konus_naseda,
            'n': data.n,
            'P': data.P,
            'pesto': data.pesto,
            'obremenitev': data.obremenitev
        }
        
        calculation_data.clear()
        calculation_data.update(calculation)
        print("Calculation data:", calculation_data)
        
        return {"status": "success", "message": "Podatki uspešno sprejeti"}
        
    except Exception as e:
        print(f"Napaka pri vnosu: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
