# rehype-image-titles-to-captions

[![Tests Badge][test-badge]][test]

A [rehype][rehype] plugin that turns image title attributes into caption elements.

While this is a [rehype][rehype] plugin, it's designed to be used as part of a [Markdown to HTML] pipeline.

## Why does this plugin exist?

Markdown has no explict way of captioning images without resorting to inline HTML, this plugin addresses that.

Take the following example Markdown:

```md
![Image alt text](https://example.com/example.jpg "Image title text.")
```

The image title text doesn't do much. Most renderers will show it only when the user holds the mouse over the image. This behaviour isn't obvious to users and [could be considered harmful][title-concerns] from an accessibility standpoint.

This plugin alters the semantics of the title attribute and uses it as caption text instead. The above Markdown, when passed through [remark-rehype][remark-rehype], then this plugin, becomes this:

```html
<figure>
  <img alt="Image alt text" src="https://example.com/example.jpg" />
  <figcaption>Image title text</figcaption>
</figure>
```

This markup is visible to sighted users with no mouse over necessary, and it's legible to screen readers.

This approach of using existing Markdown semantics to get more useful output has advantages:

* **No custom Markdown syntax.** Custom Markdown syntax makes documents less portable. It can make costly migrations necessary when migrating to different renderers that don't support the custom syntax.
* **No inline HTML.** Inline HTML takes presentation choices away from the renderer. An advantage of Markdown is how it separates the document's information from how it is rendered on screen.

## API

This package exports a single function `imageTitlesToCaptions`.

### `imageTitlesToCaptions(options?: Options)`

Finds an `<img>` element in the document with a populated `title` attribute. Moves the `title` text out of the `<img>` and into a new `<figcaption>` element which is placed alongside. Wraps both `<img>` and `<figcaption>` elements in a `<figure>` element. Repeats for each `<img>` in the document.

###### Options

The `imageTitlesToCaptions` function accepts a configuration object with the following properties:

* **`pictureSelector`**. Type: `string`. A [selector][selector] for [`<picture>`][picture] elements. Use this when your images are wrapped in `<picture>` elements.
* **`imgSelector`**. Type: `string` Default: `'img'`. A [selector][selector] for [`<img>`][img] elements. By default, every `<img>` in the document will be captioned. This option is useful for when you want only a subset of images captioned that match a more specific selector.
* **`deleteTitles`**. Type: `boolean`. Default: `true`. When set to `true`, image titles are deleted after being turned into captions. This is because captions and titles have different semantics the writer may not have taken into account. It's also to remove the duplication of information in the resulting document, which reduces its size.

###### Example

```js
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeFormat from 'rehype-format';
import rehypeStringify from 'rehype-stringify';
import {unified} from 'unified';
import {imageTitlesToCaptions} from 'rehype-image-titles-to-captions';

const file = await unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(imageTitlesToCaptions)
  .use(rehypeFormat)
  .use(rehypeStringify)
  .process('![Image alt text](https://example.com/example.jpg "Image caption text.")');

console.log(String(file));
```

Yields:

```html
<p>
  <figure>
    <img src="https://example.com/example.jpg" alt="Image alt text">
    <figcaption>Image caption text.</figcaption>
  </figure>
</p>
```

[test]: https://github.com/chrisnewtn/rehype-image-titles-to-captions/actions/workflows/test.yml
[test-badge]: https://github.com/chrisnewtn/rehype-image-titles-to-captions/actions/workflows/test.yml/badge.svg
[rehype]: https://github.com/rehypejs/rehype
[remark-rehype]: https://github.com/remarkjs/remark-rehype
[title-concerns]: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/title#accessibility_concerns
[selector]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors
[picture]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture
[img]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
