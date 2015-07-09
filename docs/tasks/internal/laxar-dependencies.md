# The *laxar-dependencies* Task

> For a given flow target, generates an AMD module that references all direct dependencies.

 the controller modules of all reachable widgets and activities as well the modules of their controls.

When loaded using _RequireJS_ or bundled using _r.js_ this causes all transitive dependencies of these modules to be included as well.


## Overview

*Note:* This task is an *internal building block* used by the grunt-laxar main tasks, and not considered a part of the stable API.

*Run this task with the `grunt laxar-configure laxar-dependencies:{target}` command.*

The possible targets are determined by the configuration which is generated by the [*laxar-configure*](../laxar-configure.md) task.
If used without *laxar-configure*, the task targets, files and options may be specified manually according to the grunt
[Configuring tasks](http://gruntjs.com/configuring-tasks) guide.