module.exports = (_type, element, _content, children) => {
  if (element.type === "paragraph") {
    if (children.startsWith("---")) {
      return "<hr>";
    }

    if (_content.startsWith("> ")) {
      return `<blockquote><p>${_content.replace("> ", "")}</p></blockquote>`;
    }
  }

  if (element.type === "hyperlink") {
    const isAnchor = element.data.url.startsWith("https://#");
    const isRelative = element.data.url.startsWith("https:///");

    if (isAnchor || isRelative) {
      return `<a href="${element.data.url.replace("https://", "")}">${children}</a>`;
    }
  }

  return null;
};
