import _ from 'lodash';
import { setFanAPI, toggleLanLightAPI } from '../apis/lanDeviceApi';
import { updateStates } from '../apis/restApi';
import EFanPresetMode from '../ts/enum/EFanPresetModes';
import { ICloudUIID34Params } from '../ts/interface/ICloudDeviceParams';
import ILanDeviceConstructor from '../ts/interface/ILanDeviceConstructor';
import { TypeHaFanParams } from '../ts/type/TypeHaFanParams';
import mergeDeviceParams from '../utils/mergeDeviceParams';
import LanDeviceController from './LanDeviceController';

type TypeLanFanLightParams = { light?: string; fan?: string; speed?: number };

class LanUIID34Controller extends LanDeviceController {
    entityId: string;
    uiid: number = 34;
    params?: ICloudUIID34Params;
    setFan!: (params: Omit<TypeLanFanLightParams, 'light'>) => Promise<0 | -1>;
    toggleLight!: (params: Pick<TypeLanFanLightParams, 'light'>) => Promise<0 | -1>;
    /** 将HA的数据格式转换成局域网通信的数据格式 */
    parseHaData2Lan!: (params: TypeHaFanParams) => TypeLanFanLightParams;
    /** 将局域网通信的数据格式转换成4通道协议的格式 */
    parseMdnsData2Ck!: (params: TypeLanFanLightParams) => ICloudUIID34Params['switches'];
    updateState!: (switches: ICloudUIID34Params['switches']) => Promise<void>;
    constructor(props: ILanDeviceConstructor) {
        super(props);
        const { deviceId } = props;
        this.entityId = `light.${deviceId}`;
    }
}

LanUIID34Controller.prototype.parseHaData2Lan = function ({ entity_id, preset_mode, state }) {
    const res: TypeLanFanLightParams = {};
    if (entity_id === this.entityId) {
        res.light = state;
    } else {
        if (preset_mode === undefined) {
            const switches = _.get(
                this,
                'params.switches',
                Array.from({ length: 4 }, (v, k) => ({ switch: 'off', outlet: k }))
            );
            let lastSpeed = 1;
            if (switches[2].switch === 'on') {
                lastSpeed = 2;
            }
            if (switches[3].switch === 'on') {
                lastSpeed = 3;
            }
            res.fan = state;
            res.speed = lastSpeed;
        } else if (preset_mode === EFanPresetMode.Low) {
            res.fan = 'on';
            res.speed = 1;
        } else if (preset_mode === EFanPresetMode.Medium) {
            res.fan = 'on';
            res.speed = 2;
        } else if (preset_mode === EFanPresetMode.High) {
            res.fan = 'on';
            res.speed = 3;
        }
    }
    return res;
};
LanUIID34Controller.prototype.parseMdnsData2Ck = function ({ fan, light, speed }) {
    const res: ICloudUIID34Params['switches'] = Array.from({ length: 4 }, (v, k) => ({ switch: 'off', outlet: k }));
    if (light === 'on') {
        res[0].switch = 'on';
    }
    if (fan === 'on') {
        res[1].switch = 'on';
    }
    if (speed === 2) {
        res[2].switch = 'on';
    } else if (speed === 3) {
        res[3].switch = 'on';
    }
    return res;
};

LanUIID34Controller.prototype.toggleLight = async function (params) {
    // let apikey = getDataSync('user.json', ['user', 'apikey']);
    if (this.devicekey && this.selfApikey) {
        const res = await toggleLanLightAPI({
            ip: this.ip! || this.target!,
            port: this.port,
            deviceid: this.deviceId,
            devicekey: this.devicekey,
            selfApikey: this.selfApikey,
            data: JSON.stringify(params),
        });
        if (_.get(res, ['data', 'error']) === 0) {
            this.params = mergeDeviceParams(this.params, { switches: [{ switch: params.light, outlet: 0 }] });
            this.updateState(this.params!.switches);
            return 0;
        }
    }
    return -1;
};

LanUIID34Controller.prototype.setFan = async function (params) {
    // let apikey = getDataSync('user.json', ['user', 'apikey']);
    if (this.devicekey && this.selfApikey) {
        const res = await setFanAPI({
            ip: this.ip! || this.target!,
            port: this.port,
            deviceid: this.deviceId,
            devicekey: this.devicekey,
            selfApikey: this.selfApikey,
            data: JSON.stringify(params),
        });
        if (_.get(res, ['data', 'error']) === 0) {
            let tmp = [
                {
                    switch: 'off',
                    outlet: 1,
                },
                {
                    switch: 'off',
                    outlet: 2,
                },
                {
                    switch: 'off',
                    outlet: 3,
                },
            ];
            if (params.fan === 'on') {
                tmp[0].switch = 'on';
            }
            if (params.speed === 2) {
                tmp[1].switch = 'on';
            } else if (params.speed === 3) {
                tmp[2].switch = 'on';
            }
            this.params = mergeDeviceParams(this.params, { switches: tmp });
            this.updateState(this.params!.switches);
            return 0;
        }
    }
    return -1;
};

LanUIID34Controller.prototype.updateState = async function (switches) {
    if (this.disabled) {
        return;
    }
    // Light
    let lightState = switches[0].switch;

    // Fan
    let fanState = switches[1].switch;
    let presetMode = EFanPresetMode.Low;
    if (switches[2].switch === 'on') {
        presetMode = EFanPresetMode.Medium;
    }
    if (switches[3].switch === 'on') {
        presetMode = EFanPresetMode.High;
    }

    if (!this.online) {
        lightState = 'unavailable';
        fanState = 'unavailable';
    }

    updateStates(`${this.entityId}`, {
        entity_id: `${this.entityId}`,
        state: lightState,
        attributes: {
            restored: false,
            supported_features: 0,
            friendly_name: `${this.deviceName}`,
            state: lightState,
        },
    });

    updateStates(`fan.${this.deviceId}`, {
        entity_id: `fan.${this.deviceId}`,
        state: fanState,
        attributes: {
            restored: false,
            supported_features: 0,
            friendly_name: `${this.deviceName}`,
            state: lightState,
            preset_mode: presetMode,
            preset_modes: Object.values(EFanPresetMode),
        },
    });
};

export default LanUIID34Controller;
