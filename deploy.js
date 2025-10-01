const fs = require('fs-extra');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');
const { minify } = require('terser');
const CleanCSS = require('clean-css');
const path = require('path');

const SOURCE_DIR = path.resolve(__dirname);
const DIST_DIR = path.resolve(__dirname, 'dist');

async function deploy() {
    try {
        // Clean dist directory
        console.log('Cleaning dist directory...');
        await fs.emptyDir(DIST_DIR);

        // Copy all files
        console.log('Copying files...');
        await fs.copy(SOURCE_DIR, DIST_DIR, {
            filter: (src) => !src.includes('node_modules') && !src.includes('.git')
        });

        // Optimize images
        console.log('Optimizing images...');
        const images = await imagemin([`${DIST_DIR}/images/**/*.{jpg,png,svg}`], {
            destination: `${DIST_DIR}/images`,
            plugins: [
                imageminJpegtran(),
                imageminPngquant({
                    quality: [0.6, 0.8]
                }),
                imageminSvgo({
                    plugins: [{
                        name: 'removeViewBox',
                        active: false
                    }]
                })
            ]
        });

        // Minify CSS
        console.log('Minifying CSS...');
        const cssFiles = await fs.readdir(`${DIST_DIR}/css`);
        for (const file of cssFiles) {
            if (file.endsWith('.css')) {
                const cssPath = path.join(DIST_DIR, 'css', file);
                const css = await fs.readFile(cssPath, 'utf8');
                const minified = new CleanCSS({ level: 2 }).minify(css);
                await fs.writeFile(cssPath, minified.styles);
            }
        }

        // Minify JavaScript
        console.log('Minifying JavaScript...');
        const jsFiles = await fs.readdir(`${DIST_DIR}/js`);
        for (const file of jsFiles) {
            if (file.endsWith('.js')) {
                const jsPath = path.join(DIST_DIR, 'js', file);
                const js = await fs.readFile(jsPath, 'utf8');
                const minified = await minify(js, {
                    compress: true,
                    mangle: true
                });
                await fs.writeFile(jsPath, minified.code);
            }
        }

        // Create server configuration
        console.log('Creating server configuration...');
        const nginxConfig = `
server {
    listen 80;
    server_name castnfish.com www.castnfish.com;
    root /var/www/castnfish.com;
    index index.html;

    # SSL configuration
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/castnfish.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/castnfish.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval' *.mapbox.com api.castnfish.com; img-src 'self' data: blob: *.mapbox.com;";

    # Caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # API proxy
    location /api/ {
        proxy_pass http://api.castnfish.com/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # HTML5 History Mode
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml;
    gzip_disable "MSIE [1-6]\.";
}`;

        await fs.writeFile(path.join(DIST_DIR, 'nginx.conf'), nginxConfig);

        // Create deployment script
        const deployScript = `#!/bin/bash
# Stop nginx
sudo systemctl stop nginx

# Copy files
sudo cp -R ./dist/* /var/www/castnfish.com/

# Copy nginx config
sudo cp ./dist/nginx.conf /etc/nginx/sites-available/castnfish.com
sudo ln -sf /etc/nginx/sites-available/castnfish.com /etc/nginx/sites-enabled/

# Restart nginx
sudo systemctl start nginx

# Reload Cloudflare cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \\
     -H "Authorization: Bearer $CF_TOKEN" \\
     -H "Content-Type: application/json" \\
     --data '{"purge_everything":true}'`;

        await fs.writeFile(path.join(DIST_DIR, 'deploy.sh'), deployScript);
        await fs.chmod(path.join(DIST_DIR, 'deploy.sh'), '755');

        console.log('Deployment package created successfully!');
    } catch (error) {
        console.error('Deployment failed:', error);
        process.exit(1);
    }
}

deploy();