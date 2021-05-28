import CloudDeviceController from './CloudDeviceController';
import { ICloudRGBBulbParams } from '../ts/interface/ICloudDeviceParams';
import ICloudDeviceConstrucotr from '../ts/interface/ICloudDeviceConstrucotr';
import { updateStates } from '../apis/restApi';
import coolKitWs from 'coolkit-ws';
import _ from 'lodash';
import { TypeHaRgbBulbParams } from '../ts/type/TypeHaLightParams';
import { presetEffectMap, rgbBulbEffectList } from '../config/rgbLight';

class CloudRGBBulbController extends CloudDeviceController {
    disabled: boolean;
    entityId: string;
    uiid: number = 22;
    params: ICloudRGBBulbParams;
    effectList = rgbBulbEffectList;
    updateLight!: (params: Partial<ICloudRGBBulbParams>) => Promise<void>;
    updateState!: (params: TypeHaRgbBulbParams) => Promise<void>;

    parseHaData2Ck!: (params: TypeHaRgbBulbParams) => Partial<ICloudRGBBulbParams>;
    parseCkData2Ha!: (params: Partial<ICloudRGBBulbParams>) => TypeHaRgbBulbParams;

    constructor(params: ICloudDeviceConstrucotr<ICloudRGBBulbParams>) {
        super(params);
        this.entityId = `light.${params.deviceId}`;
        this.params = params.params;
        this.disabled = params.disabled!;
    }
}

CloudRGBBulbController.prototype.parseHaData2Ck = function (params) {
    const { rgbww_color, brightness_pct, effect, state } = params;
    console.log('Jia ~ file: CloudRGBBulbController.ts ~ line 32 ~ state', state);
    let res = {
        state,
        zyx_mode: 1,
    } as Partial<ICloudRGBBulbParams>;
    if (rgbww_color) {
        res = {
            ...res,
            channel0: `${rgbww_color[3]}`,
            channel1: `${rgbww_color[4]}`,
            channel2: `${rgbww_color[0]}`,
            channel3: `${rgbww_color[1]}`,
            channel4: `${rgbww_color[2]}`,
        };
        if (rgbww_color[0] !== 0 || rgbww_color[1] !== 0 || rgbww_color[2] !== 0) {
            res = {
                ...res,
                channel0: '0',
                channel1: '0',
                zyx_mode: 2,
            };
        }
    }
    if (brightness_pct) {
        const tmp = (brightness_pct * 2.55).toFixed(0);
        res = {
            ...res,
            channel0: tmp,
            channel1: tmp,
            zyx_mode: 1,
        };
    }
    if (effect) {
        res = {
            ...res,
            zyx_mode: this.effectList.indexOf(effect),
            ...presetEffectMap.get(effect),
        };
    }
    return res;
};

CloudRGBBulbController.prototype.parseCkData2Ha = function (params) {
    const {
        zyx_mode,
        state = 'on',
        channel0 = this.params.channel0,
        channel1 = this.params.channel1,
        channel2 = this.params.channel2,
        channel3 = this.params.channel3,
        channel4 = this.params.channel4,
    } = params;

    const res = {
        state,
        brightness: Math.max(+(channel0 || 0), +(channel1 || 0)),
        rgbww_color: [+channel2, +channel3, +channel4, +channel0, +channel1],
    } as TypeHaRgbBulbParams;

    if (zyx_mode) {
        res.effect = this.effectList[zyx_mode || 0];
    }
    return res;
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
    if (res.error === 0) {
        this.params = {
            ...this.params,
            ...params,
        };
        this.updateState(this.parseCkData2Ha(params));
    }
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
            restored: false,
            supported_features: 4,
            friendly_name: this.deviceName,
            supported_color_modes: ['rgbww'],
            effect_list: this.effectList.slice(3),
            ...this.parseCkData2Ha(this.params),
            ...params,
            state,
        },
    });
};

export default CloudRGBBulbController;
