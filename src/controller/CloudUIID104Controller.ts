import CloudDeviceController from './CloudDeviceController';
import { IUIID104Params } from '../ts/interface/ICloudDeviceParams';
import ICloudDeviceConstructor from '../ts/interface/ICloudDeviceConstructor';
import { updateStates } from '../apis/restApi';
import coolKitWs from 'coolkit-ws';
import _ from 'lodash';
import { TypeHaRgbLightParams } from '../ts/type/TypeHaLightParams';
import { rbgLEDBulbEffectList, rbgLEDBulbLtypeMap } from '../config/light';
import mergeDeviceParams from '../utils/mergeDeviceParams';
class CloudUIID104Controller extends CloudDeviceController {
    disabled: boolean;
    entityId: string;
    uiid: number = 104;
    effectList = rbgLEDBulbEffectList;
    params: IUIID104Params;
    parseHaData2Ck!: (params: TypeHaRgbLightParams) => Partial<IUIID104Params>;
    updateLight!: (params: Partial<IUIID104Params>) => Promise<void>;
    updateState!: (params: Partial<IUIID104Params>) => Promise<void>;
    constructor(params: ICloudDeviceConstructor<IUIID104Params>) {
        super(params);
        this.entityId = `light.${params.deviceId}`;
        this.disabled = params.disabled!;
        this.params = params.params;
    }
}

CloudUIID104Controller.prototype.parseHaData2Ck = function (params) {
    const { state, brightness_pct, effect, color_temp, rgb_color } = params;
    let res = {} as Partial<IUIID104Params>;
    if (state === 'off') {
        return {
            switch: 'off',
        };
    }
    // 从关闭到打开
    if (!brightness_pct && !color_temp && !effect && !rgb_color) {
        const tmp = this.params.ltype;
        return {
            switch: 'on',
            ltype: tmp,
            [tmp]: _.get(this, ['params', tmp]),
        };
    }

    if (brightness_pct) {
        const tmp = this.params.ltype;
        res = {
            ...res,
            ltype: tmp,
            [tmp]: {
                ..._.get(this, ['params', tmp], {}),
                br: brightness_pct,
            },
        };
    }

    if (rgb_color) {
        const tmp = this.params.ltype;
        res = {
            ...res,
            ltype: 'color',
            color: {
                ..._.get(this, ['params', tmp], {
                    br: 100,
                }),
                r: rgb_color[0],
                g: rgb_color[1],
                b: rgb_color[2],
            },
        };
    }

    if (color_temp) {
        res.ltype = 'white';
        res.white = {
            br: _.get(this, ['params', 'white', 'br']),
            ct: 255 - color_temp,
        };
    }
    if (effect) {
        res = {
            ...res,
            ...rbgLEDBulbLtypeMap.get(effect),
        } as Partial<IUIID104Params>;
    }
    return res;
};
CloudUIID104Controller.prototype.updateLight = async function (params) {
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
CloudUIID104Controller.prototype.updateState = async function (params) {
    if (this.disabled) {
        return;
    }

    const { switch: status = 'on', ltype } = params;
    let br = this.params.white.br,
        ct = this.params.white.ct,
        r = this.params.color.r,
        g = this.params.color.g,
        b = this.params.color.b;
    const tmp = params[ltype!];
    if (tmp) {
        tmp.br && (br = tmp.br);
        tmp.ct && (ct = tmp.ct);
        tmp.r && (r = tmp.r);
        tmp.g && (g = tmp.g);
        tmp.b && (b = tmp.b);
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
            supported_color_modes: ['color_temp', 'rgb'],
            effect_list: this.effectList,
            state,
            min_mireds: 1,
            max_mireds: 255,
            effect: ltype,
            brightness: (br * 2.55) >> 0,
            color_temp: 255 - ct!,
            rgb_color: [r, g, b],
        },
    });
};

export default CloudUIID104Controller;
