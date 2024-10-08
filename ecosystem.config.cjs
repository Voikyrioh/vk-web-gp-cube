module.exports = {
    apps : [{
        script: 'serve',
        name: 'web-gpcube',
        time: true,
        instances: 1,
        autorestart: true,
        watch: false,
        max_restarts: 50,
        env: {
            PM2_SERVE_PATH: "/var/www/web-gpcube.voikyrioh.fr/",
            PM2_SERVE_PORT: 39666,
        }
    }],
    deploy: {
        production: {
            user: process.env.SERVER_USER,
            host: process.env.SERVER_IP?.split(','),
            ssh_options: "StrictHostKeyChecking=no",
            port: process.env.SERVER_PORT,
            key: 'deploy.key',
            ref: 'origin/main',
            repo: 'https://Voikyrioh:' + process.env.GIT_TOKEN + '@github.com/Voikyrioh/vk-web-gp-cube.git',
            path: '/home/' + process.env.SERVER_USER + '/Apps/vk-web-gp-cube',
            'post-deploy':
                'npm i --omit=dev && npm run build-production && cp -r ./dist/* /var/www/web-gpcube.voikyrioh.fr/ && pm2 reload ecosystem.config.cjs --env production && pm2 save',
            env: {
                NODE_ENV: 'production',
            },
        },
    },
}
