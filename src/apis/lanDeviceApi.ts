import axios from 'axios';
import coolKitWs from 'coolkit-ws';
import AuthUtil from '../utils/lanControlAuthenticationUtils';

const setSwitch = async (params: { ip: string; port: number; deviceid: string; devicekey: string; data: string; selfApikey: string }) => {
    const { ip, port, deviceid, devicekey, data, selfApikey } = params;
    const iv = `abcdef${Date.now()}abcdef`.slice(0, 16);
    const reqData = {
        iv: AuthUtil.encryptionBase64(iv),
        deviceid,
        selfApikey,
        encrypt: true,
        sequence: `${Date.now()}`,
        data: AuthUtil.encryptionData({
            iv,
            data,
            key: devicekey,
        }),
    };
    let res = axios.post(`http://${ip}:${port}/zeroconf/switch`, reqData);

    res.catch(async (e) => {
        console.log('控制局域网单通道设备出错', reqData);
        return await coolKitWs.updateThing({
            deviceid,
            ownerApikey: selfApikey,
            params: JSON.parse(data),
        });
    });

    return await res;
};

const setSwitches = async (params: { ip: string; port: number; deviceid: string; devicekey: string; data: string; selfApikey: string }) => {
    const { ip, port, deviceid, devicekey, data, selfApikey } = params;
    const iv = `abcdef${Date.now()}abcdef`.slice(0, 16);
    const reqData = {
        iv: AuthUtil.encryptionBase64(iv),
        deviceid,
        selfApikey,
        encrypt: true,
        sequence: `${Date.now()}`,
        data: AuthUtil.encryptionData({
            iv,
            data,
            key: devicekey,
        }),
    };
    const res = axios.post(`http://${ip}:${port}/zeroconf/switches`, reqData);

    res.catch(async (e) => {
        console.log('控制局域网多通道设备出错', reqData);
        return await coolKitWs.updateThing({
            deviceid,
            ownerApikey: selfApikey,
            params: JSON.parse(data),
        });
    });

    return await res;
};

/**
 *
 * @deprecated 局域网设备好像不支持该接口
 */
const getLanDeviceParams = async (params: { ip: string; port: number; deviceid: string; devicekey: string; selfApikey: string }) => {
    const { ip, port, deviceid, devicekey, selfApikey } = params;
    const iv = `abcdef${Date.now()}abcdef`.slice(0, 16);
    const reqData = {
        iv: AuthUtil.encryptionBase64(iv),
        deviceid,
        selfApikey,
        encrypt: true,
        sequence: `${Date.now()}`,
        data: AuthUtil.encryptionData({
            iv,
            data: JSON.stringify({}),
            key: devicekey,
        }),
    };
    const res = axios.post(`http://${ip}:${port}/zeroconf/info`, reqData);

    res.catch(async (e) => {
        console.log('get lan device params failed:', deviceid);
    });

    return await res;
};

/**
 * @description 调整灯的模式及亮度、色温
 * @description 目前仅针对UIID 103
 */
const updateLanLight = async (params: { ip: string; port: number; deviceid: string; devicekey: string; data: string; selfApikey: string }) => {
    const { ip, port, deviceid, devicekey, data, selfApikey } = params;
    const iv = `abcdef${Date.now()}abcdef`.slice(0, 16);
    const reqData = {
        iv: AuthUtil.encryptionBase64(iv) ,
        deviceid,
        selfApikey,
        encrypt: true,
        sequence: `${Date.now()}`,
        data: AuthUtil.encryptionData({
            iv,
            data,
            key: devicekey,
        }),
    };
    let res = axios.post(`http://${ip}:${port}/zeroconf/dimmable`, reqData);

    res.catch(async (e) => {
        console.log('控制局域网灯设备出错', reqData);
        return await coolKitWs.updateThing({
            deviceid,
            ownerApikey: selfApikey,
            params: JSON.parse(data),
        });
    });

    return await res;
};

export { setSwitch, setSwitches, getLanDeviceParams, updateLanLight };
