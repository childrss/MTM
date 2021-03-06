ComputerService.factory("myErrorHandler",function($window) {
    var EH = [];
    EH.doit = function(data) {
	console.log(data);
    }

    EH.format = function(jsondata) {
	//console.log("EH.format");
	//console.log(jsondata);
	var data = angular.fromJson(jsondata);

	if(angular.isDefined(data.status) && angular.isDefined(data.status.error) && data.status.error == 2) {
	    var landingURL = "https://" + $window.location.host +
		"/Portal/api/v1/login/";
	    console.log(landingURL);
	    console.log($window.location);
	    $window.open(landingURL,"_blank");
	}
		      
	return data;
		      
    }
    return EH;
});

ComputerService.factory("Computer",function($resource,myErrorHandler) {
    var results = [];
//    var Comp = $resource("/api/v1/computers/:how/:key/:key2");

    var Comp = $resource("/api/v1/computers/:how/:key/:key2",{},{
	'query': {method:'GET',
		  isArray:true,
		  transformResponse: function(data) {return myErrorHandler.format(data)},
		  interceptor: { responseError: myErrorHandler.doit}},
	'queryrepo': {method:'GET',
		       url: "/api/v1/users/repositories",
		       isArray:true,
		       transformResponse: function(data) {return myErrorHandler.format(data)},
		       interceptor: {responseError: myErrorHandler.doit}}

    });

    Comp.setlastresults = function(current_results) {
	results = current_results;
    };

    Comp.getlastresults = function() {
	return results;
    };

    return Comp;

});

ComputerService.factory("User",function($resource,myErrorHandler) {
    var results = [];
    var User = $resource("/api/v1/users/repositories",{},{
	'query': {method:'GET',
		  isArray:true,
		  transformResponse: function(data) {myErrorHandler.format(data)},
		  interceptor: {responseError: myErrorHandler.doit}}
    });

    User.setlastresults = function(current_results) {
	results = current_results;
    };

    User.getlastresults = function() {
	return results;
    };

    return User;
});

app.filter('range', function() {
    return function(input,total) {
	total = parseInt(total);

	for(var i=0;i<total;i++) {
	    input.push(i);
	}

	return input;
    }
});

app.controller("ComputerController",function($scope,$routeParams,Computer,$location) {
    var editindex = 0;

    $scope.itemsperpage = 10;

    Computer.query({how:$routeParams.how,
		    key:$routeParams.key,
		    key2:$routeParams.key2},function(data){
			$scope.processdata(data);
		    });

    $scope.repos = [];
    
    Computer.queryrepo({},function(data){
	$scope.repos = data;
	$scope.form_repo = $scope.repos[0];
	if($routeParams.how == 'repo' && angular.isDefined($routeParams.key)) {
	    angular.forEach($scope.repos,function(value,index) {
		if(value.id == $routeParams.key) {
		    $scope.form_repo = value;
		}
	    });
	}
    });

    var lastresults = Computer.getlastresults();

    var checklastresults = function(theresults) {
	if(angular.isDefined(theresults.status)) {
	    $scope.lastresults = 1;
	    if(theresults['status']['error'] == 1){
		$scope.errortext = 'ERROR';
	    } else {
		$scope.errortext = 'OK';
	    }
	    $scope.resulttext = theresults['status']['text'];
	} else {
	    $scope.lastresults = 0;
	}
    }

    checklastresults(lastresults);

    $scope.computersearch = function() {
	Computer.setlastresults([]);
	$location.url('/computers/search/repo/' + $scope.form_repo.id);
    };
    
    $scope.setedit = function($activeID) {
	$location.url('/computers/edit/id/' + $activeID);
    };

    $scope.processdata = function(data) {
	if(data.length < 1) {
	    $scope.goodresults = 0;
	    $scope.computers = [];
	    $scope.displaycomputers = [];
	} else {
	    $scope.goodresults = 1;
	    $scope.computers = data;
	    $scope.displaycomputers = [] . concat($scope.computers);
	}
    };

    $scope.goadd = function() {
    	Computer.setlastresults({});
    	$location.url('/computers/edit/new/' + $scope.form_repo.id);
    };

});

