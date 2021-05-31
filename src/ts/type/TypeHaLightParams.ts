type TypeHaRgbLightParams = { state: string; brightness_pct?: number; brightness?: number; rgb_color: number[]; color_temp: number; effect: string };
type TypeHaRgbBulbParams = { state: string; brightness_pct?: number; brightness?: number; rgbww_color: number[]; effect: string };
type TypeHaDoubleColorBulbParams = { state: string; brightness_pct?: number; brightness?: number; color_temp: number; effect: string };
export { TypeHaDoubleColorBulbParams, TypeHaRgbLightParams, TypeHaRgbBulbParams };
