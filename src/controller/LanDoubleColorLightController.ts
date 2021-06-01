import _ from 'lodash';
import { setSwitch, updateLanLight } from '../apis/lanDeviceApi';
import { updateStates } from '../apis/restApi';
import { doubleColorBulbEffectList, doubleColorBulbLtypeMap } from '../config/light';
import { IDoubleColorLightParams } from '../ts/interface/ICloudDeviceParams';
import ILanDeviceConstrucotr from '../ts/interface/ILanDeviceConstrucotr';
import { TypeHaDoubleColorBulbParams } from '../ts/type/TypeHaLightParams';
import LanDeviceController from './LanDeviceController';
class LanDoubleColorLightController extends LanDeviceController {
    entityId: string;
    params?: IDoubleColorLightParams;
    effectList = doubleColorBulbEffectList;
    parseHaData2Ck!: (params: TypeHaDoubleColorBulbParams) => Partial<IDoubleColorLightParams>;

    updateLight!: (params: Partial<IDoubleColorLightParams>) => Promise<0 | -1>;
    updateState!: (params: Partial<IDoubleColorLightParams>) => Promise<void>;
    constructor(props: ILanDeviceConstrucotr) {
        super(props);
        const { deviceId } = props;
        this.entityId = `light.${deviceId}`;
    }
}

LanDoubleColorLightController.prototype.parseHaData2Ck = function (params) {
    const { state, brightness_pct, effect, color_temp } = params;
    let res = {} as Partial<IDoubleColorLightParams>;
    if (state === 'off') {
        return {
            switch: 'off',
        };
    }
    // 从关闭到打开
    if (!brightness_pct && !color_temp && !effect) {
        const tmp = _.get(this, ['params', 'ltype']);
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

LanDoubleColorLightController.prototype.updateLight = async function (params) {
    if (this.devicekey && this.selfApikey) {
        let res;
        if (params.ltype) {
            res = await updateLanLight({
                ip: this.ip! || this.target!,
                port: this.port,
                deviceid: this.deviceId,
                devicekey: this.devicekey,
                selfApikey: this.selfApikey,
                data: JSON.stringify(params),
            });
        } else {
            res = await setSwitch({
                ip: this.ip! || this.target!,
                port: this.port,
                deviceid: this.deviceId,
                devicekey: this.devicekey,
                selfApikey: this.selfApikey,
                data: JSON.stringify(params),
            });
        }
        if (_.get(res, ['data', 'error']) === 0) {
            // todo
        }
    }
    return -1;
};
LanDoubleColorLightController.prototype.updateState = async function (params) {
    if (this.disabled) {
        return;
    }

    const { switch: status = 'on', ltype } = params;
    let br = _.get(this, ['params', 'white', 'br']),
        ct = _.get(this, ['params', 'white', 'ct']);
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

export default LanDoubleColorLightController;
