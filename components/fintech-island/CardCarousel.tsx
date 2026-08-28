import React, { useCallback, useRef } from 'react'
import {
  Image,
  ImageBackground,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { ISLAND } from './constants/island'
import { verticalScale } from './constants/scaling'
import type { CarouselCard } from './constants/types'



interface CardCarouselProps {
  cards: CarouselCard[]
  interactive?: boolean
  onAddMore?: () => void
  style?: StyleProp<ViewStyle>
}



const CARD_W      = verticalScale(195)
const CARD_H      = verticalScale(122)
const CARD_R      = verticalScale(12)
const CARD_GAP    = verticalScale(12)
const ITEM_W      = CARD_W + CARD_GAP      
const CONTAINER_W = ISLAND.CARD2.width
const SIDE_PAD    = (CONTAINER_W - CARD_W) / 2


const PaginationDot: React.FC<{
  index: number
  scrollX: SharedValue<number>
}> = ({ index, scrollX }) => {
  const style = useAnimatedStyle(() => ({
    width: interpolate(
      scrollX.value,
      [(index - 1) * ITEM_W, index * ITEM_W, (index + 1) * ITEM_W],
      [5, 14, 5],
      Extrapolation.CLAMP,
    ),
    opacity: interpolate(
      scrollX.value,
      [(index - 1) * ITEM_W, index * ITEM_W, (index + 1) * ITEM_W],
      [0.3, 1, 0.3],
      Extrapolation.CLAMP,
    ),
  }))

  return <Animated.View style={[styles.dot, style]} />
}


const CardItem: React.FC<{
  card: CarouselCard
  index: number
  scrollX: SharedValue<number>
}> = ({ card, index, scrollX }) => {
  const flipProgress = useSharedValue(0)
  const isFlipped    = useRef(false)

  const handleFlip = useCallback(() => {
    flipProgress.value = withSpring(
      isFlipped.current ? 0 : 1,
      { damping: 16, stiffness: 200 },
    )
    isFlipped.current = !isFlipped.current
  }, [])



  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{
      scale: interpolate(
        scrollX.value,
        [(index - 1) * ITEM_W, index * ITEM_W, (index + 1) * ITEM_W],
        [0.85, 1.0, 0.85],
        Extrapolation.CLAMP,
      ),
    }],
    opacity: interpolate(
      scrollX.value,
      [(index - 1) * ITEM_W, index * ITEM_W, (index + 1) * ITEM_W],
      [0.45, 1.0, 0.45],
      Extrapolation.CLAMP,
    ),
  }))



  const frontStyle = useAnimatedStyle(() => ({
    opacity: flipProgress.value < 0.5 ? 1 : 0,
    transform: [
      { perspective: 900 },
      {
        rotateY: `${interpolate(
          flipProgress.value,
          [0, 0.5],
          [0, 90],
          Extrapolation.CLAMP,
        )}deg`,
      },
    ],
  }))

  const backStyle = useAnimatedStyle(() => ({
    opacity: flipProgress.value >= 0.5 ? 1 : 0,
    transform: [
      { perspective: 900 },
      {
        rotateY: `${interpolate(
          flipProgress.value,
          [0.5, 1],
          [-90, 0],
          Extrapolation.CLAMP,
        )}deg`,
      },
    ],
  }))

  return (
    <Pressable onPress={handleFlip} style={styles.itemPressable}>
      <Animated.View style={[styles.itemWrapper, wrapStyle]}>

       
        <Animated.View style={[StyleSheet.absoluteFill, frontStyle]}>
          <ImageBackground
            source={card.backgroundImage}
            style={styles.cardSurface}
            imageStyle={styles.cardImage}
          >
            <View style={styles.cardContent}>
              <View style={styles.frontTopRow}>
                {card.paypassImage ? (
                  <Image
                    source={card.paypassImage}
                    style={styles.paypassIcon}
                    resizeMode="contain"
                  />
                ) : null}
              </View>

              <Text style={styles.cardNumber} numberOfLines={1}>
                •••• •••• •••• {card.lastFour}
              </Text>

              <View style={styles.frontBottomRow}>
                <View style={styles.holderExpiry}>
                  <Text style={styles.metaText}>{card.holderName}</Text>
                  <Text style={styles.metaText}>{card.expiry}</Text>
                </View>
                {card.networkLogo ? (
                  <Image
                    source={card.networkLogo}
                    style={styles.networkLogo}
                    resizeMode="contain"
                  />
                ) : null}
              </View>
            </View>
          </ImageBackground>
        </Animated.View>

       
        <Animated.View style={[StyleSheet.absoluteFill, backStyle]}>
          <ImageBackground
            source={card.backgroundImage}
            style={styles.cardSurface}
            imageStyle={styles.cardImage}
          >
            <View style={styles.magneticStrip} />
            <View style={styles.cvvContainer}>
              <View style={styles.cvvStrip}>
                <Text style={styles.cvvNumber}>{card.cvv}</Text>
              </View>
              <Text style={styles.cvvLabel}>CVV</Text>
            </View>
            <Text style={styles.tagline}>Your money, your rules.</Text>
          </ImageBackground>
        </Animated.View>

      </Animated.View>
    </Pressable>
  )
}



