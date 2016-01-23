// We use an "Immediate Function" to initialize the application to avoid leaving anything behind in the global scope
(function () {

    // use Handlebars to compile templates:
    HomeView.prototype.template = Handlebars.compile($("#home-tpl").html());
    ResourceListView.prototype.template = Handlebars.compile($("#resource-list-tpl").html());
    ResourceView.prototype.template = Handlebars.compile($("#resource-tpl").html());
    SplashView.prototype.template = Handlebars.compile($("#splash-tpl").html());
    LoginView.prototype.template = Handlebars.compile($("#login-tpl").html());
    RegisterView.prototype.template = Handlebars.compile($("#register-tpl").html());

    var slider = new PageSlider($('body'));

    document.addEventListener("deviceready", onDeviceReady, false);

    var service = null;

    function onDeviceReady() {
        console.log("inside onDeviceReady()");

        // document.addEventListener("backbutton", onBackKeyDown, false);

        // register FastClick fix for 300ms delay on IOS devices:
        FastClick.attach(document.body);

        // StatusBar.overlaysWebView(false);
        // StatusBar.backgroundcolorByHexString('#ffffff');
        // StatusBar.styleDefault();

        loginService = new LoginService();
        loginService.init().done(function() {
            console.log("loginService is initialized");
        });

        passwordsService = new PasswordsService();
        passwordsService.init().done(function() {

            router.addRoute('login', function() {
                slider.slidePage(new LoginView(loginService).render().$el);
            });

            router.addRoute('home', function() {
                slider.slidePage(new HomeView(loginService, passwordsService).render().$el);
            });

            router.addRoute('resources/:id', function(id) {
                passwordsService.findById(parseInt(id)).done(function(resource) {
                    slider.slidePage(new ResourceView(passwordsService, resource).render().$el);
                })
            });

            router.addRoute('', function() {
                slider.slidePage(new SplashView(loginService).render().$el);
            });

            router.addRoute('register', function() {
                console.log(loginService);
                slider.slidePage(new RegisterView(loginService).render().$el);
            });

            router.start();
        });

    }

    /* --------------------------------- Event Registration -------------------------------- */


    /* ---------------------------------- Local Functions ---------------------------------- */

    // // first clear search box if back pressed, then exit.
    // function onBackKeyDown() {
    //     // if(window.location.href.endsWith("#home")) {
    //     //     if($('.search-key').val() !== "") {
    //     //         $('.search-key').val("");
    //     //         $('.search-key').keyup();
    //     //         return false;
    //     //     } else {
    //     //         if(device.platform === 'Android') {
    //     //             navigator.app.exitApp();
    //     //         } else {
    //     //             console.log(device.platform + " does not support navigator.app.exitApp()");
    //     //             window.location.href="#login";
    //     //         }
    //     //         return false;
    //     //     }
    //     // } else if(window.location.href.endsWith("#login")) {
    //     //     if(device.platform === 'Android') {
    //     //         navigator.app.exitApp();
    //     //     } else {
    //     //         console.log(device.platform + " does not support navigator.app.exitApp()");
    //     //     }
    //     //     return false;
    //     // } else {
    //     //     window.history.back();
    //     //     return(true);
    //     // }
    // }

}());