/*
The only purpose of this controller is to route the about button
*/

winstonControllers.controller('headerCtrl', ['$scope', '$location', '$modal', 'SubjectBin', '$window', function($scope, $location, $modal, SubjectBin, $window) {

	SubjectBin.populate();

	$scope.open = function() {
		var modalInstance = $modal.open({
	  		templateUrl: 'addedCoursesModal.html',
	  		controller: 'addedCoursesModalCtrl'
		});
	}

	$scope.back = function() {
		$location.path('/browse');
	}

	$scope.showAdded = true;
	$scope.showBackToBrowse = false;

	$scope.$watch(function() {
		return $location.path();
	}, function() {
		if ($location.path() == '/schedule') {
			$scope.showAdded = false;
			$scope.showBackToBrowse = true;
		} else {
			$scope.showAdded = true;
			$scope.showBackToBrowse = false;
		}
	});

}]);