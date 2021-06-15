/**
 * @file auth.ts
 * @description 使用新的验证方式,无须手动输入token
 * @deprecated
 */
import { getDataSync } from '../utils/dataUtil';
import { debugMode } from './config';
let auth: string | undefined;
if (debugMode) {
    auth =
        // Pi
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIzYmY0N2YzZTgwZDY0ZjU3OTEyY2ZkZGI1OGJkZTQyNiIsImlhdCI6MTYyMzMxMjQ5OSwiZXhwIjoxOTM4NjcyNDk5fQ.IhZCm3dOPmNuAA3-4f9y1vGyxEI2n44E8ai6cUY_--0';
    // Docker
    // 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI1ZmQ2MTcwZTQ5YmU0OWVlYjQ0YzMzMTQ0MzY2ODQ1MSIsImlhdCI6MTYyMDQ1ODE1NCwiZXhwIjoxOTM1ODE4MTU0fQ.U_L861eypPB4wlQM5tlavfjjTI_Dl9WF_jOydeqZwiw';
}

export { auth as HaToken };
