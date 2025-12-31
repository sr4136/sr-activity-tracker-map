import { custom_map_styles } from "./map_styles.js";

let DateTime = easepick.DateTime;

let all_bounds = null;
let infowindow = null;
let map = null;
let all_polylines = [];
let all_markers = [];
let pristine_data = null;

const activities_showing = document.getElementById("showing");
const activities_showing_count = document.getElementById("count-showing");
const activities_dates_alert = document.getElementById("datepicker-alert");
const activities_listing = document.getElementById("listing");

const color_marker_start = "#08A69C";
const color_marker_end = "#BD411D";

export function set_pristine_data(original_data) {
  //console.log("SET PRISTINE");
  pristine_data = structuredClone(original_data);
  //console.log(pristine_data);

  /* Setup the extra options. */
  setup_extra_otions();

  /* Create the list */
  addToList(original_data);
}

/* Remove all polylines & markers. */
function clear_everything() {
  // Clear polylines.
  for (let i = 0; i < all_polylines.length; i++) {
    all_polylines[i].setMap(null);
  }
  all_polylines.length = 0;

  // Clear markers.
  for (let i = 0; i < all_markers.length; i++) {
    all_markers[i].setMap(null);
  }
  all_markers.length = 0;

  /* Hide date error. */
  activities_dates_alert.classList.add("hidden");
}

/* Use the incoming data to set some HTML. */
export function set_markup(data) {
  // Activity Count.
  const activity_count_container = document.querySelector("#count-total");
  activity_count_container.innerHTML = data.activity_count;

  // Activity Types.
  const activity_types_container = document.querySelector("#activity-types ul");

  data.activity_types.forEach(function (element) {
    let activity_type_li = `<li class="${element} active" data-type="${element}">${element}</li>`;
    activity_types_container.insertAdjacentHTML("beforeend", activity_type_li);
  });

  let activity_lis = activity_types_container.querySelectorAll("li");
  for (let i = 0; i < activity_lis.length; i++) {
    activity_lis[i].addEventListener("click", function (event) {
      this.classList.toggle("active");
      filter_data(data);
    });
  }
} //set_markup();

/* Filter the data based on the chosen type(s). */
function filter_data(data) {
  const filtered_data = structuredClone(pristine_data);
  const activity_types_container = document.querySelector("#activity-types ul");
  const activity_elements_total_length =
    activity_types_container.querySelectorAll("li").length;

  const activity_elements_active =
    activity_types_container.querySelectorAll(".active");
  const activity_elements_active_length = activity_elements_active.length;

  //console.log("active elemets: ", activity_elements_active);
  //console.log("total count: ", activity_elements_total_length);
  //console.log("active count: ", activity_elements_active_length);

  // None: clear.
  if (activity_elements_active_length == 0) {
    // Reset map & content.
    activities_showing_count.innerHTML = "0";
    clear_everything();
    // All: reset classes, clear, and update.
  } else if (
    activity_elements_active_length == activity_elements_total_length
  ) {
    // Reset map & content.
    clear_everything();
    update_map_with_data(pristine_data);

    // One or more: filter activities, set classes, clear, and update.
  } else {
    // Get active filters.
    let active_types = Array.from(activity_elements_active).map((elem) => {
      return elem.dataset.type;
    });
    //console.log("active types", active_types);

    // Modify the activities list.
    //console.log("filtered activities before", filtered_data.activities);
    filtered_data.activities = filtered_data.activities.filter((item) => {
      return active_types.includes(item.type);
    });
    //console.log("filtered activities after", filtered_data.activities);
    //console.log("filtered", filtered_data);

    // Reset map & content.
    clear_everything();
    update_map_with_data(filtered_data);
    modifyList(filtered_data);
  }
}

/* Pairs of ActivityTypes x Colors. */
function get_color(color) {
  const colors = {
    Running: "#f84499",
    Walking: "#0ec188",
    Hiking: "#8255df",
    Rowing: "#338fed",
    Race: "#241e70",
    Visiting: "#f2a229",
  };
  return colors[color];
}

window.initMap = function () {
  all_bounds = new google.maps.LatLngBounds();
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 11,
    center: {
      lat: 42.4151,
      lng: -71.3838,
    },
    mapTypeId: "roadmap",
    disableDefaultUI: false,
    styles: custom_map_styles,
  });
}; // initMap

