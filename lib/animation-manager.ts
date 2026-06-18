import { Animated, Easing } from 'react-native';

export class AnimationManager {
  // Button Press Animation (Scale 0.97)
  static createButtonPressAnimation(): {
    scaleValue: Animated.Value;
    handlePressIn: () => void;
    handlePressOut: () => void;
  } {
    const scaleValue = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.timing(scaleValue, {
        toValue: 0.97,
        duration: 80,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 80,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    };

    return {
      scaleValue,
      handlePressIn,
      handlePressOut,
    };
  }

  // Toggle Animation (Smooth rotation)
  static createToggleAnimation(): {
    rotateValue: Animated.Value;
    toggle: () => void;
  } {
    const rotateValue = new Animated.Value(0);

    const toggle = () => {
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    };

    return {
      rotateValue,
      toggle,
    };
  }

  // Theme Transition (Fade)
  static createThemeTransition(): {
    fadeValue: Animated.Value;
    fadeIn: () => void;
    fadeOut: () => void;
  } {
    const fadeValue = new Animated.Value(1);

    const fadeOut = () => {
      Animated.timing(fadeValue, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    };

    const fadeIn = () => {
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start();
    };

    return {
      fadeValue,
      fadeIn,
      fadeOut,
    };
  }

  // Download Progress Animation
  static createProgressAnimation(): {
    progressValue: Animated.Value;
    updateProgress: (progress: number) => void;
  } {
    const progressValue = new Animated.Value(0);

    const updateProgress = (progress: number) => {
      Animated.timing(progressValue, {
        toValue: progress,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    };

    return {
      progressValue,
      updateProgress,
    };
  }

  // Modal Animation (Slide up)
  static createModalAnimation(): {
    slideValue: Animated.Value;
    slideUp: () => void;
    slideDown: () => void;
  } {
    const slideValue = new Animated.Value(500);

    const slideUp = () => {
      Animated.timing(slideValue, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    };

    const slideDown = () => {
      Animated.timing(slideValue, {
        toValue: 500,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    };

    return {
      slideValue,
      slideUp,
      slideDown,
    };
  }

  // Tab Transition Animation
  static createTabAnimation(): {
    tabValue: Animated.Value;
    animateTab: (toValue: number) => void;
  } {
    const tabValue = new Animated.Value(0);

    const animateTab = (toValue: number) => {
      Animated.timing(tabValue, {
        toValue,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    };

    return {
      tabValue,
      animateTab,
    };
  }

  // Pulse Animation (for loading states)
  static createPulseAnimation(): {
    pulseValue: Animated.Value;
    startPulse: () => void;
    stopPulse: () => void;
  } {
    const pulseValue = new Animated.Value(1);
    let animation: Animated.CompositeAnimation | null = null;

    const startPulse = () => {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 0.7,
            duration: 600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );

      animation.start();
    };

    const stopPulse = () => {
      if (animation) {
        animation.stop();
        pulseValue.setValue(1);
      }
    };

    return {
      pulseValue,
      startPulse,
      stopPulse,
    };
  }

  // Bounce Animation
  static createBounceAnimation(): {
    bounceValue: Animated.Value;
    bounce: () => void;
  } {
    const bounceValue = new Animated.Value(0);

    const bounce = () => {
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: -10,
          duration: 100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 0,
          duration: 100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    };

    return {
      bounceValue,
      bounce,
    };
  }

  // Shake Animation (for errors)
  static createShakeAnimation(): {
    shakeValue: Animated.Value;
    shake: () => void;
  } {
    const shakeValue = new Animated.Value(0);

    const shake = () => {
      Animated.sequence([
        Animated.timing(shakeValue, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeValue, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeValue, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeValue, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    };

    return {
      shakeValue,
      shake,
    };
  }

  // Rotation Animation (for loading spinner)
  static createRotationAnimation(): {
    rotateValue: Animated.Value;
    startRotation: () => void;
    stopRotation: () => void;
  } {
    const rotateValue = new Animated.Value(0);
    let animation: Animated.CompositeAnimation | null = null;

    const startRotation = () => {
      animation = Animated.loop(
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      animation.start();
    };

    const stopRotation = () => {
      if (animation) {
        animation.stop();
        rotateValue.setValue(0);
      }
    };

    return {
      rotateValue,
      startRotation,
      stopRotation,
    };
  }

  // Interpolate rotation value to degrees
  static interpolateRotation(rotateValue: Animated.Value): Animated.AnimatedInterpolation<string> {
    return rotateValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
  }

  // Interpolate scale value
  static interpolateScale(value: Animated.Value, inputRange: number[], outputRange: number[]): Animated.AnimatedInterpolation<number> {
    return value.interpolate({
      inputRange,
      outputRange,
    });
  }
}
