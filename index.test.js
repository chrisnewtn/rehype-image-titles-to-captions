import { h } from 'hastscript';
import { it, describe } from 'node:test';
import { deepEqual, equal } from 'node:assert/strict';
import { rehype } from 'rehype';
import { imageTitlesToCaptions } from './index.js';
import rehypeMinifyWhitespace from 'rehype-minify-whitespace';

async function processHTML(htmlString) {
  return await rehype()
    .data('settings', {fragment: true})
    .use(imageTitlesToCaptions)
    .use(rehypeMinifyWhitespace)
    .process(htmlString);
}

async function compareDocs(actual, expected) {
  const [processedActual, processedExpected] = await Promise.all([
    processHTML(actual),
    processHTML(expected),
  ]);

  return equal(
    String(processedActual),
    String(processedExpected)
  );
}

describe('imageTitlesToCaptions', () => {
  describe('when passed no configuration', () => {
    it('replaces images with figcaptions with the title as the caption', () => {
      deepEqual(
        rehype()
          .use(imageTitlesToCaptions)
          .runSync(
            h('root', [
              h('img', {
                title: 'Hello, world!',
                alt: 'An example image.',
                src: 'https://example.com/test.jpg'
              })
            ])
          ),
        h('root', [
          h('figure', [
            h('img', {
              alt: 'An example image.',
              src: 'https://example.com/test.jpg'
            }),
            h('figcaption', 'Hello, world!')
          ])
        ])
      );
    });

    it('ignores images without titles', () => {
      deepEqual(
        rehype()
          .use(imageTitlesToCaptions)
          .runSync(
            h('root', [
              h('img', {
                title: 'Hello, world!',
                alt: 'An example image.',
                src: 'https://example.com/test.jpg'
              }),
              h('img', {
                alt: 'An example image.',
                src: 'https://example.com/test.jpg'
              })
            ])
          ),
        h('root', [
          h('figure', [
            h('img', {
              alt: 'An example image.',
              src: 'https://example.com/test.jpg'
            }),
            h('figcaption', 'Hello, world!')
          ]),
          h('img', {
            alt: 'An example image.',
            src: 'https://example.com/test.jpg'
          })
        ])
      );
    });

    it('ignores mages with empty titles', () => {
      deepEqual(
        rehype()
          .use(imageTitlesToCaptions)
          .runSync(
            h('root', [
              h('img', {
                title: 'Hello, world!',
                alt: 'An example image.',
                src: 'https://example.com/test.jpg'
              }),
              h('img', {
                title: '',
                alt: 'An example image.',
                src: 'https://example.com/test.jpg'
              })
            ])
          ),
        h('root', [
          h('figure', [
            h('img', {
              alt: 'An example image.',
              src: 'https://example.com/test.jpg'
            }),
            h('figcaption', 'Hello, world!')
          ]),
          h('img', {
            title: '',
            alt: 'An example image.',
            src: 'https://example.com/test.jpg'
          })
        ])
      );
    });
  });

  describe('when configured with an imgSelector', () => {
    it('replaces images with figcaptions with the title as the caption', () => {
      deepEqual(
        rehype()
          .use(imageTitlesToCaptions, {
            imgSelector: 'img.to-replace'
          })
          .runSync(
            h('root', [
              h('img', {
                title: 'Hello, world!',
                class: 'to-replace',
                alt: 'An example image.',
                src: 'https://example.com/test.jpg'
              }),
              h('img', {
                title: 'Leave me alone.',
                alt: 'An example image.',
                src: 'https://example.com/test.jpg'
              })
            ])
          ),
        h('root', [
          h('figure', [
            h('img', {
              class: 'to-replace',
              alt: 'An example image.',
              src: 'https://example.com/test.jpg'
            }),
            h('figcaption', 'Hello, world!')
          ]),
          h('img', {
            title: 'Leave me alone.',
            alt: 'An example image.',
            src: 'https://example.com/test.jpg'
          })
        ])
      );
    });

    it('ignores images without titles', () => {
      deepEqual(
        rehype()
          .use(imageTitlesToCaptions, {
            imgSelector: 'img.to-replace'
          })
          .runSync(
            h('root', [
              h('img', {
                title: 'Hello, world!',
                alt: 'An example image.',
                src: 'https://example.com/test.jpg'
              }),
              h('img', {
                class: 'to-replace',
                alt: 'An example image.',
                src: 'https://example.com/test.jpg'
              })
            ])
          ),
        h('root', [
          h('img', {
            title: 'Hello, world!',
            alt: 'An example image.',
            src: 'https://example.com/test.jpg'
          }),
          h('img', {
            class: 'to-replace',
            alt: 'An example image.',
            src: 'https://example.com/test.jpg'
          })
        ])
      );
    });

    it('ignores images with empty titles', () => {
      deepEqual(
        rehype()
          .use(imageTitlesToCaptions, {
            imgSelector: 'img.to-replace'
          })
          .runSync(
            h('root', [
              h('img', {
                title: 'Hello, world!',
                alt: 'An example image.',
                src: 'https://example.com/test.jpg'
              }),
              h('img', {
                title: '',
                class: 'to-replace',
                alt: 'An example image.',
                src: 'https://example.com/test.jpg'
              })
            ])
          ),
        h('root', [
          h('img', {
            title: 'Hello, world!',
            alt: 'An example image.',
            src: 'https://example.com/test.jpg'
          }),
          h('img', {
            title: '',
            class: 'to-replace',
            alt: 'An example image.',
            src: 'https://example.com/test.jpg'
          })
        ])
      );
    });
  });

  describe('when configured with a picture selector', () => {
    it('replaces pictures with figcaptions with the img title as the caption', () => {
      deepEqual(
        rehype()
          .use(imageTitlesToCaptions, {
            pictureSelector: 'article picture:has(img[title])'
          })
          .runSync(
            h('root', [
              h('article', [
                h('picture', [
                  h('img', {
                    title: 'Hello, world!',
                    alt: 'An example image.',
                    src: 'https://example.com/test.jpg'
                  })
                ])
              ])
            ])
          ),
        h('root', [
          h('article', [
            h('figure', [
              h('picture', [
                h('img', {
                  alt: 'An example image.',
                  src: 'https://example.com/test.jpg'
                })
              ]),
              h('figcaption', 'Hello, world!')
            ])
          ])
        ])
      );
    });

    it('ignores pictures with images without titles', () => {
      deepEqual(
        rehype()
          .use(imageTitlesToCaptions, {
            pictureSelector: 'article picture:has(img[title])'
          })
          .runSync(
            h('root', [
              h('article', [
                h('picture', [
                  h('img', {
                    title: 'Hello, world!',
                    alt: 'An example image.',
                    src: 'https://example.com/test.jpg'
                  })
                ]),
                h('picture', [
                  h('img', {
                    alt: 'An example image.',
                    src: 'https://example.com/test.jpg'
                  })
                ])
              ])
            ])
          ),
        h('root', [
          h('article', [
            h('figure', [
              h('picture', [
                h('img', {
                  alt: 'An example image.',
                  src: 'https://example.com/test.jpg'
                })
              ]),
              h('figcaption', 'Hello, world!')
            ]),
            h('picture', [
              h('img', {
                alt: 'An example image.',
                src: 'https://example.com/test.jpg'
              })
            ])
          ])
        ])
      );
    });

    it('ignores pictures with images with empty titles', () => {
      deepEqual(
        rehype()
          .use(imageTitlesToCaptions, {
            pictureSelector: 'article picture:has(img[title])'
          })
          .runSync(
            h('root', [
              h('article', [
                h('picture', [
                  h('img', {
                    title: 'Hello, world!',
                    alt: 'An example image.',
                    src: 'https://example.com/test.jpg'
                  })
                ]),
                h('picture', [
                  h('img', {
                    title: '',
                    alt: 'An example image.',
                    src: 'https://example.com/test.jpg'
                  })
                ])
              ])
            ])
          ),
        h('root', [
          h('article', [
            h('figure', [
              h('picture', [
                h('img', {
                  alt: 'An example image.',
                  src: 'https://example.com/test.jpg'
                })
              ]),
              h('figcaption', 'Hello, world!')
            ]),
            h('picture', [
              h('img', {
                title: '',
                alt: 'An example image.',
                src: 'https://example.com/test.jpg'
              })
            ])
          ])
        ])
      );
    });
  });

  describe('when the image being captioned is in a paragraph tag', () => {
    describe('and that paragraph is empty and NOT also within another paragraph tag', () => {
      it('replaces the paragraph tag with the new figure tag', async () => {
        await compareDocs(`
          <article>
            <p>1</p>
            <p>2</p>
            <p>
              <img
                src="https://example.com/test.jpg"
                alt="An example image."
                title="Hello, world!" />
            </p>
            <p>3</p>
          </article>`, `
          <article>
            <p>1</p>
            <p>2</p>
            <figure>
              <img
                src="https://example.com/test.jpg"
                alt="An example image.">
              <figcaption>Hello, world!</figcaption>
            </figure>
            <p>3</p>
          </article>`
        );
      });
    });

    describe('and that paragraph is NOT empty and NOT also within another paragraph tag', () => {
      it('place the new figure tag after the paragraph formerly containing the image', async () => {
        await compareDocs(`
          <article>
            <p>1</p>
            <p>2</p>
            <p>
              Contrived text
              <img
                src="https://example.com/test.jpg"
                alt="An example image."
                title="Hello, world!" />
            </p>
            <p>3</p>
          </article>`, `
          <article>
            <p>1</p>
            <p>2</p>
            <p>Contrived text</p>
            <figure>
              <img
                src="https://example.com/test.jpg"
                alt="An example image.">
              <figcaption>Hello, world!</figcaption>
            </figure>
            <p>3</p>
          </article>`
        );
      });
    });

    describe('and that paragraph is within yet another paragraph tag', () => {
      // Leaving the figure where it is does technically produce invalid HTML
      // (the reason for moving it in the first place), but it's currently
      // unclear what the best course of action is in this circumstance.
      // Leaving it where it is seems to least worst option.
      it('leaves the figure where it is', async () => {
        await compareDocs(`
          <p>
            <p>1</p>
            <p>2</p>
            <p>
              <img
                src="https://example.com/test.jpg"
                alt="An example image."
                title="Hello, world!" />
            </p>
            <p>3</p>
          </p>`, `
          <p>
            <p>1</p>
            <p>2</p>
            <figure>
              <img
                src="https://example.com/test.jpg"
                alt="An example image.">
              <figcaption>Hello, world!</figcaption>
            </figure>
            <p>3</p>
          </p>`
        );
      });
    });
  });
});
