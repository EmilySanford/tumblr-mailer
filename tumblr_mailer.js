var fs = require('fs');
var ejs = require('ejs');
var tumblr = require('tumblr.js');

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('sOdHDoTVJNaYZgvsER_Z0A');

var csvFile = fs.readFileSync("friend_list.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.ejs', 'utf-8');


// Authenticate via OAuth
var client = tumblr.createClient({
  consumer_key: 'uTaBCBIPTj7uEnDe1WBt7D0Oe5Mbx5HzUa49LsT8RnfkvheLTc',
  consumer_secret: '8D60e7vYsHKMofVeL3jqJHDUAPUOSM9TmRBgWiwaq7v5KB1rLm',
  token: 'ghMhtgrIXjZRva2FCMlqKAyVWJknkbjLBDJnxJgU2JR6WGCn4M',
  token_secret: 'kahiAGrCS5Tr2MB0mCBVdD9iQ1MdVr30OZkgbqPI0i0IdfV9XV'
});


//Create a contact object to hold within csv data array

var contactObj = function(first, last, months, email){
	this.firstName = first;
	this.lastName = last;
	this.numMonthsSinceContact = months;
	this.emailAddress = email;
};

// Function to parse the csv file and return an array of objects

var csvParse = function(csv){
	var contactsArray = [];
	var rows = csv.split("\n");
		for (var i = 1; i < rows.length; i++){
			var contactInfoArr = rows[i].split(",");
			if (contactInfoArr.length > 1){
			contactsArray.push(new contactObj(contactInfoArr[0], contactInfoArr[1], contactInfoArr[2], contactInfoArr[3]));
			}
		}
	return contactsArray;
}




//find the latest posts

var latestPosts = [];
client.posts('emilywritescode.tumblr.com', function(err, blog){
	var today = new Date();
	var oneMonthAgo = new Date(today);
	oneMonthAgo = oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

	//I've changed this to posts from the last month instead of
	//the last week to account for the fact that I haven't 
	//posted frequently
  	blog.posts.forEach(function(post){
  		var posted = new Date(post.date);

  		if(posted > oneMonthAgo){
  			latestPosts.push(post);
  		}
  	});
  	console.log(latestPosts);

  	var csv_data = csvParse(csvFile)
	console.log(csv_data);
  	//create customized templates
	csv_data.forEach(function(contact){
		var firstName = contact.firstName;
		var numMonthsSinceContact = contact.numMonthsSinceContact;
		var templateCopy = emailTemplate;
		//templateCopy = templateCopy.replace(/FIRST_NAME/gi, firstName).replace(/NUM_MONTHS_SINCE_CONTACT/gi, numMonthsSinceContact)
		
		var customizedTemplate = ejs.render(templateCopy, 
     		{ firstName: firstName,  
     		numMonthsSinceContact: numMonthsSinceContact,
     		latestPosts: latestPosts

     });
		console.log(latestPosts);

	sendEmail(firstName, contact["emailAddress"], "Emily", "emilyannsanford@gmail.com", "testing", customizedTemplate); 
	console.log(customizedTemplate);

});

  
});




function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,    
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]    
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {

    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
 }









