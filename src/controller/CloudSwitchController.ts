import CloudDeviceController from './CloudDeviceController';
import { ICloudSwitchParams } from '../ts/interface/ICloudDeviceParams';
import ICloudDeviceConstructor from '../ts/interface/ICloudDeviceConstructor';
import { updateStates } from '../apis/restApi';
import coolKitWs from 'coolkit-ws';
class CloudSwitchController extends CloudDeviceController {
    disabled: boolean;
    entityId: string;
    uiid: number = 1;
    params: ICloudSwitchParams;
    updateSwitch!: (status: string) => Promise<void>;
    updateState!: (status: string) => Promise<void>;
    constructor(params: ICloudDeviceConstructor<ICloudSwitchParams>) {
        super(params);
        this.entityId = `switch.${params.deviceId}`;
        this.params = params.params;
        this.disabled = params.disabled!;
        this.uiid = params.extra.uiid;
    }
}

CloudSwitchController.prototype.updateSwitch = async function (status) {
    const res = await coolKitWs.updateThing({
        ownerApikey: this.apikey,
        deviceid: this.deviceId,
        params: {
            switch: status,
        },
    });
    if (res.error === 0) {
        this.updateState(status);
        this.params.switch = status;
    }
};

/**
 * @description 更新状态到HA
 */
CloudSwitchController.prototype.updateState = async function (status) {
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
            restored: false,
            supported_features: 0,
            friendly_name: this.deviceName,
            state,
        },
    });
};

export default CloudSwitchController;
