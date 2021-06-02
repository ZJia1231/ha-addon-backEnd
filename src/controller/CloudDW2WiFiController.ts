import CloudDeviceController from './CloudDeviceController';
import ICloudDeviceConstructor from '../ts/interface/ICloudDeviceConstructor';
import { updateStates } from '../apis/restApi';
import { ICloudDW2Params } from '../ts/interface/ICloudDeviceParams';
class CloudDW2WiFiController extends CloudDeviceController {
    disabled: boolean;
    entityId: string;
    uiid: number = 102;
    params: ICloudDW2Params;
    online: boolean;
    lowVolAlarm: number;
    updateState!: (params: Partial<ICloudDW2Params>) => Promise<void>;
    constructor(params: ICloudDeviceConstructor<ICloudDW2Params> & { devConfig: { lowVolAlarm: number } }) {
        super(params);
        this.entityId = `binary_sensor.${params.deviceId}`;
        this.params = params.params;
        this.disabled = params.disabled!;
        this.online = true;
        this.lowVolAlarm = params.devConfig.lowVolAlarm;
    }
}

/**
 * @description 更新状态到HA
 */
CloudDW2WiFiController.prototype.updateState = async function ({ switch: status, battery }) {
    if (this.disabled) {
        return;
    }

    let state = status;
    let batteryState = battery! < this.lowVolAlarm ? 'on' : 'off';
    // if (!this.online) {
    //     state = 'unavailable';
    //     batteryState = 'unavailable';
    // }

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
    updateStates(`${this.entityId}_battery`, {
        entity_id: `${this.entityId}_battery`,
        state: batteryState,
        attributes: {
            restored: false,
            friendly_name: `${this.deviceName}-Battery`,
            device_class: 'battery',
            state: batteryState,
        },
    });
};

export default CloudDW2WiFiController;
