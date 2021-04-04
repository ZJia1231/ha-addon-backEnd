import CloudDeviceController from '../controller/CloudDeviceController';
import DiyController from '../controller/DiyDeviceController';
import _ from 'lodash';
import LanDeviceController from '../controller/LanDeviceController';

const ghostManufacturer = (manufacturer: string = 'eWeLink') => {
    if (~manufacturer.indexOf('松诺') || ~manufacturer.toLocaleUpperCase().indexOf('SONOFF')) {
        return 'SONOFF';
    }
    return 'eWeLink';
};

export default (data: DiyController | CloudDeviceController | LanDeviceController) => {
    if (data instanceof DiyController) {
        return {
            key: data.deviceId,
            deviceId: data.deviceId,
            disabled: data.disabled,
            entityId: data.entityId,
            ip: data.ip,
            port: data.port,
            type: data.type,
            rssi: data.txt.data1?.rssi,
        };
    }

    if (data instanceof LanDeviceController) {
        return {
            key: data.deviceId,
            deviceId: data.deviceId,
            disabled: data.disabled,
            entityId: data.entityId,
            ip: data.ip,
            port: data.port,
            type: data.type,
            manufacturer: ghostManufacturer(data.extra?.manufacturer),
            deviceName: data.deviceName,
            model: data.extra?.model,
        };
    }

    if (data instanceof CloudDeviceController) {
        return {
            key: data.deviceId,
            deviceId: data.deviceId,
            disabled: data.disabled,
            uiid: data.uiid,
            type: data.type,
            manufacturer: ghostManufacturer(data.extra.manufacturer),
            deviceName: data.deviceName,
            model: data.extra.model,
            rssi: data.rssi,
        };
    }
};
