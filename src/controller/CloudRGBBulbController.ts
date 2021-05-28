import CloudDeviceController from './CloudDeviceController';
import { ICloudRGBLightParams } from '../ts/interface/ICloudDeviceParams';
import ICloudDeviceConstrucotr from '../ts/interface/ICloudDeviceConstrucotr';
import { updateStates } from '../apis/restApi';
import coolKitWs from 'coolkit-ws';
import { parseHS2RGB, parseRGB2HS } from '../utils/colorUitl';
import _ from 'lodash';

type TypeHaRgbLightParams = { state: string; brightness_pct?: number; brightness?: number; rgb_color: number[]; color_temp: number; effect: string };

class CloudRGBBulbController extends CloudDeviceController {
    disabled: boolean;
    entityId: string;
    uiid: number = 22;
    params: ICloudRGBLightParams;
    updateLight!: (params: Partial<ICloudRGBLightParams>) => Promise<void>;
    updateState!: (params: TypeHaRgbLightParams) => Promise<void>;

    parseHaData2Ck!: (params: TypeHaRgbLightParams) => Partial<ICloudRGBLightParams>;
    parseCkData2Ha!: (params: Partial<ICloudRGBLightParams>) => TypeHaRgbLightParams;

    constructor(params: ICloudDeviceConstrucotr<ICloudRGBLightParams>) {
        super(params);
        this.entityId = `light.${params.deviceId}`;
        this.params = params.params;
        this.disabled = params.disabled!;
    }
}

CloudRGBBulbController.prototype.parseHaData2Ck = function (params) {
    return {};
};

CloudRGBBulbController.prototype.parseCkData2Ha = function (params) {
    return {} as TypeHaRgbLightParams;
};

CloudRGBBulbController.prototype.updateLight = async function (params) {
    if (this.disabled) {
        return;
    }
    const res = await coolKitWs.updateThing({
        ownerApikey: this.apikey,
        deviceid: this.deviceId,
        params,
    });
};

/**
 * @description 更新状态到HA
 */
CloudRGBBulbController.prototype.updateState = async function (params) {
    const { state: status } = params;

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
            min_mireds: 1,
            max_mireds: 3,
            restored: false,
            supported_features: 4,
            friendly_name: this.deviceName,
            supported_color_modes: ['color_temp', 'rgb'],
            effect_list: [],
            ...this.parseCkData2Ha(this.params),
            ...params,
            state,
        },
    });
};

export default CloudRGBBulbController;
