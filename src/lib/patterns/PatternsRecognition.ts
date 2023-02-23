import { OrderedFlucts, Pattern, PatternDetected, PatternResponse } from '../models/Patterns.js';

/************************		helpers		************************/

const extractFlucts = (orderedFlucts: OrderedFlucts[]): number[] => {
	return orderedFlucts.map((fluct) => fluct.flucts);
}

const distance = (first: number, second: number): number => {
	return Math.abs(first - second);
}

const wedgeCheck = (flucts: number[], isDowntrend: boolean): boolean => {
	let downtrendFlag = flucts[0] > flucts[1];

	if (isDowntrend && downtrendFlag) {
		return downtrend(flucts);
	}

	if (downtrendFlag) {
		return false
	}

	return uptrend(flucts);
}

const uptrend = (flucts: number[]): boolean => {
	let flag = false;

	for (let i = 0; i < flucts.length - 1; i++) {
		if (trendChecker(flucts[i], flucts[i + 1], flag)) {
			return false;
		}
		flag = !flag;
	}
	return true;
}

const downtrend = (flucts: number[]): boolean => {
	let flag = true

	for (let i = 0; i < flucts.length - 1; i++) {
		if (trendChecker(flucts[i], flucts[i + 1], flag)) {
			return false;
		}
		flag = !flag;
	}
	return true;
}

/**
	* flag must be true for downtrend 
	*/
const trendChecker = (firstFluc: number, secondFluc: number, flag: boolean): boolean => {
	return flag ? firstFluc > secondFluc : firstFluc < secondFluc;
}

/**
	*  1 or more 		<- distance in first half is smaller than distance in second half
	*  0 						<- distance in first half is equal to distance in second half
	* -1 or less 		<- distance in first half is bigger than distance in second half 
	*/
const distanceMeasuring = (flucts: number[]): number => {
	const firstDistance = distance(flucts[1], flucts[0]);
	const secondDistance = distance(flucts[3], flucts[2]);

	return flucts.length === 4 ? secondDistance - firstDistance : NaN;
}

/**
	* true 		<- 					head and shoulders pattern
	* false 	<- inverted head and shoulders pattern
	*/
const headAndShoulders = (flucts: number[]): boolean => {
	return (
		flucts.length === 6 &&
		flucts[0] < flucts[1] && 	// shoulder
		flucts[1] > flucts[2] && 	// head
		flucts[2] > flucts[3]  		// shoulder
	);
}

/************************		exporteds		************************/

// Falling
export const headAndShouldersPattern = (orderedFlucts: OrderedFlucts[]): PatternResponse => {
	const flucts = extractFlucts(orderedFlucts);

	return <PatternResponse>{
		pattern: Pattern.HEAD_AND_SHOULDERS,
		detected: headAndShoulders(flucts) ? PatternDetected.YES : PatternDetected.NO
	};
}

// Falling
export const bearishFlagPattern = (orderedFlucts: OrderedFlucts[]): PatternResponse => {
	const flucts = extractFlucts(orderedFlucts);

	return <PatternResponse>{
		pattern: Pattern.BEARISH_FLAG,
		detected: distanceMeasuring(flucts) <= 0 ? PatternDetected.YES : PatternDetected.NO
	};
}

// Falling
export const doubleTopPattern = (orderedFlucts: OrderedFlucts[]): PatternResponse => {
	const flucts = extractFlucts(orderedFlucts);

	return <PatternResponse>{
		pattern: Pattern.DOUBLE_TOP,
		detected: wedgeCheck(flucts, false) ? PatternDetected.YES : PatternDetected.NO
	};
}

// Falling
export const tripleTopPattern = (orderedFlucts: OrderedFlucts[]): PatternResponse => {
	const flucts = extractFlucts(orderedFlucts);

	return <PatternResponse>{
		pattern: Pattern.TRIPLE_TOP,
		detected: wedgeCheck(flucts, false) ? PatternDetected.YES : PatternDetected.NO
	};
}

// Falling
export const uptrendRisingWedgePattern = (orderedFlucts: OrderedFlucts[]): PatternResponse => {
	const flucts = extractFlucts(orderedFlucts);

	return <PatternResponse>{
		pattern: Pattern.UPTREND_RISING_WEDGE,
		detected: false ? PatternDetected.YES : PatternDetected.NO
	};
}

// Falling
export const downtrendRisingWedgePattern = (orderedFlucts: OrderedFlucts[]): PatternResponse => {
	const flucts = extractFlucts(orderedFlucts);


	return <PatternResponse>{
		pattern: Pattern.DOWNTREND_RISING_WEDGE,
		detected: false ? PatternDetected.YES : PatternDetected.NO
	};
}

/*********																									*********/
/***********************		end of falling		************************/
/*********     																     					*********/

// Rising
export const invertedHeadAndShouldersPattern = (orderedFlucts: OrderedFlucts[]): PatternResponse => {
	const flucts = extractFlucts(orderedFlucts);

	return <PatternResponse>{
		pattern: Pattern.INVERTED_HEAD_AND_SHOULDERS,
		detected: !headAndShoulders(flucts) ? PatternDetected.YES : PatternDetected.NO
	};
}

// Rising
export const bullishFlagPattern = (orderedFlucts: OrderedFlucts[]): PatternResponse => {
	const flucts = extractFlucts(orderedFlucts);

	return <PatternResponse>{
		pattern: Pattern.BULLISH_FLAG,
		detected: distanceMeasuring(flucts) >= 0 ? PatternDetected.YES : PatternDetected.NO
	};
}

// Rising
export const doubleBottomPattern = (orderedFlucts: OrderedFlucts[]): PatternResponse => {
	const flucts = extractFlucts(orderedFlucts);

	return <PatternResponse>{
		pattern: Pattern.DOUBLE_BOTTOM,
		detected: wedgeCheck(flucts, true) ? PatternDetected.YES : PatternDetected.NO
	};
}

// Rising
export const tripleBottomPattern = (orderedFlucts: OrderedFlucts[]): PatternResponse => {
	const flucts = extractFlucts(orderedFlucts);

	return <PatternResponse>{
		pattern: Pattern.TRIPLE_BOTTOM,
		detected: wedgeCheck(flucts, true) ? PatternDetected.YES : PatternDetected.NO
	};
}

// Rising
export const uptrendFallingWedge = (orderedFlucts: OrderedFlucts[]): PatternResponse => {
	const detected = false;


	return <PatternResponse>{
		pattern: Pattern.UPTREND_FALLING_WEDGE,
		detected: detected ? PatternDetected.YES : PatternDetected.NO
	};
}

// Rising
export const downtrendFallingWedge = (orderedFlucts: OrderedFlucts[]): PatternResponse => {
	const detected = false;


	return <PatternResponse>{
		pattern: Pattern.DOWNTREND_FALLING_WEDGE,
		detected: detected ? PatternDetected.YES : PatternDetected.NO
	};
}

/*********																									*********/
/***********************		 end of rising		************************/
/*********     																     					*********/
