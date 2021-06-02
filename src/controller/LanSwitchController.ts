import axios from 'axios';
import { setSwitch } from '../apis/lanDeviceApi';
import { updateStates } from '../apis/restApi';
import { ICloudSwitchParams } from '../ts/interface/ICloudDeviceParams';
import ILanDeviceConstructor from '../ts/interface/ILanDeviceConstructor';
import LanDeviceController from './LanDeviceController';
class LanSwitchController extends LanDeviceController {
    entityId: string;
    params?: ICloudSwitchParams;
    setSwitch!: (status: string) => Promise<0 | -1>;
    updateState!: (status: string) => Promise<any>;
    constructor(props: ILanDeviceConstructor) {
        super(props);
        const { deviceId } = props;
        this.entityId = `switch.${deviceId}`;
    }
}

LanSwitchController.prototype.setSwitch = async function (status) {
    // let apikey = getDataSync('user.json', ['user', 'apikey']);
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
        if (res?.data && res.data.error === 0) {
            this.updateState(status);
            this.params!.switch = status;
            return 0;
        }
    }
    return -1;
};

LanSwitchController.prototype.updateState = async function (status) {
    if (this.disabled) {
        return;
    }

    let state = status;
    if (!this.online) {
        state = 'unavailable';
    }

    const res = await updateStates(this.entityId, {
        entity_id: this.entityId,
        state,
        attributes: {
            restored: false,
            supported_features: 0,
            friendly_name: this.deviceName || this.entityId,
            state,
        },
    });
};

export default LanSwitchController;
