import os

class Config:
    JWT_SECRET_KEY = 'kIFEX2vEDkQn0Dk' 
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:Sql10pass!@127.0.0.1:3306/voting_system'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
