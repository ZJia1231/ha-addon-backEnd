import CkApi from 'coolkit-open-api';
import { getDataSync, saveData } from './dataUtil';
import generateLovelace from './generateLovelace';
import getThings from './getThings';

export default async () => {
    const loginParams = getDataSync('user.json', ['login']);
    if (loginParams) {
        const result = await CkApi.user.login(loginParams);
        if (result.error === 0) {
            await saveData('user.json', JSON.stringify({ ...result.data, login: loginParams }));
            await getThings();
            await generateLovelace();
        }
    }
};