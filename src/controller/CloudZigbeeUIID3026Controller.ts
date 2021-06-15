import _ from 'lodash';
import { updateStates } from '../apis/restApi';
import ICloudDeviceConstructor from '../ts/interface/ICloudDeviceConstructor';
import { IZigbeeUIID3026Params } from '../ts/interface/IZigbeeDeviceParams';
import CloudDeviceController from './CloudDeviceController';

class ZigbeeUIID3026Controller extends CloudDeviceController {
    type: number = 8;
    uiid: number;
    entityId: string;
    params: IZigbeeUIID3026Params;
    updateState!: (params: Partial<IZigbeeUIID3026Params>) => Promise<void>;
    constructor(props: ICloudDeviceConstructor<IZigbeeUIID3026Params>) {
        super(props);
        this.uiid = props.extra.uiid;
        this.entityId = `binary_sensor.${this.deviceId}`;
        this.params = props.params;
    }
}

/**
 * @description 更新状态到HA
 */
ZigbeeUIID3026Controller.prototype.updateState = async function ({ lock, battery }) {
    if (this.disabled) {
        return;
    }

    let state = lock === 1 ? 'on' : 'off';

    if (!this.online) {
        state = 'unavailable';
    }

    if (lock !== undefined) {
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

export default ZigbeeUIID3026Controller;
