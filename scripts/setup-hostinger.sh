#!/bin/bash
# ===========================================
# Initial VPS Setup Script for Hostinger
# ===========================================
# This script prepares a fresh Hostinger VPS
# for running n8n Marketing Dashboard
# Usage: ./scripts/setup-hostinger.sh
# ===========================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=""
EMAIL=""
SETUP_DIR="/opt/n8n-dashboard"

# Function to print colored messages
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_message "${RED}" "Error: This script must be run as root"
        exit 1
    fi
}

# Function to detect OS
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VERSION=$VERSION_ID
    else
        print_message "${RED}" "Error: Cannot detect OS"
        exit 1
    fi

    print_message "${GREEN}" "Detected OS: $OS $VERSION"
}

# Function to update system
update_system() {
    print_message "${YELLOW}" "Updating system packages..."

    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        apt-get update -y
        apt-get upgrade -y
        apt-get install -y curl wget git ufw fail2ban
    elif [ "$OS" = "almalinux" ] || [ "$OS" = "centos" ]; then
        dnf update -y
        dnf install -y curl wget git firewalld fail2ban
    fi

    print_message "${GREEN}" "✓ System updated"
}

# Function to install Docker
install_docker() {
    print_message "${YELLOW}" "Installing Docker and Docker Compose..."

    if command_exists docker; then
        print_message "${YELLOW}" "Docker already installed, skipping..."
        return
    fi

    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh

    systemctl enable docker
    systemctl start docker

    usermod -aG docker $SUDO_USER

    print_message "${GREEN}" "✓ Docker installed"
}

# Function to install Nginx
install_nginx() {
    print_message "${YELLOW}" "Installing Nginx..."

    if command_exists nginx; then
        print_message "${YELLOW}" "Nginx already installed, skipping..."
        return
    fi

    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        apt-get install -y nginx certbot python3-certbot-nginx
    elif [ "$OS" = "almalinux" ] || [ "$OS" = "centos" ]; then
        dnf install -y nginx certbot python3-certbot-nginx
    fi

    systemctl enable nginx
    systemctl start nginx

    print_message "${GREEN}" "✓ Nginx installed"
}

# Function to configure firewall
configure_firewall() {
    print_message "${YELLOW}" "Configuring firewall..."

    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw --force enable
    elif [ "$OS" = "almalinux" ] || [ "$OS" = "centos" ]; then
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --reload
    fi

    print_message "${GREEN}" "✓ Firewall configured"
}

# Function to create project directory
setup_project_dir() {
    print_message "${YELLOW}" "Creating project directory..."

    mkdir -p $SETUP_DIR
    chown $SUDO_USER:$SUDO_USER $SETUP_DIR

    print_message "${GREEN}" "✓ Project directory created: $SETUP_DIR"
}

# Function to setup swap (for small VPS)
setup_swap() {
    print_message "${YELLOW}" "Setting up swap space..."

    if [ -f /swapfile ]; then
        print_message "${YELLOW}" "Swap file already exists, skipping..."
        return
    fi

    # Create 2GB swap file
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile

    # Add to fstab
    echo '/swapfile none swap sw 0 0' >> /etc/fstab

    # Configure swappiness
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf

    print_message "${GREEN}" "✓ Swap configured (2GB)"
}

# Function to optimize system
optimize_system() {
    print_message "${YELLOW}" "Optimizing system settings..."

    # Increase file descriptor limits
    cat >> /etc/sysctl.conf << EOF

# Docker optimization
net.ipv4.ip_forward=1
net.bridge.bridge-nf-call-iptables=1
fs.file-max=2097152
fs.inotify.max_user_watches=524288
EOF

    sysctl -p

    print_message "${GREEN}" "✓ System optimized"
}

# Function to create SSL certificate
setup_ssl() {
    if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
        print_message "${YELLOW}" "No domain/email provided, skipping SSL setup"
        return
    fi

    print_message "${YELLOW}" "Setting up SSL certificate for $DOMAIN..."

    # Create temporary Nginx config
    cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}
EOF

    ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
    systemctl reload nginx

    # Get certificate
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL

    print_message "${GREEN}" "✓ SSL certificate obtained"
}

# Function to print next steps
print_next_steps() {
    print_message "${GREEN}" "\n========================================"
    print_message "${GREEN}" "VPS Setup Complete!${NC}"
    print_message "${GREEN}" "========================================\n"

    echo -e "${YELLOW}Next Steps:${NC}"
    echo -e "1. Clone your repository:"
    echo -e "   ${GREEN}git clone https://github.com/your-repo.git $SETUP_DIR${NC}\n"

    echo -e "2. Navigate to project directory:"
    echo -e "   ${GREEN}cd $SETUP_DIR${NC}\n"

    echo -e "3. Create environment file:"
    echo -e "   ${GREEN}cp .env.production.example .env.production${NC}"
    echo -e "   ${GREEN}nano .env.production${NC}\n"

    echo -e "4. Deploy the application:"
    echo -e "   ${GREEN}./scripts/deploy.sh production${NC}\n"

    echo -e "5. Configure Nginx reverse proxy:"
    echo -e "   ${GREEN}nano /etc/nginx/sites-available/$DOMAIN${NC}\n"

    echo -e "${YELLOW}Useful Commands:${NC}"
    echo -e "  View Docker logs: ${GREEN}docker-compose logs -f${NC}"
    echo -e "  Restart services: ${GREEN}systemctl restart nginx${NC}"
    echo -e "  Check SSL status:  ${GREEN}certbot renew --dry-run${NC}\n"

    if [ -z "$DOMAIN" ]; then
        echo -e "${YELLOW}To configure SSL later, run:${NC}"
        echo -e "  ${GREEN}certbot --nginx -d yourdomain.com${NC}\n"
    fi
}

# ===========================================
# Main Execution
# ===========================================

print_message "${BLUE}" "========================================"
print_message "${BLUE}" "Hostinger VPS Setup Script${NC}"
print_message "${BLUE}" "========================================\n"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --domain)
            DOMAIN="$2"
            shift 2
            ;;
        --email)
            EMAIL="$2"
            shift 2
            ;;
        *)
            print_message "${RED}" "Unknown option: $1"
            exit 1
            ;;
    esac
done

check_root
detect_os
update_system
install_docker
install_nginx
configure_firewall
setup_project_dir
setup_swap
optimize_system
setup_ssl
print_next_steps

print_message "${GREEN}" "VPS setup completed successfully!${NC}"
