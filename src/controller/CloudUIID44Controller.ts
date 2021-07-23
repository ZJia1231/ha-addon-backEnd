import CloudDeviceController from './CloudDeviceController';
import { ICloudUIID44Params } from '../ts/interface/ICloudDeviceParams';
import ICloudDeviceConstructor from '../ts/interface/ICloudDeviceConstructor';
import { updateStates } from '../apis/restApi';
import coolKitWs from 'coolkit-ws';
import mergeDeviceParams from '../utils/mergeDeviceParams';
/**
 *
 * @class CloudUIID44Controller
 * @extends {CloudDeviceController}
 * @description 单路调光开关
 */
class CloudUIID44Controller extends CloudDeviceController {
    entityId: string;
    uiid: number = 44;
    params: ICloudUIID44Params;
    updateLight!: (params: Partial<ICloudUIID44Params>) => Promise<void>;
    updateState!: (params: Partial<ICloudUIID44Params>) => Promise<void>;
    constructor(params: ICloudDeviceConstructor<ICloudUIID44Params>) {
        super(params);
        this.entityId = `light.${params.deviceId}`;
        this.params = params.params;
    }
}

CloudUIID44Controller.prototype.updateLight = async function (params) {
    const res = await coolKitWs.updateThing({
        ownerApikey: this.apikey,
        deviceid: this.deviceId,
        params,
    });
    if (res.error === 0) {
        this.params = mergeDeviceParams(this.params, params);
        this.updateState(params);
    }
};

/**
 * @description 更新状态到HA
 */
CloudUIID44Controller.prototype.updateState = async function ({ brightness, switch: status }) {
    if (this.disabled) {
        return;
    }
    let state = status;
    if (!this.online) {
        state = 'unavailable';
    }
    const br = brightness !== undefined ? brightness : this.params.brightness;

    updateStates(this.entityId, {
        entity_id: this.entityId,
        state,
        attributes: {
            restored: false,
            supported_features: 4,
            friendly_name: this.deviceName,
            supported_color_modes: ['brightness'],
            state,
            brightness: (br * 2.55) >> 0,
            // effect_list: this.effectList,
            // effect: ltype,
        },
    });
};

export default CloudUIID44Controller;