/* Process each activity into map. */
export function update_map_with_data(input_data) {
  //console.log("input data", input_data);

  all_bounds = new google.maps.LatLngBounds();

  // Each activity.
  input_data.activities.forEach((activity) => {
    //console.log(activity);

    // Each point, for Google's special `LatLng()`.
    let path_for_google = [];
    activity.path.forEach((point, index) => {
      let point_for_google = new google.maps.LatLng(point.lat, point.lon);

      point_for_google.start_end = activity.path[index];

      path_for_google.push(point_for_google);
      all_bounds.extend(point_for_google);
    });

    // Set the poly on the map.
    let poly = new google.maps.Polyline({
      path: path_for_google,
      defaultColor: get_color(activity.type),
      strokeColor: get_color(activity.type),
      strokeOpacity: 0.75,
      strokeWeight: 4,
      gpxid: activity.gpxid,
    });

    // Calculate polyline distance, meters to miles.
    let poly_meters = google.maps.geometry.spherical.computeLength(
      poly.getPath()
    );
    let poly_miles = poly_meters * 0.000621371192;
    poly.poly_length = poly_miles.toFixed(2);

    // Add polylines to map.
    all_polylines.push(poly);
    poly.setMap(map);

    // Add markers to start/end of polyline.
    let marker_start = new google.maps.Marker({
      position: poly.getPath().getAt(0),
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 3,
        strokeColor: color_marker_start,
      },
      draggable: false,
      map: map,
    });
    let marker_end = new google.maps.Marker({
      position: poly.getPath().getAt(poly.getPath().getLength() - 1),
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 3,
        strokeColor: color_marker_end,
      },
      draggable: false,
      map: map,
    });
    all_markers.push(marker_start);
    all_markers.push(marker_end);

    // Add event listeners to poly.
    google.maps.event.addListener(
      poly,
      "mouseover",
      (function (poly) {
        return function (event) {
          // If an infowindow is open, close it.
          if (infowindow) {
            infowindow.close();
          }

          // Toggle the *other* polylines more transparent.
          all_polylines.forEach(function (single_poly) {
            if (single_poly.gpxid !== poly.gpxid) {
              single_poly.setOptions({ strokeOpacity: "0.15" });
              single_poly.setOptions({ zIndex: 0 });
            } else {
              single_poly.setOptions({ strokeOpacity: "0.75" });
              single_poly.setOptions({ zIndex: 100 });
            }
          });

          /* Setup new infowindow. */
          infowindow = new google.maps.InfoWindow();

          // Datetime formats: define the supplied format (via runkeeper) & create new datetime.
          let dt_format_input = "YYYY-MM-DD hh:mm:ss";
          let dt_in_start = new DateTime(
            activity.datetime.start,
            dt_format_input
          );
          let dt_in_end = new DateTime(activity.datetime.end, dt_format_input);

          // Datetime formats: format for output.
          let date_format_output = "MMM DD, YYYY";
          let time_format_output = "hh:mm:ss a";

          let date_out = dt_in_start.format(date_format_output);
          let time_out_start = dt_in_start.format(time_format_output);
          let time_out_end = dt_in_end.format(time_format_output);

          let activity_heading = activity.type;
          if (activity.name) {
            activity_heading += `: ${activity.name}`;
          }

          let iw_content = `<div class="srinfowindow ${activity.type}">`;
          iw_content += `<h3 class="activity-heading">${activity_heading}</h3>`;
          iw_content += `<span class="activity-date">${date_out}</span>`;
          iw_content += `<span class="activity-distance">${poly.poly_length} mi</span>`;
          iw_content += `<span class="activity-time">${time_out_start} - ${time_out_end}</span>`;
          iw_content += `</div>`;

          infowindow.setContent(iw_content);
          infowindow.setPosition(event.latLng);
          infowindow.open(map);
        };
      })(poly)
    );
    google.maps.event.addListener(
      poly,
      "mouseout",
      (function (poly) {
        return function (event) {
          // Toggle all polylines back to original transparency.
          all_polylines.forEach(function (single_poly) {
            single_poly.setOptions({ strokeOpacity: "0.75" });
          });

          if (infowindow) {
            infowindow.close();
          }
        };
      })(poly)
    );
  });

  // Toggle start/end markers visibility depending on zoom.
  google.maps.event.addListener(map, "zoom_changed", function () {
    var zoom = map.getZoom();

    for (let i = 0; i < all_markers.length; i++) {
      all_markers[i].setOptions({
        visible: zoom >= 15,
      });
    }
  });

  // Set markers to initally be hidden.
  for (let i = 0; i < all_markers.length; i++) {
    all_markers[i].setOptions({
      visible: false,
    });
  }

  /*
  // Set the map bounds & "auto" zoom. Set zoom to 15, fitbounds, then remove zoom.
  map.setOptions({
    maxZoom: 15,
  });
  map.fitBounds(all_bounds);
  map.setOptions({
    maxZoom: null,
  });
  */

  // Update count.
  activities_showing_count.innerHTML = input_data.activities.length;
}

