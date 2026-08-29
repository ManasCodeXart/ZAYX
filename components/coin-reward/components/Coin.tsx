import {
    Image,
    ImageSourcePropType,
    StyleSheet,
    View,
} from 'react-native'

import { verticalScale } from '@/constants/scaling'
import { CoinFace, CoinProps } from '@/constants/types'

export const COIN_SIZE = verticalScale(225)

const DEFAULT_SOURCES: Record<CoinFace, ImageSourcePropType> = {
    heads: require('../assets/images/head.png'),
    tails: require('../assets/images/tail.png'),
}

const Coin = ({ face, source, style }: CoinProps) => (
    <View style={[styles.container, style]}>
        <Image
            source={source ?? DEFAULT_SOURCES[face]}
            style={styles.image}
            resizeMode="contain"
        />
    </View>
)

export default Coin

const styles = StyleSheet.create({
    container: {
        width: COIN_SIZE,
        height: COIN_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
})