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
            templateUrl: 'partials/admin-add.html',
            controller: 'addController'
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


heroApp.controller('mainController', function ($scope, $resource,characterModel) {
   
    var Characters = $resource('/api');
    Characters.query(function (characters) {
        $scope.characters = characters;
        $scope.characterCnt = characters.length;
        $scope.columnLimit1 = Math.floor($scope.characterCnt/3);
        $scope.columnLimit2 = Math.floor($scope.characterCnt/3) + Math.floor($scope.characterCnt/3);
    });
    $scope.character1 = "";
    $scope.character2 = "";
    $scope.parent1 = "";
    $scope.parent2 = "";
    $scope.randomBetween = function(lowNumber,highNumber){
        return(Math.floor(Math.random() * ((highNumber-lowNumber)+1) + lowNumber));
    };
    
    $scope.rankingRange = function(powerType){
        var powerRange = [1,7]
        angular.forEach($scope.parent1.rankings, function(value, key) {
        if (value.category ===powerType) {
                powerRange[0] = Number(value.level);
            }
        });
        
        angular.forEach($scope.parent2.rankings, function(value, key) {
        if (value.category ===powerType) {
            if(Number(value.level)<powerRange[0]){
                powerRange[1] = powerRange[0];
                powerRange[0] = Number(value.level);
            }else{
                powerRange[1] = Number(value.level);
            }
                
            }
        });
        return powerRange;
    };
    
    $scope.createCharacter = function(){
        var anomoly = Math.floor(Math.random() * 1000) + 1;
        var intelligenceRange = [1,7];
        var strengthRange = [1,7];
        var speedRange = [1,7];
        var durabilityRange = [1,7];
        var energyRange = [1,7];
        var fightingRange = [1,7];
        
        
        intelligenceRange = $scope.rankingRange("Intelligence");
        strengthRange = $scope.rankingRange("Strength");
        speedRange = $scope.rankingRange("Speed");
        durabilityRange = $scope.rankingRange("Durability");
        energyRange = $scope.rankingRange("EnergyProjection");
        fightingRange = $scope.rankingRange("FightingSkills");
        
        //alert(strengthRange);
        
        
          
        $scope.childCharacter = characterModel.character;
        $scope.childCharacter.name = "New Character";
        
        $scope.childCharacter.rankings[0].level = $scope.randomBetween(intelligenceRange[0],intelligenceRange[1]);
        $scope.childCharacter.rankings[1].level = $scope.randomBetween(strengthRange[0],strengthRange[1]);
        $scope.childCharacter.rankings[2].level = $scope.randomBetween(speedRange[0],speedRange[1]);
        $scope.childCharacter.rankings[3].level = $scope.randomBetween(durabilityRange[0],durabilityRange[1]);
        $scope.childCharacter.rankings[4].level = $scope.randomBetween(energyRange[0],energyRange[1]);
        $scope.childCharacter.rankings[5].level = $scope.randomBetween(fightingRange[0],fightingRange[1]);
        //alert(JSON.stringify($scope.childCharacter));
        $('#myModal').modal('show');
        
    }
    
    $scope.combine = function(id){
        if($scope.character1.length == 0){
            $scope.character1 = id;
        }else{
            $scope.character2 = id;
        }
        
        if($scope.character1.length>0 && $scope.character2.length>0){
            var Parent1 = $resource('/api/edit/:id', { id: '@_id' }, { get: {method:'GET'}});
            Parent1.get({ id: $scope.character1 }, function (character) {
                $scope.parent1 = character;
                
                
                var Parent2 = $resource('/api/edit/:id', { id: '@_id' }, { get: {method:'GET'}});
                Parent2.get({ id: $scope.character2 }, function (character) {
                    $scope.parent2 = character;
                    
                     $scope.createCharacter();
                });
                
            });
            
            
            
            
            
            //get char1
            //get char2
            
            /*
            create char3
            anomoly - yes or no : random
            if not anomoly 
                strength - random between char1 & char2
                speed - random between char1 & char2
                intelligence - random between char1 & char2
                durability - random between char1 & char2
                energy projection - random between char1 & char2
                fighting skill - random between char1 & char2
                trait - random from char1 and char2
            else
                strength - random bewteen min and max
                speed - random between min and max
                intelligence - random between min and max
                durability - random between min and max
                energy projection - random between min and max
                fighting skill - random between min and max
                trait - random
            */
            
            
            
        }
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

heroApp.controller('addController', function ($scope, $resource, $location, $routeParams,characterModel) {
    if($routeParams.id){
        var Characters = $resource('/api/edit/:id', { id: '@_id' }, { update: {method:'PUT'}});
        Characters.get({ id: $routeParams.id }, function (character) {
            $scope.character = character;
        });
        
        $scope.save = function () {
            Characters.update($scope.character, function () {
                $location.path('/');
            });
        };
    }else{
        $scope.character = characterModel.character;
        $scope.save = function () {
            var Characters = $resource('/api');
            Characters.save($scope.character, function () {
                $location.path('/');
            });
        };
    }
   $scope.getCharacter = function(id){
            var tempCharacter = $resource('/api/edit/:id', { id: '@_id' }, { get: {method:'GET'}});
            tempCharacter.get({ id: id }, function (character) {
                alert(JSON.stringify(character));
                return character;
            });
    };
    
    $scope.parent1 = characterModel.character;
    $scope.parent2 = characterModel.character;
    $scope.parent1 = $scope.getCharacter($scope.character.parents[0].parent);
    
    
    
    var powerCounter = 0;
    var traitCounter = 0;
    var imageCounter = 0;
    

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
    
    
    
    
    
});

angular.module('SmasherApp').service("characterModel", function() {
    this.character = { 
        name: '', 
        affinity: '',
        rankings: [{ id: 0, category: 'Intelligence', origin: '', level: '2', passable: 'true' },
        { id: 1, category: 'Strength', origin: '', level: '2', passable: 'true' },
        { id: 2, category: 'Speed', origin: '', level: '2', passable: 'true' },
        { id: 3, category: 'Durability', origin: '', level: '2', passable: 'true' },
        { id: 4, category: 'EnergyProjection', origin: '', level: '1', passable: 'true' },
        { id: 5, category: 'FightingSkills', origin: '', level: '2', passable: 'true' },],
        
        
        powers: [{ id: 0, powerDesc: '' }], 
        
        traits: [{ id: 0, trait: '' }], 
        biography: '', 
        images: [{ image: '' }],
        parents:[{parent:'56af3cdffc0f0fb41beb6bee'},{parent:'56af3cdffc0f0fb41beb6bee'}] };
})