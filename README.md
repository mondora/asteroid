[![Build Status](https://travis-ci.org/mondora/asteroid.svg?branch=master)](https://travis-ci.org/mondora/asteroid)
[![Coverage Status](https://coveralls.io/repos/mondora/asteroid/badge.svg)](https://coveralls.io/r/mondora/asteroid)

#asteroid

A javascript client (browser and node) for a Meteor backend.

##Table of contents

[Why](#why)

[Install](#install)

[Example usage](#example-usage)

[Advantages over the canonical Meteor front-end](#advantages-over-the-canonical-meteor-front-end)

[Build asteroid locally](#build-asteroid-locally)

## Why

Meteor is an awesome platform, but its canonical front-end is not very flexible.
Asteroid gives the possibility to connect to a Meteor backend with any JS app.

Some of the things Asteroid allows you to do are:

*	make any existing application reactive

*	use any front-end framework you want with Meteor

*	develop browser extensions backed by Meteor

## Install

```sh
    npm install asteroid
```

## Example usage

```javascript
import {createClass} from "asteroid";
import passwordMixin from "asteroid-password";

const Asteroid = createClass([passwordMixin]);
// Connect to a Meteor backend
const ceres = new Asteroid({
    endpoint: "ws://localhost:3000/websocket"
});
```

## Advantages over the canonical Meteor front-end

* Small footprint.

* Framework agnostic. Use the tools you already know and love to build your app.

* Allows to use Meteor as a full-blown backend or just as a real-time platform
  pluggable into any existing project.

* Easily connect to multiple Meteor servers at the same time, perfect for
  building admin interfaces.


## Build asteroid locally

Clone the repository (or your fork) on your computer.

```sh
    git clone https://github.com/mondora/asteroid
```

Enter the project's directory and install the required dependencies:

```sh
    cd asteroid/
    npm install
```

Start the development environment:

```sh
    npm run dev
```
