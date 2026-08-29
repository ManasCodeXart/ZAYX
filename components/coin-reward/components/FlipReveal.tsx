import { useCallback, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { CoinFace, FlipRevealProps } from '@/constants/types'
import CoinFlip from './CoinFlip'
import ScratchCard, { SLIDE_EXIT_DURATION } from './ScratchCard'

const DISMISS_RESET_BUFFER = 50
const DISMISS_RESET_DELAY = SLIDE_EXIT_DURATION + DISMISS_RESET_BUFFER

const FlipReveal = ({ onFlipComplete, onRevealComplete }: FlipRevealProps) => {
    const [face, setFace] = useState<CoinFace | null>(null)
    const faceRef = useRef<CoinFace | null>(null)
    const [cardVisible, setCardVisible] = useState(false)

    const handleFlipResult = useCallback((result: CoinFace) => {
        faceRef.current = result
        setFace(result)
        setCardVisible(true)
        onFlipComplete?.(result)
    }, [onFlipComplete])

    const handleDismiss = useCallback(() => {
        setCardVisible(false)
        setTimeout(() => setFace(null), DISMISS_RESET_DELAY)
    }, [])

    const handleFullyRevealed = useCallback(() => {
        if (faceRef.current) onRevealComplete?.(faceRef.current)
    }, [onRevealComplete])

    return (
        <View style={styles.container}>
            <CoinFlip onResult={handleFlipResult} />
            <ScratchCard
                face={face}
                visible={cardVisible}
                onDismiss={handleDismiss}
                onFullyRevealed={handleFullyRevealed}
            />
        </View>
    )
}

export default FlipReveal

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})