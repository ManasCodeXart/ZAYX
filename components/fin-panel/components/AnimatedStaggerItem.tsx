import React, { useEffect } from 'react';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
    type WithSpringConfig,
    type WithTimingConfig,
} from 'react-native-reanimated';

const DEFAULT_SPRING: WithSpringConfig = { damping: 18, stiffness: 220, mass: 0.6 };
const DEFAULT_FADE: WithTimingConfig = { duration: 180, easing: Easing.out(Easing.quad) };

interface AnimatedStaggerItemProps {
    readonly index: number;
    readonly visible: boolean;
    readonly baseDelay?: number;
    readonly staggerMs?: number;
    readonly translateDistance?: number;
    readonly springConfig?: WithSpringConfig;
    readonly fadeConfig?: WithTimingConfig;
    readonly children: React.ReactNode;
}


export function AnimatedStaggerItem({
    index,
    visible,
    baseDelay = 80,
    staggerMs = 60,
    translateDistance = 40,
    springConfig = DEFAULT_SPRING,
    fadeConfig = DEFAULT_FADE,
    children,
}: AnimatedStaggerItemProps) {
    const translateX = useSharedValue(translateDistance);
    const opacity = useSharedValue(0);

    useEffect(() => {
        const delay = baseDelay + index * staggerMs;
        if (visible) {
            translateX.value = withDelay(delay, withSpring(0, springConfig));
            opacity.value = withDelay(delay, withTiming(1, fadeConfig));
        } else {
            translateX.value = translateDistance;
            opacity.value = 0;
        }

      // eslint-disable-next-line react-hooks/exhaustive-deps
      
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        opacity: opacity.value,
    }));

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}