import _ from 'lodash';

export default (source: any, params: any) => {
    return _.mergeWith(source, params, (objVal, srcVal, key) => {
        // RF-Bridge 通道设置
        if (key === 'rfList') {
            return srcVal;
        }
        // MINIR3 场景设置
        if (key.includes('lightScenes')) {
            return srcVal;
        }
        // MINIR3 互锁设置
        if (key === 'locks') {
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
