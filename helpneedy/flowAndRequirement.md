Hyper-Local Disaster Support & Community Aid Hub — PRD
1. Project Overview
Project Name
Hyper-Local Disaster Support & Community Aid Hub
Vision
A web platform designed to coordinate community assistance during local crises such as:
Floods
Severe storms
Grid failures
Natural disasters
Local emergencies
Pandemics
Other community-level crises
The platform connects people who need immediate assistance with nearby people who can provide assistance.
The central idea is:
Someone needs help → nearby people who can help are identified → someone accepts the request → help is provided → request is completed.
The platform should prioritize simplicity and speed rather than behaving like a traditional social media platform.

2. Problem Statement
During a local disaster, information is often scattered across:
WhatsApp groups
Facebook groups
X/Twitter
Telegram
Local community groups
Phone calls
Word of mouth
The problem is that these channels are not structured specifically for coordinating immediate assistance.
A person might post:
"My family needs drinking water."
But there may be no structured way to determine:
Where they are
How urgent the request is
What exactly they need
Whether someone nearby can help
Whether someone has already accepted the request
Whether the request has been fulfilled
At the same time, someone nearby may have:
"I have 20 bottles of drinking water and can help people within 5 km."
but may have no efficient way of discovering the people who need it.
The platform solves this by creating a structured connection between needs and available help.

3. Core Product Concept
The application revolves around two primary actions:
I NEED HELP
For people requesting assistance.
Examples:
Food
Drinking water
Medicine
Medical assistance
Shelter
Transportation
Evacuation assistance
Electricity/charging
Other essential needs
I CAN HELP
For people who are able to provide assistance.
Examples:
Food
Water
Medicine
Transportation
Shelter
Medical assistance
Rescue assistance
Electricity/charging
Other resources
The platform then uses geographic proximity and matching criteria to connect the two.

4. Target Users
4.1 People Requesting Help
Examples:
Individuals
Families
Elderly people
People with disabilities
People stranded during a disaster
People who need food/water/medicine
People requiring transportation
Primary need:
Quickly communicate what they need and where they need it.

4.2 Volunteers / Helpers
People who are willing to provide assistance.
Examples:
Local residents
Volunteers
Community members
Drivers
Medical professionals
People with food/water supplies
People offering temporary accommodation
Primary need:
Quickly discover nearby people who need the type of help they can provide.

4.3 Organizations
Organizations can include:
NGOs
Community groups
Local relief organizations
Volunteer groups
They can eventually coordinate multiple requests and volunteers.

4.4 Administrators
Administrators manage the platform itself.
Responsibilities include:
User management
Request management
Reports
Platform moderation
Monitoring activity
Managing organizations

5. Core User Flow
The main product flow should remain extremely simple.
                    COMMUNITY AID HUB
                           |
              +------------+------------+
              |                         |
        I NEED HELP                I CAN HELP
              |                         |
       Create Request              Create Offer
              |                         |
              +------------+------------+
                           |
                    MATCHING ENGINE
                           |
                    Nearby Matching
                           |
              +------------+------------+
              |                         |
          REQUESTER                 VOLUNTEER
              |                         |
              +------------+------------+
                           |
                       ASSIGNMENT
                           |
                       HELP GIVEN
                           |
                        FULFILLED
This is the central workflow around which the application should be designed.

6. Feature 1 — I Need Help
The requester should be able to create a help request quickly.
Step 1 — Select What They Need
Example:
What do you need?

[ Food ]

[ Drinking Water ]

[ Medicine ]

[ Medical Assistance ]

[ Shelter ]

[ Evacuation ]

[ Power ]

[ Other ]

Step 2 — Select Urgency
How urgent is this?

Critical
Immediate danger or urgent medical/emergency situation

Urgent
Need help within a few hours

Normal
Can wait for some time
The user explicitly selects the urgency level.

Step 3 — Provide Location
The user should have multiple options:
Use my current location

OR

Select location on map

OR

Enter location / landmark
The system should store the geographic coordinates required for nearby matching.

Step 4 — Add Details
Example:
Describe what you need.

"Need drinking water for 4 people."

[ Optional Photo ]

[ Submit Request ]
The description should remain optional for simple requests.

Step 5 — Confirmation
After submission:
REQUEST CREATED

Request ID:
REQ-8F31A

Priority:
URGENT

Your request has been added.

[ View Request ]

7. Feature 2 — I Can Help
Helpers should be able to specify what they can provide.
Step 1 — Select Capabilities
I CAN HELP

What can you provide?

