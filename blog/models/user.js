var mongodb = require('./db');
function User(user){
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
}
module.exports = User;
// 保存
User.prototype.save = function(callback){
	// 要保存的数据
	var user = {
		name: this.name,
		password: this.password,
		email: this.email
	};
	// 打开数据库
	mongodb.open(function(err, db){
		if(err){
			return callback(err);// 返回错误信息
		}
		// 获取 users 集合
		db.collection('users', function(err, collection){
			if(err){
				// 关闭连接
				mongodb.close();
				return callback(err);// 返回错误信息
			}
			// 插入 user 文档
			collection.insert(user, {safe: true}, function(err, user){
				// 关闭连接
				mongodb.close();
				// err为null，返回存储后的文档
				callback(null, user[0]);
			});
		});
	});
}
// 用户查询
User.get = function(user, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		db.collection('users', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.findOne({
				name: user.name
			},function(err, resultUser){
				mongodb.close();
				if(resultUser){
					return callback(null, resultUser);
				}
				callback(err);
			});
		});
	});
}

