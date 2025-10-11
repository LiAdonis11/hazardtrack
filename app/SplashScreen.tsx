import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/logos/tagudin-logo.png')} style={styles.logo} />
        <Image source={require('../assets/logos/hazartrack-logo.png')} style={styles.logo} />
        <Image source={require('../assets/logos/bfp-logo.png')} style={styles.logo} />
      </View>
      <Text style={styles.subtitle}>In partnership with the Bureau of Fire Protection – Tagudin LGU</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginHorizontal: 10,
    resizeMode: 'contain',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginHorizontal: 20,
  },
});

export default SplashScreen;