function setupDatePickers() {
  const picker = new easepick.create({
    css: [
      "https://cdn.jsdelivr.net/npm/@easepick/bundle@1.2.1/dist/index.css",
      "./style-easepick.css",
    ],
    plugins: ["RangePlugin", "PresetPlugin"],
    element: document.getElementById("datepicker"),
    format: "MM/DD/YYYY",
    calendars: 2,
    PresetPlugin: {
      position: "left",
    },
    setup(picker) {
      /* Picker - on view/open/show. */
      picker.on("show", (e) => {
        /* Modal background: show. */
        document.body.classList.add("modal");
      });

      /* Picker - on chosen dates. */
      picker.on("select", (e) => {
        /* Modal background: hide. */
        document.body.classList.remove("modal");
        /* Filter the data w/date. */
        let date_start = e.detail.start;
        let date_end = e.detail.end;
        filter_data_withDate([date_start, date_end]);
      });

      /* Picker - on exit/cliked-out-of. */
      picker.on("hide", (e) => {
        /* Modal background: hide. */
        document.body.classList.remove("modal");
      });

      /* Set -1 month on open if on large screens.
       * via: https://github.com/easepick/easepick/blob/e33a7f4e4ec1a8b15557ea864445923a278bc88b/packages/core/src/core.ts#L186
       */
      if (window.innerWidth >= 993) {
        picker.calendars[0].subtract(1, "month");
      }
    },
  });

  /* Reset dates button. */
  const dates_reset = document.getElementById("datepicker-reset");
  dates_reset.addEventListener("click", function () {
    // Reset map & content.
    clear_everything();
    update_map_with_data(pristine_data);
    picker.clear();
  });
}
setupDatePickers();

function setup_extra_otions() {
  /* Show listing. */
  const checkbox_listing = document.getElementById("check-listing");
  checkbox_listing.checked = false;

  checkbox_listing.addEventListener("change", function () {
    if (checkbox_listing.checked) {
      document.body.classList.add("show-listing");
    } else {
      document.body.classList.remove("show-listing");
    }
  });

  /* Latest event: highlight it. */
  const checkbox_latest = document.getElementById("check-latest");
  checkbox_latest.checked = false;

  checkbox_latest.addEventListener("change", function () {
    const last_poly = all_polylines[0];
    let last_poly_latlngs = null;
    let keyname = null;

    if (this.checked) {
      last_poly.setOptions({ strokeColor: "#FF0000" });
      last_poly.setOptions({ zIndex: 100 });
    } else {
      last_poly.setOptions({ strokeColor: last_poly.defaultColor });
      last_poly.setOptions({ zIndex: 0 });
    }

    // Why does Gmaps obfuscate the property names within latLngs?
    // Get the first object-property's first array-item's first object-property.
    keyname = Object.keys(last_poly.latLngs)[0];
    last_poly_latlngs = last_poly.latLngs[keyname][0][keyname];

    const bounds_latest = new google.maps.LatLngBounds();
    last_poly_latlngs.forEach(function (LatLng) {
      bounds_latest.extend(LatLng);
    });
    map.fitBounds(bounds_latest);

    let currentZoom = map.getZoom();
    map.setZoom(currentZoom - 2);
  });

  /* Suppress infowindows. */
  const checkbox_suppress = document.getElementById("check-suppress");
  checkbox_suppress.checked = false;

  checkbox_suppress.addEventListener("change", function () {
    document.body.classList.toggle(
      "suppress-infowindows",
      checkbox_suppress.checked
    );
  });

  /* Map style toggler. */
  const checkbox_default_style = document.getElementById("check-default-style");
  checkbox_default_style.checked = false;

  checkbox_default_style.addEventListener("change", function () {
    if (checkbox_default_style.checked) {
      map.setOptions({
        styles: null,
      });
    } else {
      map.setOptions({
        styles: custom_map_styles,
      });
    }
  });

  /* Current location. */
  let marker_current_location = new google.maps.Marker({
    draggable: false,
    map: map,
    visible: false,
  });
  let marker_color_bool = false;

  const checkbox_current_location = document.getElementById("check-location");
  checkbox_current_location.checked = false;

  let current_location_updater = null;

  function update_location() {
    // console.log("Location requested.");
    if (navigator) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const current_pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            marker_current_location.setOptions({
              visible: true,
              position: current_pos,
              icon: marker_color_bool
                ? "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                : "https://maps.google.com/mapfiles/ms/icons/purple-dot.png",
            });
            // console.log("Location found: ", current_pos);
            current_location_updater = setTimeout(function () {
              update_location();
            }, 5000);

            marker_color_bool = !marker_color_bool;
          },
          (error) => {
            checkbox_current_location.checked = false;
            alert(
              "Geolocation declined by user --OR-- allowed by user but not enabled on device."
            );
          }
        );
      } else {
        checkbox_current_location.checked = false;
        alert("Geolocation not supported on device.");
      }
    }
  }

  checkbox_current_location.addEventListener("change", () => {
    // console.log("Location toggled: ", checkbox_current_location.checked);
    if (checkbox_current_location.checked) {
      update_location();
    } else {
      marker_current_location.setOptions({
        visible: false,
      });
    }
  });

  /* Search. */
  const search_box = document.getElementById("searchbox");
  const search_button = document.getElementById("searchbox-go");

  search_box.addEventListener("keypress", function (event) {
    if (event.key == "Enter") {
      pan_map_to_location();
    }
  });
  search_button.addEventListener("click", function () {
    pan_map_to_location();
  });
}

