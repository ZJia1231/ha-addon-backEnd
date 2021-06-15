import _ from 'lodash';
import { updateStates } from '../apis/restApi';
import { getDataSync } from '../utils/dataUtil';
import { getLanDeviceParams, setSwitch } from '../apis/lanDeviceApi';
import LanDeviceController from './LanDeviceController';
import mergeDeviceParams from '../utils/mergeDeviceParams';
import ILanDeviceConstructor from '../ts/interface/ILanDeviceConstructor';
import { ICloudPowerDetectionSwitchParams } from '../ts/interface/ICloudDeviceParams';

class LanPowerDetectionSwitchController extends LanDeviceController {
    entityId: string;
    uiid?: number;
    params?: ICloudPowerDetectionSwitchParams;
    setSwitch!: (status: string) => Promise<0 | -1>;
    updateState!: (params: { status: string; power?: string; current?: string; voltage?: string }) => Promise<void>;
    rate?: number;
    constructor(params: ILanDeviceConstructor) {
        super(params);
        this.entityId = `switch.${params.deviceId}`;
        this.rate = +getDataSync('rate.json', [this.deviceId]) || 0;
    }
}

LanPowerDetectionSwitchController.prototype.setSwitch = async function (status) {
    if (this.devicekey && this.selfApikey) {
        const res = await setSwitch({
            ip: this.ip! || this.target!,
            port: this.port,
            deviceid: this.deviceId,
            devicekey: this.devicekey,
            selfApikey: this.selfApikey,
            data: JSON.stringify({
                switch: status,
            }),
        });
        if (res && res.data && res.data.error === 0) {
            this.updateState({
                status,
            });
            this.params = mergeDeviceParams(this.params, {
                switch: status,
            });
            return 0;
        }
    }
    return -1;
};

/**
 * @description 更新状态到HA
 */
LanPowerDetectionSwitchController.prototype.updateState = async function ({ power, current, voltage, status }) {
    if (this.disabled) {
        return;
    }

    let state = status;
    if (!this.online) {
        state = 'unavailable';
    }

    let attributes: any = {
        restored: false,
        supported_features: 0,
        friendly_name: this.deviceName,
        power: `${power || _.get(this, ['params', 'power'], 0)} W`,
        current: `${current || _.get(this, ['params', 'current'], 0)} A`,
        voltage: `${voltage || _.get(this, ['params', 'voltage'], 0)} V`,
    };

    const res = await updateStates(this.entityId, {
        entity_id: this.entityId,
        state: state || _.get(this, ['params', 'switch']),
        attributes,
    });
};

export default LanPowerDetectionSwitchController;
