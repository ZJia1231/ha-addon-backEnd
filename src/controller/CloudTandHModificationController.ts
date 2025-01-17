import CloudDeviceController from './CloudDeviceController';
import { ITemperatureAndHumidityModificationParams } from '../ts/interface/ICloudDeviceParams';
import ICloudDeviceConstructor from '../ts/interface/ICloudDeviceConstructor';
import { updateStates } from '../apis/restApi';
import coolKitWs from 'coolkit-ws';
import { getDataSync } from '../utils/dataUtil';
class CloudTandHModificationController extends CloudDeviceController {
    online: boolean;
    disabled: boolean;
    entityId: string;
    uiid: number = 15;
    unit: string;
    params: ITemperatureAndHumidityModificationParams;
    updateSwitch!: (status: string) => Promise<void>;
    updateState!: (status: string) => Promise<void>;
    updateTandH!: (currentTemperature: string, currentHumidity: string) => Promise<void>;
    constructor(params: ICloudDeviceConstructor<ITemperatureAndHumidityModificationParams>) {
        super(params);
        this.params = params.params;
        this.entityId = `switch.${params.deviceId}`;
        this.disabled = params.disabled || false;
        this.online = params.online;
        this.unit = getDataSync('unit.json', [this.deviceId]) || 'c';
    }
}

CloudTandHModificationController.prototype.updateSwitch = async function (status) {
    const res = await coolKitWs.updateThing({
        ownerApikey: this.apikey,
        deviceid: this.deviceId,
        params: {
            switch: status,
        },
    });
    if (res.error === 0) {
        this.updateState(status);
        this.params.switch = status;
    }
};

/**
 * @description 更新状态到HA
 */
CloudTandHModificationController.prototype.updateState = async function (status) {
    if (this.disabled) {
        return;
    }

    let state = status;
    if (!this.online) {
        state = 'unavailable';
    }

    updateStates(`switch.${this.deviceId}`, {
        entity_id: `switch.${this.deviceId}`,
        state,
        attributes: {
            restored: false,
            supported_features: 0,
            friendly_name: this.deviceName,
            state,
        },
    });
};
CloudTandHModificationController.prototype.updateTandH = async function (currentTemperature, currentHumidity) {
    if (currentTemperature && currentTemperature !== 'unavailable') {
        updateStates(`sensor.${this.deviceId}_t`, {
            entity_id: `sensor.${this.deviceId}_t`,
            state: currentTemperature,
            attributes: {
                restored: false,
                supported_features: 0,
                friendly_name: `${this.deviceName}-Temperature`,
                device_class: 'temperature',
                state: currentTemperature,
                unit_of_measurement: '°C',
            },
        });
    }
    if (currentHumidity && currentHumidity !== 'unavailable') {
        updateStates(`sensor.${this.deviceId}_h`, {
            entity_id: `sensor.${this.deviceId}_h`,
            state: currentHumidity,
            attributes: {
                restored: false,
                supported_features: 0,
                friendly_name: `${this.deviceName}-Humidity`,
                device_class: 'humidity',
                state: currentHumidity,
                unit_of_measurement: '%',
            },
        });
    }
};

export default CloudTandHModificationController;
