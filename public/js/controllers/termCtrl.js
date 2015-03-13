
winstonControllers.controller('termCtrl', ['$scope', 'localStorageService', function($scope, localStorageService) {

	$scope.termOptions = [
		{ 
			'name': 'Fall 2014',
			'termId': '1490'
		},
		{ 
			'name': 'Winter 2015',
			'termId': '1500'
		},
		{ 
			'name': 'Spring 2015',
			'termId': '1510'
		},
		{ 
			'name': 'Summer 2015',
			'termId': '1520'
		},
		{ 
			'name': 'Fall 2015',
			'termId': '1530'
		},
		{ 
			'name': 'Winter 2016',
			'termId': '1540'
		}
	]
	$scope.selectedTerm = localStorageService.get('selectedTerm') || $scope.termOptions[0];

	localStorageService.bind($scope, 'selectedTerm');

}]);