# For designers

## Installation

### Dependencies

* [node.js](http://nodejs.org), install through the install button
* [git](http://git-scm.com), install through the download button
* [watch(1)](https://github.com/visionmedia/watch), which helps building assets in the background

```bash
$ cd /tmp
$ git clone git@github.com:visionmedia/watch.git
$ cd watch
$ sudo make install
```

* [component(1)](http://component.io), which is the asset builder. Install via

```bash
$ sudo npm install -g component
```

### App

Now it's time to finally install the app. Go to the folder you want to put the app into, and run:

```bash
$ git clone git@github.com:juliangruber/alrt.io.git
$ cd alrt.io
$ npm install
```

## Running the app

In one tab of your terminal, inside alrt.io's directorty, issue the following command, which will rebuild the assets every second.

```bash
$ watch make
```

In another tab start the app via

```bash
$ npm start
```

...and restart via `^C` and `npm start`.

## Templates and Stylesheets

* Layout: `public/index.html` and `lib/boot/style.css`
* Home: `lib/home/template.html` and `lib/home/style.css`
* Favicon (todo): `lib/timer/style.css`
* Chrome: `lib/timer/template.html` and `lib/timer/style.css`
* Timer: `lib/time-view/template.html` and `lib/time-view/style.css`

## Disabling annoying stuff

During development the beep sounds and notification can become quite annoying. To disable them, make this flag true: https://github.com/juliangruber/alrt.io/blob/master/lib/timer/index.js#L23. **Don't forget to set to false before committing!**

## Fin

Happy Hacking!
