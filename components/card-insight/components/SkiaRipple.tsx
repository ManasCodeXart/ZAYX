import { memo } from 'react'
import { Canvas, Group, Paint, RoundedRect, RuntimeShader, Skia } from '@shopify/react-native-skia'
import { StyleSheet, View } from 'react-native'

import { RIPPLE_SHADER_SOURCE } from '../hooks/conf'
import type { RippleOverlayProps } from '../constants/types'

const RIPPLE_SHADER = Skia.RuntimeEffect.Make(RIPPLE_SHADER_SOURCE)

// Presentational-only: doesn't call useRipple itself. `uniforms` and
// `intensity` are passed in from whichever hook instance owns the ripple
// state (e.g. Card3D calling useRipple and passing trigger() into
// onSettle) — that keeps a single source of truth for when the ripple is
// playing, rather than this component owning a second, disconnected
// instance that Card3D's trigger would fire into a black hole.
const RippleOverlay = memo<RippleOverlayProps>(
  ({ width, height, color, uniforms, intensity, borderRadius = 0, style }) => {
    if (!RIPPLE_SHADER) return null

    return (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { width, height, borderRadius, overflow: 'hidden' },
          style,
        ]}
      >
        <Canvas style={{ width, height }}>
          <Group
            layer={
              <Paint>
                <RuntimeShader source={RIPPLE_SHADER} uniforms={uniforms} />
              </Paint>
            }
            opacity={intensity}
          >
            <RoundedRect
              x={0}
              y={0}
              width={width}
              height={height}
              r={borderRadius}
              color={color}
            />
          </Group>
        </Canvas>
      </View>
    )
  },
)

export { RippleOverlay }
