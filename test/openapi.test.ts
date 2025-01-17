import CkApi from 'coolkit-open-api';
import coolKitWs from 'coolkit-ws';
import { appId, appSecret } from '../src/config/app';
import { getDataSync } from '../src/utils/dataUtil';
import Controller from '../src/controller/Controller';
import { updateStates } from '../src/apis/restApi';
(async () => {
    const at = getDataSync('user.json', ['at']);
    const apikey = getDataSync('user.json', ['user', 'apikey']);
    const region = getDataSync('user.json', ['region']);

    const result = await coolKitWs.init({
        appid: appId,
        at,
        apikey,
        region,
        userAgent: 'app',
    });

    console.log('连接的结果: ', result);

    coolKitWs.on('message', (ws) => {
        try {
            const { type, data } = ws;
            if (type === 'message' && data !== 'pong') {
                const tmp = JSON.parse(data);
                const deviceName = Controller.getDeviceName(tmp.deviceid);
                updateStates(`switch.${tmp.deviceid}`, {
                    entity_id: `switch.${tmp.deviceid}`,
                    state: tmp.params.switch,
                    attributes: {
                        restored: false,
                        supported_features: 0,
                        friendly_name: deviceName,
                    },
                });
            }
        } catch (error) {
            console.log(error);
        }
    });

    CkApi.init({
        appId,
        appSecret,
    });
    await CkApi.user.login({
        countryCode: '+86',
        phoneNumber: '+8618875224960',
        lang: 'cn',
        password: 'coolkit666',
    });

    const { error, data } = await CkApi.device.getThingList({
        lang: 'cn',
    });

    if (error === 0) {
        const { thingList } = data;
        thingList.map((item) => {
            if (item.itemType < 3) {
                const { extra, deviceid, name, params } = item.itemData;
                if (extra?.uiid === 1) {
                    Controller.setDevice({
                        id: deviceid!,
                        type: 4,
                        data: item.itemData,
                    });
                    updateStates(`switch.${deviceid}`, {
                        entity_id: `switch.${deviceid}`,
                        state: params.switch,
                        attributes: {
                            restored: false,
                            supported_features: 0,
                            friendly_name: name,
                        },
                    });
                }
            }
        });
    }
})();
