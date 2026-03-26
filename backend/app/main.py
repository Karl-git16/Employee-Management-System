#Bootstrap employee management system backend
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.config.database import client, employees_collection
from app.routes.employee_routes import router as employee_router
from app.routes.user_routes import router as user_router
from fastapi.middleware.cors import CORSMiddleware 

#Importing the context manager for lifespan events and startup and shutdown code
asynccontextmanager
@asynccontextmanager
async def lifespan(app: FastAPI):
    #Startup code
    try:
        info = client.server_info()  
        print("Connected to MongoDB server:")
        #Initialize database connections, load configurations, etc.
        print("Starting up the Employee Management System API...")
    except Exception as e:
        #Handle connection errors, log them, and decide whether to exit or continue with limited functionality
        print("Error connecting to MongoDB:", e)
        raise e
    yield
    #Shutdown code: Close database connections, clean up resources, etc.
    print("Shutting down the Employee Management System API...")

"""  #insert into employees collection
employees_collection.insert_one({
    "employee_id": "EMP001",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "position": "Software Engineer",
    "department": "Engineering",
    "salary": 80000,
    "status": "active"
}) """

app = FastAPI(title="Employee Management System API", version="1.0", lifespan=lifespan)

# CORS configuration - allow frontend to access backend
#CORS middleware setup (allowing all origins for teaching purposes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
#Include employee-related routes
app.include_router(employee_router, prefix="/employees")
app.include_router(user_router, prefix="/auth")

#Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok"}
    
