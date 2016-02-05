var heroApp = angular.module('SmasherApp', ['ngResource', 'ngRoute', 'ngCookies']);
heroApp.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'partials/home.html',
            controller: 'mainController'
        })
        .when('/add', {
            templateUrl: 'partials/admin-add.html',
            controller: 'addController'
        })
        .when('/character/:id', {
            templateUrl: 'partials/admin-add.html',
            controller: 'addController'
        })
        .when('/delete/:id', {
            templateUrl: 'partials/admin-delete.html',
            controller: 'deleteController'
        })
        .when('/login', {
            templateUrl: 'partials/login.html',
            controller: 'loginController'
        })
        .when('/register', {
            templateUrl: 'partials/register.html',
            controller: 'registerController'
        })
        .otherwise({
            redirectTo: '/'
        });
});

heroApp.controller('registerController', function ($cookies, $scope, $location, $http) {
    $scope.register = function () {
        $http.post('/api/signUp', { email: $scope.email, password: $scope.password })
          .success(function (data, status) {
              if (status === 200 && data === true) {
                  $cookies.put('autho', 'true');
                  $location.path('/');
              } else {
                  $scope.errorMessage = data;
              }
          })
          .error(function (data) {
              $scope.errorMessage = 'The account wasn\'t created due to a server error.';
          });
    };
});


heroApp.controller('loginController', function ($cookies, $scope, $rootScope, $location, $http) {
    $scope.pageHeader = 'LOGIN';
    $scope.loggedIn = false;
    var autho = $cookies.get('autho');
    if (autho === 'true') {
        $scope.loggedIn = true;
        $scope.pageHeader = 'LOGOUT';
    } else {
        $scope.loggedIn = false;
    }
    $scope.loading = false;
    $scope.login = function () {
        $scope.loading = true;
        $http.post('/api/signIn', { username: $scope.username, password: $scope.password })
          .success(function (data, status) {
              $scope.loading = false;
              if (status === 200 && data === true) {
                  $cookies.put('autho', 'true');
                  $location.path('/');
              } else {
                  $scope.errorMessage = data;
              }
          })
          .error(function (data) {
              $scope.loading = false;
              $scope.errorMessage = 'The account wasn\'t created due to a server error.';
          });
    };
    $scope.logout = function () {
        $cookies.put('autho', 'false');
        $http.get('/api/signOut', {})
          .success(function (data, status) {
              if (status === 200 && data === true) {
                  $location.path('/');
              }
          });
        $location.path('/');
    };
});

