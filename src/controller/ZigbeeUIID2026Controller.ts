import _ from 'lodash';
import { updateStates } from '../apis/restApi';
import ICloudDeviceConstructor from '../ts/interface/ICloudDeviceConstructor';
import { IZigbeeUIID2026Params } from '../ts/interface/IZigbeeDeviceParams';
import CloudDeviceController from './CloudDeviceController';

class ZigbeeUIID2026Controller extends CloudDeviceController {
    uiid: number;
    entityId: string;
    params: IZigbeeUIID2026Params;
    updateState!: (params: { motion: number; battery: number }) => Promise<void>;
    constructor(props: ICloudDeviceConstructor<IZigbeeUIID2026Params>) {
        super(props);
        this.uiid = props.extra.uiid;
        this.entityId = `binary_sensor.${this.deviceId}`;
        this.params = props.params;
    }
}

/**
 * @description 更新状态到HA
 */
ZigbeeUIID2026Controller.prototype.updateState = async function ({ motion, battery }) {
    if (this.disabled) {
        return;
    }

    let state = motion === 1 ? 'on' : 'off';

    if (!this.online) {
        state = 'unavailable';
    }

    if (motion !== undefined) {
        // 更新开关
        updateStates(`${this.entityId}_motion`, {
            entity_id: `${this.entityId}_motion`,
            state,
            attributes: {
                restored: false,
                friendly_name: `${this.deviceName}-Motion`,
                device_class: 'motion',
                state,
            },
        });
    }

    if (battery !== undefined) {
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
    }
};

export default ZigbeeUIID2026Controller;
