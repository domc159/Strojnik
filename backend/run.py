import uvicorn

if __name__ == "__main__":
    print(f"Starting server on all interfaces, port 5000")
    uvicorn.run(
        "main:app", 
        host="0.0.0.0",  # To omogoča dostop iz drugih naprav
        port=5000, 
        reload=True,
        workers=1,
        proxy_headers=True,
        forwarded_allow_ips="*"
    ) 