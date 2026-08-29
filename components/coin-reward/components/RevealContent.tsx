import { StyleSheet, Text, View } from 'react-native'

import { verticalScale } from '@/constants/scaling'
import { RevealContentProps } from '@/constants/types'

const RevealContent = ({ face }: RevealContentProps) => {
    return face === 'heads' ? <HeadsReveal /> : <TailsReveal />
}

export default RevealContent


const HeadsReveal = () => (
    <View style={styles.card}>
        <Text style={styles.label}>Heads</Text>
        <Text style={styles.hint}>Edit this component to add your reward content</Text>
    </View>
)


const TailsReveal = () => (
    <View style={styles.card}>
        <Text style={styles.label}>Tails</Text>
        <Text style={styles.hint}>Edit this component to add your reward content</Text>
    </View>
)

export { HeadsReveal, TailsReveal }

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: '#1A1A1A',
        borderRadius: verticalScale(24),
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: verticalScale(28),
        paddingVertical: verticalScale(32),
        gap: verticalScale(8),
    },
    label: {
        color: '#FFFFFF',
        fontSize: verticalScale(28),
        
    },
    hint: {
        color: '#A0A0A0',
        fontSize: verticalScale(13),
        textAlign: 'center',
        lineHeight: verticalScale(20),
        paddingHorizontal: verticalScale(12),
    },
})