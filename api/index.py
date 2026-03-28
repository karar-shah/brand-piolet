from fastapi import FastAPI

app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")

@app.get("/api/hello")
def hello_work():
    return {"message": "Hello Work from FastAPI V2!"}
