import { View, type ViewProps } from "react-native";

import { cn } from "@/lib/utils";

  className?: string;
}

/**
 * A View component with automatic theme-aware background.
 * Uses NativeWind for styling - pass className for additional styles.
 */
  return <View className={cn("bg-background", className)} {...otherProps} />;
}
