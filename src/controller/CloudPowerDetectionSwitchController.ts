import _ from 'lodash';
import coolKitWs from 'coolkit-ws';
import { updateStates } from '../apis/restApi';
import { getDataSync } from '../utils/dataUtil';
import CloudDeviceController from './CloudDeviceController';
import ICloudDeviceConstrucotr from '../ts/interface/ICloudDeviceConstrucotr';
import { ICloudPowerDetectionSwitchParams } from '../ts/interface/ICloudDeviceParams';
class CloudPowerDetectionSwitchController extends CloudDeviceController {
    online: boolean;
    disabled: boolean;
    entityId: string;
    uiid: number;
    params: ICloudPowerDetectionSwitchParams;
    updateSwitch!: (status: string) => Promise<void>;
    updateState!: (params: { status: string; power?: string; current?: string; voltage?: string }) => Promise<void>;
    rate?: number;
    constructor(params: ICloudDeviceConstrucotr<ICloudPowerDetectionSwitchParams>) {
        super(params);
        this.entityId = `switch.${params.deviceId}`;
        this.params = params.params;
        this.disabled = params.disabled!;

        this.uiid = params.extra.uiid;
        this.online = params.online;
        this.rate = +getDataSync('rate.json', [this.deviceId]) || 0;
        // // 如果电流电压功率有更新就通知我
        // setInterval(() => {
        //     coolKitWs.updateThing({
        //         deviceApikey: this.apikey,
        //         deviceid: this.deviceId,
        //         params: { uiActive: 120 },
        //     });
        // }, 120000);
    }
}

CloudPowerDetectionSwitchController.prototype.updateSwitch = async function (status) {
    const res = await coolKitWs.updateThing({
        ownerApikey: this.apikey,
        deviceid: this.deviceId,
        params: {
            switch: status,
        },
    });

    if (res.error === 0) {
        this.updateState({ status });
        this.params.switch = status;
    }
};

/**
 * @description 更新状态到HA
 */
CloudPowerDetectionSwitchController.prototype.updateState = async function ({ power, current, voltage, status }) {
    if (this.disabled) {
        return;
    }
    let state = status;
    if (!this.online) {
        state = 'unavailable';
    }
    let attributes: any = {
        restored: true,
        supported_features: 0,
        friendly_name: this.deviceName,
        power: `${power || _.get(this, ['params', 'power'], 0)} W`,
        state: state || _.get(this, ['params', 'switch']),
    };

    if (this.uiid === 32) {
        attributes = {
            ...attributes,
            current: `${current || _.get(this, ['params', 'current'], 0)} A`,
            voltage: `${voltage || _.get(this, ['params', 'voltage'], 0)} V`,
        };
    }

    const res = await updateStates(this.entityId, {
        entity_id: this.entityId,
        state: state || _.get(this, ['params', 'switch']),
        attributes,
    });
};

export default CloudPowerDetectionSwitchController;
