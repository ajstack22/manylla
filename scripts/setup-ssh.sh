#!/bin/bash

# Manylla SSH Setup Script
# Configures SSH access for deployment

echo "🔧 Manylla SSH Configuration Setup"
echo "=================================="
echo

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if .ssh directory exists
if [ ! -d ~/.ssh ]; then
    echo "Creating ~/.ssh directory..."
    mkdir -p ~/.ssh
    chmod 700 ~/.ssh
fi

# Check if config file exists
if [ ! -f ~/.ssh/config ]; then
    echo "Creating ~/.ssh/config..."
    touch ~/.ssh/config
    chmod 600 ~/.ssh/config
fi

# Check if manylla-cpanel already exists
if grep -q "Host manylla-cpanel" ~/.ssh/config 2>/dev/null; then
    echo -e "${GREEN}✅ SSH configuration already exists${NC}"
    echo
    echo "Current configuration:"
    sed -n '/Host manylla-cpanel/,/^$/p' ~/.ssh/config
    echo
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Configuration unchanged."
        exit 0
    fi
    # Remove existing configuration
    sed -i.backup '/Host manylla-cpanel/,/^$/d' ~/.ssh/config
fi

# Get server details
echo -e "${YELLOW}Please provide your hosting details:${NC}"
echo
read -p "Server hostname (e.g., server123.web-hosting.com): " hostname
read -p "SSH username: " username
read -p "SSH port (default 22): " port
port=${port:-22}

# Add configuration
echo "" >> ~/.ssh/config
echo "Host manylla-cpanel" >> ~/.ssh/config
echo "    HostName $hostname" >> ~/.ssh/config
echo "    Port $port" >> ~/.ssh/config
echo "    User $username" >> ~/.ssh/config

echo
echo -e "${GREEN}✅ SSH configuration added${NC}"
echo

# Ask about SSH key
echo "Do you want to set up SSH key authentication? (recommended)"
read -p "This is more secure than password authentication (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    KEY_FILE=~/.ssh/manylla_rsa
    
    if [ -f "$KEY_FILE" ]; then
        echo "SSH key already exists at $KEY_FILE"
    else
        echo "Generating new SSH key..."
        ssh-keygen -t rsa -b 4096 -f "$KEY_FILE" -N "" -C "manylla-deploy"
        echo -e "${GREEN}✅ SSH key generated${NC}"
    fi
    
    # Add to config
    echo "    IdentityFile $KEY_FILE" >> ~/.ssh/config
    
    echo
    echo "Now we need to copy your public key to the server."
    echo "You'll be prompted for your password once."
    echo
    ssh-copy-id -i "$KEY_FILE.pub" manylla-cpanel
    
    echo
    echo -e "${GREEN}✅ SSH key installed on server${NC}"
fi

# Test connection
echo
echo -e "${YELLOW}Testing connection...${NC}"
if ssh -o ConnectTimeout=5 manylla-cpanel "echo 'Connection successful!'" 2>/dev/null; then
    echo -e "${GREEN}✅ SSH connection successful!${NC}"
    
    # Create necessary directories on server
    echo
    echo "Creating deployment directories on server..."
    ssh manylla-cpanel << 'EOF'
        mkdir -p ~/public_html/qual
        mkdir -p ~/public_html/api/sync
        mkdir -p ~/public_html/qual/api/sync
        mkdir -p ~/backups
        echo "✅ Directories created"
EOF
else
    echo -e "${YELLOW}⚠️  Could not connect. Please check your settings.${NC}"
    echo
    echo "Your configuration has been saved. You can test it with:"
    echo "  ssh manylla-cpanel"
fi

echo
echo -e "${GREEN}Setup complete!${NC}"
echo
echo "You can now deploy using:"
echo "  npm run deploy:qual    # Deploy to staging"
echo "  npm run deploy:prod    # Deploy to production"