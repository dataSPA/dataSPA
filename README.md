![DataSpa](./DataSpa.png)

# DataSpa

## A hypermedia framework.

DataSpa is a friendly fork of the [Datastar](https://data-star.dev/) framework for
building everything from simple sites to real-time collaborative web
applications. The aim of DataSpa is to restore the plugins from the
Datastar beta that are now only available in [Datastar Pro](https://data-star.dev/reference/datastar_pro).

A number of plugins were removed from Datastar as they were a source of support
requests, were considered footguns, or were in danger of making apps too
SPA-like. DataSpa aims to restore these plugins and let people enjoy a trip to
the SPA should they wish.

| Features              | Datastar                       | DataSpa                                                |
| ----------------------| ------------------------------ | ------------------------------------------------------ |
| Footguns              | :x:                            | :white_check_mark:                                     |
| Support               | :white_check_mark:             | :x:                                                    |
| Inspector             | Pro Only :moneybag:            | [devtools](https://github.com/lllama/dataspa-devtools) |
| Bundler               | Pro Only :moneybag:            | DIY (just edit the bundle file and rebuild)            |
| Reproducible Builds   | :x:                            | :white_check_mark:                                     |


| Attribute                    | Datastar              | DataSpa            |
|----------------------------- | --------------------- | ------------------ |
| data-attr                    | Open-core             | Included           |
| data-bind                    | Open-core             | Included           |
| data-class                   | Open-core             | Included           |
| data-computed                | Open-core             | Included           |
| data-effect                  | Open-core             | Included           |
| data-ignore                  | Open-core             | Included           |
| data-ignore-morph            | Open-core             | Included           |
| data-indicator               | Open-core             | Included           |
| data-json-signals            | Open-core             | Included           |
| data-on                      | Open-core             | Included           |
| data-on-intersect            | Open-core             | Included           |
| data-on-interval             | Open-core             | Included           |
| data-on-load                 | Open-core             | Included           |
| data-on-signal-patch         | Open-core             | Included           |
| data-on-signal-patch-filter  | Open-core             | Included           |
| data-preserve-attr           | Open-core             | Included           |
| data-ref                     | Open-core             | Included           |
| data-show                    | Open-core             | Included           |
| data-signals                 | Open-core             | Included           |
| data-style                   | Open-core             | Included           |
| data-text                    | Open-core             | Included           |
| data-animate                 | Pro :moneybag:        | TODO               |
| data-custom-validity         | Pro :moneybag:        | TODO               |
| data-on-raf                  | Pro :moneybag:        | TODO               |
| data-on-resize               | Pro :moneybag:        | TODO               |
| data-persist                 | Pro :moneybag:        | :white_check_mark: |
| data-query-string            | Pro :moneybag:        | TODO               |
| data-replace-url             | Pro :moneybag:        | :white_check_mark: |
| data-scroll-into-view        | Pro :moneybag:        | :white_check_mark: |
| data-view-transition         | Pro :moneybag:        | :white_check_mark: |

| Action                       | Datastar              | DataSpa   |
|----------------------------- | --------------------- | --------- |
| @peek()                      | Open-core             | Included  |
| @setAll()                    | Open-core             | Included  |
| @toggleAll()                 | Open-core             | Included  |
| @get()                       | Open-core             | Included  |
| @post()                      | Open-core             | Included  |
| @put()                       | Open-core             | Included  |
| @patch()                     | Open-core             | Included  |
| @delete()                    | Open-core             | Included  |
| @clipboard                   | Pro :moneybag:        | TODO      |
| @fit                         | Pro :moneybag:        | TODO      |

| Events                       | Datastar              | DataSpa   |
| ---------------------------- | --------------------- | --------- |
| upload-progress              | Pro :moneybag:        | TODO      |

In addition to the above, DataSpa also has a [browser extension](https://github.com/lllama/dataspa-devtools)
that can be used to inspect signals and SSE events.


<!--Getting started is as easy as adding a single script tag to your HTML.

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/starfederation/datastar@main/bundles/datastar.js"></script>
```

Then start adding frontend reactivity using declarative <code>data-*</code> attributes.

```html
<input data-bind-title />
<div data-text="$title.toUpperCase()"></div>
<button data-on-click="@post('/endpoint')">Save</button>
```

Visit the [Datastar Website »](https://data-star.dev/)

Watch the [Videos »](https://www.youtube.com/@data-star)

Join the [Discord Server »](https://discord.gg/bnRNgZjgPh)

## Getting Started

Read the [Getting Started Guide »](https://data-star.dev/guide/getting_started)

## Contributing

Read the [Contribution Guidelines »](https://github.com/starfederation/datastar/blob/develop/CONTRIBUTING.md)

-->