function pan_map_to_location() {
  const search_box = document.getElementById("searchbox");
  const geocoder = new google.maps.Geocoder();
  const query = search_box.value.trim();
  const address_query = query;

  if ("homebase" == address_query) {
    const homebase = new google.maps.LatLng({
      lat: 42.42599,
      lng: -71.33429,
    });
    map.panTo(homebase);
    map.setZoom(12);
  } else {
    geocoder.geocode({ address: address_query }, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        const found_latLng = results[0].geometry.location;
        const point_for_google = new google.maps.LatLng(
          found_latLng.lat(),
          found_latLng.lng()
        );
        const current_zoom = map.getZoom();
        all_bounds = new google.maps.LatLngBounds(point_for_google);
        map.fitBounds(all_bounds);
        map.setZoom(current_zoom);
      } else {
        alert("Geocode usuccessful: " + status);
      }
    });
  }
}

function filter_data_withDate(supplied_dates) {
  const dated_data = structuredClone(pristine_data);

  //console.log(supplied_dates);

  dated_data.activities = dated_data.activities.filter((item) => {
    const item_date_formatted = new DateTime(item.datetime.start);

    // Only one day selected.
    if (supplied_dates[0].isSame(supplied_dates[1])) {
      //   console.log(
      //     "looking for single: ",
      //     item_date_formatted,
      //     "in: ",
      //     supplied_dates[0],
      //     item_date_formatted.isSame(supplied_dates[0], "day"),
      //     item.gpx_url
      //   );
      return item_date_formatted.isSame(supplied_dates[0], "day");
    } else {
      //   console.log(
      //     "looking for: ",
      //     item_date_formatted,
      //     "between: ",
      //     supplied_dates[0],
      //     supplied_dates[1],
      //     item_date_formatted.isBetween(supplied_dates[0], supplied_dates[1],"[]"),
      //     item.gpx_url
      //   );

      return item_date_formatted.isBetween(
        supplied_dates[0],
        supplied_dates[1],
        "[]"
      );
    }
  });

  //console.log("remaining activities: ", dated_data.activities.length);
  if (dated_data.activities.length > 0) {
    // Reset map & content.
    clear_everything();
    update_map_with_data(dated_data);
  } else {
    activities_dates_alert.classList.remove("hidden");
  }
}

function addToList(list_input_data) {
  list_input_data.activities = list_input_data.activities.toReversed();
  list_input_data.activities.forEach((activity) => {
    // Datetime formats: define the supplied format (via runkeeper) & create new datetime.
    let dt_format_input = "YYYY-MM-DD hh:mm:ss";
    let dt_in_start = new DateTime(activity.datetime.start, dt_format_input);
    let dt_in_end = new DateTime(activity.datetime.end, dt_format_input);

    // Datetime formats: format for output.
    let date_format_output = "MMM DD, YYYY";
    let time_format_output = "hh:mm:ss a";

    let date_out = dt_in_start.format(date_format_output);
    let time_out_start = dt_in_start.format(time_format_output);
    let time_out_end = dt_in_end.format(time_format_output);

    let activity_heading = activity.type;
    if (activity.name) {
      activity_heading += `: ${activity.name}`;
    }

    let list_content = `<li class="${activity.type}">`;
    list_content += `<h3 class="activity-heading"><input type="checkbox" checked  data-id="${activity.gpxid}" /> ${activity_heading}</h3>`;
    list_content += `<div class="activity-datetime"><div class="activity-date">${date_out}</div>`;
    //list_content += `<span class="activity-distance">${poly.poly_length} mi</span>`;
    list_content += `<div class="activity-time">${time_out_start} - ${time_out_end}</div></div>`;
    list_content += `</li>`;

    activities_listing.innerHTML += list_content;
  });
}

function modifyList(changed_data) {
  /* Uncheck all. */
  let all_checkboxes = [...activities_listing.getElementsByTagName("input")];
  all_checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  /* Check the shown ones (from changed_data). */
  changed_data.activities.forEach((activity) => {
    let current_data_id = activity.gpxid;
    let matching_activity = document.querySelector(
      '#listing li input[data-id="' + current_data_id + '"]'
    );
    matching_activity.checked = true;
  });
}