heroApp.controller('mainController', function ($http, $cookies, $scope, $resource, $rootScope, characterModel) {
    $scope.loggedIn = false;
    $scope.loading = true;

    $http({
        method: 'GET',
        url: '/api/checkAuth'
    }).then(function successCallback(response) {

        if (response.data === true) {

            $cookies.put('autho', 'true');
            $scope.loggedIn = true;
        } else {
            $cookies.put('autho', 'false');
            $scope.loggedIn = false;
        }

    }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });

    var Characters = $resource('/api');
    Characters.query(function (characters) {
        $scope.characters = characters;
        $scope.characterCnt = characters.length;


        $scope.columnLimit1 = Math.floor($scope.characterCnt / 3);
        if ($scope.characterCnt % 3) {
            $scope.columnLimit1++;
        }
        $scope.columnLimit2 = Math.floor(($scope.characterCnt - $scope.columnLimit1) / 2);
        if (($scope.characterCnt - $scope.columnLimit1) % 2) {
            $scope.columnLimit2++;
        }
        $scope.loading = false;
    });

    $scope.character1 = '';
    $scope.character2 = '';
    $scope.parent1 = '';
    $scope.parent2 = '';
    $scope.randomBetween = function (lowNumber, highNumber) {
        return (Math.floor(Math.random() * ((highNumber - lowNumber) + 1) + lowNumber));
    };

    $scope.rankingRange = function (powerType) {
        var powerRange = [1, 7];
        angular.forEach($scope.parent1.rankings, function (value, key) {
            if (value.category === powerType) {
                powerRange[0] = Number(value.level);
            }
        });

        angular.forEach($scope.parent2.rankings, function (value, key) {
            if (value.category === powerType) {
                if (Number(value.level) < powerRange[0]) {
                    powerRange[1] = powerRange[0];
                    powerRange[0] = Number(value.level);
                } else {
                    powerRange[1] = Number(value.level);
                }

            }
        });
        return powerRange;
    };

    $scope.createCharacter = function () {
        var anomoly = Math.floor(Math.random() * 1000) + 1;
        var intelligenceRange = [1, 7];
        var strengthRange = [1, 7];
        var speedRange = [1, 7];
        var durabilityRange = [1, 7];
        var energyRange = [1, 7];
        var fightingRange = [1, 7];

        if (anomoly !== 369) {
            intelligenceRange = $scope.rankingRange('Intelligence');
            strengthRange = $scope.rankingRange('Strength');
            speedRange = $scope.rankingRange('Speed');
            durabilityRange = $scope.rankingRange('Durability');
            energyRange = $scope.rankingRange('Energy Projection');
            fightingRange = $scope.rankingRange('Fighting Skills');
        }
        //alert(strengthRange);



        $scope.childCharacter = characterModel.character;
        $scope.childCharacter.name = 'New Character';

        $scope.childCharacter.rankings[0].level = $scope.randomBetween(intelligenceRange[0], intelligenceRange[1]);
        $scope.childCharacter.rankings[1].level = $scope.randomBetween(strengthRange[0], strengthRange[1]);
        $scope.childCharacter.rankings[2].level = $scope.randomBetween(speedRange[0], speedRange[1]);
        $scope.childCharacter.rankings[3].level = $scope.randomBetween(durabilityRange[0], durabilityRange[1]);
        $scope.childCharacter.rankings[4].level = $scope.randomBetween(energyRange[0], energyRange[1]);
        $scope.childCharacter.rankings[5].level = $scope.randomBetween(fightingRange[0], fightingRange[1]);

        //add powers

        //alert(JSON.stringify($scope.childCharacter));
        $('#myModal').modal('show');

    };
    
$scope.isSelected = function(id){
   
    if(id===$scope.character1 || id===$scope.character2){
        return true;
    }
};
    $scope.combine = function (id) {
        if(id===$scope.character1){
            $scope.character1 ="";
            return;
        }
        if(id===$scope.character2){
            $scope.character2 ="";
            return;
        }
        
        if ($scope.character1.length === 0) {
            $scope.character1 = id;
        } else {
            $scope.character2 = id;
        }

        if ($scope.character1.length > 0 && $scope.character2.length > 0) {
            var Parent1 = $resource('/api/edit/:id', { id: '@_id' }, { get: { method: 'GET' } });
            Parent1.get({ id: $scope.character1 }, function (character) {
                $scope.parent1 = character;

                var Parent2 = $resource('/api/edit/:id', { id: '@_id' }, { get: { method: 'GET' } });
                Parent2.get({ id: $scope.character2 }, function (character) {
                    $scope.parent2 = character;
                    $scope.createCharacter();
                });
            });
        }
    };
});

heroApp.controller('deleteController', function ($http, $cookies, $scope, $resource, $location, $routeParams) {
    var displayContent = function () {
        var Characters = $resource('/api/delete/:id');
        Characters.get({ id: $routeParams.id }, function (character) {
            $scope.character = character;
        });

        $scope.delete = function () {
            Characters.delete({ id: $routeParams.id }, function (character) {
                $location.path('/');
            });
        };
    };

    $http({
        method: 'GET',
        url: '/api/checkAuth'
    }).then(function successCallback(response) {
        if (response.data === true) {
            $cookies.put('autho', 'true');
            $scope.loggedIn = true;
            displayContent();
        } else {
            $cookies.put('autho', 'false');
            $scope.loggedIn = false;
            $location.path('/');
        }
    }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });
});

