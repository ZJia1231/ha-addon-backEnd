import ICloudDevice from '../ts/interface/ICloudDevice';
import _ from 'lodash';
import {
    ICloudCoverParams,
    ICloudDimmingParams,
    ICloudDualR3Params,
    ICloudDW2Params,
    ICloudMultiChannelSwitchParams,
    ICloudPowerDetectionSwitchParams,
    ICloudRFBridgeParams,
    ICloudRGBBulbParams,
    ICloudRGBLightStripParams,
    ICloudSwitchParams,
    ICloudUIID34Params,
    ICloudUIID44Params,
    IDoubleColorLightParams,
    ITemperatureAndHumidityModificationParams,
    IUIID104Params,
} from '../ts/interface/ICloudDeviceParams';
import TypeMdnsDiyDevice from '../ts/type/TypeMdnsDiyDevice';
import CloudDeviceController from './CloudDeviceController';
import CloudSwitchController from './CloudSwitchController';
import CloudTandHModificationController from './CloudTandHModificationController';
import DiyDeviceController from './DiyDeviceController';
import { getDataSync } from '../utils/dataUtil';
import TypeLanDevice from '../ts/type/TypeMdnsLanDevice';
import LanDeviceController from './LanDeviceController';
import CloudRGBBulbController from './CloudRGBBulbController';
import CloudDimmingController from './CloudDimmingController';
import CloudPowerDetectionSwitchController from './CloudPowerDetectionSwitchController';
import CloudMultiChannelSwitchController from './CloudMultiChannelSwitchController';
import CloudRGBLightStripController from './CloudRGBLightStripController';
import formatLanDevice from '../utils/formatLanDevice';
import LanSwitchController from './LanSwitchController';
import LanMultiChannelSwitchController from './LanMultiChannelSwitchController';
import { multiChannelSwitchUiidSet, switchUiidSet, unsupportedLanModeUiidSet } from '../config/uiid';
import CloudDoubleColorBulbController from './CloudDoubleColorBulbController';
import UnsupportDeviceController from './UnsupportDeviceController';
import CloudDualR3Controller from './CloudDualR3Controller';
import LanDualR3Controller from './LanDualR3Controller';
import LanTandHModificationController from './LanTandHModificationController';
import LanPowerDetectionSwitchController from './LanPowerDetectionSwitchController';
import CloudDW2WiFiController from './CloudDW2WiFiController';
import LanDoubleColorLightController from './LanDoubleColorLightController';
import CloudUIID104Controller from './CloudUIID104Controller';
import { IZigbeeUIID1000Params, IZigbeeUIID1770Params, IZigbeeUIID2026Params, IZigbeeUIID3026Params } from '../ts/interface/IZigbeeDeviceParams';
import CloudZigbeeUIID1770Controller from './CloudZigbeeUIID1770Controller';
import CloudZigbeeUIID2026Controller from './CloudZigbeeUIID2026Controller';
import CloudZigbeeUIID3026Controller from './CloudZigbeeUIID3026Controller';
import CloudZigbeeUIID1000Controller from './CloudZigbeeUIID1000Controller';
import mergeDeviceParams from '../utils/mergeDeviceParams';
import CloudCoverController from './CloudCoverController';
import CloudRFBridgeController from './CloudRFBridgeController';
import LanRFBridgeController from './LanRFBridgeController';
import CloudUIID44Controller from './CloudUIID44Controller';
import CloudUIID34Controller from './CloudUIID34Controller';
import LanUIID34Controller from './LanUIID34Controller';
import ELanType from '../ts/enum/ELanType';

class Controller {
    static deviceMap: Map<string, DiyDeviceController | CloudDeviceController | LanDeviceController> = new Map();
    static unsupportDeviceMap: Map<string, UnsupportDeviceController> = new Map();
    static count: number = 999;
    static getDevice(id: string) {
        if (id) {
            // 删除switch.等前缀
            const tmp = id.replace(/.*(?=\.)\./, '');
            return Controller.deviceMap.get(tmp);
        }
        return null;
    }

