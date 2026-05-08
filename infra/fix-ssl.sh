#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}>>> Iniciando correção e blindagem do SSL...${NC}"

# 1. Verificar dependências
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Certbot não encontrado. Instalando dependências...${NC}"
    # Assume Amazon Linux / RHEL based based on ec2-user
    sudo dnf install -y certbot python3-certbot-nginx || sudo apt-get install -y certbot python3-certbot-nginx
fi

# 2. Detectar usuário do webserver
WEB_USER="nginx"
if id "www-data" &>/dev/null; then WEB_USER="www-data"; fi

# 3. Garantir diretórios
echo "Configurando webroot em /var/www/html para o usuário $WEB_USER..."
sudo mkdir -p /var/www/html
sudo chown -R $WEB_USER:$WEB_USER /var/www/html
sudo chmod -R 755 /var/www/html

# 4. Validar Config do Nginx antes de reiniciar
echo "Validando sintaxe do Nginx..."
if sudo nginx -t; then
    sudo systemctl restart nginx
else
    echo -e "${RED}Erro na sintaxe do Nginx. Abortando para evitar queda do serviço.${NC}"
    exit 1
fi

# 5. Gerar Certificado
echo -e "${GREEN}>>> Solicitando certificado para moodspace.com.br...${NC}"
sudo certbot --nginx -d moodspace.com.br -d www.moodspace.com.br --non-interactive --agree-tos -m admin@moodspace.com.br --redirect

if [ $? -eq 0 ]; then
    echo -e "${GREEN}>>> SUCESSO! HTTPS ativo. 🚀${NC}"
    
    # Garantir que a renovação automática está no crontab
    if ! sudo crontab -l | grep -q "certbot renew"; then
        echo "Adicionando renovação automática ao cron..."
        (sudo crontab -l 2>/dev/null; echo "0 12 * * * certbot renew --quiet && systemctl reload nginx") | sudo crontab -
    fi
else
    echo -e "${RED}>>> FALHA NA GERAÇÃO DO CERTIFICADO.${NC}"
    echo "Verifique se o domínio aponta para: $(curl -4s icanhazip.com)"
fi
