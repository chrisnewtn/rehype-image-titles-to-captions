import { h } from 'hastscript';
import { it, describe } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { rehype } from 'rehype';
import { imageTitlesToCaptions } from './index.js';

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
});
