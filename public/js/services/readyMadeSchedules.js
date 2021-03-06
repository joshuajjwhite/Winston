winstonApp.factory('readyMadeSchedules', ['scheduleFactory', 'addedCourses', '$window', '$location', 'addedBusyTime', '$modal', '$timeout', '$route', '$q', 'ngProgressLite', 'preferencesValues', 'currentTerm', function(scheduleFactory, addedCourses, $window, $location, addedBusyTime, $modal, $timeout, $route, $q, ngProgressLite, preferencesValues, currentTerm) {

	/*
	Worked function the created readyMadeSchedules

	readyMadeSchedules is an array with each index being a single schedule in the correct format for Andrew Shaw's Full Calendar
	*/

    function buildSchedules(scheduleListing) {

        var cachedColors = [];

        // A brighter color scene custom made by myself!
        //var colorPallet = ['#FF530D', '#227831', '#AFDEE8', '#2F4BE8', '#443111', '#83a283'];

        // A material design-ish color pallet
        var colorPallet = ['#673AB7', '#2196F3', '#009688', '#607D8B', '#FF9800','#F44336']

        // Earthy color pallet
        //var colorPallet = ['#443111', '#227831', '#af9b56', '#2a4560', '#83a283'];
        
        var colorPalletIndex = 0;

        var readyMadeSchedules = [];

        scheduleListing.objects.forEach(function (scheduleResponse) {
        	// scheduleResponse is an individual schedule response as-is from the server
        	var singleReadyMade = [];

        	scheduleResponse.sections.forEach(function (classtime) {
        		// an individual class object

	       		// Null check
	            if (classtime.startTime === null ||
	                classtime.endTime === null   ||
	                classtime.day === null         ) {
	                return;
	            }

	            /*
	            ****
	            Time
	            ****
	             */
	            var startTimeString = classtime.startTime.match(/(\d+):(\d+)/),
	                endTimeString = classtime.endTime.match(/(\d+):(\d+)/);

	            // Minute
	            var startMinute = parseInt(startTimeString[2]),
	                endMinute = parseInt(endTimeString[2]);

	            // Hour
	            var startHour;
	            if (classtime.startTime.match(/PM/) && startTimeString[1] != 12) {
	                // PM
	                startHour = parseInt(startTimeString[1]) + 12;
	            }
	            else {
	                // AM
	                startHour = parseInt(startTimeString[1]);
	            }

	            var endHour;
	            if (classtime.endTime.match(/PM/) && endTimeString[1] != 12) {
	                // PM
	                endHour = parseInt(endTimeString[1]) + 12;
	            }
	            else {
	                // AM
	                endHour = parseInt(endTimeString[1]);
	            }

	            /*
	            *****
	            Color
	            *****
	             */
	            var currentColor;
	            var foundColor = false;

	            cachedColors.forEach(function (cachedCourse) {
	                // Already in cached colors
	                if (cachedCourse.name === classtime.course) {
	                    currentColor = cachedCourse.color;
	                    foundColor = true;
	                }
	            });

	            // Not already in cache
	            if (!foundColor) {
	                currentColor = colorPallet[colorPalletIndex];
	                cachedColors.push({name: classtime.course, color: currentColor});
	                colorPalletIndex = colorPalletIndex + 1;
	            }

	            /*
	            ***
	            Day
	            ***
	             */
	            var date = new Date(),
	                d = date.getDate(),
	                m = date.getMonth(),
	                y = date.getFullYear();

	            // Note: JavaScript function Date.getDay() returns enum of current day of the week

	            // @return {int} enumeration of current day of the week
	            var dayNumber = date.getDay(),
	                offset;

	            // Use the current day {int:0:6} of the week
	            // Enumerate each day of the week {int:0:6}
	            // and find the offset {int:0:6}
	            // Use this offset to find calendar day number  {int:0:31}
	            if (classtime.day.match(/M/)) {
	                offset = 1 - dayNumber;
	                addEvent();
	            }

	            if (classtime.day.match(/T/)) {
	                offset = 2 - dayNumber;
	                addEvent();
	            }

	            if (classtime.day.match(/W/)) {
	                offset = 3 - dayNumber;
	                addEvent();
	            }

	            if (classtime.day.match(/R/)) {
	                offset = 4 - dayNumber;
	                addEvent();
	            }

	            if (classtime.day.match(/F/)) {
	                offset = 5 - dayNumber;
	                addEvent();
	            }

	            /*
				Add event to singleReadyMade
	            */
	            function addEvent() {
	                singleReadyMade.push({
	                    title: classtime.asString,
	                    titleVerbose: classtime.courseTitle,
	                    start: new Date(y, m, d + offset, startHour, startMinute),
	                    end: new Date(y, m, d + offset, endHour, endMinute),
	                    color: currentColor,
	                    description: classtime.courseDescription
	                });
	            }

        	}); // END iterate through class object
	
			/*
			Form an array of singleReadyMade
			*/
			readyMadeSchedules.push(singleReadyMade);

        }); // END iteratate through possible schedules
			
		// Return this array of arrays
		return readyMadeSchedules;
    };

    /*
	Return a an object with some data, a getter and a function returning a promise who's goal is to get the up to date data
    */

	var factory = {};

	factory.readyMadeSchedules = null;

    factory.getSchedulesPromise = function() {
    	// if (!addedCourses.data[currentTerm.termId]) {
    	// 	addedCourses.data[currentTerm.termId] = [];
    	// }

    	if (addedCourses.data[0].length === 0) {
    		factory.readyMadeSchedules = null;
    		ngProgressLite.done();
    		return $q(function(resolve, reject) {
    			resolve();
    		});
    	}

   //  	// No courses added? Don't bother generating schedules, but stay on the schedule view
   //  	if (!addedCourses.data[currentTerm.termId] || addedCourses.data[currentTerm.termId].length === 0) {
   //  		factory.readyMadeSchedules = null;
			// ngProgressLite.done();
			// return $q(function(resolve, reject) {
			// 	resolve();
			// });
   //  	}

    	addedBusyTime.generateApiFormattedBusyTimes();

    	ngProgressLite.set(0.6);

		return (scheduleFactory.getSchedules(addedCourses.data, addedBusyTime.apiFormattedData, preferencesValues.data).

			success(function (data) {
	    		// Assign schedule response to member
	       		var scheduleResponse = angular.fromJson(data);

	        	// Build the schedules event objects
	       		factory.readyMadeSchedules = buildSchedules(scheduleResponse);

	       		// No schedules available? Show a dialog alerting this, but stay on the schedule view
	       		if (factory.readyMadeSchedules.length === 0) {
	       			factory.readyMadeSchedules = null;

	       			var modalInstance = $modal.open({
	  					templateUrl: 'noSchedulesModal.html',
	  					controller: 'noSchedulesModalCtrl'
					});
	       		}
			}).
			error(function() {
	    		$window.alert("Server not responding...");
	    		$location.path('/browse');
			}).
			finally(function() {
				ngProgressLite.done();
			}) );
    }

    return factory;

}])






