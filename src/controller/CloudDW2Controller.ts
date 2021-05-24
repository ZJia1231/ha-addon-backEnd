import CloudDeviceController from './CloudDeviceController';
import ICloudDeviceConstrucotr from '../ts/interface/ICloudDeviceConstrucotr';
import { updateStates } from '../apis/restApi';
import { ICloudDW2Params } from '../ts/interface/ICloudDeviceParams';
class CloudDW2Controller extends CloudDeviceController {
    disabled: boolean;
    entityId: string;
    uiid: number = 102;
    params: ICloudDW2Params;
    online: boolean;
    updateState!: (status: string) => Promise<void>;
    constructor(params: ICloudDeviceConstrucotr<ICloudDW2Params>) {
        super(params);
        this.entityId = `binary_sensor.${params.deviceId}`;
        this.params = params.params;
        this.disabled = params.disabled!;
        this.online = params.online;
    }
}

/**
 * @description 更新状态到HA
 */
CloudDW2Controller.prototype.updateState = async function (status) {
    if (this.disabled) {
        return;
    }

    let state = status;
    if (!this.online) {
        state = 'unavailable';
    }

    updateStates(this.entityId, {
        entity_id: this.entityId,
        state,
        attributes: {
            restored: true,
            friendly_name: this.deviceName,
            state,
        },
    });
};

export default CloudDW2Controller;