☐ Food
☐ Water
☐ Medicine
☐ Transport
☐ Shelter
☐ Medical Assistance
☐ Rescue Assistance
☐ Electricity / Charging
☐ Other
A helper can select multiple categories.

Step 2 — Service Radius
The helper specifies how far they are willing to travel.
How far can you help?

○ 1 km
○ 3 km
○ 5 km
○ 10 km

Step 3 — Availability
Available now?

[ YES ]

Available until:

[ 8:00 PM ]
This information will be used by the matching engine.

8. Matching Engine
The matching engine is one of the most important technical components of the platform.
Suppose a request is created:
Request:

Location:
28.6139, 77.2090

Need:
Water

Priority:
Urgent
And there are three volunteers:
Volunteer 1
Location: 28.6150, 77.2100
Offers: Water
Radius: 5 km

Volunteer 2
Location: 28.6200, 77.2300
Offers: Food
Radius: 10 km

Volunteer 3
Location: 28.6120, 77.2080
Offers: Water
Radius: 2 km
The system should identify:
Volunteer 3
↓
Volunteer 1
as potential matches.
Volunteer 2 should not be considered a match because they do not provide water.

9. Matching Algorithm
The initial matching algorithm should be simple, deterministic, and explainable.
A potential score could be calculated using:
score =
    category_match
  + distance_score
  + availability_score
Example:
Category match        +50

Within 1 km           +30

Within 3 km           +20

Within 5 km           +10

Available now         +15
The system can then rank potential helpers by score.
The first implementation should avoid unnecessarily complex AI or machine-learning-based matching.

10. Geographic Matching with PostGIS
PostgreSQL with PostGIS is highly suitable for the location-based requirements of this project.
Instead of calculating geographic distances manually inside Node.js, PostGIS can perform geographic queries.
For example:
SELECT *
FROM help_requests
WHERE ST_DWithin(
    location,
    ST_SetSRID(
        ST_MakePoint(:lng, :lat),
        4326
    )::geography,
    5000
);
This allows the application to find requests within a specific radius.
PostGIS functionality that will be useful includes:
POINT
GEOGRAPHY
ST_Distance
ST_DWithin
Spatial Indexes
Bounding-box queries

11. Database Design
The initial database can be built around the following tables.
users
id
name
email
phone
role
created_at
updated_at
Roles:
REQUESTER
VOLUNTEER
ORGANIZATION
MODERATOR
ADMIN

help_requests
id
requester_id
category
description
urgency
status
location
location_visibility
created_at
updated_at
expires_at
Possible status values:
OPEN
MATCHED
IN_PROGRESS
FULFILLED
CANCELLED
EXPIRED

help_offers
id
volunteer_id
category
description
location
availability_status
service_radius
available_until
created_at
updated_at

assignments
Requests and volunteers should not be directly coupled.
Use an assignment table.
id
request_id
volunteer_id
status
assigned_at
accepted_at
completed_at
Possible assignment states:
PROPOSED
ACCEPTED
REJECTED
COMPLETED
CANCELLED

notifications
id
user_id
type
title
message
read_at
created_at

reports
id
reported_by
target_type
target_id
reason
status
created_at

audit_logs
id
actor_id
action
entity_type
entity_id
metadata
created_at
Example:
ADMIN
CLOSED_REQUEST
REQ-123
reason: "Help confirmed"

12. Request Lifecycle
The primary request lifecycle should be:
                +---------+
                |  OPEN   |
                +----+----+
                     |
                     v
                +---------+
                | MATCHED |
                +----+----+
                     |
                     v
              +--------------+
              | IN_PROGRESS  |
              +------+-------+
                     |
                     v
                +----------+
                |FULFILLED |
                +----------+
The purpose of this lifecycle is to make the current state of every request clear to both the requester and helper.

13. Map
The platform should provide an interactive map showing nearby requests and available help.
The map should visually distinguish different categories.
Example:
Critical requests
Urgent requests
Normal requests

Available volunteer/resource
Organizations
Different icons can be used for different categories.
For example:
Medical
Food
Water
Shelter
Transportation
The map should support:
Zoom
Pan
Request markers
Helper/resource markers
Category filtering
Urgency filtering
Distance filtering
Request detail view

14. Location Privacy
Location information needs to be handled carefully.
The platform may store sensitive information such as:
Home location
Current location
Medical requirements
Contact information
Exact locations should not necessarily be exposed publicly.
For example, instead of publicly displaying:
28.613912, 77.209023
the public map can display an approximate location.
Example:
Urgent medical assistance

Approximately 300m away
When an appropriate assignment is created, more precise location information can be made available to the relevant helper when required.

