/** Returns in range 0-100 */
export const calculcatePercentage = (part: number, outOf: number) => {
	if (outOf === 0) return 100;
	return Math.round((part * 100) / outOf);
};
