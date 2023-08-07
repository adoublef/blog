/** @jsx h */
import blog, { ga, redirects, h, configureBlog } from "blog";

blog({
    title: "adoublef",
    description: "Welcome to my blog",
    // header: <header>Your custom header</header>,
    // section: (post: Post) => <section>Your custom section with access to Post props.</section>,
    // footer: <footer>Your custom footer</footer>,
    avatar: "static/avatar-1.jpg",
    avatarClass: "rounded-full",
    author: "Kristopher Rahim Afful-Brown",
    links: [
        { title: "Email", url: "mailto:kristopherab@gmail.com" },
        { title: "GitHub", url: "https://github.com/adoublef" },
        { title: "LinkedIn", url: "https://linkedin.com/in/kraffulbrown" },
    ],
    favicon: "static/favicon.png",
    theme: "auto",
    lang: "en",
    style: `
        html {
            background-color: #FFF5F9;
        }
    `,
    // localised format based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
    dateFormat: (date) =>
        new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(date),
    // middlewares: [

    // If you want to set up Google Analytics, paste your GA key here.
    // ga("UA-XXXXXXXX-X"),

    // If you want to provide some redirections, you can specify them here,
    // pathname specified in a key will redirect to pathname in the value.
    // redirects({
    //  "/hello_world.html": "/hello_world",
    // }),

    // ]
});