15. Organizations / NGOs
Organizations can eventually have profiles containing:
Organization:
XYZ Relief Foundation

Capabilities:

Food
Water
Medical
Transportation

Coverage:
10 km

Contact:
...
Organizations can then manage:
Requests
Volunteers
Resources
This can allow the platform to support larger community relief operations.

16. Resource Inventory
A future version can allow organizations or helpers to list available resources.
Example:
Community Center A

Water:
250 bottles

Food:
120 meals

Blankets:
80
The system can then match requests against available resources.
Example:
Request:
Water × 5

Available:
Water × 250

Distance:
1.8 km
This can make the platform useful not only for matching people but also for coordinating physical resources.

17. API Design
The backend can use a REST API.
Authentication
POST   /api/auth/register
POST   /api/auth/login

Help Requests
GET    /api/requests
POST   /api/requests
GET    /api/requests/:id
PATCH  /api/requests/:id
DELETE /api/requests/:id

POST   /api/requests/:id/accept
POST   /api/requests/:id/cancel
POST   /api/requests/:id/fulfill

Help Offers
GET    /api/offers
POST   /api/offers
GET    /api/offers/:id
PATCH  /api/offers/:id
DELETE /api/offers/:id

Matching
GET    /api/matches/nearby

Map
GET    /api/map/requests
GET    /api/map/resources

Notifications
GET    /api/notifications
PATCH  /api/notifications/:id/read

Reports
POST   /api/reports

Admin
GET    /api/admin/dashboard
GET    /api/admin/reports
GET    /api/admin/users
GET    /api/admin/requests

18. Authentication & Authorization
Authentication should be handled using Supabase Auth or another established authentication mechanism.
The application should support role-based authorization.
Example:
REQUESTER
    ↓
Can create/manage own requests

VOLUNTEER
    ↓
Can create/manage offers
Can accept available requests

ORGANIZATION
    ↓
Can manage organizational resources

MODERATOR
    ↓
Can moderate platform activity

ADMIN
    ↓
Full administrative access
Authorization must always be enforced on the backend.
The frontend should never be treated as the security boundary.

19. API Security
The backend should implement:
Authentication
Every protected endpoint should require valid authentication.
Authorization
Users should only be able to perform actions allowed by their role.
Input Validation
All incoming API data should be validated on the backend.
For example:
{
  "urgency": "critical"
}
should be validated against the allowed values.
Rate Limiting
Rate limiting should be applied particularly to:
POST /requests
POST /reports
POST /authentication
This helps prevent spam and abuse.

20. Abuse Prevention
Because the platform deals with emergency requests, abuse prevention needs to be considered.
Potential abuse includes:
Spam Requests
Possible protections:
Rate limits
Account verification
Request limits
Abuse monitoring
Fake Volunteer Accounts
Possible protections:
Account verification
Organization association
Activity history
Malicious Reports
Possible protections:
Rate limiting
Moderation
Admin review
Location Abuse
Possible protections:
Approximate public locations
Restricted exact-location access
Controlled sharing

21. Frontend Architecture
A clean React structure could look like:
src/

├── app/
│
├── components/
│   ├── Button/
│   ├── Modal/
│   ├── Map/
│   ├── RequestCard/
│   └── StatusBadge/
│
├── features/
│   ├── auth/
│   ├── requests/
│   ├── offers/
│   ├── matching/
│   ├── notifications/
│   ├── map/
│   └── admin/
│
├── pages/
│
├── hooks/
│
├── services/
│   └── api.js
│
├── utils/
│
└── assets/
Feature-based organization should make the application easier to maintain as it grows.

22. Backend Architecture
A Node.js backend can be structured as:
src/

├── controllers/
│
├── routes/
│
├── services/
│   ├── matching.service.js
│   ├── request.service.js
│   ├── notification.service.js
│   └── assignment.service.js
│
├── repositories/
│
├── middleware/
│
├── validators/
│
├── db/
│   ├── migrations/
│   └── queries/
│
├── utils/
│
└── app.js
Business logic should remain inside services rather than being placed directly inside route handlers.
For example:
Route
  ↓
Controller
  ↓
Service
  ↓
Repository / Database

23. Recommended Technology Stack
Based on your existing skills, I would use:
Frontend
React.js
Tailwind CSS
TypeScript
You already know React and Tailwind, so this minimizes unnecessary learning.

Backend
Node.js
Express.js or Fastify
TypeScript
Zod

Database
PostgreSQL
PostGIS
PostGIS is the main new database technology worth learning for this project.

Supabase
Use Supabase for:
Authentication
PostgreSQL
Realtime
Storage
You already have experience with Supabase, so this fits your existing skill set.

