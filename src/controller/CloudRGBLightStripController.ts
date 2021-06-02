import CloudDeviceController from './CloudDeviceController';
import { ICloudRGBLightStripParams } from '../ts/interface/ICloudDeviceParams';
import ICloudDeviceConstructor from '../ts/interface/ICloudDeviceConstructor';
import { updateStates } from '../apis/restApi';
import coolKitWs from 'coolkit-ws';
import { parseHS2RGB, parseRGB2HS } from '../utils/colorUitl';
import { IRGBLightStripSocketParams } from '../ts/interface/ICkSocketParams';
import _ from 'lodash';
import { effectList, fakeTempList } from '../config/light';
import { TypeHaRgbLightParams } from '../ts/type/TypeHaLightParams';

class CloudRGBLightStripController extends CloudDeviceController {
    entityId: string;
    uiid: number = 59;
    params: ICloudRGBLightStripParams;
    mode: number;
    effectList = effectList;
    updateLight!: (params: Partial<ICloudRGBLightStripParams>) => Promise<void>;
    updateState!: (params: TypeHaRgbLightParams) => Promise<void>;

    parseCkData2Ha!: (params: Partial<ICloudRGBLightStripParams>) => TypeHaRgbLightParams;
    parseHaData2Ck!: (params: TypeHaRgbLightParams) => Partial<ICloudRGBLightStripParams>;

    constructor(params: ICloudDeviceConstructor<ICloudRGBLightStripParams>) {
        super(params);
        this.entityId = `light.${params.deviceId}`;
        this.params = params.params;
        this.mode = this.params.mode;
    }
}

CloudRGBLightStripController.prototype.parseHaData2Ck = function (params) {
    const { state, effect, brightness_pct, rgb_color, color_temp } = params;
    const res = {
        switch: state,
        mode: 1,
    } as Partial<ICloudRGBLightStripParams>;
    brightness_pct && (res.bright = brightness_pct);

    if (rgb_color) {
        res.colorR = rgb_color[0];
        res.colorG = rgb_color[1];
        res.colorB = rgb_color[2];
        res.light_type = 1;
    }
    if (color_temp) {
        res.light_type = 2;
        const [r, g, b] = fakeTempList[color_temp].split(',');
        res.colorR = +r;
        res.colorG = +g;
        res.colorB = +b;
    }
    if (effect) {
        res.mode = this.effectList.indexOf(effect);
    }
    return res;
};

CloudRGBLightStripController.prototype.parseCkData2Ha = function (params) {
    const { colorR, colorG, colorB, mode, bright, light_type, switch: state = 'on' } = params;
    const res = {
        state,
        effect: this.effectList[1],
    } as TypeHaRgbLightParams;

    bright && (res.brightness = (bright * 2.55) << 0);

    // * 彩光
    if (light_type === 1) {
        if (colorR && colorG && colorB) {
            res.rgb_color = [colorR, colorG, colorB];
        }
    }

    // * 白光
    if (light_type === 2) {
        if (colorR && colorG && colorB) {
            const temp = fakeTempList.indexOf(`${colorR},${colorG},${colorB}`);
            if (temp !== -1) {
                res.color_temp = temp;
            } else {
                // todo
                // ? 找不到对应的值时取临近值
            }
        }
    }
    if (mode) {
        res.effect = this.effectList[mode];
    }

    return res;
};

CloudRGBLightStripController.prototype.updateLight = async function (params) {
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
CloudRGBLightStripController.prototype.updateState = async function (params) {
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
            supported_color_modes: ['color_temp', 'rgb'],
            effect_list: this.effectList.slice(1),
            min_mireds: 1,
            max_mireds: 142,
            friendly_name: this.deviceName,
            ...this.parseCkData2Ha(this.params),
            ...params,
            state,
        },
    });
};

export default CloudRGBLightStripController;
