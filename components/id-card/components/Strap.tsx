import type { Vector } from '@shopify/react-native-skia';
import { Canvas, Vertices } from '@shopify/react-native-skia';
import { Image, StyleSheet, View } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';
import {
  CANVAS_W,
  DEG,
  STRAP_BOT_H,
  STRAP_CURL_CENTER,
  STRAP_CURL_LINEAR_MIX,
  STRAP_CURL_WIDTH,
  STRAP_GRAD_BOTTOM,
  STRAP_GRAD_TOP,
  STRAP_MAX_TWIST_DEG,
  STRAP_OVERLAP,
  STRAP_SEGMENTS,
  STRAP_SHADE_MIN,
  STRAP_TOP_H,
  STRAP_W,
  CLIP_H,
} from '../constants/card';
import { verticalScale } from '../constants/scaling';
import type { StrapProps } from '../constants/types';
import { useStrapBow } from '../hooks/useStrapBow';

const RIBBON_LEN = STRAP_TOP_H + CLIP_H + STRAP_BOT_H;
const CX = CANVAS_W / 2;

const INDICES: number[] = (() => {
  const out: number[] = [];
  for (let i = 0; i < STRAP_SEGMENTS; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    out.push(a, b, c, b, d, c);
  }
  return out;
})();

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const GRAD_TOP_RGB = hexToRgb(STRAP_GRAD_TOP);
const GRAD_BOT_RGB = hexToRgb(STRAP_GRAD_BOTTOM);
const ROWS = STRAP_SEGMENTS + 1;

function twistProfile(t: number): number {
  let x = (t - STRAP_CURL_CENTER) / STRAP_CURL_WIDTH + 0.5;
  x = x < 0 ? 0 : x > 1 ? 1 : x;
  const s = x * x * (3 - 2 * x);
  return (1 - STRAP_CURL_LINEAR_MIX) * s + STRAP_CURL_LINEAR_MIX * t;
}

const PROFILE: number[] = Array.from({ length: ROWS }, (_, i) =>
  twistProfile(i / STRAP_SEGMENTS),
);

const GRAD: [number, number, number][] = Array.from({ length: ROWS }, (_, i) => {
  const f = 1 - i / STRAP_SEGMENTS;
  return [
    GRAD_BOT_RGB[0] + (GRAD_TOP_RGB[0] - GRAD_BOT_RGB[0]) * f,
    GRAD_BOT_RGB[1] + (GRAD_TOP_RGB[1] - GRAD_BOT_RGB[1]) * f,
    GRAD_BOT_RGB[2] + (GRAD_TOP_RGB[2] - GRAD_BOT_RGB[2]) * f,
  ];
});

const BOW_SHAPE: number[] = Array.from({ length: ROWS }, (_, i) =>
  Math.sin(Math.PI * (i / STRAP_SEGMENTS)),
);

function relativeFlipDeg(flipDeg: number): number {
  'worklet';
  const rest = Math.round(flipDeg / 180) * 180;
  return flipDeg - rest;
}

function twistRad(flipDeg: number): number {
  'worklet';
  const delta = relativeFlipDeg(flipDeg);
  return STRAP_MAX_TWIST_DEG * Math.sin(delta * DEG) * DEG;
}

export function Strap({ flipAngle }: StrapProps) {
  const { bow } = useStrapBow(flipAngle);

  const vertices = useDerivedValue<Vector[]>(() => {
    const out: Vector[] = new Array(ROWS * 2);
    const tw = twistRad(flipAngle.value);
    const b = bow.value;
    for (let i = 0; i < ROWS; i++) {
      const t = i / STRAP_SEGMENTS;
      const phi = tw * PROFILE[i];
      const halfW = (STRAP_W / 2) * Math.abs(Math.cos(phi));
      const y = t * RIBBON_LEN;
      const cx = CX + b * BOW_SHAPE[i];
      out[i * 2] = { x: cx - halfW, y };
      out[i * 2 + 1] = { x: cx + halfW, y };
    }
    return out;
  }, [flipAngle, bow]);

  const colors = useDerivedValue<string[]>(() => {
    const out: string[] = new Array(ROWS * 2);
    const tw = twistRad(flipAngle.value);
    for (let i = 0; i < ROWS; i++) {
      const phi = tw * PROFILE[i];
      const facing = Math.cos(phi);
      const g = GRAD[i];
      const shade = STRAP_SHADE_MIN + (1 - STRAP_SHADE_MIN) * Math.abs(facing);
      const c =
        'rgba(' +
        Math.round(g[0] * shade) +
        ',' +
        Math.round(g[1] * shade) +
        ',' +
        Math.round(g[2] * shade) +
        ',1)';
      out[i * 2] = c;
      out[i * 2 + 1] = c;
    }
    return out;
  }, [flipAngle]);

  return (
    <View style={styles.wrapper}>
      <Canvas style={styles.canvas}>
        <Vertices vertices={vertices} colors={colors} indices={INDICES} mode="triangles" />
      </Canvas>
      <View style={styles.labelWrap} pointerEvents="none">
        <Image
          source={require('../assets/images/zayx.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    overflow: 'visible',
    zIndex: 1,
    marginBottom: -STRAP_OVERLAP,
  },
  canvas: {
    width: CANVAS_W,
    height: RIBBON_LEN,
  },
  labelWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: STRAP_TOP_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: verticalScale(50),
    height: verticalScale(24),
    opacity: 0.7,
    transform: [{ rotate: '90deg' }],
    marginTop: verticalScale(30),
  },
});
