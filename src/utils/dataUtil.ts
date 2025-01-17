import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import { debugMode, isSupervisor } from '../config/config';

let basePath = path.join('/data');

if (debugMode || !isSupervisor) {
    basePath = path.join(__dirname, '../../data');
}

if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath);
}

const getDataSync = (fileName: string, namePath: string[] = []) => {
    try {
        const data = fs.readFileSync(path.join(basePath, `/${fileName}`), { encoding: 'utf-8' });
        return namePath.reduce((cur, path: string) => cur[path], JSON.parse(data));
    } catch (err) {
        console.log(`getDataSync: ${fileName} -> ${namePath} no data`);
        return null;
    }
};

const saveData = async (fileName: string, data: string): Promise<-1 | 0> => {
    try {
        return new Promise((resolve, reject) => {
            fs.writeFile(path.join(basePath, `/${fileName}`), data, (err) => {
                if (err) {
                    console.log('Jia ~ file: data Util.ts ~ line 23 ~ fs.writeFile ~ err', err);
                    resolve(-1);
                }
                resolve(0);
            });
        });
    } catch (err) {
        console.log('saveData-> no data');
        return -1;
    }
};

const appendData = async (fileName: string, namePath: string[], data: string | number | boolean) => {
    const fileData = getDataSync(fileName) || {};
    _.set(fileData, namePath, data);
    return saveData(fileName, JSON.stringify(fileData));
};

const clearData = async (fileName: string) => {
    return saveData(fileName, '{}');
};

export { getDataSync, saveData, appendData, clearData };
