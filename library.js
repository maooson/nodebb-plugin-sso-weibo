(function(module) {
	"use strict";

	var user = module.parent.require('./user'),
		meta = module.parent.require('./meta'),
		db = module.parent.require('../src/database'),
		passport = module.parent.require('passport'),
  		passportWeibo = require('passport-weibo').Strategy,
  		fs = module.parent.require('fs'),
  		path = module.parent.require('path'),
  		nconf = module.parent.require('nconf');

	var constants = Object.freeze({
		'name': "Weibo",
		'admin': {
			'route': '/plugins/sso-weibo',
			'icon': 'fa-twitter-square'
		}
	});

	var Weibo = {};

	Weibo.init = function(app, middleware, controllers) {
		function render(req, res, next) {
			res.render('admin/plugins/sso-weibo', {});
		}

		console.log('adding weibo routes!');
		app.get('/admin/plugins/sso-weibo', middleware.admin.buildHeader, render);
		app.get('/api/admin/plugins/sso-weibo', render);
	};

	Weibo.getStrategy = function(strategies, callback) {
		if (meta.config['social:weibo:key'] && meta.config['social:weibo:secret']) {
			passport.use(new passportWeibo({
				authorizationURL: 'https://api.weibo.com/oauth2/authorize',
				tokenURL: 'https://api.weibo.com/oauth2/access_token',
				clientID: meta.config['social:weibo:key'],
				clientSecret: meta.config['social:weibo:secret'],
				callbackURL: nconf.get('url') + '/auth/weibo/callback',
				userAgent: 'aow.me'
			}, function(accessToken, refreshToken, profile, done) {
				console.log(profile);
				Weibo.login(profile.id, profile.screen_name, profile.profile_image_url, function(err, user) {
					if (err) {
						return done(err);
					}
					done(null, user);
				});
			}));

			strategies.push({
				name: 'weibo',
				url: '/auth/weibo',
				callbackURL: '/auth/weibo/callback',
				icon: 'twitter',
				scope: ''
			});
		}

		callback(null, strategies);
	};

	Weibo.login = function(wbid, username, profile_image_url, callback) {
		Weibo.getUidByWeiboId(wbid, function(err, uid) {
			if(err) {
				return callback(err);
			}

			if (uid !== null) {
				// Existing User
				callback(null, {
					uid: uid
				});
			} else {
				// New User
				user.create({username: username}, function(err, uid) {
					if(err) {
						return callback(err);
					}

					// Save weibo-specific information to the user
					user.setUserField(uid, 'wbid', wbid);
					db.setObjectField('wbid:uid', wbid, uid);

					// Save their photo, if present
					if (profile_image_url && profile_image_url.length > 0) {
						user.setUserField(uid, 'uploadedpicture', profile_image_url);
						user.setUserField(uid, 'picture', profile_image_url);
					}

					callback(null, {
						uid: uid
					});
				});
			}
		});
	};

	Weibo.getUidByWeiboId = function(wbid, callback) {
		db.getObjectField('wbid:uid', wbid, function(err, uid) {
			if (err) {
				return callback(err);
			}
			callback(null, uid);
		});
	};

	Weibo.addMenuItem = function(custom_header, callback) {
		custom_header.authentication.push({
			"route": constants.admin.route,
			"icon": constants.admin.icon,
			"name": constants.name
		});

		callback(null, custom_header);
	}

	// Weibo.addAdminRoute = function(custom_routes, callback) {
	// 	fs.readFile(path.resolve(__dirname, './static/admin.tpl'), function (err, template) {
	// 		custom_routes.routes.push({
	// 			"route": constants.admin.route,
	// 			"method": "get",
	// 			"options": function(req, res, callback) {
	// 				callback({
	// 					req: req,
	// 					res: res,
	// 					route: constants.admin.route,
	// 					name: constants.name,
	// 					content: template
	// 				});
	// 			}
	// 		});

	// 		callback(null, custom_routes);
	// 	});
	// };

	module.exports = Weibo;
}(module));
