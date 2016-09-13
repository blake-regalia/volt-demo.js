var h_user_config = require(__dirname+'/config.demo.js');
require(__dirname+'/dist/server/proxy.js')(h_user_config.volt, h_user_config.proxy, function() {

});