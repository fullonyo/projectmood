#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}>>> Iniciando configuração do Servidor MoodSpace (Amazon Linux)...${NC}"

# 1. Atualizar o sistema
echo -e "${GREEN}>>> Atualizando pacotes...${NC}"
sudo dnf update -y

# 2. Instalar Docker e Git (caso não tenha)
echo -e "${GREEN}>>> Verificando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo "Instalando Docker..."
    sudo dnf install -y docker git
    sudo service docker start
    sudo usermod -aG docker $USER
    # Habilitar docker para iniciar no boot
    sudo systemctl enable docker
    echo "Docker instalado. Você precisará fazer logout/login para usar docker sem sudo."
else
    echo "Docker já instalado."
fi

# Instalar Docker Compose (Plugin) se necessário
if ! docker compose version &> /dev/null; then
    echo "Instalando Docker Compose Plugin..."
    sudo mkdir -p /usr/local/lib/docker/cli-plugins/
    sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
    sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi


# 3. Instalar Nginx
echo -e "${GREEN}>>> Instalando Nginx...${NC}"
sudo dnf install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 4. Instalar Certbot (via pip, método recomendado para Amazon Linux 2023)
echo -e "${GREEN}>>> Instalando Certbot...${NC}"
sudo dnf install -y python3 augeas-libs
sudo python3 -m venv /opt/certbot/
sudo /opt/certbot/bin/pip install --upgrade pip
sudo /opt/certbot/bin/pip install certbot certbot-nginx
sudo ln -s /opt/certbot/bin/certbot /usr/bin/certbot

# 5. Configurar Nginx
echo -e "${GREEN}>>> Configurando Nginx para moodspace.com.br...${NC}"
# No Amazon Linux, geralmente usa-se nginx.conf direto ou conf.d
# Vamos criar o arquivo na conf.d
sudo cp infra/nginx.conf /etc/nginx/conf.d/moodspace.conf

# Ajustar o nginx.conf principal se necessário para ler conf.d (padrão no AL2023)
# Remover server default se existir
# sudo mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.bak 2>/dev/null

sudo nginx -t && sudo systemctl restart nginx

# 6. Obter Certificado SSL (HTTPS)
echo -e "${GREEN}>>> Obtendo certificado SSL com Let's Encrypt...${NC}"
echo "Certifique-se de que o domínio moodspace.com.br já aponta para este IP no DNS."
echo "IMPORTANTE: No Amazon Linux, certifique-se que as portas 80 e 443 estão abertas no Security Group da AWS."
read -p "Pressione ENTER para continuar com a geração do certificado SSL..."

sudo certbot --nginx -d moodspace.com.br -d www.moodspace.com.br --non-interactive --agree-tos -m admin@moodspace.com.br --redirect

echo -e "${GREEN}>>> Configuração concluída! O MoodSpace deve estar acessível em https://moodspace.com.br 🚀${NC}"
