import _ from 'lodash';
import { updateStates } from '../apis/restApi';
import IZigbeeDeviceConstructor, { IZigbeeDeviceExtra } from '../ts/interface/IZigbeeDeviceConstructor';
import { IZigbeeUIID1770Params } from '../ts/interface/IZigbeeDeviceParams';
import ZigbeeDeviceController from './ZigbeeDeviceController';

class ZigbeeUIID1770Controller extends ZigbeeDeviceController {
    entityId: string;
    params: IZigbeeUIID1770Params;
    updateState!: (params: { humidity: string; temperature: string; battery: number }) => Promise<void>;
    constructor(props: IZigbeeDeviceConstructor<IZigbeeUIID1770Params, IZigbeeDeviceExtra>) {
        super(props);
        this.entityId = `sensor.${this.deviceId}`;
        this.params = props.params;
    }
}

/**
 * @description 更新状态到HA
 */
ZigbeeUIID1770Controller.prototype.updateState = async function ({ temperature, humidity, battery }) {
    if (this.disabled) {
        return;
    }
    let t = `${+temperature / 100}`,
        h = `${+humidity / 100}`;
    if (!this.online) {
        t = 'unavailable';
        h = 'unavailable';
    }

    if (humidity !== undefined) {
        // 更新湿度
        updateStates(`${this.entityId}_humidity`, {
            entity_id: `${this.entityId}_humidity`,
            state: h,
            attributes: {
                restored: false,
                friendly_name: `${this.deviceName}-Humidity`,
                unit_of_measurement: '%',
                device_class: 'humidity',
                state: h,
            },
        });
    }

    if (temperature !== undefined) {
        // 更新温度
        updateStates(`${this.entityId}_temperature`, {
            entity_id: `${this.entityId}_temperature`,
            state: t,
            attributes: {
                restored: false,
                friendly_name: `${this.deviceName}-Temperature`,
                unit_of_measurement: '°C',
                device_class: 'temperature',
                state: t,
            },
        });
    }

    if (battery !== undefined) {
        // 更新电量
        updateStates(`${this.entityId}_battery`, {
            entity_id: `${this.entityId}_battery`,
            state: battery,
            attributes: {
                restored: false,
                friendly_name: `${this.deviceName}-Battery`,
                device_class: 'battery',
                unit_of_measurement: '%',
                state: battery,
            },
        });
    }
};

export default ZigbeeUIID1770Controller;