app.controller("ComputerEditController",function($scope,$location,$routeParams,Computer) {
    if(angular.isDefined($routeParams.how) && $routeParams.how == 'id') {
	if(angular.isDefined($routeParams.id)) {
	    $scope.editindex = $routeParams.id;
	}
    }

    var checklastresults = function() {
	var theresults = Computer.getlastresults();
	if(angular.isDefined(theresults.status)) {
	    $scope.lastresults = 1;
	    if(theresults['status']['error'] == 1){
		$scope.errortext = 'ERROR';
	    } else {
		$scope.errortext = 'OK';
	    }
	    $scope.resulttext = theresults['status']['text'];
	} else {
	    $scope.lastresults = 0;
	}
    }

    checklastresults();

    $scope.repos = [];
    $scope.showresults = 0;
    $scope.showdelete = 0;
    Computer.queryrepo({},function(data){
	$scope.repos = data;
	if(angular.isDefined($routeParams.how) && $routeParams.how == 'id') {
	    Computer.query({how:'id',key:$routeParams.id},function(data){
		$scope.processdata(data);
	    });
	} else {
	    $scope.showadd = 1;
	    $scope.showedit = 0;
	    Computer.queryrepo({},function(data){
		$scope.repos = data;
		if(angular.isDefined($routeParams.how) && $routeParams.how == 'new' && angular.isDefined($routeParams.id)) {
		    $scope.form_repo = $scope.repos[0];
		    angular.forEach($scope.repos,function(value,index) {
			if(value.id == $routeParams.id) {
			    $scope.form_repo = value;
			}
		    });
		} else  {
		    $scope.form_repo = $scope.repos[0];
		}
		$scope.form_rename_on_install = true;
	    });
	
	}

    });

//    $scope.ischecked = function(test) {
//	return test == 1;
//    };

    $scope.computer_update = function() {
	var mycomp = new Computer({ID:$scope.editindex});
	mycomp.name = $scope.form_name;
	mycomp.identifier = $scope.form_identifier;
	mycomp.repository_id = $scope.form_repo.id;
	mycomp.window = $scope.form_window;
	mycomp.forced_clientidentifier = $scope.form_forced_clientidentifier;
	mycomp.rename_on_install = $scope.form_rename_on_install;
	mycomp.$save({how:''}).then(function(data) {
	    if(angular.isDefined(data.status)) {
		Computer.setlastresults(data);
		checklastresults();
		if(data.status.error == 0) {
		    $location.url('/computers/search/repo/' + $scope.form_repo.id );
		}
	    }
	});
    };

    $scope.edit_cancel = function() {
	if($scope.form_repo.id != 0) {
	    $location.url('/computers/search/repo/' + $scope.form_repo.id );
	} else {
	    $location.url('/computers/search');
	}

    };

    $scope.computers_add = function() {
	var mycomp = new Computer();
	mycomp.name = $scope.form_name;
	mycomp.identifier = $scope.form_identifier;
	mycomp.repository_id = $scope.form_repo.id;
	mycomp.window = $scope.form_window;
	mycomp.forced_clientidentifier = $scope.form_forced_clientidentifier;
	mycomp.rename_on_install = $scope.form_rename_on_install;
	mycomp.$save({how:''},function(data) {
	    if(angular.isDefined(data.status)) {
		Computer.setlastresults(data);
		checklastresults();
	    }
	});
    };

    $scope.processdata = function(data) {
	$scope.form_name = data[0].name;
	$scope.form_identifier = data[0].identifier;
	$scope.form_repo = [];
	angular.forEach($scope.repos,function(value,index) {
	    if(value.id == data[0].repository_id) {
		$scope.form_repo = value;
	    }
	});
	$scope.repository_id = data[0].repository_id;
	$scope.form_window = data[0].window;
	$scope.form_forced_clientidentifier = data[0].forced_clientidentifier;
	if(data[0].rename_on_install == 1) {
	    $scope.form_rename_on_install = true;
	} else {
	    $scope.form_rename_on_install = false;
	}
	$scope.showadd = 0;
	$scope.showedit = 1;
    }
    
});
