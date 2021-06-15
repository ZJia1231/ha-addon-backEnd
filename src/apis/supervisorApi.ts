import axios, { AxiosPromise } from 'axios';
const { SUPERVISOR_TOKEN } = process.env;
const supervisorRequest = axios.create({
    baseURL: 'http://supervisor',
    headers: {
        'Content-Type': 'application/json',
        'X-Supervisor-Token': `Bearer ${SUPERVISOR_TOKEN}`,
    },
});

const getCoreInfoAPI = async () => {
    const res = supervisorRequest({
        method: 'GET',
        url: '/core/info',
    });
    res.catch((e) => {
        console.log(e);
        return null;
    });
    return res as AxiosPromise<{
        version: string;
        version_latest: string;
        update_available: boolean;
        arch: string;
        machine: string;
        ip_address: string;
        image: string;
        boot: boolean;
        port: number;
        ssl: boolean;
        watchdog: boolean;
        wait_boot: number;
        audio_input: string;
        audio_output: string;
    }>;
};

export { getCoreInfoAPI };
