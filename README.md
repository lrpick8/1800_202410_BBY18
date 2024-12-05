# Project Title
PlayPal Sports MatchMaker

## 1. Project Description
Our team BBY18 is developing a web app to match people wanting to play sports against new competitors based on preferences like 
location, timing and ability to enjoy your chosen sport and compete against like-minded people within your community.


## 2. Names of Contributors
List team members and/or short bio's here... 
* Liam Pickrell - I don't like cars as much as yang.
    I contributed the Profile Adjustment pages and javascript, Styling Elements, and most Secondary Features like the Review page.
* Yang Li - I like Cars
    I contributed the main MatchMaking function, the Chatbox function and most debugging for all pages.
* Armaan Sidhu - I like playing basketball
    I contributed the Authentication and Chat-box framework.
	
## 3. Technologies and Resources Used
List technologies (with version numbers), API's, icons, fonts, images, media or data sources, and other resources that were used.
* HTML5, CSS, JavaScript
* Bootstrap 5.0 (Frontend library)
* Firebase 8.0 (BAAS - Backend as a Service)
* 

## 4. Complete setup/installion/usage
State what a user needs to do when they come to your project.  How do others start using your code or application?
Here are the steps ...
* A user would see our non-logged in landing page (index.html) and they'd be prompted to create a login and insert their first and last name.
* Once they create a login, they can immediately click the main matchmaking button labeled "Find a Match".
* They are then navigated to matchMake.html and they can further set their parameters of the match they'd like to engage in.
* Once they set their parameters, they will click the "Find Players" button and the system will navigate to the matching.html page, which 
initializes a timer and enters the user into a queue. 
* If two players are in the same queue at the same time, they will be matched together, and they will both be navigated to the chatbox.html page
which contains a chat with only the other matched player. 
* They both can then chat with the other user to coordinate the time and location of their match so they can play each other in person.
* Secondarily, if the user clicks the dropdown menu in the top left corner of any pages, they can then select their profile button and they will 
navigate to the profile.html page. 
* At the profile.html page, the user can re-set and save parameters like their name on the app, their address or location they'd like to be matched
from and their preferred sport they are using the app for. All those will write and read to/from our firestore database.
* In the future, they will also be able to leave reviews or report other users if there are inappropriate behaviours in place by navigating to their match history page, seeing the details of a match they've already played against a given user, and leave them a review/report. 

## 5. Known Bugs and Limitations
Here are some known bugs:
* The system will only match users on exact matches (i.e. there won't be a suggestion for two users that are just barely outside the location preference parameters to match together).
* The Review and matchHistory pages have the framework in place, but without links to them.

## 6. Features for Future
What we'd like to build in the future:
* Gambling/Wagering on their upcoming matches.
* Tournaments/events for multiple users to join at the same time (not just one match with two users).
* More user customization across all pages (like an avatar, nicknames, dark mode, etc.)
* Integration with maps and other boards to allow users to know exact locations and current status of the court/field they will host their match on.
	
## 7. Contents of Folder
Content of the project folder:

```
 Top level of project folder: 
├── .gitignore               # Git ignore file
├── index.html               # landing HTML file, this is what users see when you come to url
├── login.html               # after clicking the login button, this is where users will come to login for the first time.
├── main.html                # once a user is logged in, they will arrive at main.html which is the main landing page once they are logged in.
├── matchMake.html           # the file that houses the match preferences list. This is where the user inputs what/where they want to play.
├── matching.html            # the loading page while a user is placed in a queue, the user has the option to either navigate away, or cancel the
                                  queue.
├── matchHistory.html        # the page that will post all the matches a given user has played in recent history. Not fully implemented/linked.
├── match.html               # the page that posts the match details when the system discovers a match. The user can then click on the "Go to 
                                Chatbox" button and chat with the player they have matched with.
├── profile.html             # the page the user will navigate to if they want to adjust any of their personal details like address and sport 
                                preference.
├── review.html              # the page the user can write review if you wish to leave a review or report on another previously played user.
├── chatbox.html             # the page containing the chatbox to allow users to coordinate details between one another.
├── 404.html                 # the page that the system navigates to if there is an issue loading a given page.
├── firestore.rules          # contains the firestore rules copy from the console.
├── firestore.indexes.json   # Json file for firestore indexes.
├── firebase.json            # Json file for firebase.
├── .firebaserc              # Firebase RC file.
└── README.md

It has the following subfolders and files:
├── .git                     # Folder for git repo
├── images                   # Folder for images
    /blah.jpg                # Acknowledge source
├── scripts                  # Folder for scripts
    /blah.js                 # 
├── styles                   # Folder for styles
    /blah.css                # 



```


