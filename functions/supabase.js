const { createClient } = require("@supabase/supabase-js");
const { SUPABASE_URL, SUPABASE_KEY } = process.env;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getConfig() {
    let { data: config, error } = await supabase.from("config").select("*");
    // console.log(config, error);
    return { config, error };
}

async function getEvents() {
    let { data: events, error } = await supabase.from("events").select("*");
    return { events, error };
}

async function getMediaAssets() {
    let { data: media_assets, error } = await supabase.from("media_assets").select("*");
    return { media_assets, error };
}

exports.handler = async (event) => {
    try {
        const requested_table = event.queryStringParameters.table;

        if (requested_table === "config") {
            const { config, error } = await getConfig();
            // let's try this but remember that config is an array, and we might need an object
            // in case not:
            // const finalConfig = config[0];
            // console.log(config, error);
            return {
                statusCode: 200,
                body: JSON.stringify(config),
            };
        } else if (requested_table === "events") {
            const { events, error } = await getEvents();
            // console.log(events, error);
            return {
                statusCode: 200,
                body: JSON.stringify(events),
            };
        } else if (requested_table === "media_assets") {
            const { media_assets, error } = await getMediaAssets();
            // console.log(media_assets, error);
            return {
                statusCode: 200,
                body: JSON.stringify(media_assets),
            };
        } else {
            // console.log("Table not found");
            return {
                statusCode: 400,
                body: "Error: table not found",
            };
        }
    } catch (error) {
        console.log({ error });
        return { statusCode: 500, body: error.toString() };
    }
};
