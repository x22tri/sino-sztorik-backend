# Sino-sztorik (frontend)

Sino-sztorik is a **language course for Hungarian learners of Chinese**. It teaches the 3000 most common Chinese characters through visual associations and stories.

This backend primarily uses Node.js, Express and Sequelize.js, and is connected to a MySQL database and a [React frontend](https://github.com/x22tri/sino-sztorik).

## Structural Overview

This backend is mainly responsible for assembling the *"Chinese character object"* that the user is eligible to see. 

As the course is linear, the currently logged-in user has a "progress status" that *determines which characters they can and cannot see*. In addition, the user can *"unlock" more and more information* about already learned characters as they progress through the course. 

As such, the backend utilizes extensive SQL queries to filter information about a given character and assemble it into one "version" of a character that is then sent to the frontend to be displayed.

## Features

- **Assembling Chinese character objects** from different rows of the "characters" database based on the user's current progress
- **Grouping characters into lessons** with prefaces
- **Looking up additional information** about a Chinese character, such as phrases, additional meanings and easily confusable characters--and only showing the ones that the user hasn't unlocked yet
- For admins: **creating, editing and removing** characters, lessons and additional information
- Tracking user progress