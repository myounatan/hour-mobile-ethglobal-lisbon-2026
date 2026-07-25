import { Gift } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { REWARD_COLORS, S } from './theme';

interface RewardsFilterChipProps {
  active: boolean;
  onPress: () => void;
  /** Defaults to "Rewards" -- override for a shorter label in tight layouts. */
  label?: string;
}

/**
 * A chip for filtering a venue list down to venues with an active rewards program.
 *
 * Self-contained (no host theme import) so it can sit at the front of a host's own
 * tag-filter chip row and match it visually -- `REWARD_COLORS` mirrors the host's
 * design tokens value-for-value.
 */
export function RewardsFilterChip({
  active,
  onPress,
  label = 'Rewards',
}: RewardsFilterChipProps) {
  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: S.xs,
          backgroundColor: active ? REWARD_COLORS.navy : '#fff',
          borderWidth: 1,
          borderColor: active ? REWARD_COLORS.navy : REWARD_COLORS.label4,
          borderRadius: 8,
          paddingVertical: S.xs,
          paddingHorizontal: S.sm,
        }}
      >
        <Gift size={16} color={active ? '#fff' : REWARD_COLORS.label2} />
        <Text
          style={{
            fontSize: 13,
            fontWeight: '500',
            color: active ? '#fff' : REWARD_COLORS.label2,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
