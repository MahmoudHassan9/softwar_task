function sum(numbers) {
    if (!Array.isArray(numbers)) {
        throw new Error('Input must be an array');
    }
    return numbers.reduce((acc, val) => acc + val, 0);
}
module.exports = sum;
