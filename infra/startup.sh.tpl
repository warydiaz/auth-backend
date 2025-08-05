#!/bin/bash

# --- Configuración inicial y logs ---
exec > >(tee /var/log/startup-script.log|logger -t startup-script -s 2>/dev/console) 2>&1
echo "Iniciando script de arranque..."

# --- Actualizar e instalar Docker ---
echo "Actualizando paquetes e instalando Docker..."
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release docker.io

# Asegurarse de que el servicio Docker esté iniciado y habilitado
systemctl start docker
systemctl enable docker

# --- Instalar gcloud si no está ---
if ! command -v gcloud &> /dev/null; then
  echo "Instalando Google Cloud SDK..."
  apt-get install -y apt-transport-https ca-certificates gnupg curl

  # Descargar y agregar la clave de Google Cloud correctamente
  curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg

  echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] http://packages.cloud.google.com/apt cloud-sdk main" \
    | tee /etc/apt/sources.list.d/google-cloud-sdk.list

  apt-get update -y && apt-get install -y google-cloud-sdk
fi

# --- (Opcional) Autenticar con cuenta de servicio ---
# Descomenta y ajusta si usas cuenta de servicio:
# echo "Activando cuenta de servicio..."
# gcloud auth activate-service-account --key-file=/ruta/a/tu/key.json

# --- Configurar Docker para Artifact Registry ---
echo "Configurando Docker para autenticación con Artifact Registry..."
gcloud auth configure-docker europe-southwest1-docker.pkg.dev --quiet

# --- Variables pasadas desde Terraform ---
DB_HOST="${db_host}"
REDIS_HOST="${redis_host}"
PROJECT_ID="${project_id}"
REGION="${region}"
SERVICES_DOCKER_IMAGE="${services_docker_image}"
FEATURES_DOCKER_IMAGE="${features_docker_image}"

# --- Limpiar contenedores existentes ---
echo "Deteniendo y eliminando contenedores existentes..."
docker stop services-container features-container || true
docker rm services-container features-container || true

# --- Pull de ambas imágenes ---
echo "Tirando de la imagen de services-docker: $SERVICES_DOCKER_IMAGE"
docker pull "$SERVICES_DOCKER_IMAGE"
echo "Tirando de la imagen de features-docker: $FEATURES_DOCKER_IMAGE"
docker pull "$FEATURES_DOCKER_IMAGE"

# --- Ejecutar contenedor services-docker (puerto 80) ---
echo "Ejecutando contenedor services-docker..."
docker run -d \
  --name services-container \
  --restart=always \
  -e DB_HOST="$DB_HOST" \
  -e DB_PORT=5432 \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=postgres \
  -e DB_NAME=postgres \
  -e SALT_ROUNDS=10 \
  -e JWT_SECRET=super-secret-key-graham \
  -e REDIS_HOST="$REDIS_HOST" \
  -e REDIS_PORT=6379 \
  -e SMTP_HOST=smtp.gmail.com \
  -e SMTP_PORT=587 \
  -e SMTP_USER=not.replay.nexttest@gmail.com \
  -e SMTP_PASS='pzxd lfdl pckl fojp' \
  -e PORT=80 \
  -p 80:80 \
  "$SERVICES_DOCKER_IMAGE"

# --- Ejecutar contenedor features-docker (puerto 8080) ---
echo "Ejecutando contenedor features-docker..."
docker run -d \
  --name features-container \
  --restart=always \
  -e DB_HOST="$DB_HOST" \
  -e DB_PORT=5432 \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=postgres \
  -e DB_NAME=postgres \
  -e SALT_ROUNDS=10 \
  -e JWT_SECRET=super-secret-key-graham \
  -e REDIS_HOST="$REDIS_HOST" \
  -e REDIS_PORT=6379 \
  -e SMTP_HOST=smtp.gmail.com \
  -e SMTP_PORT=587 \
  -e SMTP_USER=not.replay.nexttest@gmail.com \
  -e SMTP_PASS='pzxd lfdl pckl fojp' \
  -e PORT=8080 \
  -p 8080:8080 \
  "$FEATURES_DOCKER_IMAGE"

echo "Script de arranque finalizado."
