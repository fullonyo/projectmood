#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}>>> Iniciando configuração do Servidor MoodSpace...${NC}"

# 1. Atualizar o sistema
echo -e "${GREEN}>>> Atualizando pacotes...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

# 2. Instalar Docker e Docker Compose (caso não tenha)
echo -e "${GREEN}>>> Verificando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo "Instalando Docker..."
    sudo apt-get install -y docker.io docker-compose-v2 git
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
    echo "Docker instalado. Você precisará fazer logout/login para usar docker sem sudo."
else
    echo "Docker já instalado."
fi

# 3. Instalar Nginx e Certbot
echo -e "${GREEN}>>> Instalando Nginx e Certbot...${NC}"
sudo apt-get install -y nginx certbot python3-certbot-nginx

# 4. Configurar Firewall (UFW)
echo -e "${GREEN}>>> Configurando Firewall...${NC}"
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

# 5. Configurar Nginx
echo -e "${GREEN}>>> Configurando Nginx para moodspace.com.br...${NC}"
sudo cp infra/nginx.conf /etc/nginx/sites-available/moodspace
sudo ln -sf /etc/nginx/sites-available/moodspace /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# 6. Obter Certificado SSL (HTTPS)
echo -e "${GREEN}>>> Obtendo certificado SSL com Let's Encrypt...${NC}"
echo "Certifique-se de que o domínio moodspace.com.br já aponta para este IP no DNS."
read -p "Pressione ENTER para continuar com a geração do certificado SSL..."

sudo certbot --nginx -d moodspace.com.br -d www.moodspace.com.br --non-interactive --agree-tos -m admin@moodspace.com.br --redirect

echo -e "${GREEN}>>> Configuração concluída! O MoodSpace deve estar acessível em https://moodspace.com.br 🚀${NC}"
