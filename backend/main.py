
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from fastapi.responses import JSONResponse

from api_funkcije.zagozde import router as zagozde_router
from api_funkcije.mozniki import router as mozniki_router
from api_funkcije.utornezveze import router as utorna_zveza_router
from api_funkcije.zobatezveze import router as zobate_zveze_router
from api_funkcije.poligonalnezveze import router as poligonalne_zveze_router
from api_funkcije.krcninased import router as krcni_nased_router
from api_funkcije.spenjalnezveze import router as spenjalne_zveze_router
from api_funkcije.stozcastinased import router as stozcasti_nased_router
app = FastAPI(
    title="Krcni Nased API",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# CORS nastavitve
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Dovoli vse izvore
    allow_methods=["*"],  # Dovoli vse metode
    allow_headers=["*"],  # Dovoli vse headerje
    expose_headers=["*"]  # Izpostavi vse headerje
)

# Dodajte middleware za izpis zahtevkov
@app.middleware("http")
async def log_requests(request, call_next):
    print(f"\n=== New Request ===")
    print(f"Incoming request: {request.method} {request.url}")
    print(f"Client host: {request.client.host if request.client else 'Unknown'}")
    print(f"Headers: {dict(request.headers)}")
    
    if request.method == "POST":
        try:
            body = await request.body()
            print(f"Request body: {body.decode()}")
        except Exception as e:
            print(f"Error reading body: {e}")
    
    response = await call_next(request)
    print(f"Response status: {response.status_code}")
    print(f"=== End Request ===\n")
    return response


    

# Spremenimo root endpoint
@app.get("/api")
async def root():
    return {"message": "API is running"}

@app.get("/api/test")
async def test():
    print("Test endpoint hit")
    return {"message": "Test successful"}






app.include_router(zagozde_router)
app.include_router(mozniki_router)
app.include_router(utorna_zveza_router)
app.include_router(zobate_zveze_router)
app.include_router(poligonalne_zveze_router)
app.include_router(krcni_nased_router)
app.include_router(spenjalne_zveze_router)
app.include_router(stozcasti_nased_router)
if __name__ == "__main__":
    import uvicorn
    print(f"Starting server on all interfaces, port 5000")
    uvicorn.run(app, host="0.0.0.0", port=5000)
