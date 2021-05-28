var myWebSocket = require('ws');
var tmp = new myWebSocket('http://supervisor/core/websocket');
tmp.on('open', (res) => {
    tmp.send(
        JSON.stringify({
            type: 'auth',
            access_token: 'e6a6b35d3a980d038b8069a57128ab8a9dcb4599436d0022fc23c733e350597d3e044241e6bdc13ee64c4fb3d24ae1ab7984fe61ed1bcdd7',
        })
    );
});
tmp.on('message', (res) => {
    console.log('接收到消息：\n', res);
});
