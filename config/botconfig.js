module.exports =
{
    env: 'dev',
    assets_path: "",

    botconfig:
    {
        //variable to set user from user table
        use_permanent_bot_user: true,
        typing_delay: true,
        typing_time: 30, //characters per second
        time_for_typing_on: 3500,
        humanize: true,
        humanize_subs: false,
        typing_error_chance: 0,
    },

    //facebook
    facebook:
    {
        send_to: true,
        graph_url: "https://graph.facebook.com",
        version: "v2.8",
        login_app_id: "",
        login_app_secret: "",
        verify_token: 'bot_is_a_bot',
        pages: {},
    },

    database:
    {
        config:
        {
            host: "localhost",
            port: "3306",
            user: "root",
            password: "",
            database: "bot",
            debug: false
        },

        user_table: 'tbl_user',
        storage_table: 'tbl_user',
        pages_table: 'tbl_page'
    }
}
