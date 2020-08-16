# Event Scheduler

## Web Technologies and Standards Final Project Report

- Taylor Herb (tah77)
- Xi Dai (xid39)
- Xueming Yang (xuy22)
- Ziyue Qi (ziq2)

## 1. Introduction

Our web application helps people decide on a location and time to meet for a group event. Making decisions can be difficult when group members are not available at the same time. It is usually time-consuming to reach an agreement for a meeting time and location, especially for a large group.  Therefore, there is a demand for an event scheduler.

## 2. Objectives

There are two main problems that our project has solved. One is that there would be time conflicts when a large  group of people attending the same event or party.  And the other is that people would have their preference for restaurants or bars.  So the decision-making can be hard among group members. It’s very time-consuming to discuss it with members and reach an agreement.

Our Time and Location Planner for Group Event provides every group member the opportunity to add the ideal location for a meeting, including restaurants and bars. After a group event is created by an administrator of the group, everyone can fill in the availability on the schedule, and vote for their available time slots and preferred places.

## 3. Team member’s contributions

- Taylor: Front-end of the dashboard and group creation and vote web page; presentation slides
- Xi Dai: Database design, backend of login and sign up API and validation;
- Xueming Yang: Database design; front-end of home, log in and signup web page; backend of vote API; breakpoints;
- Ziyue Qi: Database design, EJS templates, front end, the back-end of group creation, member invitation, timeslot and location insertion API;

## 4. Technical Architecture

Our entire project is constructed on Glitch using Express, MongoDB, EJS and Node.js, Bootstrap. Express is a framework for back-end that operates on Node.js. MongoDB is a data management system. EJS is embedded Javascript templating. For example, in our case, users’ and groups’ information data structures are on MongoDB.

User and group data collections are stored in MongoDB. A user creates groups, adds options and votes by putting in required information in html forms (View). This information is sent to be validated and processed by Express middlewares (Controller). The controller then pass it on to the database (Model). Any changes in the database will be reflected on the frontend since we’re populating data into EJS templates.

## 5. Challenges

One of the challenges we face while developing this app is limited browser compatibility of datetime-local, an html 5 input type for users to easily pick a specific time from the calendar. It is supported by Chrome and Firefox but not Safari.

When attempting to implement a password validation form at the front end, it is inconsistent with the layout and does not work as to how the tutorial presents after multiple adjustments. Thus, flash was used instead at the back end and output into the EJS template.
Another challenge is that we cannot find an easier way to update the object in a nested array in the collection. So we use for loop to find the targeted object and update its value. And then update the array in the collection.

The asynchronous programming feature of Node.js is also another difficulty when implementing. To deal with asynchronous programming, much knowledge need to be learned, like async patterns, behavior, hooks, as well as async/await syntax.

## 6. Future Work

If possible, we would like to add features for deleting members and groups. Our current version only allows adding members and creating groups.

Another useful feature we can develop in the future is the choices for users to refuse or accept invitations to join a group. Our current system allows the administrator to add members without asking for permission. It would be reasonable to have this option available. 
If we had more time we’d like to learn React and Vue.

## 7. Conclusions

We now have a fundamental overview of web standards and technologies, from frontend languages and frameworks to the backend technology stack.

The backend technology stack MEAN (MongoDB, ExpressJs, Angular, NodeJs) would be very useful. Since the stack has gained lots of popularity in the real industries.

## 8. Documentation

[Mongoose API documentation](https://mongoosejs.com/docs/api.html)

[Express-flash-notification](https://www.npmjs.com/package/)

[Moment.js](https://momentjs.com/)

## 9. Instructions for testing

*Please test the system in Chrome/Firefox for the datetime-local compatibility.*

1. Click the ‘sign up’ button on the index page.

    - Nickname (required): the length of it should be at least 1 character
    - Username/Email (required): it should be in the form of email, like xxx@xxx.xxx. And the email should be unique.
    - Password (required): the password has to be 8 digits minimum and no longer than 15 digits
    - Click the button to firstly do the validation and submit.

2. Click the ‘Login’ button in the index page

    - Username (required): username has to be in the database.
    - Password (required): the password has to be matched with the username.

3. When logged in,  you’ll see a dashboard displaying all your groups. Click one to enter a group.

4. Click “Create Group” on the top left corner to create a group. The group name is required. The creator will be the administrator of this group.

5. Group members are displayed in the first column of the group page. If you’re the administrator, you’ll have the right to add users to this group by username. The input form will be hidden to the other members.
    - User must existed.
    - User must not already be in this group.

6. You can add options for location and time separately in the second column of the group page. Options and their vote number are displayed on the right side.

7. Vote for preferred locations and time slots using checkboxes.

      - You can vote for multiple locations and time slots.
      - You must vote for at least one candidate option for both.
      - You can only vote once.

8. Authentications are provided. User must log in to see his/her own dashboard and have no access to that of other users. Test by the endpoint “/non-existing-user/groups”.
