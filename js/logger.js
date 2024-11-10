const { createLogger, format, transports } = require('winston');
const path = require('path');

const logger = createLogger({
    level: 'info',  // 設置默認的日誌級別，可以根據需要設為 'debug', 'warn', 'error'
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`)
    ),
    transports: [
        new transports.Console(),  // 在控制台輸出日誌
        new transports.File({ filename: path.join(__dirname, 'logs', 'app.log') })  // 日誌輸出到文件
    ],
});

module.exports = logger;