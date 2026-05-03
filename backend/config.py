import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = 'community-secondhand-secret-key-2026'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'community_secondhand.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    
    ADMIN_USERNAME = 'admin'
    ADMIN_PASSWORD = 'admin123'
