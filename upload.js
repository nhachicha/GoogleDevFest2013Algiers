/***************************************************************/
// Simple Web Server that allow upload of images, store them 
// into a SQLite, and allow retrieval as JSON array 
/**************************************************************/


var formidable = require('formidable'),
   	http = require('http'),
    util = require('util'),
    path = require("path"),
    url = require("url");


var server = http.createServer(function(req, res) {
    // Simple path-based request dispatcher
    switch (url.parse(req.url).pathname) {
        case '/':
            display_form(req, res);
            break;
        case '/upload':
            upload_file(req, res);
            break;
        case '/photos':
            display_photos(req, res);
            break;    
        default:
            display_image(req, res);
            break;
    }
});

// Server would listen on port 80
server.listen(5000);

function upload_file(req, res) {
    // parse a file upload
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
      
      var fileName = fields.title;
      var fileLocation = files.upload.path;
      var fileSize = files.upload.size;
      
      res.end('Name: ' + fileName + ' Size:  ' + fileSize + ' Location ' + fileLocation); 

	  addPhoto(fileName, fileSize, fileLocation);
    });
    return;
}



/*
 * Return uploaded photos
 */
function display_photos(req, res) {
	  // show a file upload form
	  res.writeHead(200, {'content-type': 'application/json'});
	  
	  getPhotos(res);
}

/*
 * return image as a stream
 */
function display_image(req, response) {
	 var uri = url.parse(req.url).pathname;
    
     fs.exists(uri, function(exists) {
		    if(!exists) {
		    	show_404(req, response);
		    	
		    } else {
		    	fs.readFile(uri, "binary", function(err, file) {
			      if(err) {        
			        response.writeHead(500, {"Content-Type": "text/plain"});
			        response.write(err + "\n");
			        response.end();
			        return;
			      }
			 
			      response.writeHead(200);
			      response.write(file, "binary");
			      response.end();
			    });
		   }
	});
}

/*
 * Display upload form
 */
function display_form(req, res) {
	  // show a file upload form
	  res.writeHead(200, {'content-type': 'text/html'});
	  res.end(
	    '<form action="/upload" enctype="multipart/form-data" method="post">'+
	    '<input type="text" name="title"><br>'+
	    '<input type="file" name="upload" multiple="multiple"><br>'+
	    '<input type="submit" value="Upload">'+
	    '</form>'
	  );
}


/*
 * Handles page not found error
 */
function show_404(req, res) {
    res.writeHead(404, {"Content-Type": "text/plain"});
    res.write("No such resource!");
    res.end();
}


// *************************************************
// ************** DATA BASE   SQLITE3  *************
// *************************************************


var sqlite3 = require('sqlite3').verbose();
var fs = require("fs");
var file = 'photos.db';
var exists = fs.existsSync(file);
var db = new sqlite3.Database('photos.db');

// CREATE THE TABLE IF IT'S OUR FIRST RUN
	db.serialize(function() {
	  if(!exists) {
	   	db.run("CREATE TABLE shopping (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, image TEXT)");
	  }
	});

function addPhoto (name, size, path) {
		if (size > 0) {
			db.run("INSERT INTO shopping (name, image) VALUES ('"+name+"', '"+path+"')");			
			
		} 
		
	}
	
	 
function getPhotos (res) {
	 	var sql = "SELECT name, image FROM shopping";
	 	db.all(sql, function(err, rows) {
			res.end(JSON.stringify(rows));
    	});	
	 }	