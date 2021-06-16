# Job Planner 🤖


```javascript
const planner = createPlan(({ sync }) => sync(
    connectToDB,
    runMigrations
))

planner()
``` 

```javascript
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
    stopOnError: true,
    executor(process) {
        return process.startSyncProcess()
    },
    errorHandler(e) {
        console.error(e)
    }
})
```
