import { get, set, subscribe } from "svelte/store";
import {
  media_store,
  events_store,
  platform_config_store,
} from "../stores/store";
import { localtoUTCdatetimeobj } from "../utils/utils";

export async function fetch_platform_config() {
  return await fetch("/.netlify/functions/supabase?table=config")
    .then((response) => response.json())
    .then((platform_config) => {
      platform_config_store.set(platform_config[0]);
    });
}

export async function fetch_events() {
  return await fetch("/.netlify/functions/supabase?table=events")
    .then((response) => response.json())
    .then((events) => {
      process_events_data(events);
    });
}

export async function fetch_media_assets() {
  return await fetch("/.netlify/functions/supabase?table=media_assets")
    .then((response) => response.json())
    .then((media_assets) => {
      process_media_assets_data(media_assets);
    });
}

export async function process_events_data(events) {
  let stored_events = get(events_store);
  let new_events = [];

  events.forEach((event, i) => {
    // lowercase all keys in event object
    Object.keys(event).forEach((key) => {
      event[key.toLowerCase()] = event[key];
      delete event[key];
    });

    event.start_date_time = localtoUTCdatetimeobj(
      new Date(event["datetime (yyyy-mm-dd hh:mm:ss)"])
    );

    event.end_date_time = new Date(
      (event.end_date_time = new Date(event.start_date_time.getTime() + 10000))
    );

    event.start = event.start_date_time;
    event.end = event.end_date_time;

    let id = i + " event " + event.event;
    event.id = id;
    event.description = event["event"];

    new_events.push(event);
  });

  if (JSON.stringify(stored_events) !== JSON.stringify(new_events)) {
    events_store.set(new_events);
  }
}

export async function process_media_assets_data(videos) {
  let stored_media_assets = get(media_store);
  let new_videos = {};

  videos.forEach((video) => {
    try {
      Object.values(video).forEach((value, key) => {
        // 1. convert string booleans to real booleans,
        if (value === "TRUE" || value === "FALSE") {
          video[key] = value == "TRUE";

          if (r == 0 && !Object.keys($filter_toggles).includes(key)) {
            $filter_toggles[key] = false;
          }
        } else {
          video[key] = value;
        }
      });

      // 2. convert lon/lat strings to float values
      if (video["Latitude (decimal)"] && video["Longitude (decimal)"]) {
        video.lat = parseFloat(video["Latitude (decimal)"]);
        video.long = parseFloat(video["Longitude (decimal)"]);
      }

      video.type = "range";
      video.label = video.UAR;
      video.id = video.UAR;
      video.url = video.Pathname;

      // 3. convert datetime strings to date objects

      if (
        video["Chronolocation (YYYY-MM-DD HH:MM:SS)"] &&
        video["Asset duration (HH:MM:SS)"]
      ) {
        try {
          video.duration = video["Asset duration (HH:MM:SS)"];
          video.start = localtoUTCdatetimeobj(
            new Date(video["Chronolocation (YYYY-MM-DD HH:MM:SS)"])
          );
          let [length_hours, length_minutes, length_seconds] =
            video.duration.split(":");
          video.end_date_time =
            new Date(video.start).getTime() +
            length_hours * 60 * 60 * 1000 +
            length_minutes * 60 * 1000 +
            length_seconds * 1000;

          video.times = [
            {
              starting_time: new Date(video.start).getTime(),
              ending_time: new Date(video.end_date_time).getTime(),
            },
          ];

          video.end = video.end_date_time;
        } catch (error) {
          console.log("conversion to datetime failed");
        }
        delete video["Chronolocation (YYYY-MM-DD HH:MM:SS)"];
      }

      new_videos[video.UAR] = video;
    } catch (error) {
      console.log(error);
    }
  });

  if (JSON.stringify(stored_media_assets) !== JSON.stringify(new_videos)) {
    media_store.set(new_videos);
  }
}
