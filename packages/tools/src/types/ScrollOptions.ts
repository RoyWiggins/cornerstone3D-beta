type ScrollOptions = {
  // can be positive or negative
  delta: number;
  volumeId?: string;
  debounceLoading?: boolean;
  loopScroll?: boolean;
};

export default ScrollOptions;
