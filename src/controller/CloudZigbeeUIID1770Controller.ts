import _ from 'lodash';
import { updateStates } from '../apis/restApi';
import ICloudDeviceConstructor from '../ts/interface/ICloudDeviceConstructor';
import { IZigbeeUIID1770Params } from '../ts/interface/IZigbeeDeviceParams';
import CloudDeviceController from './CloudDeviceController';
/**
 *
 * @class CloudZigbeeUIID1770Controller
 * @extends {CloudDeviceController}
 * @description ZigBee温湿度传感器
 */
class CloudZigbeeUIID1770Controller extends CloudDeviceController {
    type: number = 8;
    uiid: number;
    entityId: string;
    params: IZigbeeUIID1770Params;
    updateState!: (params: Partial<IZigbeeUIID1770Params>) => Promise<void>;
    constructor(props: ICloudDeviceConstructor<IZigbeeUIID1770Params>) {
        super(props);
        this.uiid = props.extra.uiid;
        this.entityId = `sensor.${this.deviceId}`;
        this.params = props.params;
    }
}

/**
 * @description 更新状态到HA
 */
CloudZigbeeUIID1770Controller.prototype.updateState = async function ({ temperature, humidity, battery }) {
    if (this.disabled) {
        return;
    }
    let t = `${+(temperature || 0) / 100}`,
        h = `${+(humidity || 0) / 100}`;
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

export default CloudZigbeeUIID1770Controller;