export const CardCarousel: React.FC<CardCarouselProps> = ({
  cards,
  interactive = true,
  onAddMore,
  style,
}) => {
  const scrollX = useSharedValue(0)

  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x
  })

  return (
    <Animated.View
      style={[styles.container, style]}
      pointerEvents={interactive ? 'box-none' : 'none'}
    >

      
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_W}
        decelerationRate="fast"
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {cards.map((card, index) => (
          <CardItem key={card.id} card={card} index={index} scrollX={scrollX} />
        ))}
      </Animated.ScrollView>

      
      <View style={styles.dotsRow}>
        {cards.map((_, i) => (
          <PaginationDot key={i} index={i} scrollX={scrollX} />
        ))}
      </View>

      
      <Pressable
        style={({ pressed }) => [
          styles.addMoreBtn,
          pressed && styles.addMoreBtnPressed,
        ]}
        onPress={onAddMore}
        hitSlop={6}
      >
        <Text style={styles.addMoreText}>Add more</Text>
      </Pressable>

    </Animated.View>
  )
}



const styles = StyleSheet.create({


  container: {
    width:           CONTAINER_W,
    backgroundColor: '#141414f3',
    borderRadius:    verticalScale(20),
    paddingVertical: verticalScale(14),
    borderWidth:     0.5,
    borderColor:     '#ffffff2a',
    overflow:        'hidden',
  },
  scrollContent: {
    paddingHorizontal: SIDE_PAD,
  },

  
  itemPressable: {
    width:       CARD_W,
    height:      CARD_H,
    marginRight: CARD_GAP,
  },
  itemWrapper: {
    width:  CARD_W,
    height: CARD_H,
  },

 
  cardSurface: {
    width:        CARD_W,
    height:       CARD_H,
    borderRadius: CARD_R,
    overflow:     'hidden',
  },
  cardImage: {
    borderRadius: CARD_R,
  },

 
  cardContent: {
    flex:           1,
    padding:        verticalScale(14),
    justifyContent: 'space-between',
  },
  frontTopRow: {
    flexDirection:  'row',
    justifyContent: 'flex-end',
  },
  paypassIcon: {
    width:  verticalScale(14),
    height: verticalScale(14),
  },
  cardNumber: {
    color:         '#FFFFFF',
    fontSize:      verticalScale(11),
    fontFamily:    'SpaceGroteskMedium',
    letterSpacing: 1,
  },
  frontBottomRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-end',
  },
  holderExpiry: {
    flexDirection: 'row',
    gap:           verticalScale(10),
  },
  metaText: {
    color:      '#FFFFFF',
    fontSize:   verticalScale(10),
    fontFamily:    'SpaceGroteskMedium',
  },
  networkLogo: {
    width:  verticalScale(28),
    height: verticalScale(18),
  },

 
  magneticStrip: {
    width:           '100%',
    height:          verticalScale(26),
    backgroundColor: '#000000',
    marginTop:       verticalScale(18),
  },
  cvvContainer: {
    paddingHorizontal: verticalScale(12),
    marginTop:         verticalScale(8),
    gap:               verticalScale(2),
  },
  cvvStrip: {
    backgroundColor:   '#ffffff',
    paddingVertical:   verticalScale(5),
    paddingHorizontal: verticalScale(10),
    alignItems:        'flex-end',
  },
  cvvNumber: {
    fontSize:      verticalScale(11),
    fontFamily:    'SpaceGroteskBold',
    color:         '#000',
    letterSpacing: 3,
  },
  cvvLabel: {
    color:      '#ffffff80',
    fontSize:   verticalScale(9),
    fontFamily: 'SpaceGroteskMedium',
    alignSelf:  'flex-end',
  },
  tagline: {
    color:             '#ffffff70',
    fontSize:          verticalScale(9),
    fontFamily:        'SpaceGroteskBold',
    letterSpacing:     0.8,
    paddingHorizontal: verticalScale(12),
    marginTop:         verticalScale(4),
  },

  
  dotsRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    gap:            verticalScale(5),
    marginTop:      verticalScale(10),
  },
  dot: {
    height:          verticalScale(4),
    borderRadius:    verticalScale(2),
    backgroundColor: '#FFFFFF',
  },

  
  addMoreBtn: {
    alignSelf:         'center',
    marginTop:         verticalScale(10),
    paddingHorizontal: verticalScale(20),
    paddingVertical:   verticalScale(7),
    borderRadius:      verticalScale(14),
    backgroundColor:   '#2A2A2A',
  },
  addMoreBtnPressed: {
    backgroundColor: '#333',
  },
  addMoreText: {
    color:      '#CCC',
    fontSize:   verticalScale(11),
    fontFamily: 'SpaceGroteskMedium',
  },
})