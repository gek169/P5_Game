# Everything you need for game development in Javascript.

A fully fledged 2D game engine with a minimalistic editor and extremely flexible runtime dynamicism.

![editor](EditorDemo.gif)


# How do I write code for the engine?

Implement a script in assets called "preload_run.js".

You can modify what file is run by editting these lines in sketch.js:

```js
function preload(){
	dummy_img = loadImage('assets/aball.png');
	get_and_run('assets/preload_run.js');
}
```

You can load as many files as you like in a chain by repeatedly invoking get_and_run,
but it is not recommended you use this as a level loading convention, because this is incredibly inefficient.

But, it's an option.

dummy_img is your asset to use when you do not have a texture. By default, I use the old Boing! Ball.


# Javascript is slow? Why would you write a game engine in Javascript????

Javascript, while extremely slow, does not require recompilation for new targets and is extra-ordinarily
portable.

This makes it a superb choice for most game development, where in most cases, performance is not that important.

This isn't the right choice if you want to write the next realistic immersive 3d game, of course.

I have two other engines i've written, one in C and one in C++, if you're interested. (C_GE, which has lua support,
 and GSGE, which is C++ only.)


See LICENSE for the license of this repository's code.

The p5 reference is copied here for development convenience. it is non-commercial sharealike, so remove it
from the repository when deploying.

p5.min.js and p5.sound.min.js are both under the LGPL, which is MIT compatible. 

If you make any modifications to them,
you must distribute the source code to those libraries.
