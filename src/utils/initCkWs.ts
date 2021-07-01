import coolKitWs from 'coolkit-ws';
import { getDataSync } from './dataUtil';
import Controller from '../controller/Controller';
import { appId, appSecret } from '../config/app';
import CloudSwitchController from '../controller/CloudSwitchController';
import CloudTandHModificationController from '../controller/CloudTandHModificationController';
import CloudRGBBulbController from '../controller/CloudRGBBulbController';
import CloudDimmingController from '../controller/CloudDimmingController';
import CloudPowerDetectionSwitchController from '../controller/CloudPowerDetectionSwitchController';
import CloudMultiChannelSwitchController from '../controller/CloudMultiChannelSwitchController';
import CloudRGBLightStripController from '../controller/CloudRGBLightStripController';
import { IPowerDetectionSwitchSocketParams, ITandHModificationSocketParams } from '../ts/interface/ICkSocketParams';
import { getStateByEntityId, updateStates } from '../apis/restApi';
import CloudDoubleColorBulbController from '../controller/CloudDoubleColorBulbController';
import eventBus from './eventBus';
import CloudDualR3Controller from '../controller/CloudDualR3Controller';
import LanDualR3Controller from '../controller/LanDualR3Controller';
import CloudDW2WiFiController from '../controller/CloudDW2WiFiController';
import { ICloudCoverParams, ICloudDW2Params } from '../ts/interface/ICloudDeviceParams';
import CloudUIID104Controller from '../controller/CloudUIID104Controller';
import { IZigbeeUIID1000Params, IZigbeeUIID1770Params, IZigbeeUIID2026Params, IZigbeeUIID3026Params } from '../ts/interface/IZigbeeDeviceParams';
import CloudZigbeeUIID1770Controller from '../controller/CloudZigbeeUIID1770Controller';
import CloudZigbeeUIID2026Controller from '../controller/CloudZigbeeUIID2026Controller';
import CloudZigbeeUIID3026Controller from '../controller/CloudZigbeeUIID3026Controller';
import CloudZigbeeUIID1000Controller from '../controller/CloudZigbeeUIID1000Controller';
import CloudCoverController from '../controller/CloudCoverController';
import LanTandHModificationController from '../controller/LanTandHModificationController';
import CloudRFBridgeController from '../controller/CloudRFBridgeController';
import TypeCkRFBridgeParams from '../ts/type/TypeCkRFBridgeParams';

const apikey = getDataSync('user.json', ['user', 'apikey']);

