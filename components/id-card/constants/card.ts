import { verticalScale } from './scaling';

export const DEG = Math.PI / 180;

export const CARD_W = verticalScale(340);
export const CARD_H = verticalScale(200);
export const STRAP_TOP_H = verticalScale(70);
export const STRAP_BOT_H = verticalScale(36);
export const CLIP_H = verticalScale(10);

export const PILL_W = verticalScale(56);
export const PILL_H = verticalScale(14);

export const STRAP_OVERLAP = verticalScale(12);
export const PILL_GAP = verticalScale(0);

export const STRAP_W = verticalScale(38);
export const STRAP_SEGMENTS = 24;
export const STRAP_CURL_CENTER = 0.5;
export const STRAP_CURL_WIDTH = 0.45;
export const STRAP_CURL_LINEAR_MIX = 0.2;
export const STRAP_MAX_TWIST_DEG = 64;
export const STRAP_SHADE_MIN = 0.55;
export const STRAP_FRONT_COLOR = '#2F5BFF';
export const STRAP_BACK_COLOR = '#1F3FBF';
export const STRAP_GRAD_TOP = '#FFFFFF';
export const STRAP_GRAD_BOTTOM = '#89858D';

export const BOW_K = verticalScale(90);
export const BOW_C = verticalScale(5.0);
export const BOW_DRIVE = verticalScale(700);
export const BOW_VEL_REF = 500;
export const BOW_VEL_SMOOTH_S = 0.03;
export const BOW_MAX_PX = verticalScale(14);

export const DROP_K = verticalScale(170);
export const DROP_C = verticalScale(10.0);
export const DROP_KICK = verticalScale(200);
export const DROP_VEL_REF = 50;
export const DROP_MIN_DEG = 8;
export const DROP_MAX_PX = verticalScale(14);
export const DROP_MAX_UP_PX = verticalScale(4);

export const CANVAS_BUFFER = verticalScale(8);
export const CANVAS_W = (STRAP_W / 2 + BOW_MAX_PX) * 2 + CANVAS_BUFFER;

export const TOTAL_H = STRAP_TOP_H + CLIP_H + STRAP_BOT_H + CARD_H;

export const PENDULUM_K = 5;
export const PENDULUM_C = 1.8;
export const PENDULUM_MAX_DEG = 34;
export const DRAG_PX_PER_DEG = verticalScale(4);
export const GRAB_SMOOTH_S = 0.08;
export const RELEASE_OMEGA_MAX = 170;
export const HOLD_BLEED_TC = 0.05;
export const HOLD_REARM_FRAC = 0.6;
export const PENDULUM_BOUNCE = -0.25;

export const BACK_HOLD_S = 0.18;
export const HOLD_ANGLE_FRAC = 0.85;
export const RETURN_EASE_S = 0.2;

export const FLIP_FULL_DEG = 28;
export const FLIP_BAND_START = 0.25;
export const FLIP_BAND_END = 0.95;
export const FLIP_DIR = 1;
export const FLIP_FOLLOW_K = 40;
export const FLIP_FOLLOW_C = 6;
export const FLIP_TARGET_DEG = 180;
export const CARD_PERSPECTIVE = 1200;
