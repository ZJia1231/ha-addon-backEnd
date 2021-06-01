import CloudDeviceController from './CloudDeviceController';
import { IDoubleColorLightParams } from '../ts/interface/ICloudDeviceParams';
import ICloudDeviceConstrucotr from '../ts/interface/ICloudDeviceConstrucotr';
import { updateStates } from '../apis/restApi';
import coolKitWs from 'coolkit-ws';
import _ from 'lodash';
import { TypeLtype } from '../ts/type/TypeLtype';
import { TypeHaDoubleColorBulbParams } from '../ts/type/TypeHaLightParams';
import { doubleColorBulbEffectList, doubleColorBulbLtypeMap } from '../config/light';
class CloudDoubleColorBulbController extends CloudDeviceController {
    disabled: boolean;
    entityId: string;
    uiid: number = 103;
    effectList = doubleColorBulbEffectList;
    params: IDoubleColorLightParams;
    parseHaData2Ck!: (params: TypeHaDoubleColorBulbParams) => Partial<IDoubleColorLightParams>;
    updateLight!: (params: Partial<IDoubleColorLightParams>) => Promise<void>;
    updateState!: (params: Partial<IDoubleColorLightParams>) => Promise<void>;
    constructor(params: ICloudDeviceConstrucotr<IDoubleColorLightParams>) {
        super(params);
        this.entityId = `light.${params.deviceId}`;
        this.disabled = params.disabled!;
        this.params = params.params;
    }
}

CloudDoubleColorBulbController.prototype.parseHaData2Ck = function (params) {
    const { state, brightness_pct, effect, color_temp } = params;
    let res = {} as Partial<IDoubleColorLightParams>;
    if (state === 'off') {
        return {
            switch: 'off',
        };
    }
    // 从关闭到打开
    if (!brightness_pct && !color_temp && !effect) {
        const tmp = this.params.ltype;
        return {
            switch: 'on',
            ltype: tmp,
            [tmp]: _.get(this, ['params', tmp]),
        };
    }

    if (brightness_pct) {
        res.ltype = 'white';
        res.white = {
            br: brightness_pct,
            ct: _.get(this, ['params', 'white', 'ct']),
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
            ...doubleColorBulbLtypeMap.get(effect),
        } as Partial<IDoubleColorLightParams>;
    }
    return res;
};
CloudDoubleColorBulbController.prototype.updateLight = async function (params) {
    const res = await coolKitWs.updateThing({
        ownerApikey: this.apikey,
        deviceid: this.deviceId,
        params,
    });
    if (res.error === 0) {
        // todo
        this.params = {
            ...this.params,
            ...params,
        };
        this.updateState(params);
    }
};

/**
 * @description 更新状态到HA
 */
CloudDoubleColorBulbController.prototype.updateState = async function (params) {
    if (this.disabled) {
        return;
    }

    const { switch: status = 'on', ltype } = params;
    let br = this.params.white.br,
        ct = this.params.white.ct;
    const tmp = params[ltype!];
    if (tmp) {
        br = tmp.br;
        ct = tmp.ct;
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
            supported_color_modes: ['color_temp'],
            effect_list: this.effectList,
            state,
            min_mireds: 1,
            max_mireds: 255,
            effect: ltype,
            brightness: (br * 2.55) >> 0,
            color_temp: 255 - ct,
        },
    });
};

export default CloudDoubleColorBulbController;
