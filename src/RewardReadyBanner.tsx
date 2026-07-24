import { Gift } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { accentAlpha, REWARD_COLORS, S } from './theme';
import { useRewardPop } from './useRewardPop';

type RewardReadyBannerProps = {
  title: string;
  subtitle: string;
};

export function RewardReadyBanner({ title, subtitle }: RewardReadyBannerProps) {
  const popStyle = useRewardPop(true);

  return (
    <Animated.View style={[styles.banner, popStyle]}>
      <View style={styles.icon}>
        <Gift size={20} color="#fff" />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    padding: S.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: accentAlpha(0.3),
    backgroundColor: accentAlpha(0.12),
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: REWARD_COLORS.pink,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: REWARD_COLORS.navy,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: REWARD_COLORS.label3,
  },
});