heroApp.controller('addController', function ($http, $cookies, $scope, $resource, $location, $routeParams, characterModel) {
    $scope.loggedIn = false;
    $scope.loading = false;

    $scope.getCharacter = function (id, parentNumber) {
        if (id) {
            if (id.length > 0) {
                var tempCharacter = $resource('/api/edit/:id', { id: '@_id' }, { get: { method: 'GET' } });
                tempCharacter.get({ id: id }, function (character) {
                    if (parentNumber === 1) {
                        $scope.parent1 = character;
                        $scope.character.parents[0].parent = $scope.parent1._id;
                    } else {
                        $scope.parent2 = character;
                        $scope.character.parents[1].parent = $scope.parent2._id;
                    }
                });
            }
        }
    };

    var Characters = $resource('/api');
    Characters.query(function (characters) {
        $scope.characters = characters;
    });
    $scope.character = {};
    $scope.parent1 = {};
    $scope.parent2 = {};
    $scope.showParentChange = false;

    var LoadCharacter;
    var displayForm = function () {
        if ($routeParams.id) {
            LoadCharacter = $resource('/api/edit/:id', { id: '@_id' }, { update: { method: 'PUT' } });
            LoadCharacter.get({ id: $routeParams.id }, function (character) {
                $scope.character = character;
                if ($scope.character.parents) {
                    $scope.getCharacter($scope.character.parents[0].parent, 1);
                }
                if ($scope.character.parents) {
                    $scope.getCharacter($scope.character.parents[1].parent, 2);
                }
            });


        } else {
            if ($scope.loggedIn === true) {
                $scope.character = characterModel.character;
            } else {
                $location.path('/login');
            }
        }
    };



    $http({
        method: 'GET',
        url: '/api/checkAuth'
    }).then(function successCallback(response) {
        if (response.data === true) {
            $cookies.put('autho', 'true');
            $scope.loggedIn = true;
        } else {
            $cookies.put('autho', 'false');
            $scope.loggedIn = false;
        }
        displayForm();
    }, function errorCallback(response) {
        $cookies.put('autho', 'false');
        $scope.loggedIn = false;
        //SERVER ERROR
    });
    
    
    var powerCounter = 0;
    var traitCounter = 0;
    var imageCounter = 0;

    $scope.save = function () {
        $scope.loading = true;
        if ($routeParams.id) {
            LoadCharacter.update($scope.character, function () {
                $scope.loading = false;
                $location.path('/');
            });
        } else {
            $http({
                method: 'POST',
                url: '/api',
                data: $scope.character
            }).then(function successCallback(response) {
                if (response.data === true && response.status === 200) {
                    $scope.loading = false;
                    $location.path('/');
                } else {
                    $scope.loading = false;
                    $scope.errorMessage = response.data;
                }
            }, function errorCallback(response) {
                $scope.errorMessage = 'Character not created due to server issue.';
            });
        }
    };




    $scope.newPower = function ($event) {
        powerCounter++;
        $scope.character.powers.push({ id: powerCounter, powerDesc: '' });
    };

    $scope.newTrait = function ($event) {
        traitCounter++;
        $scope.character.traits.push({ id: traitCounter, trait: '' });
    };

    $scope.newImage = function ($event) {
        imageCounter++;
        $scope.character.images.push({ id: imageCounter, image: '' });
    };

    $scope.parentChangeNumber = 1;
    $scope.changeParent = function (parentNumber) {
        $scope.showParentChange = true;
        if (parentNumber === 1) {
            $scope.parentChangeNumber = 1;
        } else {
            $scope.parentChangeNumber = 2;
        }
    };

    $scope.updateParent = function () {
        if ($scope.parentChangeNumber === 1) {
            $scope.getCharacter($scope.parentSelection, 1);
        } else {
            $scope.getCharacter($scope.parentSelection, 2);
        }
        $scope.showParentChange = false;
        $scope.parentSelection = '';
    };

});

angular.module('SmasherApp').service('characterModel', function () {
    this.character = {
        name: '',
        affinity: '',
        rankings: [{ id: 0, category: 'Intelligence', origin: 'birth', level: '2', passable: 'true' },
        { id: 1, category: 'Strength', origin: 'birth', level: '2', passable: 'true' },
        { id: 2, category: 'Speed', origin: 'birth', level: '2', passable: 'true' },
        { id: 3, category: 'Durability', origin: 'birth', level: '2', passable: 'true' },
        { id: 4, category: 'Energy Projection', origin: 'birth', level: '1', passable: 'true' },
        { id: 5, category: 'Fighting Skills', origin: 'birth', level: '2', passable: 'true' }, ],
        powers: [{ id: 0, powerDesc: '' }],
        traits: [{ id: 0, trait: '' }],
        biography: '',
        images: [{ image: '' }],
        parents: [{ parent: '' }, { parent: '' }]
    };
});