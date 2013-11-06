var mongodb = require('./db');
function Cookie(cookie){
	this.name = cookie.name;
	this.cookie = cookie.cookie;
}
module.exports = Cookie;

Cookie.prototype.save = function(){
	var cookie = {
		name: this.name,
		cookie: this.cookie
	};
	mongodb.open(function(err, db){
		if(err){
			console.log(err);
			return ;
		}
		db.collection("cookie", function(err, collection){
			if(err){
				mongodb.close();
				console.log(err);
				return ;
			}
			collection.insert(cookie, {safe: true}, function(err, cookies){
				mongodb.close();
			});
		});
	});
}
Cookie.get = function(cookie, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		db.collection("cookie", function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.find().sort({
				_id: -1
			}).toArray(function(err, docs){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null, docs);
			});
		});
	});
}