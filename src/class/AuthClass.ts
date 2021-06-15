import { refreshAuth } from '../apis/restApi';
import { HaToken } from '../config/auth';
import { debugMode, isSupervisor } from '../config/config';
import { TypeHaToken, TypeToken } from '../ts/type/TypeToken';
import { appendData, getDataSync } from '../utils/dataUtil';

class AuthClass {
    static AuthMap: Map<string, TypeToken> = new Map();
    static instance: AuthClass;
    curAuth?: string;
    constructor() {
        this.init();
    }

    static createInstance() {
        if (!AuthClass.instance) {
            AuthClass.instance = new AuthClass();
        }
        return AuthClass.instance;
    }

    async init() {
        if (debugMode) {
            this.curAuth = HaToken;
            return;
        }
        // 通过Addon方式安装自带TOKEN
        if (isSupervisor) {
            this.curAuth = process.env.SUPERVISOR_TOKEN;
            return;
        }
        // 针对Docker方式安装
        try {
            const auths = getDataSync('auth.json', []);
            for (let origin in auths) {
                const auth = JSON.parse(auths[origin]) as TypeToken;
                if (auth && Date.now() < +auth.expires_time) {
                    AuthClass.AuthMap.set(origin, auth);
                    const tmp = await this.refresh(origin);
                    if (tmp) {
                        this.curAuth = auth.access_token;
                    }
                }
            }
        } catch (error) {
            console.log('Jia ~ file: AuthClass.ts ~ line 52 ~ AuthClass ~ init ~ error', error);
        }
    }

    isValid(host: string) {
        const auth = AuthClass.AuthMap.get(host);
        if (auth && auth.expires_time > Date.now()) {
            this.curAuth = auth.access_token;
            return true;
        }
        return false;
    }

    setAuth(origin: string, clientId: string, auth: TypeHaToken) {
        const data = {
            ...auth,
            cliend_id: clientId,
            expires_time: Date.now() + auth.expires_in * 1000,
        };
        this.curAuth = auth.access_token;
        AuthClass.AuthMap.set(origin, data);
        appendData('auth.json', [origin], JSON.stringify(data));
        setTimeout(() => {
            this.refresh(origin);
            console.log("it's time to refresh token");
        }, (auth.expires_in - 300) * 1000);
    }

    async refresh(origin: string) {
        const auth = AuthClass.AuthMap.get(origin);
        if (auth) {
            const { cliend_id, refresh_token } = auth;

            // supervisor形式不需要刷新token,token到期了直接删除
            if (isSupervisor) {
                AuthClass.AuthMap.delete(origin);
                return;
            }

            console.log('refreshing...');
            const res = await refreshAuth(cliend_id, refresh_token);
            console.log('refresh token success!');
            if (res && res.status === 200) {
                this.setAuth(origin, cliend_id, {
                    ...auth,
                    ...res.data,
                });
            }
            return res.data as TypeHaToken;
        }
    }
}
const instance = AuthClass.createInstance();
instance.init();
export default instance;
