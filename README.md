# Job Planner 🤖

[![npm version](https://badge.fury.io/js/job-planner.svg)](https://badge.fury.io/js/job-planner)

Simple and powerful task manager lib. Manage your processes' execution order with zero pain.

## Installing

Using npm:

`npm install job-planner`

Using yarn:

`yarn add job-planner`

## Example

Creating a plan with synchronous execution order and plain structure:

```javascript
import { createPlan } from 'job-planner'

const planner = createPlan(({ sync }) => sync(
    connectToDB,
    runMigrations
))

planner()
``` 

Creating a plan with mixed behaviour, nested jobs and provided config:

```javascript
import { createPlan } from 'job-planner'

const planner = createPlan(({ sync, parallel }) => sync(
    runMigrations,
    downloadDataUpdates,
    parallel(
        sendStatistic,
        sync(
            prepareUsageInfo,
            sendUsageInfo
        )
    )
))

planner({
    async executor(process) {
        return process.startSyncProcess()
    },
    errorHandler(e) {
        console.error(e)
    }
})
```

## Usage

`Job` is a foundation block of the `job-planner`. It contains a set of functions to call (processes) and represents
a type of execution flow that will be applied to provided processes.

`Process` is a function or class method (depends on your execution strategy) that contains work
to perform. E.g., database connection, migrations, and a lot of other stuff that require some sort of execution order.

Two utility functions that are used to describe the plan are `sync()` and `parallel()`.

`Sync` is a type of job in which processes will be called one by one after the finish of a previous process.

`Parallel` is a type of job in which processes will be called simultaneously.

You can access them by calling `createPlan` function or by importing them directly to a file:

```javascript
import { createPlan } from 'job-planner'

createPlan(({ sync, parallel }) => parallel(
    sync(
        connectToDB,
        runMigrations
    ),
    performOtherStuff
))

// OR

import { sync, parallel, createPlan } from 'job-planner'

const setupDB = sync(
    connectToDB,
    runMigrations
)

const plan = parallel(
    setupDB,
    performOtherStuff
)

const planner = createPlan(() => plan)
```

Job can contain other jobs as well as processes. There are no limitations on the number of nested jobs, or its depth.

You can set up planner run with `Config` object:

```javascript
// Default values
const config = {
    async executor(process) {
        return process()
    },
    stopOnError: false,
    errorHandler(e) {
        throw e
    }
}
```

`Config.executor()` - function that handles how provided `processes` will be called.

`Config.stopOnError` - flag that determines whether to stop the execution of the whole plan when an error in one
of processes occurs or just pass it to `errorHandler` and continue execution of the plan.

>If `stopOnError` is set to true and exception was threw `errorHandler` will be called firstly and only after that
execution of a plan will be stopped.


`Config.errorHandler` - function that handles error that was raised from provided processes.

