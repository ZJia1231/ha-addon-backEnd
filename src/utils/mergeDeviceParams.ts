import _ from 'lodash';

export default (source: any, params: any) => {
    return _.mergeWith(source, params, (objVal, srcVal, key) => {
        // RF-Bridge
        if (key === 'rfList') {
            return srcVal;
        }
        // Muti-Switch
        if (Array.isArray(objVal) && Array.isArray(srcVal)) {
            for (let item of srcVal) {
                if (item.outlet !== undefined) {
                    objVal[item.outlet] = item;
                }
            }
            return objVal;
        }
        return srcVal;
    });
};
