# Talker

## About talker

This application is a social platform that allows users to engage with each other through posts and comments. Users can create accounts, share posts, and comment on both posts and other comments. The platform supports threaded or nested comments, allowing for discussions to unfold in a structured manner. Users can also follow and be followed by others, receive notifications, and like posts and comments. The application aims to create a dynamic and interactive community where users can connect, share ideas, and stay informed about updates through notifications. Additionally, the system includes features like user authentication, hashed password storage, and the ability to generate and validate one-time passwords (OTP) for added security. The technology stack includes Prisma for database interactions, PostgreSQL as the database provider, and a Prisma Client to facilitate seamless communication with the database.

## Requirements

For development, you will only need Node.js and a node global package, NPM/Yarn, installed in your environment.

## Running the project

### Node

-   #### Node installation on Windows

    Just go on [official Node.js website](https://nodejs.org/) and download the installer.
    Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

-   #### Node installation on Ubuntu

    You can install nodejs and npm easily with apt install, just run the following commands.

        $ sudo apt install nodejs
        $ sudo apt install npm

-   #### Other Operating Systems
    You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v18.13.2

    $ npm --version
    8.19.2

If you need to update `npm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.

    $ npm install npm -g

###

---

## Install

    $ git clone https://github.com/AnkitNayan83/Talker
    $ cd Talker
    $ npm install
