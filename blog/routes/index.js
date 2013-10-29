
/*
 * GET home page.
 */

var crypto = require('crypto');
var User = require('../models/user');

module.exports = function(app){
	app.get('/', function(req, res){
		res.render('index', {
			title: '主页',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		} );
	});
	app.get('/reg', function(req, res){
		res.render('reg', {
			title: '注册',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	app.post('/reg', function(req, res){
		var password = req.body.password;
		var password_repeat = req.body.password_repeat;
		// 检测密码是否一致
		if(password != password_repeat){
			req.flash('error', '两次密码不一致');
			return res.redirect('/reg');
		}
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('hex');
		var newUser = new User({
			name: req.body.name,
			password: password,
			email: req.body.email
		});
		// 检测用户是否存在
		User.get(newUser, function(err, user){
			if(user){
				req.flash('error', '用户已存在');
				return res.redirect('/reg');
			}
			// 保存用户
			newUser.save(function(err, user){
				if(err){
					req.flash('error', err);
					return res.redirect('/reg');
				}
				req.session.user = user;// 将用户信息存入session
				req.flash('success', '注册成功');
				return res.redirect('/');
			});
		});
	});
	app.get('/login', function(req, res){
		res.render('login', {
			title: '登录',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	app.post('/login', function(req, res){
		
	});
	app.get('/post', function(req, res){
		res.render('post', {
			title: '发表',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	app.post('/post', function(req, res){
		
	});
	app.get('/loginout', function(req, res){
		
	});
}