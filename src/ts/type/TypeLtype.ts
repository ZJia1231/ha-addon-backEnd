export type TypeLtype = 'bright' | 'read' | 'computer' | 'nightLight' | 'white';
export type TypeRGBBulbLtype = 'white' | 'color' | 'bright' | 'goodNight' | 'read' | 'nightLight' | 'party' | 'leisure' | 'soft' | 'colorful';

export type TypeLtypeParams = {
    [key in TypeLtype]: {
        br: number;
        ct: number;
    };
};

export type TypeRGBBulbLtypeParams = {
    [key in TypeRGBBulbLtype]: {
        name?: string;
        br: number;
        ct?: number;
        r?: number;
        g?: number;
        b?: number;
        /**
         * 颜色模式
         * 1 静态
         * 2 渐变
         * 3 跳变
         * 4 呼吸
         */
        tf?: number;
        /**
         * 颜色变化速度
         */
        sp?: number;
    };
};
