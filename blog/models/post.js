var mongodb = require('./db');

function Post(name, title, post){
	this.name = name;
	this.title = title;
	this.post = post;
}

module.exports = Post;

// 保存发表的内容
Post.prototype.save = function(callback){
	
	var date = new Date();
	// 存储各种时间格式，方便以后使用
	var time = {
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + "-" + (date.getMonth() + 1),
		day: date.getFullYear() + "-" + (date.getMonth() + 1) + date.getDate(),
		minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
	};
	// 要存入数据库的文档
	var post = {
		name: this.name,
		time: time,
		title: this.title,
		post: this.post
	};
	// 打开数据库
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		// 获取post集合
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			// 保存数据到post集合
			collection.insert(post, {safe: true}, function(err, resPosts){
				mongodb.close();
				if(err){
					return callback(err);
				}
				return callback(null, resPosts[0]);
			});
		});
	});
}
// 读取文章及相关信息
Post.get = function(name, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if(name){
				query.name = name;
			}
			// 根据query查询docs
			collection.find().sort({
				time: -1
			}).toArray(function(err, docs){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null, docs);
			});
		});
	});
};










