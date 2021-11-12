const emojiRegex = require("emoji-regex");
const slugify = require("slugify");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addWatchTarget("./src/sass/");

  eleventyConfig.addPassthroughCopy("./src/css");
  eleventyConfig.addPassthroughCopy("./src/fonts");
  eleventyConfig.addPassthroughCopy("./src/img");
  eleventyConfig.addPassthroughCopy("./src/favicon.png");
  eleventyConfig.addPassthroughCopy("./src/_redirects");

  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  eleventyConfig.addFilter("slug", (str) => {
    if (!str) {
      return;
    }

    const regex = emojiRegex();
    // Remove Emoji first
    let string = str.replace(regex, "");

    return slugify(string, {
      lower: true,
      replacement: "-",
      remove: /[*+~·,()'"`´%!?¿:@\/]/g,
    });
  });

  eleventyConfig.addFilter("jsonTitle", (str) => {
    if (!str) {
      return;
    }
    let title = str.replace(/((.*)\s(.*)\s(.*))$/g, "$2&nbsp;$3&nbsp;$4");
    title = title.replace(/"(.*)"/g, '\\"$1\\"');
    return title;
  });

  eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {
      zone: "America/Chicago",
    }).toLocaleString(DateTime.DATE_MED);
  });

  eleventyConfig.addFilter("pubDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {
      zone: "America/Chicago",
    }).toHTTP();
  });

  eleventyConfig.addCollection("orderedEpisodes", function (collection) {
    return collection.getFilteredByTag("episodes").sort((a, b) => {
      return b.data.episodeNumber - a.data.episodeNumber;
    });
  });

  eleventyConfig.addFilter("latest", (array, n) => {
    if (n < 0) {
      return array.slice(n);
    }

    return array;
  });

  eleventyConfig.addFilter("toMins", (time) => {
    return Math.floor(time / 60) + ":" + ("0" + Math.floor(time % 60)).slice(-2);
  });

  eleventyConfig.addPairedShortcode("feature", function (content, img, alt = "") {
    return `<div class="tdbc-feature"><img src="${img}" alt="${alt}" /> <div class="tdbc-feature__content">${content}</div></div>`;
  });

  eleventyConfig.addFilter("hasTag", (tags, tag) => {
    return tags.includes(tag);
  });

  eleventyConfig.addFilter("pluck", function (arr, selections, attr) {
    return arr.filter((item) => selections.includes(item.data[attr]));
  });

  /* Markdown Overrides */
  let markdownLibrary = markdownIt({
    html: true,
  }).use(markdownItAnchor, {
    permalink: true,
    permalinkClass: "tdbc-anchor",
    permalinkSymbol: "#",
    permalinkSpace: false,
    level: [1, 2, 3],
    slugify: (s) =>
      s
        .trim()
        .toLowerCase()
        .replace(/[\s+~\/]/g, "-")
        .replace(/[().`,%·'"!?¿:@*]/g, ""),
  });
  eleventyConfig.setLibrary("md", markdownLibrary);

  return {
    dir: {
      input: "src",
      output: "public",
    },
  };
};
