import CloudDeviceController from '../controller/CloudDeviceController';
import DiyDeviceController from '../controller/DiyDeviceController';
import _ from 'lodash';
import LanDeviceController from '../controller/LanDeviceController';
import CloudMultiChannelSwitchController from '../controller/CloudMultiChannelSwitchController';
import LanMultiChannelSwitchController from '../controller/LanMultiChannelSwitchController';
import Controller from '../controller/Controller';
import { getDataSync } from './dataUtil';
import CloudTandHModificationController from '../controller/CloudTandHModificationController';
import CloudPowerDetectionSwitchController from '../controller/CloudPowerDetectionSwitchController';
import CloudDualR3Controller from '../controller/CloudDualR3Controller';
import LanTandHModificationController from '../controller/LanTandHModificationController';
import LanDualR3Controller from '../controller/LanDualR3Controller';
import LanPowerDetectionSwitchController from '../controller/LanPowerDetectionSwitchController';
import CloudDW2WiFiController from '../controller/CloudDW2WiFiController';
import UnsupportDeviceController from '../controller/UnsupportDeviceController';
import CloudRFBridgeController from '../controller/CloudRFBridgeController';
import LanRFBridgeController from '../controller/LanRFBridgeController';

const ghostManufacturer = (manufacturer: string = 'eWeLink') => {
    if (~manufacturer.indexOf('松诺') || ~manufacturer.toLocaleUpperCase().indexOf('SONOFF')) {
        return 'SONOFF';
    }
    return 'eWeLink';
};

const formatDevice = (data: DiyDeviceController | CloudDeviceController | LanDeviceController) => {
    if (data instanceof DiyDeviceController) {
        return {
            key: data.deviceId,
            uiid: data.uiid,
            deviceId: data.deviceId,
            deviceName: data.deviceName,
            disabled: data.disabled,
            ip: data.ip,
            port: data.port,
            type: data.type,
            rssi: data.txt.data1?.rssi,
            params: data.txt,
            online: true,
            index: 19,
        };
    }

    if (data instanceof LanDeviceController) {
        let tags, unit, rate;
        if (data instanceof LanMultiChannelSwitchController) {
            tags = data.channelName;
        }
        if (data instanceof LanRFBridgeController) {
            tags = data.tags;
        }
        if (data instanceof LanTandHModificationController) {
            unit = data.unit;
        }
        if (data instanceof LanDualR3Controller || data instanceof LanPowerDetectionSwitchController) {
            rate = data.rate;
        }

        let index = 5;
        if (data.online) {
            index += 16;
        }

        return {
            key: data.deviceId,
            deviceId: data.deviceId,
            disabled: data.disabled,
            ip: data.ip,
            uiid: data.extra?.uiid,
            port: data.port,
            type: data.type,
            manufacturer: ghostManufacturer(data.extra?.manufacturer),
            deviceName: data.deviceName,
            model: data.extra?.model,
            apikey: data.selfApikey,
            params: data.params,
            online: data.online,
            index,
            tags,
            unit,
            rate,
        };
    }

    if (data instanceof CloudDeviceController) {
        let tags, unit, rate, lowVolAlarm;
        if (data instanceof CloudMultiChannelSwitchController) {
            tags = data.channelName;
        }
        if (data instanceof CloudRFBridgeController) {
            tags = data.tags;
        }
        if (data instanceof CloudTandHModificationController) {
            unit = data.unit;
        }
        if (data instanceof CloudPowerDetectionSwitchController || data instanceof CloudDualR3Controller) {
            rate = data.rate;
        }
        if (data instanceof CloudDW2WiFiController) {
            lowVolAlarm = data.lowVolAlarm;
        }

        let index = 9;
        if (data.online) {
            index += 16;
        }

        return {
            key: data.deviceId,
            deviceId: data.deviceId,
            disabled: data.disabled,
            uiid: data.uiid,
            type: data.type,
            manufacturer: ghostManufacturer(data.extra.manufacturer),
            deviceName: data.deviceName,
            model: data.extra.model,
            apikey: data.apikey,
            params: data.params,
            online: data.online,
            index: data.index,
            tags,
            unit,
            rate,
            lowVolAlarm,
        };
    }
};

const formatUnsupportDevice = (data: UnsupportDeviceController) => {
    return {
        key: data.deviceId,
        deviceId: data.deviceId,
        uiid: data.uiid,
        deviceName: data.deviceName,
        params: data.params,
        online: data.online,
    };
};

const getFormattedDeviceList = () => {
    const result: any[] = [];
    for (let item of Controller.deviceMap.values()) {
        result.push(formatDevice(item));
    }
    for (let item of Controller.unsupportDeviceMap.values()) {
        result.push(formatUnsupportDevice(item));
    }
    const oldDiyDevices = getDataSync('diy.json', []) as { [key: string]: any };
    for (let key in oldDiyDevices) {
        try {
            if (!Controller.getDevice(key)) {
                result.push({
                    online: false,
                    type: 1,
                    deviceId: key,
                    deviceName: _.get(oldDiyDevices, [key, 'deviceName']),
                    index: 3,
                });
            }
        } catch (error) {
            if (!Controller.getDevice(key)) {
                result.push({
                    online: false,
                    type: 1,
                    deviceId: key,
                    index: 3,
                });
            }
        }
    }
    result.sort((a, b) => {
        if (!a.index) {
            return 1;
        }
        if (!b.index) {
            return -1;
        }
        return b.index - a.index;
    });
    return result;
};

export { formatDevice, getFormattedDeviceList };
