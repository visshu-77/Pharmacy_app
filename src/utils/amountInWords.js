const numberInWords = (value) => {
    const units = [
        "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen"
    ];
    const tens = [
        "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    ];
    const number = Math.floor(Math.abs(Number(value) || 0));

    if (number < 20) return units[number];
    if (number < 100) {
        return `${tens[Math.floor(number / 10)]}${number % 10 ? ` ${units[number % 10]}` : ""}`;
    }

    for (const [place, label] of [[10000000, "Crore"], [100000, "Lakh"], [1000, "Thousand"], [100, "Hundred"]]) {
        if (number >= place) {
            const whole = Math.floor(number / place);
            const remainder = number % place;
            return `${numberInWords(whole)} ${label}${remainder ? ` ${numberInWords(remainder)}` : ""}`;
        }
    }

    return "";
};

export const amountInWords = (value) => {
    const paiseTotal = Math.round(Math.abs(Number(value) || 0) * 100);
    const rupees = Math.floor(paiseTotal / 100);
    const paise = paiseTotal % 100;

    return `${numberInWords(rupees)} Rupees${paise ? ` and ${numberInWords(paise)} Paise` : ""} Only`;
};
