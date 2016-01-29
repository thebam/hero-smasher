var heroApp = angular.module('SmasherApp', ['ngResource', 'ngRoute']);
heroApp.config(function ($routeProvider) {
    $routeProvider
        .when('/',{
            templateUrl: 'partials/home.html',
            controller: 'mainController'
        })
        .when('/admin', {
            templateUrl: 'partials/admin-home.html',
            controller: 'adminController'
        })
        .when('/add', {
            templateUrl: 'partials/admin-add.html',
            controller: 'addController'
        })
        .when('/character/:id', {
            templateUrl: 'partials/admin-edit.html',
            controller: 'editController'
        })
        .when('/delete/:id', {
            templateUrl: 'partials/admin-delete.html',
            controller: 'deleteController'
        })
        .otherwise({
            redirectTo: '/'
        });
});

heroApp.controller('adminController', function ($scope,$resource) {
    var Characters = $resource('/api');
    Characters.query(function (characters) {
        $scope.characters = characters;
    });    
});

heroApp.controller('mainController', function ($scope, $resource) {
    var Characters = $resource('/api');
    Characters.query(function (characters) {
        $scope.characters = characters;
    });
});

heroApp.controller('editController', function ($scope, $resource, $location, $routeParams) {
    var Characters = $resource('/api/edit/:id', { id: '@_id' }, { update: {method:'PUT'}});
    Characters.get({ id: $routeParams.id }, function (character) {
        $scope.character = character;
    });

    var powerCounter = 0;
    var traitCounter = 0;
    var imageCounter = 0;
    $scope.character = { name: '', powers: [{ id: powerCounter, powerName: '', origin: 'birth', level: '1', passable: 'true' }], traits: [{ id: traitCounter, trait: '' }], biography: '', images: [{ image: '' }] };


    $scope.newPower = function ($event) {
        powerCounter++;
        $scope.character.powers.push({ id: powerCounter, powerName: '', origin: 'birth', level: '1', passable: 'true' });
    };

    $scope.newTrait = function ($event) {
        traitCounter++;
        $scope.character.traits.push({ id: traitCounter, trait: '' });
    };

    $scope.newImage = function ($event) {
        imageCounter++;
        $scope.character.images.push({ id: imageCounter, image: '' });
    };


    $scope.save = function () {
        Characters.update($scope.character, function () {
            $location.path('/');
        });
    };
});

heroApp.controller('deleteController', function ($scope, $resource, $location, $routeParams) {
    var Characters = $resource('/api/delete/:id');
    Characters.get({ id: $routeParams.id }, function (character) {
        $scope.character = character;
    });

    $scope.delete = function () {
        Characters.delete({ id: $routeParams.id }, function (character) {
            $location.path('/');
        });
    };
});

heroApp.controller('addController', function ($scope, $resource, $location) {
    var powerCounter = 0;
    var traitCounter = 0;
    var imageCounter = 0;
    $scope.character = { name: '', powers: [{ id: powerCounter, powerName: '', origin: 'birth', level: '1', passable: 'true' }], traits: [{ id: traitCounter, trait: '' }], biography: '', images: [{image:''}] };
    

    $scope.newPower = function ($event) {
        powerCounter++;
        $scope.character.powers.push({ id: powerCounter, powerName: '', origin: 'birth', level: '1', passable: 'true' });
    };

    $scope.newTrait = function ($event) {
        traitCounter++;
        $scope.character.traits.push({ id: traitCounter, trait: '' });
    };

    $scope.newImage = function ($event) {
        imageCounter++;
        $scope.character.images.push({ id: imageCounter, image: '' });
    };



    $scope.save = function () {
        var Characters = $resource('/api');
        Characters.save($scope.character, function () {
            $location.path('/');
        });
    };
});