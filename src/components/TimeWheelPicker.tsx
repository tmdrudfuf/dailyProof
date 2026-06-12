import { useEffect, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, radii } from '../theme';

const ITEM_HEIGHT = 46;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const hours = Array.from({ length: 12 }, (_, index) => String(index + 1));
const minutes = Array.from(
  { length: 12 },
  (_, index) => String(index * 5).padStart(2, '0'),
);
const periods = ['AM', 'PM'];

type TimeParts = {
  hour: string;
  minute: string;
  period: string;
};

type TimeWheelPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

function parseTime(value: string): TimeParts {
  const match = value.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/);

  if (!match) {
    return { hour: '9', minute: '00', period: 'AM' };
  }

  const minuteNumber = Number(match[2]);
  const roundedMinute = Math.min(Math.round(minuteNumber / 5) * 5, 55);

  return {
    hour: String(Math.min(Math.max(Number(match[1]), 1), 12)),
    minute: String(roundedMinute).padStart(2, '0'),
    period: match[3],
  };
}

type WheelColumnProps = {
  items: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  width: number;
};

function WheelColumn({
  items,
  selectedValue,
  onSelect,
  width,
}: WheelColumnProps) {
  const initialIndex = Math.max(items.indexOf(selectedValue), 0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      animated: false,
      y: initialIndex * ITEM_HEIGHT,
    });
  }, [initialIndex]);

  function handleScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) {
    const rawIndex = Math.round(
      event.nativeEvent.contentOffset.y / ITEM_HEIGHT,
    );
    const index = Math.min(Math.max(rawIndex, 0), items.length - 1);
    onSelect(items[index]);
  }

  return (
    <ScrollView
      contentContainerStyle={styles.wheelContent}
      decelerationRate="fast"
      nestedScrollEnabled
      onMomentumScrollEnd={handleScrollEnd}
      onScrollEndDrag={handleScrollEnd}
      ref={scrollRef}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      style={[styles.wheel, { width }]}
    >
      {items.map((item) => (
        <View key={item} style={[styles.wheelItem, { width }]}>
          <Text
            style={[
              styles.wheelText,
              item === selectedValue && styles.wheelTextSelected,
            ]}
          >
            {item}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

export function TimeWheelPicker({
  value,
  onChange,
}: TimeWheelPickerProps) {
  const selected = parseTime(value);

  function updateTime(part: keyof TimeParts, nextValue: string) {
    const nextTime = { ...selected, [part]: nextValue };
    onChange(`${nextTime.hour}:${nextTime.minute} ${nextTime.period}`);
  }

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.selectionHighlight} />
      <WheelColumn
        items={hours}
        onSelect={(hour) => updateTime('hour', hour)}
        selectedValue={selected.hour}
        width={82}
      />
      <Text pointerEvents="none" style={styles.separator}>
        :
      </Text>
      <WheelColumn
        items={minutes}
        onSelect={(minute) => updateTime('minute', minute)}
        selectedValue={selected.minute}
        width={82}
      />
      <WheelColumn
        items={periods}
        onSelect={(period) => updateTime('period', period)}
        selectedValue={selected.period}
        width={88}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.large,
    borderWidth: 1,
    flexDirection: 'row',
    height: PICKER_HEIGHT,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  selectionHighlight: {
    backgroundColor: colors.softGreen,
    borderColor: colors.accentDark,
    borderRadius: radii.small,
    borderWidth: 1,
    height: ITEM_HEIGHT,
    left: 12,
    position: 'absolute',
    right: 12,
    top: ITEM_HEIGHT * 2,
  },
  wheel: {
    flexGrow: 0,
    height: PICKER_HEIGHT,
  },
  wheelContent: {
    paddingVertical: ITEM_HEIGHT * 2,
  },
  wheelItem: {
    alignItems: 'center',
    height: ITEM_HEIGHT,
    justifyContent: 'center',
  },
  wheelText: {
    color: '#A2A59E',
    fontSize: 17,
    fontWeight: '700',
  },
  wheelTextSelected: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '900',
  },
  separator: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '900',
    marginHorizontal: -7,
    zIndex: 1,
  },
});
