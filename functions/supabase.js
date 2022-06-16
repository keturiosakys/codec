const { createClient } = require("@supabase/supabase-js");
const { SUPABASE_URL, SUPABASE_KEY } = process.env;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getConfig() {
    let { data: config, error } = await supabase.from("config").select("*");
    // console.log(config, error);
    return { config, error };
}
