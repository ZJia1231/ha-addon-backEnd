import CloudDeviceController from './CloudDeviceController';
import { ICloudCoverParams } from '../ts/interface/ICloudDeviceParams';
import ICloudDeviceConstructor from '../ts/interface/ICloudDeviceConstructor';
import { updateStates } from '../apis/restApi';
import coolKitWs from 'coolkit-ws';
import mergeDeviceParams from '../utils/mergeDeviceParams';
import _ from 'lodash';
class CloudCoverController extends CloudDeviceController {
    entityId: string;
    uiid: number = 11;
    params: ICloudCoverParams;
    setCover!: (params: Pick<ICloudCoverParams, 'switch' | 'setclose'>) => Promise<void>;
    updateState!: (params: Pick<ICloudCoverParams, 'switch' | 'setclose'>) => Promise<void>;
    constructor(params: ICloudDeviceConstructor<ICloudCoverParams>) {
        super(params);
        this.entityId = `cover.${params.deviceId}`;
        this.params = params.params;
    }
}

CloudCoverController.prototype.setCover = async function (params) {
    let reqParams: any = params;
    if (_.isNumber(params.setclose)) {
        reqParams = {
            setclose: 100 - params.setclose,   
        };
    }
    console.log('Jia ~ file: CloudCoverController.ts ~ line 21 ~ params', params);
    const res = await coolKitWs.updateThing({
        ownerApikey: this.apikey,
        deviceid: this.deviceId,
        params: reqParams,
    });
    if (res.error === 0) {
        this.updateState(params);
        this.params = mergeDeviceParams(this.params, params);
    }
};

/**
 * @description 更新状态到HA
 */
CloudCoverController.prototype.updateState = async function ({ switch: status = 'on', setclose }) {
    if (this.disabled) {
        return;
    }

    let state = status;
    if (!this.online) {
        state = 'unavailable';
    }

    updateStates(this.entityId, {
        entity_id: this.entityId,
        state: state,
        attributes: {
            restored: false,
            supported_features: 15,
            friendly_name: this.deviceName,
            current_position: 100 - (setclose || this.params.setclose),
            state,
        },
    });
};

export default CloudCoverController;
