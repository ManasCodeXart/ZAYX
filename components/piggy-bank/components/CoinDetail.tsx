// import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import AnimatedRollingNumber from 'react-native-animated-rolling-numbers';
// import { verticalScale } from '../constants/scaling';

// const COIN = {
//   name: 'Ethereum',
//   price: 2302.08,
//   image: require('../assets/images/eth.png'),
//   overview: 'Ethereum is a decentralized blockchain platform powering smart contracts, digital assets, and Web3 applications through its native currency, ETH.',
//   highlights: [
//     'Fast-growing Web3 infrastructure',
//     'Supports NFTs & decentralized finance',
//     'Energy-efficient Proof-of-Stake network',
//     'Large developer community',
//     'Billions in on-chain activity daily',
//   ],
// };

// const CoinDetail = () => {
//   return (
//     <View style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

//         {/* Coin Image */}
//         <Image source={COIN.image} style={styles.coinImage} resizeMode="contain" />

//         {/* Name */}
//         <Text style={styles.name}>{COIN.name}</Text>

//         {/* Price */}
//         <View style={styles.priceRow}>
//           <Text style={styles.price}>$</Text>
//           <AnimatedRollingNumber
//             value={COIN.price}
//             textStyle={styles.price}
//             spinningAnimationConfig={{ duration: 600 }}
//           />
//         </View>

//         {/* Overview Card */}
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Overview</Text>
//           <Text style={styles.cardBody}>{COIN.overview}</Text>

//           <Text style={styles.cardTitle}>Key Highlights</Text>
//           {COIN.highlights.map((point, index) => (
//             <View key={index} style={styles.bulletRow}>
//               <Text style={styles.bullet}>•</Text>
//               <Text style={styles.bulletText}>{point}</Text>
//             </View>
//           ))}
//         </View>

//       </ScrollView>

//       {/* Buy Button */}
//       <TouchableOpacity style={styles.buyButton}>
//         <Text style={styles.buyText}>Buy {COIN.name}</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default CoinDetail;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000000',
//   },
//   scroll: {
//     alignItems: 'center',
//     paddingBottom: verticalScale(120),
//   },
//   coinImage: {
//     width: verticalScale(220),
//     height: verticalScale(220),
//     marginTop: verticalScale(40),
//   },
//   name: {
//     color: '#FFFFFF',
//     fontSize: verticalScale(22),
//     fontWeight: '500',
//     marginTop: verticalScale(16),
//     letterSpacing: 2,
//   },
//   priceRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     marginTop: verticalScale(6),
//   },
//   price: {
//     color: '#FFFFFF',
//     fontSize: verticalScale(32),
//     fontWeight: '700',
//     letterSpacing: 1,
//   },
//   card: {
//     width: '90%',
//     backgroundColor: '#111111',
//     borderRadius: verticalScale(20),
//     padding: verticalScale(20),
//     marginTop: verticalScale(28),
//     gap: verticalScale(12),
//   },
//   cardTitle: {
//     color: '#FFFFFF',
//     fontSize: verticalScale(14),
//     fontWeight: '600',
//     textAlign: 'center',
//     letterSpacing: 1.5,
//   },
//   cardBody: {
//     color: '#888888',
//     fontSize: verticalScale(12),
//     textAlign: 'center',
//     lineHeight: verticalScale(20),
//     letterSpacing: 0.5,
//   },
//   bulletRow: {
//     flexDirection: 'row',
//     gap: verticalScale(8),
//     alignItems: 'flex-start',
//   },
//   bullet: {
//     color: '#888888',
//     fontSize: verticalScale(12),
//   },
//   bulletText: {
//     color: '#888888',
//     fontSize: verticalScale(12),
//     letterSpacing: 0.5,
//     flex: 1,
//   },
//   buyButton: {
//     position: 'absolute',
//     bottom: verticalScale(32),
//     alignSelf: 'center',
//     width: '88%',
//     backgroundColor: '#FFFFFF',
//     borderRadius: verticalScale(50),
//     paddingVertical: verticalScale(18),
//     alignItems: 'center',
//   },
//   buyText: {
//     color: '#000000',
//     fontSize: verticalScale(16),
//     fontWeight: '600',
//   },
// });