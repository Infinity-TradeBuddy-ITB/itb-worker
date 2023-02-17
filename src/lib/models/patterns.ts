export enum PatternType {
	FALLING = 0,
	RISING = 1
}

export enum PatternDetected {
	NO = 0,
	YES = 1
}

export enum Pattern {
	HEAD_AND_SHOULDERS = PatternType.FALLING,
	INVERTED_HEAD_AND_SHOULDERS = PatternType.RISING,
	BULLISH_FLAG = PatternType.RISING,
	BEARISH_FLAG = PatternType.FALLING,
	DOUBLE_BOTTOM = PatternType.FALLING,
	DOUBLE_TOP = PatternType.RISING,
	TRIPLE_BOTTOM = PatternType.FALLING,
	TRIPLE_TOP = PatternType.RISING,
	UPTREND_RISING_WEDGE = PatternType.FALLING,
	UPTREND_FALLING_WEDGE = PatternType.RISING,
	DOWNTREND_RISING_WEDGE = PatternType.FALLING,
	DOWNTREND_FALLING_WEDGE = PatternType.RISING
}

export type PatternResponse = {
	pattern: Pattern,
	detected: PatternDetected
}

export type OrderedFlucts = {
	flucts: number,
	moment: Date
}