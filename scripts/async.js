define([], function() {
	return {
		all: function(promises) {
			var resultPromise = new $.Deferred();
			var results = [];
			var recursiveWait = function(remainingPromises) {
				if (!remainingPromises || remainingPromises.length == 0) {
					resultPromise.resolve(results);
				} else {
					var current = remainingPromises.shift();
					current.done(function(currentResult) {
						results.push(currentResult);
						recursiveWait(remainingPromises);
					});
				}
			}
			recursiveWait(promises);
			return resultPromise;
		}
	};
});