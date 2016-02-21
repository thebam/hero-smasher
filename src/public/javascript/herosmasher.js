var heroApp = angular.module('SmasherApp', ['ngResource', 'ngRoute']);
heroApp.config(function ($routeProvider, $httpProvider) {
    $httpProvider.defaults.cache = false;
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }
    // disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';

    $routeProvider
        .when('/', {
            templateUrl: 'partials/home.html',
            controller: 'mainController'
        })
        .when('/add', {
            templateUrl: 'partials/admin-add.html',
            controller: 'addController'
        })
        .when('/character/:id/:userGenerated', {
            templateUrl: 'partials/admin-add.html',
            controller: 'addController'
        })
        .when('/delete/:id/:userGenerated', {
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
        .when('/about', {
            templateUrl: 'partials/about.html'
        })
        .when('/contact', {
            templateUrl: 'partials/contact.html'
        })
        .otherwise({
            redirectTo: '/'
        });
});

heroApp.controller('registerController', function ($scope, $location, $http) {
    $scope.register = function () {
        $http.post('/api/signUp', { email: $scope.email, password: $scope.password })
          .success(function (data, status) {
              if (status === 200 && data === true) {
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


heroApp.controller('loginController', function ($scope, $rootScope, $location, $http) {
    $scope.pageHeader = 'LOGIN';
    $scope.loggedIn = false;
    $scope.loading = false;

    $http({
        method: 'GET',
        url: '/api/checkAuth'
    }).then(function successCallback(response) {

        if (response.data === true) {
            $scope.loggedIn = true;
            $scope.pageHeader = 'LOGOUT';
        } else {
            $scope.loggedIn = false;
        }

    }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });





    $scope.login = function () {
        $scope.loading = true;
        $http.post('/api/signIn', { username: $scope.username, password: $scope.password })
          .success(function (data, status) {
              $scope.loading = false;
              if (status === 200 && data === true) {
                  $scope.pageHeader = 'LOGOUT';
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
        $http.get('/api/signOut', {})
          .success(function (data, status) {
              if (status === 200 && data === true) {
                  $location.path('/');
              }
          });
        $location.path('/');
    };
});

heroApp.controller('mainController', function ($http, $scope, $resource, $rootScope, $location, characterModel) {
    $scope.loggedIn = false;
    $scope.loading = true;
    characterModel.editChildCharacter = {};
    $http({
        method: 'GET',
        url: '/api/checkAuth'
    }).then(function successCallback(response) {

        if (response.data === true) {
            $scope.loggedIn = true;
        } else {
            $scope.loggedIn = false;
        }

    }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });
    var loadCharacterStart = 0;
    var loadCharacterLimit = 12;
    $scope.moreResults = false;
    var Characters = $resource('/api/select/' + loadCharacterStart + '/' + loadCharacterLimit);
    Characters.query(function (characters) {
        $scope.characters = characters;
        loadCharacterStart += characters.length;
        if (loadCharacterLimit === characters.length) {
            $scope.moreResults = true;
        } else {
            $scope.moreResults = false;
        }
        $scope.loading = false;
    });

    $scope.character1 = '';
    $scope.character2 = '';
    $scope.parent1 = '';
    $scope.parent2 = '';
    $scope.message = '';
    

    $scope.loadMoreCharacters = function () {
        $scope.loading = true;
        var Characters = $resource('/api/select/' + loadCharacterStart + '/' + loadCharacterLimit);
        Characters.query(function (characters) {
            $scope.characters = $scope.characters.concat(characters);
            loadCharacterStart += characters.length;
            if (loadCharacterLimit === characters.length) {
                $scope.moreResults = true;
            } else {
                $scope.message = 'all characters loaded.';
                $scope.moreResults = false;
            }
            $scope.loading = false;
        });
    };

    $scope.userGenerated = false;
    $scope.search = function () {
        if ($scope.searchString.length >= 2) {
            $scope.loading = true;
            var Characters = $resource('/api/search/' + $scope.searchString+'/'+$scope.userGenerated);
            Characters.query(function (characters) {
                if (characters.length > 0) {
                    $scope.characters = characters;
                    $scope.message = characters.length + ' character(s) found for \'' + $scope.searchString + '\'';
                    $scope.moreResults = false;
                } else {
                    $scope.characters = '';
                    $scope.message = 'no character found for \'' + $scope.searchString + '\'';
                    $scope.moreResults = false;
                }
                $scope.loading = false;
            });
        } else {
            $scope.characters = '';
            $scope.message = 'search term must be 2 letters or more';
            $scope.moreResults = false;
        }
    };

    $scope.randomBetween = function (lowNumber, highNumber) {
        return (Math.floor(Math.random() * ((highNumber - lowNumber) + 1) + lowNumber));
    };

    $scope.rankingRange = function (powerType) {
        var powerRange = [characterModel.rankingLowerLimit, characterModel.rankingUpperLimit];
        angular.forEach($scope.parent1.rankings, function (value, key) {
            if (value.category === powerType) {
                if (value.passable === 'true') {
                    powerRange[0] = Number(value.level);
                } else {
                    powerRange[0] = 1;
                }
            }
        });

        angular.forEach($scope.parent2.rankings, function (value, key) {
            if (value.category === powerType) {
                if (value.passable === 'true') {
                    if (Number(value.level) < powerRange[0]) {
                        powerRange[1] = powerRange[0];
                        powerRange[0] = Number(value.level);
                    } else {
                        powerRange[1] = Number(value.level);
                    }
                } else {
                    powerRange[1] = 1;
                }
            }
        });
        return powerRange;
    };


    Array.prototype.shuffle = function () {
        var input = this;

        for (var i = input.length - 1; i >= 0; i--) {

            var randomIndex = Math.floor(Math.random() * (i + 1));
            var itemAtIndex = input[randomIndex];

            input[randomIndex] = input[i];
            input[i] = itemAtIndex;
        }
        return input;
    };

    $scope.randomPowers = function () {
        var allPowers = [];
        var powers = { powers: [] };
        angular.forEach($scope.parent1.powers, function (value, key) {
            if (value.powerName !== 'No power') {
                allPowers.push(value.powerName);
            }
        });
        angular.forEach($scope.parent2.powers, function (value, key) {
            if (value.powerName !== 'No power') {
                allPowers.push(value.powerName);
            }
        });

        allPowers.shuffle();
        var childNumberPowers = $scope.randomBetween(1, allPowers.length);

        allPowers.splice(childNumberPowers, allPowers.length - childNumberPowers);


        var uniqueNames = [];
        $.each(allPowers, function (i, el) {
            if ($.inArray(el, uniqueNames) === -1) { uniqueNames.push(el); }
        });


        for (var x = 0; x < uniqueNames.length; x++) {
            powers.powers[x] = { id: x, powerName: uniqueNames[x] };
        }
        return powers.powers;
    };




    $scope.createCharacter = function () {
        var anomoly = Math.floor(Math.random() * 1000) + 1;
        var intelligenceRange = [characterModel.rankingLowerLimit, characterModel.rankingUpperLimit];
        var strengthRange = [characterModel.rankingLowerLimit, characterModel.rankingUpperLimit];
        var speedRange = [characterModel.rankingLowerLimit, characterModel.rankingUpperLimit];
        var durabilityRange = [characterModel.rankingLowerLimit, characterModel.rankingUpperLimit];
        var energyRange = [characterModel.rankingLowerLimit, characterModel.rankingUpperLimit];
        var fightingRange = [characterModel.rankingLowerLimit, characterModel.rankingUpperLimit];

        if (anomoly !== 369) {
            intelligenceRange = $scope.rankingRange('Intelligence');
            strengthRange = $scope.rankingRange('Strength');
            speedRange = $scope.rankingRange('Speed');
            durabilityRange = $scope.rankingRange('Durability');
            energyRange = $scope.rankingRange('Energy Projection');
            fightingRange = $scope.rankingRange('Fighting Skills');
        }

        if (!$scope.childCharacter) {
            $scope.childCharacter = JSON.parse(JSON.stringify(characterModel.character));
        }
        $scope.childCharacter.name = 'Unnamed Character';

        var tempAffinity = $scope.randomBetween(1, 3);
        switch (tempAffinity) {
            case 1:
                $scope.childCharacter.affinity = 'hero';
                break;
            case 2:
                $scope.childCharacter.affinity = 'villian';
                break;
            case 3:
                $scope.childCharacter.affinity = 'anti-hero';
                break;
        }


        $scope.childCharacter.rankings[0].level = $scope.randomBetween(intelligenceRange[0], intelligenceRange[1]).toString();
        $scope.childCharacter.rankings[1].level = $scope.randomBetween(strengthRange[0], strengthRange[1]).toString();
        $scope.childCharacter.rankings[2].level = $scope.randomBetween(speedRange[0], speedRange[1]).toString();
        $scope.childCharacter.rankings[3].level = $scope.randomBetween(durabilityRange[0], durabilityRange[1]).toString();
        $scope.childCharacter.rankings[4].level = $scope.randomBetween(energyRange[0], energyRange[1]).toString();
        $scope.childCharacter.rankings[5].level = $scope.randomBetween(fightingRange[0], fightingRange[1]).toString();

        $scope.childCharacter.powers = $scope.randomPowers();

        $('#myModal').modal('show');


    };

    $scope.isSelected = function (id) {

        if (id === $scope.character1 || id === $scope.character2) {
            return true;
        }
    };
    $scope.displayStats = '';

    $scope.showStats = function (id) {
        if ($scope.displayStats === id) {
            $scope.displayStats = '';
        } else {
            $scope.displayStats = id;
        }
    };
    $scope.statsShowed = function (id) {
        if (id === $scope.displayStats) {
            return true;
        }
    };

    $scope.hideStats = function (id) {
        return true;
    };


    $scope.combine = function (id) {
        if (id === $scope.character1) {
            $scope.character1 = '';
            return;
        }
        if (id === $scope.character2) {
            $scope.character2 = '';
            return;
        }

        if ($scope.character1.length === 0) {
            $scope.character1 = id;
        } else {
            $scope.character2 = id;
        }

        if ($scope.character1.length > 0 && $scope.character2.length > 0) {
            var Parent1 = $resource('/api/edit/:id/:userGenerated', { id: '@_id', userGenerated:false }, { get: { method: 'GET' } });
            Parent1.get({ id: $scope.character1 }, function (character) {
                $scope.parent1 = character;

                var Parent2 = $resource('/api/edit/:id/:userGenerated', { id: '@_id', userGenerated:false }, { get: { method: 'GET' } });
                Parent2.get({ id: $scope.character2 }, function (character) {
                    $scope.parent2 = character;
                    $scope.createCharacter();
                });
            });
        }
    };
    $scope.edit = function () {
        $scope.childCharacter.parents[0].parent = $scope.character1;
        $scope.childCharacter.parents[1].parent = $scope.character2;
        characterModel.editChildCharacter = $scope.childCharacter;
        $location.path('/add');
    };
});

heroApp.controller('deleteController', function ($http, $scope, $resource, $location, $routeParams) {
    
    
        var Characters = $resource('/api/delete/:id/:userGenerated');
        Characters.get({ id: $routeParams.id, userGenerated: $routeParams.userGenerated }, function (character) {
            $scope.character = character;
            
            
            if($routeParams.userGenerated){
    $http({
        method: 'GET',
        url: '/api/checkRights/'+character.name
    }).then(function successCallback(response) {
        if (response.data === true) {
            $scope.loggedIn = true;
            
        } else {
            $scope.loggedIn = false;
            $location.path('/');
        }
    }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });
}else{
    $http({
        method: 'GET',
        url: '/api/checkAuth'
    }).then(function successCallback(response) {
        if (response.data === true) {
            $scope.loggedIn = true;
            
        } else {
            $scope.loggedIn = false;
            $location.path('/');
        }
    }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });
}
            
            
            
        });

        $scope.delete = function () {
            Characters.delete({ id: $routeParams.id, userGenerated: $routeParams.userGenerated }, function (character) {
                $location.path('/');
            });
        };
    
});

heroApp.controller('addController', function ($http, $scope, $resource, $location, $routeParams, characterModel) {

    $scope.loggedIn = false;
    $scope.loading = false;
    $scope.editing = '';
    $scope.editSavedValue = '';
    $scope.edit = function (fieldName, val) {
        $scope.editSavedValue = JSON.stringify(val);
        $scope.editing = fieldName;
        if (fieldName === 'parent1') {
            $scope.changeParent(1);
        }
        if (fieldName === 'parent2') {
            $scope.changeParent(2);
        }
    };

    $scope.isEditing = function (fieldName, mode) {
        if ($routeParams.id) {
            if ($scope.editing === fieldName) {
                return true;
            } else {
                return false;
            }
        } else {
            if (mode === 'edit') {
                return false;
            } else {
                return true;
            }
        }
    };

    $scope.saveEditing = function () {
        $scope.editing = '';
    };

    $scope.cancelEditing = function (fieldName) {
        $scope.editing = '';
        switch (fieldName) {
            case 'name':
                $scope.character.name = JSON.parse($scope.editSavedValue);
                break;
            case 'affinity':
                $scope.character.affinity = JSON.parse($scope.editSavedValue);
                break;
            case 'image':
                $scope.character.images = [JSON.parse($scope.editSavedValue)];
                break;
            case 'ranking':
                $scope.character.rankings = JSON.parse($scope.editSavedValue);
                break;
            case 'power':
                $scope.character.powers = JSON.parse($scope.editSavedValue);
                break;
            case 'trait':
                $scope.character.traits = JSON.parse($scope.editSavedValue);
                break;
            case 'bio':
                $scope.character.biography = JSON.parse($scope.editSavedValue);
                break;
            case 'parent':
                $scope.character.parents = JSON.parse($scope.editSavedValue);
                if ($scope.character.parents) {
                    $scope.getCharacter($scope.character.parents[0].parent, 1);
                }
                if ($scope.character.parents) {
                    $scope.getCharacter($scope.character.parents[1].parent, 2);
                }
                break;
        }
        $scope.editSavedValue = '';
    };


    $scope.getCharacter = function (id, parentNumber) {
        if (id) {
            if (id.length > 0) {
                var tempCharacter = $resource('/api/edit/:id/:userGenerated', { id: '@_id', userGenerated:false }, { get: { method: 'GET' } });
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
    $scope.notfound = false;
    $scope.dynamicBG = '';
    $scope.userGenerated = $routeParams.userGenerated;
    var LoadCharacter;
    var displayForm = function () {
        if ($routeParams.id) {
            LoadCharacter = $resource('/api/edit/:id/:userGenerated', { id: '@_id', userGenerated: $routeParams.userGenerated }, { update: { method: 'PUT' } });
            LoadCharacter.get({ id: $routeParams.id, userGenerated:$routeParams.userGenerated }, function (character) {
                if (character._id) {
                    $scope.character = character;
                    if ($scope.character.images) {
                        if ($scope.character.images[0]) {
                            $scope.dynamicBG = $scope.character.images[0].image;
                        }
                    }
                    if ($scope.character.parents) {
                        $scope.getCharacter($scope.character.parents[0].parent, 1);
                    }
                    if ($scope.character.parents) {
                        $scope.getCharacter($scope.character.parents[1].parent, 2);
                    }
                } else {
                    $scope.notfound = true;
                }
            });
        } else {
            if ($scope.loggedIn === true) {

                if (characterModel.editChildCharacter.name) {
                    $scope.character = characterModel.editChildCharacter;
                } else {
                    $scope.character = JSON.parse(JSON.stringify(characterModel.character));
                }

                if ($scope.character.parents) {
                    $scope.getCharacter($scope.character.parents[0].parent, 1);
                }
                if ($scope.character.parents) {
                    $scope.getCharacter($scope.character.parents[1].parent, 2);
                }

            } else {
                $location.path('/login');
            }
        }
    };


if ($routeParams.id) {
    $http({
        method: 'GET',
        url: '/api/checkRights/'+$routeParams.id
    }).then(function successCallback(response) {
        if (response.data === true) {
            $scope.loggedIn = true;
        } else {
            $scope.loggedIn = false;
        }
        displayForm();
    }, function errorCallback(response) {
        $scope.loggedIn = false;
        //SERVER ERROR
    });
}else{
    $http({
        method: 'GET',
        url: '/api/checkAuth'
    }).then(function successCallback(response) {
        if (response.data === true) {
            $scope.loggedIn = true;
        } else {
            $scope.loggedIn = false;
        }
        displayForm();
    }, function errorCallback(response) {
        $scope.loggedIn = false;
        //SERVER ERROR
    });
}

    var powerCounter = 0;
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
                    characterModel.editChildCharacter = {};
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

    

    $scope.newImage = function ($event) {
        imageCounter++;
        $scope.character.images.push({ id: imageCounter, image: '' });
    };

    $scope.parentChangeNumber = 1;
    $scope.changeParent = function (parentNumber) {
        if (parentNumber === 1) {
            $scope.parentChangeNumber = 1;
            $scope.parentSelection = $scope.character.parents[0].parent;
        } else {
            $scope.parentChangeNumber = 2;
            $scope.parentSelection2 = $scope.character.parents[1].parent;
        }
    };

    $scope.updateParent = function (parentNumber) {
        if (parentNumber === 1) {
            $scope.getCharacter($scope.parentSelection, 1);
        } else {
            $scope.getCharacter($scope.parentSelection2, 2);
        }
    };

});

angular.module('SmasherApp').service('characterModel', function () {
    this.editChildCharacter = {};
    this.rankingLowerLimit = 1;
    this.rankingUpperLimit = 7;
    this.character = {
        name: '',
        affinity: '',
        rankings: [{ id: 0, category: 'Intelligence', origin: 'birth', level: '2', passable: 'true' },
        { id: 1, category: 'Strength', origin: 'birth', level: '2', passable: 'true' },
        { id: 2, category: 'Speed', origin: 'birth', level: '2', passable: 'true' },
        { id: 3, category: 'Durability', origin: 'birth', level: '2', passable: 'true' },
        { id: 4, category: 'Energy Projection', origin: 'birth', level: '1', passable: 'true' },
        { id: 5, category: 'Fighting Skills', origin: 'birth', level: '2', passable: 'true' }, ],
        powers: [{ id: 0, powerName: '' }],
        traits: [{ id: 0, trait: '' }],
        biography: '',
        images: [{ image: '' }],
        parents: [{ parent: '' }, { parent: '' }]
    };
});