export default async () => {
    const at = getDataSync('user.json', ['at']);
    const region = getDataSync('user.json', ['region']);
    if (!at || !apikey) {
        return -1;
    }
    await coolKitWs.init({
        appid: appId,
        at,
        apikey,
        region,
        userAgent: 'app',
        reqTimeout: 30000,
    });
    console.log('Jia ~ file: initCkWs.ts ~ line 29 ~ at', at);

    coolKitWs.on('message', async (ws) => {
        try {
            const { type, data } = ws;
            console.log('receive CK-WS msg:   type-->', type);
            console.log('receive CK-WS msg:\n', data);
            if (type === 'message' && data !== 'pong') {
                const tmp = JSON.parse(data);
                if (!tmp.deviceid) {
                    return;
                }
                const device = Controller.getDevice(tmp.deviceid);
                if (tmp.action === 'update') {
                    if (device instanceof CloudSwitchController) {
                        device.updateState(tmp.params.switch);
                    }
                    if (device instanceof CloudTandHModificationController || device instanceof LanTandHModificationController) {
                        const { currentTemperature, currentHumidity, switch: state } = tmp.params as ITandHModificationSocketParams;
                        if (currentHumidity || currentTemperature) {
                            device.updateTandH(currentTemperature!, currentHumidity!);
                        } else if (state) {
                            device.updateState(state);
                        }
                    }
                    if (device instanceof CloudRGBBulbController) {
                        device.updateState(device.parseCkData2Ha(tmp.params));
                    }
                    if (device instanceof CloudDimmingController) {
                        const { bright, switch: status } = tmp.params;
                        device.updateState({
                            status,
                            bright,
                        });
                    }
                    if (device instanceof CloudPowerDetectionSwitchController) {
                        const { current, voltage, power, switch: status } = tmp.params as IPowerDetectionSwitchSocketParams;
                        console.log('接收到功率检查插座的消息->params:', tmp.params);
                        device.updateState({
                            status,
                            current,
                            voltage,
                            power,
                        });
                    }
                    if (device instanceof CloudMultiChannelSwitchController) {
                        const { switches } = tmp.params;
                        if (Array.isArray(switches)) {
                            device.updateState(switches);
                        }
                    }
                    if (device instanceof CloudRGBLightStripController) {
                        console.log('接收到灯带的消息：', tmp.params);

                        device.updateState(device.parseCkData2Ha(tmp.params));
                    }
                    if (device instanceof CloudDoubleColorBulbController) {
                        console.log('接收到双色灯的信息：', tmp.params);
                        device.updateState(tmp.params);
                    }
                    if (device instanceof CloudUIID104Controller) {
                        console.log('接收到随调五色灯的信息：', tmp.params);
                        device.updateState(tmp.params);
                    }
                    if (device instanceof CloudDualR3Controller || device instanceof LanDualR3Controller) {
                        console.log('接收到DualR3的信息：', tmp.params);
                        if (tmp.params && tmp.params.switches) {
                            device.updateState(tmp.params.switches);
                        }
                    }
                    if (device instanceof CloudDW2WiFiController) {
                        console.log('接收到DW2的信息：', tmp.params);
                        if (tmp.params) {
                            device.updateState(tmp.params as ICloudDW2Params);
                        }
                    }
                    if (device instanceof CloudZigbeeUIID1000Controller) {
                        console.log('接收到Zigbee无线按键的信息：', tmp.params);
                        if (tmp.params) {
                            device.updateState(tmp.params as IZigbeeUIID1000Params);
                        }
                    }
                    if (device instanceof CloudZigbeeUIID1770Controller) {
                        console.log('接收到Zigbee温湿度传感器的信息：', tmp.params);
                        if (tmp.params) {
                            device.updateState(tmp.params as IZigbeeUIID1770Params);
                        }
                    }
                    if (device instanceof CloudZigbeeUIID2026Controller) {
                        console.log('接收到Zigbee移动传感器的信息：', tmp.params);
                        if (tmp.params) {
                            device.updateState(tmp.params as IZigbeeUIID2026Params);
                        }
                    }
                    if (device instanceof CloudZigbeeUIID3026Controller) {
                        console.log('接收到Zigbee门磁的信息：', tmp.params);
                        if (tmp.params) {
                            device.updateState(tmp.params as IZigbeeUIID3026Params);
                        }
                    }
                    if (device instanceof CloudCoverController) {
                        console.log('接收到电动窗帘的信息：', tmp.params);
                        if (tmp.params) {
                            device.updateState(tmp.params as ICloudCoverParams);
                        }
                    }
                    if (device instanceof CloudRFBridgeController) {
                        console.log('接收到RFBridge的信息：', tmp.params);
                        // todo
                        const ids = device.parseCkData2Ha(tmp.params as TypeCkRFBridgeParams);
                        device.updateState(ids);
                    }

                    eventBus.emit('update-controller', data);
                }

                if (tmp.action === 'sysmsg' && device?.entityId) {
                    const { online } = tmp.params;
                    // 设备下线通知同步到HA
                    if (online === false) {
                        const res = await getStateByEntityId(device.entityId);
                        if (res && res.data) {
                            updateStates(device.entityId, {
                                entity_id: device.entityId,
                                state: 'unavailable',
                                attributes: {
                                    ...res.data.attributes,
                                    state: 'unavailable',
                                },
                            });
                        }
                        eventBus.emit('device-offline', device.deviceId);
                    }
                }

                // 同步状态到前端
                eventBus.emit('sse');
            }
        } catch (error) {
            console.log(error);
        }
    });
};
