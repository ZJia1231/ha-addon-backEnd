import _ from 'lodash';
import { updateStates } from '../apis/restApi';
import ICloudDeviceConstructor from '../ts/interface/ICloudDeviceConstructor';
import { IZigbeeUIID1000Params } from '../ts/interface/IZigbeeDeviceParams';
import CloudDeviceController from './CloudDeviceController';

/**
 *
 * @class CloudZigbeeUIID1000Controller
 * @extends {CloudDeviceController}
 * @description ZigBee无线按键
 */
class CloudZigbeeUIID1000Controller extends CloudDeviceController {
    type: number = 8;
    uiid: number;
    entityId: string;
    params: IZigbeeUIID1000Params;
    updateState!: (params: Partial<IZigbeeUIID1000Params>) => Promise<void>;
    constructor(props: ICloudDeviceConstructor<IZigbeeUIID1000Params>) {
        super(props);
        this.uiid = props.extra.uiid;
        this.entityId = `sensor.${this.deviceId}`;
        this.params = props.params;
    }
}

/**
 * @description 更新状态到HA
 */
CloudZigbeeUIID1000Controller.prototype.updateState = async function ({ key, battery }) {
    if (this.disabled) {
        return;
    }
    let state = `${key}`;
    if (!this.online) {
        state = 'unavailable';
    }
    const keyMap = new Map<string, string>([
        ['0', 'Click'],
        ['1', 'Double Click'],
        ['2', 'Long Press'],
        ['unavailable', 'unavailable'],
    ]);

    if (key !== undefined) {
        await updateStates(`${this.entityId}`, {
            entity_id: `${this.entityId}`,
            state: keyMap.get(state),
            attributes: {
                restored: false,
                friendly_name: `${this.deviceName}`,
                icon: 'mdi:remote',
                state,
            },
        });
        setTimeout(() => {
            updateStates(`${this.entityId}`, {
                entity_id: `${this.entityId}`,
                state: 'None',
                attributes: {
                    restored: false,
                    friendly_name: `${this.deviceName}`,
                    icon: 'mdi:remote',
                    state: 'None',
                },
            });
        }, 1000);
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

export default CloudZigbeeUIID1000Controller;
