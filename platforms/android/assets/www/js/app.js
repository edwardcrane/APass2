// We use an "Immediate Function" to initialize the application to avoid leaving anything behind in the global scope
(function () {

    if(typeof document === 'undefined') {
        alert("document is undefined");
    }

    document.addEventListener("deviceready", onDeviceReady, false);

    var service = null;

    function onDeviceReady() {
        console.log("inside onDeviceReady()");
        console.log("sqlitePlugin property names: [" + Object.getOwnPropertyNames(window.sqlitePlugin).sort() + "]");
        service = new PasswordsService();
        service.init();
        // service.initialize().done(function() {
        //     alert("Service initialized");
        // })
    }

    // /* ---------------------------------- Local Variables ---------------------------------- */
    // var service = new EmployeeService();
    // service.initialize().done(function () {
    //     console.log("Service initialized");
    // });

    /* --------------------------------- Event Registration -------------------------------- */

    $('.search-key').on('keyup', findByName);
    $('.help-btn').on('click', function() {
        alert("APass v2.0");
    });

    /* ---------------------------------- Local Functions ---------------------------------- */
    function findByName() {
        service.findResources($('.search-key').val()).done(function (resources) {
            var l = resources.length;
            var r;
            $('.resource-list').empty();
            for (var i = 0; i < l; i++) {
                r = resources[i];
                $('.resource-list').append('<li><a href="#resources/' + r._id + '">' + r.resourcename + ' ' + r.description + '</a></li>');
            }
        });
    }

}());