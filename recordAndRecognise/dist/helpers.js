'use strict';

function verifyBody() {
	var expected = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
	var actual = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var contentType = arguments[2];

	return new Promise(function (resolve, reject) {
		if (contentType.indexOf('json') > -1) {
			for (var i = 0; i < expected.length; i++) {
				var expectedParam = expected[i];
				if (expectedParam.type == 'inBody') {
					if (actual[expectedParam.name]) {
						var listOfOptions = expectedParam.options;
						if (expectedParam.typeName === 'boolean') {
							listOfOptions = ["true", "false"];
						}
						if (Array.isArray(listOfOptions) && listOfOptions.indexOf(actual[expectedParam.name]) == -1) {
							return reject(new Error('Body parameter "' + actual[expectedParam.name] + '" had a value not supported. Valid values are ' + listOfOptions.join(',')));
						}
					} else if (expectedParam.required) {
						return reject(new Error('Body parameter "' + expectedParam.name + '" is required!'));
					}
				}
			}
		}

		expected = expected.filter(function (p) {
			return p.type != "inBody";
		});

		resolve(expected);
	});
}

function verifyParameters() {
	var expected = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
	var actual = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


	return new Promise(function (resolve, reject) {

		var missingParameters = expected.filter(function (param) {
			return param.required;
		}).filter(function (param) {
			return !actual[param.name];
		});

		var invalidValues = [];

		// validate that the parameters have valid values

		var _loop = function _loop(paramName) {
			if (typeof actual[paramName] === 'string') {
				values = actual[paramName].split(',');
			} else {
				values = [actual[paramName]];
			}
			for (var i = 0; i < values.length; i++) {
				var value = values[i].toString();
				var expectedParam = expected.filter(function (p) {
					return p.name == paramName;
				});
				if (expectedParam.length == 1) {
					var listOfOptions = expectedParam[0].options;
					if (expectedParam[0].typeName === 'boolean') {
						listOfOptions = ["true", "false"];
					}
					if (Array.isArray(listOfOptions) && listOfOptions.indexOf(value) == -1) {
						reject(new Error('Parameter "' + paramName + '" had a value not supported. Valid values are ' + listOfOptions.join(',')));
					}
				} else {
					reject(new Error('Parameter "' + paramName + '" could not be found in the list of supported parameters'));
				}
			}
		};

		for (var paramName in actual) {
			var values;

			_loop(paramName);
		}

		// validate that there aren't any missing parameters
		if (missingParameters.length !== 0) {
			if (missingParameters.length > 1) {
				reject(new Error('Required parameters ' + JSON.stringify(missingParameters) + ' were not present.'));
			} else {
				reject(new Error('Required parameter "' + missingParameters[0].name + '" was not present.'));
			}
		} else {
			resolve();
		}
	});
}

function verifyHeaders() {
	var expectedHeaders = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
	var actualHeaders = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	return new Promise(function (resolve, reject) {

		var requiredPropsNotPresent = expectedHeaders.filter(function (param) {
			return param.required;
		}).filter(function (param) {
			return !actualHeaders[param.name];
		});

		if (requiredPropsNotPresent.length !== 0) {
			if (requiredPropsNotPresent.length > 1) {
				reject(new Error('Required headers ' + JSON.stringify(requiredPropsNotPresent) + ' were not present.'));
			} else {
				reject(new Error('Required header "' + requiredPropsNotPresent[0].name + '" was not present.'));
			}
		} else {
			resolve();
		}
	});
}

function verifyEndpoint() {
	var endpointsAllowed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
	var endpoint = arguments[1];

	return new Promise(function (resolve, reject) {
		if (endpointsAllowed && endpointsAllowed.indexOf(endpoint) != -1) {
			resolve();
		} else {
			reject('Endpoint ' + endpoint + ' is not supported.');
		}
	});
}

module.exports = { verifyParameters: verifyParameters, verifyHeaders: verifyHeaders, verifyEndpoint: verifyEndpoint, verifyBody: verifyBody };