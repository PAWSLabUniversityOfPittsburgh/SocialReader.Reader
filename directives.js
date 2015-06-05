(function () {
    'use strict';
    
    var parentModule = (typeof window.parentModule === 'undefined') ? "" : window.parentModule;
    var componentPath = (typeof window.componentPath === 'undefined') ? "" : window.componentPath;

    var directivesModule = angular.module(parentModule);

    reader.$inject = [];
    directivesModule.directive('reader', reader);

    function reader(angularLoad) {

        var directive = {
            link: link,
            scope: {},
            controller: controller,
            controllerAs: 'vm',
            require: ['^'+parentModule, 'reader'],
            templateUrl: componentPath + 'SocialReader.Reader/template.html',
            restrict: 'A'
        };
        
        return directive;

        function link(scope, element, attrs, controllers) {
            var managerController = controllers[0];
            var readerController = controllers[1];
            
            readerController.manager = managerController;
            
            readerController.initialize(scope);
        }
        
        function controller() {
            var vm = this;
            
            // Properties
            vm.manager = {};
            vm.item = { id: -1, name: "", size: "" };
            
            // Methods
            vm.initialize = initialize;
            vm.updateItem = updateItem;
            vm.editItem = editItem;
            
            vm.srRSetToolbarVis = false;
            vm.srRSetBtnCommentsVis = true;
            vm.srRSetBtnTextCommentVis= true;
            vm.srRSetBtnFloatSquareCommentVis = true;
            vm.srRSetBtnCommentSummaryVis= false;
            vm.srRSetBtnNextVis = true;
            vm.srRSetBtnPrevVis = true;

            // Functions

            function srRShowComments()
            {
                srRBuild(vm.readingid,true);
            }

            function srRHideComments()
            {
                srRBuild(vm.readingid,false);
            }

            function srRShowCommentSummary(){
                vm.srRSetBtnCommentSummaryVis = true;
                $("#dvStat").show();
            }

            function srRHideCommentSummary(){
                vm.srRSetBtnCommentSummaryVis = false;
                $("#dvStat").hide();  
            }

            function srRGoToNextReading(){
                srRBuild(vm.nextreadingid,true);
            }

            function srRGoToPrevReading(){
                srRBuild(vm.lastreadingid,true);
            }

            function srRBuild(creadingid,commentsvisible) {
                $.ajax({
                    url: vm.base_url + 'GetReadingInfo',
                    type: 'post',
                    dataType: 'jsonp',
                    data: { readingid: creadingid },
                    success: function (json) {
                        if (!json.error) {
                            vm.url = json.urls[0];
                            vm.lastreadingid = json.prev;
                            vm.nextreadingid = json.next;
                            $.get(vm.url, function( data ) {
                                data = data.replace(/(href=)([^>]+)/g,"$1#");
                                $("#dvContent").html(data);
                            });
                            $("#btnLast").click(function(){
                                srRGoToPrevReading();
                            });

                            $("#btnNext").click(function(){
                                srRGoToNextReading();
                            });
                            if(commentsvisible){
                                //annotator
                                var content = $($(".ng-isolate-scope")[1]).annotator();
                                content.annotator('addPlugin', 'Store', {
                                    prefix: "http://columbus.exp.sis.pitt.edu/socialreader",
                                    urls:{create:"/CreateAnnotation",search:"/GetAnnotations"},
                                    annotationData: {
                                        'uri': 'http://this/document/only',
                                        "usr": + vm.usr,
                                        "grp": + vm.grp,
                                        "fileurl": + vm.url,
                                        "page": + vm.page,
                                        "readingid":vm.readingid
                                    },
                                    loadFromSearch: {
                                        'limit': 20,
                                        'uri': 'http://this/document/only',
                                        "usr": + vm.usr,
                                        "grp": + vm.grp,
                                        "fileurl": + vm.url,
                                        "page": + vm.page,
                                        "readingid":vm.readingid
                                    }
                                });
                            }
                            
                            //annotation stat
                            $("#dvStat").hide();
                            $("#btnStat").click(
                                function(){
                                    if(vm.srRSetBtnCommentSummaryVis){
                                        srRHideCommentSummary();
                                    }else{
                                        srRShowCommentSummary();
                                    }
                                }
                            );
    

                        } else {
                            console.log("ERROR: " + json.error);
                        }
                    }
                });
            }

            function initialize(scope) {

                scope.componentPath = componentPath;

                vm.manager.respondToEditsWith(vm.editItem);
                vm.readingid = 'lewis-0077';
                vm.nextreadingid = 'lewis-0076';
                vm.lastreadingid = 'lewis-0078';
                vm.base_url = 'http://columbus.exp.sis.pitt.edu/socialreader/';
                vm.usr = 10; 
                vm.grp = 6; 
                vm.sid = 1;
                vm.url = null; 
                vm.page = 0;

                srRBuild(vm.readingid,true);

            }
            
            function updateItem() {
                vm.manager.updateItem(vm.item);
                vm.item = {};
            }
            
            function editItem(item) {
                vm.item.id = item.id;
                vm.item.name = item.name;
                vm.item.size = item.size;
            }
        }
    }
}());
