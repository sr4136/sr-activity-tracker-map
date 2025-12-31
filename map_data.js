import {
  update_map_with_data,
  set_markup,
  set_pristine_data,
} from "./map_init.js";

let DateTime = easepick.DateTime;

let gpx_data = {};
gpx_data.testing = "foobar1";
gpx_data.activity_types = [];
gpx_data.activity_count = gpx_files.length;
gpx_data.activities = [];

/* Parse Runkeeper's ISO datestring to Easepick DateTime object. */
function parseISOString(s) {
  var b = s.split(/\D+/);
  return new DateTime(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}

//console.log(gpx_files);

function fetchAll(urls) {
  return Promise.all(
    urls.map((url) => fetch(url).then((resp) => resp.text(), url))
  ).then((resp) => {
    // console.log(resp);

    resp.forEach((single_gpx, index) => {
      // Set up temp obj for each activity.
      let single_activity_data = {
        gpxid: null,
        type: null,
        name: null,
        path: null,
        gpx_url: urls[index],
        datetime: {
          start: null,
          end: null,
        },
      };

      // Process the gpxml.
      let single_gpxml = new window.DOMParser().parseFromString(
        single_gpx,
        "text/xml"
      );

      // Get the "type" by removing the CDATA and using the first word.
      let single_gpxml_blob = [...single_gpxml.getElementsByTagName("name")];
      single_gpxml_blob = single_gpxml_blob[0].innerHTML
        .replace("<![CDATA[", "")
        .replace("]]>", "");
      single_activity_data.type = single_gpxml_blob.split(" ")[0];

      // If custom 'srinfo', use that instead.
      let single_gpxml_srinfo = single_gpxml.querySelector("srinfo");
      if (single_gpxml_srinfo) {
        //console.log(single_gpxml_srinfo);
        if (single_gpxml_srinfo.getAttribute("type")) {
          single_activity_data.type = single_gpxml_srinfo.getAttribute("type");
        }
        if (single_gpxml_srinfo.getAttribute("name")) {
          single_activity_data.name = single_gpxml_srinfo.getAttribute("name");
        }
      }

      // Add to global types list.
      if (gpx_data.activity_types.indexOf(single_activity_data.type) === -1) {
        gpx_data.activity_types.push(single_activity_data.type);
      }

      // Set up the Polylines.
      let trek_points = [...single_gpxml.getElementsByTagName("trkpt")];
      let trek_points_count = trek_points.length;

      // Check to make sure the trek contains time makers.
      if (trek_points[0].querySelector("time")) {
        let start = trek_points[0].querySelector("time").innerHTML;
        let end =
          trek_points[trek_points_count - 1].querySelector("time").innerHTML;

        // Adjust time by 4h because timezone(??).
        let startDT = parseISOString(start);
        let startDTminus4 = startDT.subtract(4, "hour");
        let endDT = parseISOString(end);
        let endDTminus4 = endDT.subtract(4, "hour");

        single_activity_data.datetime.start = startDTminus4;
        single_activity_data.datetime.end = endDTminus4;

        // Generate unique readable id.
        let gpxiddate = startDTminus4.format("YYYY-MM-DD");
        let gpxidstring = `${index}-${single_activity_data.type}-${gpxiddate}`;
        single_activity_data.gpxid = gpxidstring.toLowerCase();
      }

      let polyline = [];

      trek_points.forEach((trek_point) => {
        // Lat & lon.
        let point = {
          lat: trek_point.getAttribute("lat"),
          lon: trek_point.getAttribute("lon"),
        };

        polyline.push(point);
      });

      single_activity_data.path = polyline;

      // Push single activity data into object.
      gpx_data.activities.push(single_activity_data);

      //console.log(single_activity_data.gpx_url);
    }); //trek_points.forEach

    //console.log(gpx_data);
    set_pristine_data(gpx_data);
    update_map_with_data(gpx_data);
    set_markup(gpx_data);
  });
}

fetchAll(gpx_files);
