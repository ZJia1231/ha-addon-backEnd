import _ from 'lodash';
import { updateStates } from '../apis/restApi';
import IZigbeeDeviceConstructor from '../ts/interface/IZigbeeDeviceConstructor';
import { IZigbeeUIID3026Params } from '../ts/interface/IZigbeeDeviceParams';
import ZigbeeDeviceController from './ZigbeeDeviceController';

class ZigbeeUIID3026Controller extends ZigbeeDeviceController {
    entityId: string;
    params: IZigbeeUIID3026Params;
    updateState!: (params: { lock: number; battery: number }) => Promise<void>;
    constructor(props: IZigbeeDeviceConstructor<IZigbeeUIID3026Params>) {
        super(props);
        this.entityId = `binary_sensor.${this.deviceId}`;
        this.params = props.params;
    }
}

/**
 * @description 更新状态到HA
 */
ZigbeeUIID3026Controller.prototype.updateState = async function ({ lock: status, battery }) {
    if (this.disabled) {
        return;
    }

    let state = status === 1 ? 'on' : 'off';

    if (!this.online) {
        state = 'unavailable';
    }

    // 更新开关
    updateStates(`${this.entityId}_lock`, {
        entity_id: `${this.entityId}_lock`,
        state,
        attributes: {
            restored: false,
            friendly_name: `${this.deviceName}-Lock`,
            device_class: 'lock',
            state,
        },
    });
    // 更新电量
    updateStates(`sensor.${this.deviceId}_battery`, {
        entity_id: `sensor.${this.deviceId}_battery`,
        state: battery,
        attributes: {
            restored: false,
            friendly_name: `${this.deviceName}-Battery`,
            device_class: 'battery',
            unit_of_measurement: '%',
            state: battery,
        },
    });
};

export default ZigbeeUIID3026Controller;
