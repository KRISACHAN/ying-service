// import fs from 'fs';
// import path from 'path';
import Colors from 'colors/safe';
// import dayjs from 'dayjs';
// import { isString } from 'lodash';

const THEMES = {
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red',
};

Colors.setTheme(THEMES);

const log = {};

Object.keys(THEMES).forEach(theme => {
    log[theme] = message => {
        // const day = dayjs().format('YYYY-MM-DD');
        // const filePath = `${path.join(__dirname, '..', 'logs')}/${day}.txt`;
        // const content = isString(message)
        //     ? `${message.replace(/\r|(\s{2,})/g, '')}\n`
        //     : `${JSON.stringify(message).replace(/\r|(\s{2,})/g, '')}\n`;
        // fs.appendFileSync(`${filePath}`, content, 'UTF8');
        return console.log(Colors[theme](message));
    };
});

export default log;