    static getDeviceName(id: string) {
        // 删除switch.等前缀
        const tmp = id.replace(/.*(?=\.)\./, '');
        return (Controller.deviceMap.get(tmp) as CloudDeviceController).deviceName || '';
    }

    /**
     *
     *
     * @static
     * @param {id} 设备ID
     * @param {type} 1->DIY 2->LAN 4->CLOUD
     * @param {data} 设备数据
     * @memberof Controller
     */
    static setDevice(params: { id: string; type: number; data: any; lanType?: string; index?: number }) {
        const { id, type, data, lanType, index } = params;
        const _index = index || this.count++;
        if (_.isEmpty(id)) {
            return null;
        }
        const disabled = getDataSync('disabled.json', [id]) || false;
        // DIY
        if (type === 1) {
            const tmp = data as TypeMdnsDiyDevice;
            if (!tmp.a) {
                return;
            }
            const diyDevice = new DiyDeviceController({
                ip: tmp.a,
                port: tmp.srv.port,
                deviceId: id,
                disabled,
                txt: tmp.txt,
            });
            Controller.deviceMap.set(id, diyDevice);
            return diyDevice;
        }
        // LAN
        if (type === 2) {
            const params = formatLanDevice(data as TypeLanDevice);
            // 如果ip不存在说明该设备可能不支持局域网
            if (!params || (!params.ip && !params.target)) {
                console.log('the device is not lan support', params?.deviceId);
                return;
            }
            const old = Controller.getDevice(id);
            if (old instanceof LanDeviceController) {
                if (params.iv && params.encryptedData) {
                    old.iv = params?.iv;
                    old.encryptedData = params?.encryptedData;
                }
                if (old.iv && old.devicekey && old.encryptedData) {
                    const tmpParams = old.parseEncryptedData();
                    tmpParams && (old.params = mergeDeviceParams(old.params, tmpParams));
                }
                return old;
            }

            let oldDeviceParams: any = {};
            if (old instanceof CloudDeviceController) {
                // 如果设备之前是Cloud设备,需要保持设备的位置不变,防止前端页面跳动
                oldDeviceParams = {
                    index: old.index,
                    devicekey: old.devicekey,
                    selfApikey: old.apikey,
                    deviceName: old.deviceName,
                    extra: old.extra,
                    params: old.params,
                    uiid: old.uiid,
                };
            }
            if (old instanceof CloudMultiChannelSwitchController) {
                oldDeviceParams.maxChannel = old.maxChannel;
            }

            if (unsupportedLanModeUiidSet.has(oldDeviceParams.uiid)) {
                // ! UIID 138~141 (MiniR3)的设备type为plug，但数据格式为多通道设备 -_-||
                return null;
            }

            if (lanType === ELanType.Plug) {
                const lanDevice = new LanSwitchController({
                    ...params,
                    ...oldDeviceParams,
                    disabled,
                });
                Controller.deviceMap.set(id, lanDevice);
                return lanDevice;
            } else if (lanType === ELanType.Strip) {
                const lanDevice = new LanMultiChannelSwitchController({
                    ...params,
                    ...oldDeviceParams,
                    disabled,
                });
                Controller.deviceMap.set(id, lanDevice);
                return lanDevice;
            } else if (lanType === ELanType.MultifunSwitch) {
                const lanDevice = new LanDualR3Controller({
                    ...params,
                    ...oldDeviceParams,
                    disabled,
                });
                Controller.deviceMap.set(id, lanDevice);
                return lanDevice;
            } else if (lanType === ELanType.THPlug) {
                const lanDevice = new LanTandHModificationController({
                    ...params,
                    ...oldDeviceParams,
                    disabled,
                });
                Controller.deviceMap.set(id, lanDevice);
                return lanDevice;
            } else if (lanType === ELanType.EnhancedPlug) {
                const lanDevice = new LanPowerDetectionSwitchController({
                    ...params,
                    ...oldDeviceParams,
                    disabled,
                });
                Controller.deviceMap.set(id, lanDevice);
                return lanDevice;
            } else if (lanType === ELanType.RF) {
                const lanDevice = new LanRFBridgeController({
                    ...params,
                    ...oldDeviceParams,
                    disabled,
                });
                Controller.deviceMap.set(id, lanDevice);
                return lanDevice;
            } else if (lanType === ELanType.FanLight) {
                const lanDevice = new LanUIID34Controller({
                    ...params,
                    ...oldDeviceParams,
                    disabled,
                });
                Controller.deviceMap.set(id, lanDevice);
                return lanDevice;
            }
            // if (lanType === 'light') {
            //     const lanDevice = new LanDoubleColorLightController({
            //          ...params,
            //          ...oldDeviceParams,
            //         disabled,
            //     });
            //     Controller.deviceMap.set(id, lanDevice);
            //     return lanDevice;
            // }
        }
        // CLOUD & Zigbee
        if (type >= 4) {
            if (switchUiidSet.has(data.extra.uiid)) {
                const tmp = data as ICloudDevice<ICloudSwitchParams>;
                const switchDevice = new CloudSwitchController({
                    deviceId: tmp.deviceid,
                    deviceName: tmp.name,
                    apikey: tmp.apikey,
                    extra: tmp.extra,
                    params: tmp.params,
                    online: tmp.online,
                    devicekey: tmp.devicekey,
                    disabled,
                    index: _index,
                });
                Controller.deviceMap.set(id, switchDevice);
                return switchDevice;
            }
            if (multiChannelSwitchUiidSet.has(data.extra.uiid)) {
                const tmp = data as ICloudDevice<ICloudMultiChannelSwitchParams>;
                const device = new CloudMultiChannelSwitchController({
                    deviceId: tmp.deviceid,
                    deviceName: tmp.name,
                    apikey: tmp.apikey,
                    extra: tmp.extra,
                    params: tmp.params,
                    tags: tmp.tags,
                    online: tmp.online,
                    devicekey: tmp.devicekey,
                    disabled,
                    index: _index,
                });
                Controller.deviceMap.set(id, device);
                return device;
            }
            // 电动窗帘
            if (data.extra.uiid === 11) {
                const tmp = data as ICloudDevice<ICloudCoverParams>;
                const device = new CloudCoverController({
                    deviceId: tmp.deviceid,
                    deviceName: tmp.name,
                    apikey: tmp.apikey,
                    extra: tmp.extra,
                    params: tmp.params,
                    online: tmp.online,
                    devicekey: tmp.devicekey,
                    disabled,
                    index: _index,
                });
                Controller.deviceMap.set(id, device);
                return device;
            }
            // 恒温恒湿改装件
            if (data.extra.uiid === 15) {
                const tmp = data as ICloudDevice<ITemperatureAndHumidityModificationParams>;
                const thmDevice = new CloudTandHModificationController({
                    deviceId: tmp.deviceid,
                    deviceName: tmp.name,
                    apikey: tmp.apikey,
                    extra: tmp.extra,
                    params: tmp.params,
                    online: tmp.online,
                    devicekey: tmp.devicekey,
                    disabled,
                    index: _index,
                });
                Controller.deviceMap.set(id, thmDevice);
                return thmDevice;
            }
            // RGB灯球
            if (data.extra.uiid === 22) {
                const tmp = data as ICloudDevice<ICloudRGBBulbParams>;
                const rgbLight = new CloudRGBBulbController({
                    deviceId: tmp.deviceid,
                    devicekey: tmp.devicekey,
                    deviceName: tmp.name,
                    apikey: tmp.apikey,
                    extra: tmp.extra,
                    params: tmp.params,
                    online: tmp.online,
                    disabled,
                    index: _index,
                });
                Controller.deviceMap.set(id, rgbLight);
                return rgbLight;
            }
            // RFBridge
            if (data.extra.uiid === 28) {
                const tmp = data as ICloudDevice<ICloudRFBridgeParams>;
                const rfBirdge = new CloudRFBridgeController({
                    deviceId: tmp.deviceid,
                    devicekey: tmp.devicekey,
                    deviceName: tmp.name,
                    apikey: tmp.apikey,
                    extra: tmp.extra,
                    params: tmp.params,
                    online: tmp.online,
                    disabled,
                    index: _index,
                    tags: tmp.tags,
                });
                Controller.deviceMap.set(id, rfBirdge);
                return rfBirdge;
            }
            // 功率检测告警开关
            if (data.extra.uiid === 32 || data.extra.uiid === 5) {
                const tmp = data as ICloudDevice<ICloudPowerDetectionSwitchParams>;
                const switchDevice = new CloudPowerDetectionSwitchController({
                    deviceId: tmp.deviceid,
                    deviceName: tmp.name,
                    apikey: tmp.apikey,
                    extra: tmp.extra,
                    params: tmp.params,
                    online: tmp.online,
                    devicekey: tmp.devicekey,
                    disabled,
                    index: _index,
                });
                Controller.deviceMap.set(id, switchDevice);
                return switchDevice;
            }
            // 风扇灯
            if (data.extra.uiid === 34) {
                const tmp = data as ICloudDevice<ICloudUIID34Params>;
                const fanLight = new CloudUIID34Controller({
                    deviceId: tmp.deviceid,
                    devicekey: tmp.devicekey,
                    deviceName: tmp.name,
                    apikey: tmp.apikey,
                    extra: tmp.extra,
                    params: tmp.params,
                    online: tmp.online,
                    disabled,
                    index: _index,
                });
                Controller.deviceMap.set(id, fanLight);
                return fanLight;
            }
            // // 调光开关
            // if (data.extra.uiid === 36) {
            //     const tmp = data as ICloudDevice<ICloudDimmingParams>;
            //     const dimming = new CloudDimmingController({
            //         deviceId: tmp.deviceid,
            //         deviceName: tmp.name,
            //         apikey: tmp.apikey,
            //         extra: tmp.extra,
            //         params: tmp.params,
            //         online: tmp.online,
            //         disabled,
            //         index: _index,
            //     });
            //     Controller.deviceMap.set(id, dimming);
            //     return dimming;
            // }
            // 单路调光开关
            if (data.extra.uiid === 44) {
                const tmp = data as ICloudDevice<ICloudUIID44Params>;
                const dimming = new CloudUIID44Controller({
                    deviceId: tmp.deviceid,
                    devicekey: tmp.devicekey,
                    deviceName: tmp.name,
                    apikey: tmp.apikey,
                    extra: tmp.extra,
                    params: tmp.params,
                    online: tmp.online,
                    disabled,
                    index: _index,
                });
                Controller.deviceMap.set(id, dimming);
                return dimming;
            }
            // RGB灯带
            if (data.extra.uiid === 59) {
                const tmp = data as ICloudDevice<ICloudRGBLightStripParams>;
                const device = new CloudRGBLightStripController({
                    deviceId: tmp.deviceid,
                    devicekey: tmp.devicekey,
                    deviceName: tmp.name,
                    apikey: tmp.apikey,
                    extra: tmp.extra,
                    params: tmp.params,
                    online: tmp.online,
                    disabled,
                    index: _index,
                });
                Controller.deviceMap.set(id, device);
                return device;
            }
            // DW2-WiFi 门磁
            if (data.extra.uiid === 102) {
                const tmp = data as ICloudDevice<ICloudDW2Params>;
                const device = new CloudDW2WiFiController({
                    deviceId: tmp.deviceid,
                    deviceName: tmp.name,
                    apikey: tmp.apikey,
                    extra: tmp.extra,
                    params: tmp.params,
                    devicekey: tmp.devicekey,
                    disabled,
                    online: tmp.online,
                    index: _index,
                    devConfig: tmp.devConfig as any,
                });
                Controller.deviceMap.set(id, device);
                return device;
            }
            // 双色冷暖灯
            if (data.extra.uiid === 103) {
                const tmp = data as ICloudDevice<IDoubleColorLightParams>;
                const device = new CloudDoubleColorBulbController({
                    devicekey: tmp.devicekey,
                    deviceId: tmp.deviceid,
                    deviceName: tmp.name,
                    params: tmp.params,
                    online: tmp.online,
                    apikey: tmp.apikey,
                    extra: tmp.extra,
                    index: _index,
                    disabled,
                });
                Controller.deviceMap.set(id, device);
                return device;
            }
            // 五色灯球——支持随调场景
            if (data.extra.uiid === 104) {
                const tmp = data as ICloudDevice<IUIID104Params>;
                const device = new CloudUIID104Controller({
                    devicekey: tmp.devicekey,
                    deviceId: tmp.deviceid,
                    deviceName: tmp.name,
                    params: tmp.params,
                    online: tmp.online,
                    apikey: tmp.apikey,
                    extra: tmp.extra,
                    index: _index,
                    disabled,
                });
                Controller.deviceMap.set(id, device);
                return device;
            }
            // DualR3
            if (data.extra.uiid === 126) {
                const tmp = data as ICloudDevice<ICloudDualR3Params>;
                const device = new CloudDualR3Controller({
                    deviceId: tmp.deviceid,
                    deviceName: tmp.name,
                    apikey: tmp.apikey,
                    extra: tmp.extra,
                    params: tmp.params,
                    devicekey: tmp.devicekey,
                    disabled,
                    online: tmp.online,
                    index: _index,
                });
                Controller.deviceMap.set(id, device);
                return device;
            }
            // Zigbee 无线按键
            if (data.extra.uiid === 1000) {
                const tmp = data as ICloudDevice<IZigbeeUIID1000Params>;
                const device = new CloudZigbeeUIID1000Controller({
                    devicekey: tmp.devicekey,
                    deviceId: tmp.deviceid,
                    deviceName: tmp.name,
                    apikey: tmp.apikey,
                    params: tmp.params,
                    online: tmp.online,
                    extra: tmp.extra,
                    index: _index,
                    disabled,
                });
                Controller.deviceMap.set(id, device);
                return device;
            }
            // Zigbee 温湿度传感器
            if (data.extra.uiid === 1770) {
                const tmp = data as ICloudDevice<IZigbeeUIID1770Params>;
                const device = new CloudZigbeeUIID1770Controller({
                    devicekey: tmp.devicekey,
                    deviceId: tmp.deviceid,
                    deviceName: tmp.name,
                    apikey: tmp.apikey,
                    params: tmp.params,
                    online: tmp.online,
                    extra: tmp.extra,
                    index: _index,
                    disabled,
                });
                Controller.deviceMap.set(id, device);
                return device;
            }
            // Zigbee 移动传感器
            if (data.extra.uiid === 2026) {
                const tmp = data as ICloudDevice<IZigbeeUIID2026Params>;
                const device = new CloudZigbeeUIID2026Controller({
                    devicekey: tmp.devicekey,
                    deviceId: tmp.deviceid,
                    deviceName: tmp.name,
                    apikey: tmp.apikey,
                    params: tmp.params,
                    online: tmp.online,
                    extra: tmp.extra,
                    index: _index,
                    disabled,
                });
                Controller.deviceMap.set(id, device);
                return device;
            }
            // Zigbee 门磁
            if (data.extra.uiid === 3026) {
                const tmp = data as ICloudDevice<IZigbeeUIID3026Params>;
                const device = new CloudZigbeeUIID3026Controller({
                    devicekey: tmp.devicekey,
                    deviceId: tmp.deviceid,
                    deviceName: tmp.name,
                    params: tmp.params,
                    apikey: tmp.apikey,
                    online: tmp.online,
                    extra: tmp.extra,
                    index: _index,
                    disabled,
                });
                Controller.deviceMap.set(id, device);
                return device;
            }

            // 暂不支持的设备
            if (!Controller.deviceMap.has(id)) {
                const unsupportDevice = new UnsupportDeviceController({
                    deviceId: data.deviceid,
                    deviceName: data.name,
                    apikey: data.apikey,
                    extra: data.extra,
                    params: data.params,
                    online: data.online,
                    devicekey: data.devicekey,
                    disabled,
                    index: -_index,
                });
                Controller.unsupportDeviceMap.set(id, unsupportDevice);
            }
        }
    }
}

export default Controller;
