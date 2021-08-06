import _ from 'lodash';
import coolKitWs from 'coolkit-ws';
import { updateStates } from '../apis/restApi';
import mergeDeviceParams from '../utils/mergeDeviceParams';
import CloudDeviceController from './CloudDeviceController';
import { TypeHaFanParams } from '../ts/type/TypeHaFanParams';
import { ICloudUIID34Params } from '../ts/interface/ICloudDeviceParams';
import ICloudDeviceConstructor from '../ts/interface/ICloudDeviceConstructor';
import EFanPresetMode from '../ts/enum/EFanPresetModes';

class CloudUIID34Controller extends CloudDeviceController {
    entityId: string;
    uiid: number = 34;
    params: ICloudUIID34Params;
    updateSwitch!: (switches: ICloudUIID34Params['switches']) => Promise<void>;
    updateState!: (switches: ICloudUIID34Params['switches']) => Promise<void>;
    parseHaData2Ck!: (params: TypeHaFanParams) => ICloudUIID34Params['switches'];
    constructor(params: ICloudDeviceConstructor<ICloudUIID34Params>) {
        super(params);
        this.entityId = `light.${params.deviceId}`;
        this.uiid = params.extra.uiid;
        this.params = params.params;
    }
}

CloudUIID34Controller.prototype.parseHaData2Ck = function ({ entity_id, preset_mode, state }) {
    // 控制灯
    const res = _.cloneDeep(this.params.switches);
    if (entity_id === this.entityId) {
        res[0].switch = state;
    } else {
        if (preset_mode === undefined) {
            res[1].switch = state;
        } else if (preset_mode === EFanPresetMode.Low) {
            res[1].switch = 'on';
            res[2].switch = 'off';
            res[3].switch = 'off';
        } else if (preset_mode === EFanPresetMode.Medium) {
            res[1].switch = 'on';
            res[2].switch = 'on';
            res[3].switch = 'off';
        } else if (preset_mode === EFanPresetMode.High) {
            res[1].switch = 'on';
            res[2].switch = 'off';
            res[3].switch = 'on';
        }
    }
    return res;
};

CloudUIID34Controller.prototype.updateSwitch = async function (switches) {
    const res = await coolKitWs.updateThing({
        ownerApikey: this.apikey,
        deviceid: this.deviceId,
        params: {
            switches,
        },
    });
    if (res.error === 0) {
        this.updateState(switches);
        this.params = mergeDeviceParams(this.params, { switches });
    }
};

/**
 * @description 更新状态到HA
 */
CloudUIID34Controller.prototype.updateState = async function (switches) {
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

export default CloudUIID34Controller;
