#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}>>> Iniciando correção do SSL...${NC}"

# 1. Garantir que a pasta do webroot existe e tem permissões corretas
echo "Criando diretório webroot..."
sudo mkdir -p /var/www/html
sudo chown -R nginx:nginx /var/www/html
sudo chmod -R 755 /var/www/html

# 2. Criar um arquivo de teste para verificar se o Nginx consegue ler
echo "test" | sudo tee /var/www/html/test.txt > /dev/null

# 3. Reiniciar Nginx para garantir que configs estão carregadas
echo "Reiniciando Nginx..."
sudo systemctl restart nginx

# 4. Tentar rodar o Certbot novamente
echo -e "${GREEN}>>> Tentando gerar o certificado novamente...${NC}"
sudo certbot --nginx -d moodspace.com.br -d www.moodspace.com.br --non-interactive --agree-tos -m admin@moodspace.com.br --redirect

if [ $? -eq 0 ]; then
    echo -e "${GREEN}>>> SUCESSO! O certificado foi gerado. HTTPS ativo. 🚀${NC}"
else
    echo -e "${RED}>>> AINDA COM ERRO.${NC}"
    echo "Verifique se o domínio moodspace.com.br realmente aponta para este IP:"
    curl -4 icanhazip.com
    echo "Se o IP estiver correto, verifique os logs: /var/log/nginx/error.log"
fi