Maps
Use:
MapLibre GL JS
or:
Leaflet
Either is suitable for the initial implementation.

24. Why This Stack Makes Sense for You
Your current skills already cover most of the project:
React.js          ✓
Tailwind CSS      ✓
HTML/CSS          ✓
Bootstrap         ✓
Node.js           ✓
SQL               ✓
MySQL             ✓
Supabase          ✓
PostgreSQL        ✓
The major additions are:
PostGIS
TypeScript
MapLibre / Leaflet
You don't need to switch to Vue.js or Svelte just because they were suggested in the original project idea.
React is already a strong choice for this project.
Similarly, you don't need to switch from Node.js to Python/FastAPI unless you have a specific reason to do so.
The geographic workload can be handled effectively by:
Node.js
+
PostgreSQL
+
PostGIS

25. Core MVP Features
The initial version should focus on these capabilities.
Authentication
Sign up
Login
Logout
Profile
User roles
Help Requests
Create request
Select category
Select urgency
Add description
Add location
View request
Update request
Cancel request
Mark fulfilled
Help Offers
Create offer
Select categories
Set location
Set service radius
Set availability
Update offer
Matching
Find nearby requests
Find nearby helpers
Match category
Calculate distance
Rank potential matches
Map
Display requests
Display available help
Filter by category
Filter by urgency
View request details
Notifications
New match
Request accepted
Request status changed
Request fulfilled
Admin
Dashboard
Users
Requests
Reports
Basic moderation

26. Example Complete User Journey
Person Requesting Help
Open website
      ↓
I NEED HELP
      ↓
Select "Water"
      ↓
Select "Urgent"
      ↓
Provide location
      ↓
"Need water for 4 people"
      ↓
Submit
      ↓
Request created
      ↓
Matching engine searches nearby helpers
      ↓
Potential helpers notified
      ↓
Volunteer accepts
      ↓
Requester receives notification
      ↓
Help delivered
      ↓
Request marked fulfilled

Volunteer
Open website
      ↓
I CAN HELP
      ↓
Select "Water"
      ↓
Set radius = 5 km
      ↓
Available now
      ↓
System displays nearby requests
      ↓
Volunteer selects request
      ↓
Accept
      ↓
Coordinate assistance
      ↓
Help delivered
      ↓
Mark completed

Organization
Login
   ↓
Organization Dashboard
   ↓
View requests
   ↓
View available volunteers
   ↓
View available resources
   ↓
Coordinate assistance
   ↓
Track active requests

27. Future Resource Management
Once the core request/volunteer system is working, resource management can be added.
Resources could include:
Food
Water
Medicine
Blankets
Clothing
Power banks
Generators
Vehicles
Medical equipment
Each resource can contain:
resource_id
organization_id
category
quantity
location
availability
created_at
updated_at
The matching system could eventually match:
Person needs
        ↓
Resource available
        ↓
Distance
        ↓
Helper / organization
        ↓
Assignment

28. Deployment Architecture
A practical deployment architecture could be:
                    INTERNET
                        |
                        v
                 React Frontend
                        |
                        |
                        v
                 Node.js API
                        |
              +---------+---------+
              |                   |
              v                   v
        PostgreSQL             Supabase
        + PostGIS           Auth / Realtime
              |
              |
              v
         Geographic Data
Docker can be used to package the backend.
For example:
Frontend
   ↓
Vercel / Cloudflare / AWS

Backend
   ↓
Docker
   ↓
AWS / Render / Railway / EC2

Database
   ↓
Supabase / Managed PostgreSQL

29. Suggested Repository Structure
A monorepo can make development easier:
community-aid-hub/

├── frontend/
│
├── backend/
│
├── database/
│
├── docs/
│
├── docker/
│
├── README.md
│
└── docker-compose.yml
Inside docs/:
docs/

├── PRD.md
├── ARCHITECTURE.md
├── DATABASE.md
├── API.md
└── USER-FLOWS.md

30. Initial Database Relationship
The main relationship should look like:
USER
 |
 +----------------------+
 |                      |
 v                      v
HELP REQUEST        HELP OFFER
 |                      |
 |                      |
 +----------+-----------+
            |
            v
       ASSIGNMENT
            |
            v
         MATCH
More specifically:
users
  |
  +----< help_requests
  |
  +----< help_offers
  |
  +----< notifications
  |
  +----< reports
  |
  +----< audit_logs

help_requests
  |
  +----< assignments
              |
              >---- users
This keeps the core domain model relatively simple while leaving room for future expansion.

