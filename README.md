![dataSPA](./dataSPA.png)

# dataSPA

## A hypermedia framework.

dataSPA is a friendly fork of the [Datastar](https://data-star.dev/) framework for
building everything from simple sites to real-time collaborative web
applications. The aim of dataSPA is to restore the plugins from the
Datastar beta that are now only available in [Datastar Pro](https://data-star.dev/reference/datastar_pro).

A number of plugins were removed from Datastar as they were a source of support
requests, were considered footguns, or were in danger of making apps too
SPA-like. dataSPA aims to restore these plugins and let people enjoy a trip to
the SPA should they wish.

| Features              | Datastar                       | dataSPA                                                |
| ----------------------| ------------------------------ | ------------------------------------------------------ |
| Footguns              | :x:                            | :white_check_mark:                                     |
| Support               | :white_check_mark:             | :x:                                                    |
| Inspector             | Pro Only :moneybag:            | [devtools](https://github.com/dataSPA/dataSPA-devtools) |
| Bundler               | Pro Only :moneybag:            | DIY (just edit the bundle file and rebuild)            |
| Reproducible Builds   | :x:                            | :white_check_mark:                                     |


| Attribute                    | Datastar              | dataSPA            |
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

| Action                       | Datastar              | dataSPA   |
|----------------------------- | --------------------- | --------- |
| @peek()                      | Open-core             | Included  |
| @setAll()                    | Open-core             | Included  |
| @toggleAll()                 | Open-core             | Included  |
| @get()                       | Open-core             | Included  |
| @post()                      | Open-core             | Included  |
| @put()                       | Open-core             | Included  |
| @patch()                     | Open-core             | Included  |
| @delete()                    | Open-core             | Included  |
| @clipboard                   | Pro :moneybag:        | Included  |
| @fit                         | Pro :moneybag:        | TODO      |

| Events                       | Datastar              | dataSPA   |
| ---------------------------- | --------------------- | --------- |
| upload-progress              | Pro :moneybag:        | TODO      |

In addition to the above, dataSPA also has a [browser extension](https://github.com/dataSPA/dataSPA-devtools)
that can be used to inspect signals and SSE events.

## CSP-Friendly Helpers

The `datastar-csp` and `datastar-aliased-csp` bundles replace the default `new Function`
expression evaluator with a jsep-based AST interpreter, making them safe to use under a
strict Content Security Policy (no `unsafe-eval` required).

Because arbitrary function expressions cannot be written directly in HTML attributes in
CSP mode, the `registerHelper` API lets you define complex logic in your own JavaScript
modules and invoke it from expressions using the `#name(...)` syntax.

### Registering a helper

```typescript
import { registerHelper } from 'datastar-csp'

registerHelper('format', (value: number) => value.toFixed(2))
```

Call `registerHelper` at application bootstrap, before Datastar initialises. Registering
the same name twice overwrites the previous entry.

### Using a helper in HTML

```html
<span data-text="#format($price)"></span>
```

Arguments are evaluated by the jsep interpreter before being passed to your function, so
signals, literals, and operators all work as expected:

```html
<span data-text="#currency($total, '€')"></span>
<div data-show="#isAdmin($userRole)"></div>
<input data-bind:value="#clamp($slider, 0, 100)" />
```

### Helper function rules

| Rule | Detail |
|---|---|
| Register before DOM parse | Call `registerHelper` at bootstrap. |
| Arguments are pre-evaluated | Signals and expressions are resolved before your function receives them. |
| No restriction on function body | Complex logic, `new`, closures, and async functions are all fine — the code runs in your module, not in HTML. |
| Non-CSP parity | `registerHelper` is exported from all bundles for API consistency, but only has effect in CSP mode. |


<!--Getting started is as easy as adding a single script tag to your HTML.

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/starfederation/datastar@v1.0.0-RC.6/bundles/datastar.js"></script>
```

Then start adding frontend reactivity using declarative <code>data-*</code> attributes.

```html
<input data-bind:title />
<div data-text="$title.toUpperCase()"></div>
<button data-on:click="@post('/endpoint')">Save</button>
```

Visit the [Datastar Website »](https://data-star.dev/)

Watch the [Videos »](https://www.youtube.com/@data-star)

Join the [Discord Server »](https://discord.gg/bnRNgZjgPh)

## Getting Started

Read the [Getting Started Guide »](https://data-star.dev/guide/getting_started)

## Contributing

Read the [Contribution Guidelines »](https://github.com/starfederation/datastar/blob/develop/CONTRIBUTING.md)

-->
