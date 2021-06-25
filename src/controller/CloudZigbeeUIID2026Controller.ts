import _ from 'lodash';
import { updateStates } from '../apis/restApi';
import ICloudDeviceConstructor from '../ts/interface/ICloudDeviceConstructor';
import { IZigbeeUIID2026Params } from '../ts/interface/IZigbeeDeviceParams';
import CloudDeviceController from './CloudDeviceController';

class CloudZigbeeUIID2026Controller extends CloudDeviceController {
    type: number = 8;
    uiid: number;
    entityId: string;
    params: IZigbeeUIID2026Params;
    updateState!: (params: Partial<IZigbeeUIID2026Params>) => Promise<void>;
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
CloudZigbeeUIID2026Controller.prototype.updateState = async function ({ motion, battery }) {
    if (this.disabled) {
        return;
    }

    let state = motion === 1 ? 'on' : 'off';

    if (!this.online) {
        state = 'unavailable';
    }

    if (motion !== undefined) {
        // 更新开关
        updateStates(`${this.entityId}`, {
            entity_id: `${this.entityId}`,
            state,
            attributes: {
                restored: false,
                friendly_name: `${this.deviceName}`,
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

export default CloudZigbeeUIID2026Controller;
