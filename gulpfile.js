var UglifyJS = require('uglify-js');
var fs=require('fs');
var path=require('path');

exports.default=function(done){
    fs.readFile(__dirname + path.sep + "cloneDialogOpener.js","utf8",function(err,data){
        if(err){
            done(err);
        }else{
            var minified=UglifyJS.minify(data);
            if(minified.error){
                done(err);
            }else{
                fs.writeFile(__dirname + path.sep + "dist" + path.sep + "cloneDialogOpener.min.js",minified.code,function(err){
                    done(err);
                });
            }            
        }
    });
};