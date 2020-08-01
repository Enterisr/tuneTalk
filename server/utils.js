let utils = {
	selectRandomFromArray: function selectRandomFromArray(arr) {
		const rnd = Math.floor(Math.random() * arr.length);
		return arr[rnd];
	}
};

module.exports = utils;
