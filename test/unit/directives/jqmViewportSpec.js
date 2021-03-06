"use strict";
describe('jqmViewport', function () {
    var ng, jqm, somePage;

    function init(transition) {
        somePage = '/somePage';

        ng.init({
            '': { template: '<div jqm-page>initPage</div>' },
            '/somePage': {
                transition: transition,
                template: '<div jqm-page>somePage</div>'
            }
        });
        jqm.init({
            '': { template: '<div data-role="page"><div data-role="content">initPage</div></div>' },
            '/somePage': {
                transition: transition,
                template: '<div data-role="page"><div data-role="content">somePage</div></div>'
            }
        });
    }

    beforeEach(function () {
        ng = testutils.ng;
        jqm = testutils.jqm;
    });

    describe('with animations', function () {
        beforeEach(function () {
            ng.enableTransitions(true);
            jqm.enableTransitions(true);
        });

        describe('markup', function () {
            it('generates same markup as jqm for none transition', function () {
                init('none');
                // check state on startup
                expect(ng.activePage().text()).toBe('initPage');
                expect(jqm.activePage().text()).toBe('initPage');
                testutils.compareElementRecursive(ng.viewPort, jqm.viewPort);

                // go to second page
                ng.beginTransitionTo(somePage);
                jqm.beginTransitionTo(somePage);
                testutils.compareElementRecursive(ng.viewPort, jqm.viewPort);
                expect(ng.activePage().text()).toBe('somePage');
                expect(jqm.activePage().text()).toBe('somePage');

                // go back
                jqm.historyGo(-1);
                expect(jqm.activePage().text()).toBe('initPage');
                ng.historyGo(-1);
                expect(ng.activePage().text()).toBe('initPage');
            });

            it('generates same markup as jqm during sequential transitions', function () {
                init('fade');
                // check state on startup
                expect(ng.activePage().text()).toBe('initPage');
                expect(jqm.activePage().text()).toBe('initPage');
                testutils.compareElementRecursive(ng.viewPort, jqm.viewPort);

                // go to second page
                ng.beginTransitionTo(somePage);
                jqm.beginTransitionTo(somePage);
                testutils.compareElementRecursive(ng.viewPort, jqm.viewPort);
                ng.fireAnimationEndEvents();
                jqm.fireAnimationEndEvents();
                testutils.compareElementRecursive(ng.viewPort, jqm.viewPort);
                ng.fireAnimationEndEvents();
                jqm.fireAnimationEndEvents();
                testutils.compareElementRecursive(ng.viewPort, jqm.viewPort);
                expect(ng.activePage().text()).toBe('somePage');
                expect(jqm.activePage().text()).toBe('somePage');

                // go back
                jqm.historyGo(-1);
                ng.historyGo(-1);
                testutils.compareElementRecursive(ng.viewPort, jqm.viewPort);
                ng.fireAnimationEndEvents();
                jqm.fireAnimationEndEvents();
                testutils.compareElementRecursive(ng.viewPort, jqm.viewPort);
                ng.fireAnimationEndEvents();
                jqm.fireAnimationEndEvents();
                testutils.compareElementRecursive(ng.viewPort, jqm.viewPort);
                expect(jqm.activePage().text()).toBe('initPage');
                expect(ng.activePage().text()).toBe('initPage');

            });
            it('generates same markup as jqm during parallel transitions', function () {
                init('slide');
                // check state on startup
                expect(ng.activePage().text()).toBe('initPage');
                expect(jqm.activePage().text()).toBe('initPage');
                testutils.compareElementRecursive(ng.viewPort, jqm.viewPort);

                // go to second page
                ng.beginTransitionTo(somePage);
                jqm.beginTransitionTo(somePage);
                testutils.compareElementRecursive(ng.viewPort, jqm.viewPort);
                ng.fireAnimationEndEvents();
                jqm.fireAnimationEndEvents();
                testutils.compareElementRecursive(ng.viewPort, jqm.viewPort);
                expect(ng.activePage().text()).toBe('somePage');
                expect(jqm.activePage().text()).toBe('somePage');

                // go back
                jqm.historyGo(-1);
                ng.historyGo(-1);
                testutils.compareElementRecursive(ng.viewPort, jqm.viewPort);
                ng.fireAnimationEndEvents();
                jqm.fireAnimationEndEvents();
                testutils.compareElementRecursive(ng.viewPort, jqm.viewPort);
                expect(ng.activePage().text()).toBe('initPage');
                expect(jqm.activePage().text()).toBe('initPage');
            });
        });

    });

    describe('without animations', function() {
        beforeEach(function () {
            ng.enableTransitions(false);
            jqm.enableTransitions(false);
        });
        it('generates same markup as jqm', function () {
            init('fade');
            // check state on startup
            expect(ng.activePage().text()).toBe('initPage');
            expect(jqm.activePage().text()).toBe('initPage');
            testutils.compareElementRecursive(ng.viewPort, jqm.viewPort);

            // go to second page
            ng.beginTransitionTo(somePage);
            jqm.beginTransitionTo(somePage);
            testutils.compareElementRecursive(ng.viewPort, jqm.viewPort);
            expect(ng.activePage().text()).toBe('somePage');
            expect(jqm.activePage().text()).toBe('somePage');

            // go back
            jqm.historyGo(-1);
            expect(jqm.activePage().text()).toBe('initPage');
            ng.historyGo(-1);
            expect(ng.activePage().text()).toBe('initPage');
        });

    });

    describe('details', function () {
        it("uses 'none' transition by default", inject(function () {
            var ng = testutils.ng,
                newRoute = { };
            ng.init('<div jqm-page></div>');
            ng.scope.$emit("$routeChangeStart", newRoute);
            expect(ng.viewPort.attr("ng-animate")).toBe("'jqmPage-none'");
        }));
        it("allows a function as transition on routes and injects it with locals $routeParams and $scope", inject(function () {
            var ng = testutils.ng,
                newRoute = {
                    params: { someParam: 'someTransition'},
                    transition: function($routeParams, $scope) {
                        return $routeParams.someParam + $scope.someValue;
                    }
                };
            ng.init('<div jqm-page></div>');
            ng.scope.$apply('someValue="Thing"');
            ng.scope.$emit("$routeChangeStart", newRoute);
            expect(ng.viewPort.attr("ng-animate")).toBe("'jqmPage-someTransitionThing'");
        }));
        //Describe is just so we can do the beforeEach and make a factory
        describe('', function() {
            beforeEach(module(function($provide) {
                $provide.factory('TestService', function() {
                    return {};
                });
            }));
            it("allows a function as transition on routes and injects it with injectable things", inject(function (TestService) {
                var ng = testutils.ng,
                    newRoute = {
                        transition: function(TestService) {
                            return TestService.someValue;
                        }
                    };
                TestService.someValue = 'banana';
                ng.init('<div jqm-page></div>');
                ng.scope.$emit("$routeChangeStart", newRoute);
                expect(ng.viewPort.attr("ng-animate")).toBe("'jqmPage-banana'");
            }));
        });
        it("allows a function as transition on routes and injects it with the viewport $scope", inject(function () {
            var ng = testutils.ng,
                newRoute = {
                    transition: function($scope) {
                        return $scope.superman;
                    }
                };
            ng.init('<div jqm-page></div>');
            ng.scope.superman = 'kryptonite';
            ng.scope.$apply();
            ng.scope.$emit("$routeChangeStart", newRoute);
            expect(ng.viewPort.attr("ng-animate")).toBe("'jqmPage-kryptonite'");
        }));
        it("saves the current route's transition into the history entry", inject(function ($history) {
            var ng = testutils.ng,
                newRoute = { transition: 'newTransition' };
            ng.init('<div jqm-page></div>');

            $history.urlStack = [
                {},
                {},
                {}
            ];
            $history.activeIndex = 1;
            ng.scope.$emit("$routeChangeStart", newRoute);
            expect($history.urlStack[1].transition).toBe(newRoute.transition);
        }));
        it('uses the transition from the historyEntry with reverse flag when going back', inject(function ($history) {
            var ng = testutils.ng,
                newRoute = { transition: 'newTransition' };
            ng.init('<div jqm-page></div>');

            $history.urlStack = [
                {},
                {
                    transition: 'originalTransition'
                }
            ];
            $history.activeIndex = 0;
            $history.previousIndex = 1;
            ng.scope.$emit("$routeChangeStart", newRoute);
            expect(ng.viewPort.attr("ng-animate")).toBe("'jqmPage-originalTransition-reverse'");
        }));
    });
});
