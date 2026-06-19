import { Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';

  /**
   * Tema Geçiş Animasyonu - Fade Transition
   * Smooth fade effect when changing themes
   */
  static createThemeTransition(duration: number = 250) {
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const startFadeOut = () => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: duration / 2,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
    };

    const startFadeIn = () => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: duration / 2,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
    };

    return {
      fadeAnim,
      startFadeOut,
      startFadeIn,
      animatedStyle: {
        opacity: fadeAnim,
      },
    };
  }

  /**
   * Renk Geçiş Animasyonu
   * Smooth color transition
   */
  static createColorTransition(fromColor: string, toColor: string, duration: number = 250) {
    const colorAnim = useRef(new Animated.Value(0)).current;

    const startAnimation = () => {
      Animated.timing(colorAnim, {
        toValue: 1,
        duration: duration,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
    };

    const resetAnimation = () => {
      colorAnim.setValue(0);
    };

    return {
      colorAnim,
      startAnimation,
      resetAnimation,
    };
  }

  /**
   * Tema Değişim Hook'u
   */
  static useThemeAnimation() {
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const animateThemeChange = (callback: () => void) => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start(() => {
        // Change theme
        callback();

        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          easing: Easing.ease,
          useNativeDriver: false,
        }).start();
      });
    };

    return {
      fadeAnim,
      animateThemeChange,
      animatedStyle: {
        opacity: fadeAnim,
      },
    };
  }

  /**
   * Tema Kartı Seçim Animasyonu
   */
  static useThemeCardAnimation() {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const animatePress = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    };

    return {
      scaleAnim,
      animatePress,
      animatedStyle: {
        transform: [{ scale: scaleAnim }],
      },
    };
  }

  /**
   * Tema Seçim Göstergesi Animasyonu
   */
  static useThemeIndicatorAnimation() {
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const startRotation = () => {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };

    const stopRotation = () => {
      rotateAnim.setValue(0);
    };

    const rotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return {
      rotateAnim,
      startRotation,
      stopRotation,
      animatedStyle: {
        transform: [{ rotate: rotation }],
      },
    };
  }
}

/**
 * Hook: Tema Geçiş Animasyonu Kullan
 */
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateThemeChange = (callback: () => void) => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: duration / 2,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start(() => {
      // Change theme
      callback();

      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: duration / 2,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
    });
  };

  return {
    fadeAnim,
    animateThemeChange,
    animatedStyle: {
      opacity: fadeAnim,
    },
  };
}

/**
 * Hook: Tema Kartı Animasyonu Kullan
 */
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  return {
    scaleAnim,
    handlePressIn,
    handlePressOut,
    animatedStyle: {
      transform: [{ scale: scaleAnim }],
    },
  };
}
