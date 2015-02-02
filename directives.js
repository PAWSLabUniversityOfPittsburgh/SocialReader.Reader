(function () {
    'use strict';
    
    var parentModule = (typeof window.parentModule === 'undefined') ? "" : window.parentModule;
    var componentPath = (typeof window.componentPath === 'undefined') ? "" : window.componentPath;

    var directivesModule = angular.module(parentModule);
    directivesModule.directive('itemEditor', itemEditor);

    itemEditor.$inject = [];

    function itemEditor() {

        var directive = {
            link: link,
            scope: {},
            controller: controller,
            controllerAs: 'vm',
            require: ['^'+parentModule, 'itemEditor'],
            templateUrl: componentPath + 'SocialReader.Reader/template.html',
            restrict: 'A'
        };
        
        return directive;

        function link(scope, element, attrs, controllers) {
            var managerController = controllers[0];
            var itemEditorController = controllers[1];
            
            itemEditorController.manager = managerController;
            
            itemEditorController.initialize();
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
            
            // Functions
            function initialize() {
                vm.manager.respondToEditsWith(vm.editItem);
                var base_url = 'http://columbus.exp.sis.pitt.edu/socialreader/';
                var usr = 10, grp = 6, sid = 1;
                var url = null, page = 0;
                var readingid = 'lewis-0077', nextreadingid = 'lewis-0076', lastreadingid = 'lewis-0078';
                loadIframe(readingid);
                function loadIframe(readingid) {
                    $.ajax({
                        url: base_url + 'GetReadingInfo',
                        type: 'post',
                        dataType: 'jsonp',
                        data: { readingid: readingid },
                        success: function (json) {
                            if (!json.error) {
                                url = json.urls[0];
                                lastreadingid = json.prev;
                                nextreadingid = json.next;
                                url = "6-3.html"
                                $("#dvContent").load(url);
     

                            } else {
                                console.log("ERROR: " + json.error);
                            }
                        }
                    });
                }

                var content = $('body').annotator();
                content.annotator('addPlugin', 'Store', {
                    prefix: "http://columbus.exp.sis.pitt.edu/socialreader",
                    urls:{create:"/CreateAnnotation",search:"/GetAnnotations"},
                    annotationData: {
                        'uri': 'http://this/document/only',
                        "usr": + usr,
                        "grp": + grp,
                        "fileurl": + url,
                        "page": + page,
                        "readingid":readingid
                    },
                    loadFromSearch: {
                        'limit': 20,
                        'uri': 'http://this/document/only',
                        "usr": + usr,
                        "grp": + grp,
                        "fileurl": + url,
                        "page": + page,
                        "readingid":readingid
                    }
                }); 
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
