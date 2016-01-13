// We use an "Immediate Function" to initialize the application to avoid leaving anything behind in the global scope
(function () {

    // use Handlebars to compile templates:
    HomeView.prototype.template = Handlebars.compile($("#home-tpl").html());
    ResourceListView.prototype.template = Handlebars.compile($("#resource-list-tpl").html());
    ResourceView.prototype.template = Handlebars.compile($("#resource-tpl").html());
    SplashView.prototype.template = Handlebars.compile($("#splash-tpl").html());
    LoginView.prototype.template = Handlebars.compile($("#login-tpl").html());

    var slider = new PageSlider($('body'));

    document.addEventListener("deviceready", onDeviceReady, false);

    var service = null;

    function onDeviceReady() {
        console.log("inside onDeviceReady()");

        // register FastClick fix for 300ms delay on IOS devices:
        FastClick.attach(document.body);

        // StatusBar.overlaysWebView(false);
        // StatusBar.backgroundcolorByHexString('#ffffff');
        // StatusBar.styleDefault();

        service = new PasswordsService();
        service.init().done(function() {

            router.addRoute('', function() {
                slider.slidePage(new LoginView(service).render().$el);
            });

            router.addRoute('home', function() {
                slider.slidePage(new HomeView(service).render().$el);
            });

            router.addRoute('resources/:id', function(id) {
                service.findById(parseInt(id)).done(function(resource) {
                    slider.slidePage(new ResourceView(service, resource).render().$el);
                })
            });

            router.addRoute('splash', function() {
                slider.slidePage(new SplashView().render().$el);
            });

            router.start();
        });
    }

    /* --------------------------------- Event Registration -------------------------------- */

    // $('.search-key').on('keyup', findResources);
    // $('.help-btn').on('click', function() {
    //     alert("APass v2.0");
    // });

    /* ---------------------------------- Local Functions ---------------------------------- */
    function findResources() {
        alert("inside findResources.  search-key is: [" + $('.search-key').val() + "]");
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