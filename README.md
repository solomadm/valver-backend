# README #

## Prerequisite:

Install EasyImage.
On Ubuntu:
```
$ apt-get install imagemagick
```
On Mac OS X
```
$ brew install imagemagick
```

## Deploy the project:

Clone the project from the repo and then run

```
npm install
```

## Run the project:

Navigate to the project folder.

Run in dev mode on local server:
```
npm start
```

Run in prod mode on local server:
```
NODE_ENV=production npm start
```

Restart/Run in dev mode on AWS server:
```
sudo forever stopall
sudo forever start -o forever-out.log -e forever-err.log index.js
```