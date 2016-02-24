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

    var homeView;

    document.addEventListener("deviceready", onDeviceReady, false);

    function onDeviceReady() {
        // register FastClick fix for 300ms delay on IOS devices:
        FastClick.attach(document.body);

        document.addEventListener("backbutton", onBackKeyDown, false);

        // StatusBar.overlaysWebView(false);
        // StatusBar.backgroundcolorByHexString('#ffffff');
        // StatusBar.styleDefault();

        loginService = new LoginService();

        loginService.init().done(function() {
            console.log("loginService is initialized");
        });

        passwordsService = new PasswordsService();
        passwordsService.init().done(function() {
            homeView = new HomeView(loginService, passwordsService);

            router.addRoute('login', function() {
                slider.slidePage(new LoginView(loginService).render().$el);
            });

            router.addRoute('home', function() {
                slider.slidePage(homeView.render().$el);
//                slider.slidePage(new HomeView(loginService, passwordsService).render().$el);
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

            initializeStore();
        });

    }

    /* --------------------------------- Event Registration -------------------------------- */


    /* ---------------------------------- Local Functions ---------------------------------- */

    /**
     * our in-app purchases include only turn_off_ads as of 2/2016.
     * "TURN OFF ADVERTISEMENTS - turn_off_ads"
     * MANAGED product.
     */
    function initializeStore() {

        if(!window.store) {
            console.log('Store not available');
            return;
        }

        store.verbosity = store.INFO;

        console.log('register products');
        store.register({
//            id:    "com.airanza.apass.turn_off_ads", 
            id:    "turn_off_ads",
            alias: "Turn Off Advertisements",
            type:  store.NON_CONSUMABLE
        });

        // if(app.platform == 'ios') {
        //     // TODO:  FIGURE OUT WHAT MUST BE DONE DIFFERENTLY FOR IOS.
        // }

        // when any product gets updated, refresh the app as needed:
        store.when("product").updated(function(p) {
            console.log("product updated");

            turn_off_ads_product = store.get("turn_off_ads");
            if(p === turn_off_ads_product) {
                console.log("they are equal!!! " + p + " is equal to " + turn_off_ads_product);
            } else {
                console.log("They are not equal!!! " + p + " is not equal to " + turn_off_ads_product);
            }

            if(p.owned) {
                // TODO:  turn off ads!!!
                homeView.setAdsEnabled(false);
                console.log("You are a lucky owner.");
            } else {
                homeView.setAdsEnabled(true);
                console.log("You are not subscribed");
            }
        });
        store.when("turn_off_ads").approved(function(p) {
            console.log("product approved");
        });
        store.when("turn_off_ads").verified(function(p) {
            console.log("product verified");
        });
        store.when("turn_off_ads").unverified(function(p) {
            console.log("product unverified");
        });


        store.error(function(error) {
            console.log('ERROR ' + error.code + '; ' + error.message);
        })

        // When every goes as expected, it's time to celebrate!
        // The "ready" event should be welcomed with music and fireworks,
        // go ask your boss about it! (just in case)
        store.ready(function() {
            console.log("\\o/ STORE READY \\o/");
        });

        // After we've done our setup, we tell the store to do
        // it's first refresh. Nothing will happen if we do not call store.refresh()
        console.log("refreshing store");
        store.refresh();
    }

    function onBackKeyDown() {
        if(window.location.href.endsWith("#home")) {
            // first, if menus are visible, get rid of them and do nothing else:
            if(document.getElementById("myDropdown").classList.contains('show') || 
                document.getElementById("advancedDropdown").classList.contains('show')) {
                if(document.getElementById("myDropdown").classList.contains('show')){
                    document.getElementById("myDropdown").classList.remove('show');
                };
                if(document.getElementById("advancedDropdown").classList.contains('show')){
                    document.getElementById("advancedDropdown").classList.remove('show');
                };
                return false;
            };

            // if there is text in the search box, then clear it.
            if($('.search-key').val() !== "") {
                $('.search-key').val("");
                $('.search-key').keyup();
                return false;
            } else {
                if(device.platform === 'Android') {
                    navigator.app.exitApp();
                } else {
                    console.log(device.platform + " does not support navigator.app.exitApp()");
                    window.location.href="#login";
                }
                return false;
            }
        } else if(window.location.href.endsWith("#login")) {
            if(device.platform === 'Android') {
                navigator.app.exitApp();
            } else {
                console.log(device.platform + " does not support navigator.app.exitApp()");
            }
            return false;
        } else {
            window.history.back();
            return(true);
        }
    };



}());