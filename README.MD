# CPU Monitor

![Uploading output22.gif…]()

## Getting Up and Running

Run `yarn` and `yarn start` for both `cpu-mon-frontend` and `cpu-mon-backend`

## Packages

- Create React App
- Redux Toolkit
  - I decided to use Redux Toolkit's "slice" method of state management because it reduces a lot of the redundency of setting up action constants, action creators, etc, for simple applications.
  - As well I use their their built in version of thunks for async actions.
- D3
- Styled Components

## Chart Design

The CPU monitoring chart (`CPULoadChart`) is a dynamicly updating bar chart. Because the polling rate is intended to be every 10 seconds, and CPU loads can stay relatively steady at times, I thought a bar chart would better differentiate between individual measurements, and more accurately represent the act of polling, rather than the implied interpolation of a line graph.

New bars are added in from the right side of the graph, and fade off the left side when they pass the 10 minute time window. There is also a duplicate of the y axis labelling on both sides for ease of reading from either side of the graph.

The chart is designed to be responsive to changes in window width as well as changing ranges of CPU load values if they exceed 100%. As well, on widths greater than 980px the timestamps for the bars are displayed diagonally on the X axis, and are hidden on smaller widths.

Periods of heavy load are marked with a dark red background on the chart. And if the CPU Load is currently experiencing heavy load, the application indicates `⚠️ Heavy CPU Load`.

## Misc Considerations

The way the polling thunk is processed prevents it from being called twice and resulting in a race condition. A call to the backend will only happen if the last call has returned, even with a faster polling rate.

Given more time I would probably include hover events for the graph, to allow the ability to clearly see the exact CPU load and timestamp for a bar, however I think the context of the chart and the y axis labels offer enough readability for now.

The assignment mentions "Alerting" the user, and I wasn't sure if this meant literally sending an `alert()` call, but I decided against it as it would be easy enough to change if that were the case. However, I think it's a clearer, more common, and less obtrusive pattern to alert within the application itself, and so I included a "CPU Status" check that changes based on current CPU Load, as well as changes the document title.

I think it also goes without saying but if this were a production feature I would of course attempt to work with whatever existing frameworks of state management, styling, and testing were pre-existing in the codebase. Given a production environment I probably would have brought in a more rigorous testing suite to confirm and test the rendering of the D3 chart. It would also be helpful to know how users intend to use the information to better design the chart (e.g. do they intend to be monitoring points of information besides CPU Load? Do they intend to monitor the load of multiple computers? Is heavy CPU Load tolerable or application critical? Is it necessary to know exactly when CPU Load spikes happen or just generally?).

