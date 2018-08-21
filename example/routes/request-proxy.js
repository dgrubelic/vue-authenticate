const proxy = require('http-proxy-middleware');
const https = require('https');

const config = require('../config.json')

const proxyToApi =
    proxy('/api/', {
        target: "http://useless:target/",
        changeOrigin: true,
        agent: new https.Agent({
            rejectUnauthorized: false,
        }),
        pathRewrite: {
            '^/api/': '/', // remove base path
        },
        logLevel: 'debug',
        router: (req) => config.auth[req.query.provider].apiUrl,
        onProxyReq(proxyReq, req) {
            if (req.body) {
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader('Content-Type', 'application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
            }
        }
    }
);


module.exports = proxyToApi;