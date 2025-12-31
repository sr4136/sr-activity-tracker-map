
# SR Activity Tracker Map

I’ve used various outdoor activity trackers over the years. Think Runkeeper, AllTrails, Garmin Connect, etc. Generally, these applications let you export your data as .gpx files. I enjoy owning my data, so this map is one of the ways I sort and visualize that activity data.

Screenshot:
[![](https://steverudolfi.com/wp-content/uploads/2025/12/20251219_163008541-1024x608.png)](https://steverudolfi.com/wp-content/uploads/2025/12/20251219_163008541.png)

You can check out a [public demo](https://steverudolfi.com/demos/sr-activity-tracker-map/) (with a small slice of demo data) as well as the [corresponding project page on my site](https://steverudolfi.com/posts/activity-tracker-map/) mirroring most of what you'll read here.

### Some initial requirements I laid out for myself:

-   a map that shows the routes of activities
-   on the server: use PHP to consume a directory containing .gpx files, pass it to JS as JSON
    -   [link to code](https://github.com/sr4136/sr-activity-tracker-map/blob/main/gpx_paths.php)
-   with JS, parse the .gpx data: standardize any inconsistencies, use custom data over default data
    -   I wanted to give names to the activities that will show up in the infowindow– as well as sometimes override the activity type. For that, I look for an `<srinfo>` node within the `<trk>` node.
    -   [link to code: custom data](https://github.com/sr4136/sr-activity-tracker-map/blob/f4ea83b6cacf6056b8a485ffc97ba6afc9b624ed/map_data.js#L56C1-L66C8)
    -   [link to gpx with custom data](https://github.com/sr4136/sr-activity-tracker-map/blob/main/gpx/2023-09-19-125332.gpx#L12)
    -   [link to code: simplifying gpx path data](https://github.com/sr4136/sr-activity-tracker-map/blob/f4ea83b6cacf6056b8a485ffc97ba6afc9b624ed/map_data.js#L98-L113)
    -   [link to code: category & color pairs](https://github.com/sr4136/sr-activity-tracker-map/blob/main/map_init.js#L124C1-L135C2)
-   passing it along to the Google Maps API, which adds markers & infowindows to the map, adds the markup to the page for the sidebar options and filters
    -   [link to code: parse data and kickoff](https://github.com/sr4136/sr-activity-tracker-map/blob/main/map_init.js)
    -   [link to code: sidebar options and filters](https://github.com/sr4136/sr-activity-tracker-map/blob/main/map_init.js#L383-L530)

### And then as I worked through the project, I added some features:

-   a date picker/calendar
    -   [link to code: datepicker](https://github.com/sr4136/sr-activity-tracker-map/blob/main/map_init.js#L327-L381) (Easepick.js)
-   a search box to move the map to a specific location
    -   [link to code: location search](https://github.com/sr4136/sr-activity-tracker-map/blob/main/map_init.js#L518-L530)
-   some “view” options like:
    -   highlight the latest activity
        -   [link to code: highlight the latest activity](https://github.com/sr4136/sr-activity-tracker-map/blob/main/map_init.js#L396-L411)
    -   suppress the infowindows– sometimes it’s easier to look at and compare activities without the infowindows popping up.
        -   [link to code: suppress infowindows](https://github.com/sr4136/sr-activity-tracker-map/blob/main/map_init.js#L428-L437)
    -   switch to the default (away from [my custom](https://github.com/sr4136/sr-activity-tracker-map/blob/main/map_styles.js)) map style
        -   [link to code: toggle map style](https://github.com/sr4136/sr-activity-tracker-map/blob/main/map_init.js#L439-L453)
    -   show live location pin that updates as you move– sometimes if I’m at a destination I’ve been to before, I can check to see which specific routes I’ve done before or not
        -   [link to code: live location](https://github.com/sr4136/sr-activity-tracker-map/blob/main/map_init.js#L518-L562)

### Some screenshots:
[![](https://steverudolfi.com/wp-content/uploads/2025/12/a3GCTcHqvB.png)](https://steverudolfi.com/wp-content/uploads/2025/12/a3GCTcHqvB.png)

[![](https://steverudolfi.com/wp-content/uploads/2025/12/Y67Y6CPLXr.png)](https://steverudolfi.com/wp-content/uploads/2025/12/Y67Y6CPLXr.png)

[![](https://steverudolfi.com/wp-content/uploads/2025/12/20251219_163105459.png)](https://steverudolfi.com/wp-content/uploads/2025/12/20251219_163105459.png)



### Next steps:

-   add an activity listing with checkboxes to compare/display specific activities
    -   This is in progress, check out [where it is in the code](https://github.com/sr4136/sr-activity-tracker-map/blob/main/map_init.js#L612-L659)
-   the “latest activity” checkbox is sometimes buggy, ex: when multiple activities are within the same day
