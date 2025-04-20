# Gestión de Gastos para Estudiantes

## Estructura del proyecto
├── backend/       # Django API
├── frontend/      # React App

### Entorno Virtual

python -m venv venv
source venv/bin/activate  # Linux/Mac)
venv\Scripts\activate    # Windows

### Backend
1. Entrar en la Carpeta:
cd backend

2. Instalar dependencias:
pip install -r requirements.txt

3. Crear Base de Datos en MariaDB:
```bash
CREATE DATABASE IF NOT EXISTS gestorgastos DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

4. Configurar Contraseña de MariaDB:
En settings.py ubica la línea:
```bash
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'gestorgastos',
        'USER': 'root',
        'PASSWORD': 'placeholder',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```
Y cambia "placeholder" por tu contraseña

5. Ejecutar migraciones:
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```
6. Iniciar servidor:
```bash
python manage.py runserver
```
### Frontend
1. Instalar dependencias:
```bash
cd frontend
npm install
```

2. Iniciar aplicación:
```bash
npm start
```
```