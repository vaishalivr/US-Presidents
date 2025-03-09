
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const svgWidth = writable(30);
    const svgHeight = writable(30);
    const maxCirclesPerRow = writable(1);
    const totalRows = writable(1);
    const innerRadius = writable(70);
    const outerRadius = writable(100);
    const circleSpacing = writable(100);
    const rowSpacing = writable(200);
    const titleSpace = writable(300);
    const selectedCircleId = writable(null);

    const presidents = writable([
      {
        name: "George Washington",
        status: "dead",
        birthYear: 1732,
        birthPlace: "Westmoreland County, Virginia",
        parents: "Augustine Washington and Mary Ball Washington",
        deathYear: 1799,
        deathPlace: "Mount Vernon, Virginia",
        deathReason: "Epiglottitis or pneumonia",
        presidencyStart: 1789,
        presidencyEnd: 1797,
        keyPolicies: 6,
        party: "None",
        spouse: "Martha Custis",
        children: "None",
        occupationBeforePresidency: "Farmer and Soldier",
      },
      {
        name: "John Adams",
        status: "dead",
        birthYear: 1735,
        birthPlace: "Braintree, Massachusetts",
        parents: "John Adams Sr. and Susanna Boylston",
        deathYear: 1826,
        deathPlace: "Quincy, Massachusetts",
        deathReason: "Heart failure and natural causes",
        presidencyStart: 1797,
        presidencyEnd: 1801,
        keyPolicies: 16,
        party: "Federalist",
        spouse: "Abigail Adams",
        children: "None",
        occupationBeforePresidency: "Lawyer",
      },
      {
        name: "Thomas Jefferson",
        status: "dead",
        birthYear: 1743,
        birthPlace: "Shadwell, Virginia",
        parents: "Peter Jefferson and Jane Randolph",
        deathYear: 1826,
        deathPlace: "Monticello, Virginia",
        deathReason: "Kidney infection and natural causes",
        presidencyStart: 1801,
        presidencyEnd: 1809,
        keyPolicies: 12,
        party: "Democratic-Republican",
        spouse: "Martha Wayles Skelton Jefferson",
        children: "None",
        occupationBeforePresidency: "Planter and Lawyer",
      },
      {
        name: "James Madison",
        status: "dead",
        birthYear: 1751,
        birthPlace: "Port Conway, Virginia",
        parents: "James Madison Sr. and Nelly Conway Madison",
        deathYear: 1836,
        deathPlace: "Montpelier, Virginia",
        deathReason: "Heart failure and natural causes",
        presidencyStart: 1809,
        presidencyEnd: 1817,
        keyPolicies: 8,
        party: "Democratic-Republican",
        spouse: "Dolley Payne Todd Madison",
        children: "None",
        occupationBeforePresidency: "Farmer and Politician",
      },
      {
        name: "James Monroe",
        status: "dead",
        birthYear: 1758,
        birthPlace: "Westmoreland County, Virginia",
        parents: "Spence Monroe and Elizabeth Jones",
        deathYear: 1831,
        deathPlace: "New York City, New York",
        deathReason: "Tuberculosis",
        presidencyStart: 1817,
        presidencyEnd: 1825,
        keyPolicies: 10,
        party: "Democratic-Republican",
        spouse: "Elizabeth Kortright Monroe",
        children: "3",
        occupationBeforePresidency: "Lawyer and Soldier",
      },
      {
        name: "John Quincy Adams",
        status: "dead",
        birthYear: 1767,
        birthPlace: "Braintree, Massachusetts",
        parents: "John Adams and Abigail Adams",
        deathYear: 1848,
        deathPlace: "Washington, D.C.",
        deathReason: "Stroke",
        presidencyStart: 1825,
        presidencyEnd: 1829,
        keyPolicies: 8,
        party: "Democratic-Republican",
        spouse: "Louisa Catherine Johnson Adams",
        children: "4",
        occupationBeforePresidency: "Diplomat and Lawyer",
      },
      {
        name: "Andrew Jackson",
        status: "dead",
        birthYear: 1767,
        birthPlace: "Waxhaws region, South Carolina/North Carolina",
        parents: "Andrew Jackson Sr. and Elizabeth Hutchinson Jackson",
        deathYear: 1845,
        deathPlace: "Nashville, Tennessee",
        deathReason: "Tuberculosis and natural causes",
        presidencyStart: 1829,
        presidencyEnd: 1837,
        keyPolicies: 12,
        party: "Democratic",
        spouse: "Rachel Donelson Robards Jackson",
        children: "None",
        occupationBeforePresidency: "Lawyer and Military Leader",
      },
      {
        name: "Martin Van Buren",
        status: "dead",
        birthYear: 1782,
        birthPlace: "Kinderhook, New York",
        parents: "Abraham Van Buren and Maria Hoes",
        deathYear: 1862,
        deathPlace: "Kinderhook, New York",
        deathReason: "Pneumonia",
        presidencyStart: 1837,
        presidencyEnd: 1841,
        keyPolicies: 8,
        party: "Democratic",
        spouse: "Hannah Hoes Van Buren",
        children: "5",
        occupationBeforePresidency: "Lawyer and Politician",
      },
      {
        name: "William Henry Harrison",
        status: "dead",
        birthYear: 1773,
        birthPlace: "Berkeley Plantation, Virginia",
        parents: "Benjamin Harrison V and Elizabeth Bassett Harrison",
        deathYear: 1841,
        deathPlace: "Washington, D.C.",
        deathReason: "Pneumonia",
        presidencyStart: 1841,
        presidencyEnd: 1841,
        keyPolicies: 3,
        party: "Whig",
        spouse: "Anna Tuthill Symmes Harrison",
        children: "10",
        occupationBeforePresidency: "Military Officer and Politician",
      },
      {
        name: "John Tyler",
        status: "dead",
        birthYear: 1790,
        birthPlace: "Charles City County, Virginia",
        parents: "John Tyler Sr. and Mary Ball",
        deathYear: 1862,
        deathPlace: "Richmond, Virginia",
        deathReason: "Stroke",
        presidencyStart: 1841,
        presidencyEnd: 1845,
        keyPolicies: 5,
        party: "Whig",
        spouse: "Letitia Christian Tyler",
        children: "8",
        occupationBeforePresidency: "Lawyer and Politician",
      },
      {
        name: "James K. Polk",
        status: "dead",
        birthYear: 1795,
        birthPlace: "Pineville, North Carolina",
        parents: "Samuel Polk and Jane Knox",
        deathYear: 1849,
        deathPlace: "Nashville, Tennessee",
        deathReason: "Cholera",
        presidencyStart: 1845,
        presidencyEnd: 1849,
        keyPolicies: 9,
        party: "Democratic",
        spouse: "Sarah Childress Polk",
        children: "None",
        occupationBeforePresidency: "Lawyer",
      },
      {
        name: "Zachary Taylor",
        status: "dead",
        birthYear: 1784,
        birthPlace: "Barboursville, Virginia",
        parents: "Richard Taylor and Sarah Strother",
        deathYear: 1850,
        deathPlace: "Washington, D.C.",
        deathReason: "Gastroenteritis",
        presidencyStart: 1849,
        presidencyEnd: 1850,
        keyPolicies: 4,
        party: "Whig",
        spouse: "Margaret Mackall Smith Taylor",
        children: "6",
        occupationBeforePresidency: "Military Officer",
      },
      {
        name: "Millard Fillmore",
        status: "dead",
        birthYear: 1800,
        birthPlace: "Summerhill, New York",
        parents: "Nathaniel Fillmore and Phoebe Millard",
        deathYear: 1874,
        deathPlace: "Buffalo, New York",
        deathReason: "Stroke",
        presidencyStart: 1850,
        presidencyEnd: 1853,
        keyPolicies: 6,
        party: "Whig",
        spouse: "Abigail Powers Fillmore",
        children: "2",
        occupationBeforePresidency: "Lawyer",
      },
      {
        name: "Franklin Pierce",
        status: "dead",
        birthYear: 1804,
        birthPlace: "Hillsborough, New Hampshire",
        parents: "Benjamin Pierce and Anna Kendrick",
        deathYear: 1869,
        deathPlace: "Concord, New Hampshire",
        deathReason: "Pneumonia",
        presidencyStart: 1853,
        presidencyEnd: 1857,
        keyPolicies: 7,
        party: "Democratic",
        spouse: "Jane Means Appleton Pierce",
        children: "3",
        occupationBeforePresidency: "Lawyer and Politician",
      },
      {
        name: "James Buchanan",
        status: "dead",
        birthYear: 1791,
        birthPlace: "Cove Gap, Pennsylvania",
        parents: "James Buchanan Sr. and Elizabeth Speer",
        deathYear: 1868,
        deathPlace: "Lancaster, Pennsylvania",
        deathReason: "Pneumonia",
        presidencyStart: 1857,
        presidencyEnd: 1861,
        keyPolicies: 6,
        party: "Democratic",
        spouse: "None",
        children: "None",
        occupationBeforePresidency: "Diplomat and Lawyer",
      },
      {
        name: "Abraham Lincoln",
        status: "dead",
        birthYear: 1809,
        birthPlace: "Hodgenville, Kentucky",
        parents: "Thomas Lincoln and Nancy Hanks",
        deathYear: 1865,
        deathPlace: "Washington, D.C.",
        deathReason: "Assassination",
        presidencyStart: 1861,
        presidencyEnd: 1865,
        keyPolicies: 13,
        party: "Republican",
        spouse: "Mary Todd Lincoln",
        children: "4",
        occupationBeforePresidency: "Lawyer",
      },
      {
        name: "Andrew Johnson",
        status: "dead",
        birthYear: 1808,
        birthPlace: "Raleigh, North Carolina",
        parents: "Mary (McDonough) Johnson and Jacob Johnson",
        deathYear: 1875,
        deathPlace: "Elizabethton, Tennessee",
        deathReason: "Stroke",
        presidencyStart: 1865,
        presidencyEnd: 1869,
        keyPolicies: 6,
        party: "National Union",
        spouse: "Eliza McCardle Johnson",
        children: "5",
        occupationBeforePresidency: "Tailor and Politician",
      },
      {
        name: "Ulysses S. Grant",
        status: "dead",
        birthYear: 1822,
        birthPlace: "Point Pleasant, Ohio",
        parents: "Jesse Grant and Hannah Simpson",
        deathYear: 1885,
        deathPlace: "Wilton, New York",
        deathReason: "Cancer of the throat",
        presidencyStart: 1869,
        presidencyEnd: 1877,
        keyPolicies: 10,
        party: "Republican",
        spouse: "Julia Dent Grant",
        children: "4",
        occupationBeforePresidency: "Military Leader",
      },
      {
        name: "Rutherford B. Hayes",
        status: "dead",
        birthYear: 1822,
        birthPlace: "Delaware, Ohio",
        parents: "Rutherford Hayes Sr. and Sophia Birchard",
        deathYear: 1893,
        deathPlace: "Fremont, Ohio",
        deathReason: "Heart failure",
        presidencyStart: 1877,
        presidencyEnd: 1881,
        keyPolicies: 8,
        party: "Republican",
        spouse: "Lucy Webb Hayes",
        children: "8",
        occupationBeforePresidency: "Lawyer and Politician",
      },
      {
        name: "James A. Garfield",
        status: "dead",
        birthYear: 1831,
        birthPlace: "Moreland Hills, Ohio",
        parents: "Abigail (Ballou) Garfield and Eliza (Tanner) Garfield",
        deathYear: 1881,
        deathPlace: "Elberon, New Jersey",
        deathReason: "Assassination",
        presidencyStart: 1881,
        presidencyEnd: 1881,
        keyPolicies: 2,
        party: "Republican",
        spouse: "Lucretia Rudolph Garfield",
        children: "7",
        occupationBeforePresidency: "Military Leader and Politician",
      },
      {
        name: "Chester A. Arthur",
        status: "dead",
        birthYear: 1829,
        birthPlace: "Fairfield, Vermont",
        parents: "William Arthur and Malvina Stone",
        deathYear: 1886,
        deathPlace: "New York City, New York",
        deathReason: "Stroke",
        presidencyStart: 1881,
        presidencyEnd: 1885,
        keyPolicies: 6,
        party: "Republican",
        spouse: "Ellen Lewis Herndon Arthur",
        children: "3",
        occupationBeforePresidency: "Lawyer",
      },
      {
        name: "Grover Cleveland",
        status: "dead",
        birthYear: 1837,
        birthPlace: "Caldwell, New Jersey",
        parents: "Richard Falley Cleveland and Ann Neal Cleveland",
        deathYear: 1908,
        deathPlace: "Princeton, New Jersey",
        deathReason: "Heart failure",
        presidencyStart: 1885,
        presidencyEnd: 1889,
        keyPolicies: 7,
        party: "Democratic",
        spouse: "Frances Folsom Cleveland",
        children: "5",
        occupationBeforePresidency: "Lawyer and Politician",
      },
      {
        name: "Benjamin Harrison",
        status: "dead",
        birthYear: 1833,
        birthPlace: "North Bend, Ohio",
        parents: "John Scott Harrison and Elizabeth Ramsey Irwin",
        deathYear: 1901,
        deathPlace: "Indianapolis, Indiana",
        deathReason: "Pneumonia",
        presidencyStart: 1889,
        presidencyEnd: 1893,
        keyPolicies: 8,
        party: "Republican",
        spouse: "Caroline Lavinia Scott Harrison",
        children: "1",
        occupationBeforePresidency: "Lawyer and Politician",
      },
      {
        name: "William McKinley",
        status: "dead",
        birthYear: 1843,
        birthPlace: "Niles, Ohio",
        parents: "William McKinley Sr. and Nancy Allison McKinley",
        deathYear: 1901,
        deathPlace: "Buffalo, New York",
        deathReason: "Assassination",
        presidencyStart: 1897,
        presidencyEnd: 1901,
        keyPolicies: 9,
        party: "Republican",
        spouse: "Ida Saxton McKinley",
        children: "2",
        occupationBeforePresidency: "Military Officer and Politician",
      },
      {
        name: "Theodore Roosevelt",
        status: "dead",
        birthYear: 1858,
        birthPlace: "New York City, New York",
        parents: "Theodore Roosevelt Sr. and Martha Bulloch Roosevelt",
        deathYear: 1919,
        deathPlace: "Oyster Bay, New York",
        deathReason: "Heart attack",
        presidencyStart: 1901,
        presidencyEnd: 1909,
        keyPolicies: 12,
        party: "Republican",
        spouse: "Edith Kermit Carow Roosevelt",
        children: "6",
        occupationBeforePresidency: "Military Leader and Politician",
      },
      {
        name: "William Howard Taft",
        status: "dead",
        birthYear: 1857,
        birthPlace: "Cincinnati, Ohio",
        parents: "Alphonso Taft and Louise Torrey Taft",
        deathYear: 1930,
        deathPlace: "Washington, D.C.",
        deathReason: "Heart attack",
        presidencyStart: 1909,
        presidencyEnd: 1913,
        keyPolicies: 8,
        party: "Republican",
        spouse: "Helen Herron Taft",
        children: "3",
        occupationBeforePresidency: "Judge and Politician",
      },
      {
        name: "Woodrow Wilson",
        status: "dead",
        birthYear: 1856,
        birthPlace: "Staunton, Virginia",
        parents: "Joseph Ruggles Wilson and Jessie Woodrow Wilson",
        deathYear: 1924,
        deathPlace: "Washington, D.C.",
        deathReason: "Stroke",
        presidencyStart: 1913,
        presidencyEnd: 1921,
        keyPolicies: 15,
        party: "Democratic",
        spouse: "Ellen Louise Axson Wilson",
        children: "3",
        occupationBeforePresidency: "Politician and Academic",
      },
      {
        name: "Warren G. Harding",
        status: "dead",
        birthYear: 1865,
        birthPlace: "Blooming Grove, Ohio",
        parents: "George Tryon Harding and Phoebe Dickerson Harding",
        deathYear: 1923,
        deathPlace: "San Francisco, California",
        deathReason: "Heart attack",
        presidencyStart: 1921,
        presidencyEnd: 1923,
        keyPolicies: 6,
        party: "Republican",
        spouse: "Florence Kling Harding",
        children: "1",
        occupationBeforePresidency: "Newspaper Publisher",
      },
      {
        name: "Calvin Coolidge",
        status: "dead",
        birthYear: 1872,
        birthPlace: "Plymouth Notch, Vermont",
        parents: "John Calvin Coolidge Sr. and Victoria Josephine Moor Coolidge",
        deathYear: 1933,
        deathPlace: "Northampton, Massachusetts",
        deathReason: "Heart attack",
        presidencyStart: 1923,
        presidencyEnd: 1929,
        keyPolicies: 7,
        party: "Republican",
        spouse: "Grace Anna Goodhue Coolidge",
        children: "2",
        occupationBeforePresidency: "Lawyer and Politician",
      },
      {
        name: "Herbert Hoover",
        status: "dead",
        birthYear: 1874,
        birthPlace: "West Branch, Iowa",
        parents: "Jesse Hoover and Hulda Minerva Hoover",
        deathYear: 1964,
        deathPlace: "New York City, New York",
        deathReason: "Heart attack",
        presidencyStart: 1929,
        presidencyEnd: 1933,
        keyPolicies: 6,
        party: "Republican",
        spouse: "Lou Henry Hoover",
        children: "2",
        occupationBeforePresidency: "Engineer and Politician",
      },
      {
        name: "Franklin D. Roosevelt",
        status: "dead",
        birthYear: 1882,
        birthPlace: "Hyde Park, New York",
        parents: "James Roosevelt I and Sara Delano Roosevelt",
        deathYear: 1945,
        deathPlace: "Warm Springs, Georgia",
        deathReason: "Cerebral hemorrhage",
        presidencyStart: 1933,
        presidencyEnd: 1945,
        keyPolicies: 15,
        party: "Democratic",
        spouse: "Eleanor Roosevelt",
        children: "6",
        occupationBeforePresidency: "Politician and Lawyer",
      },
      {
        name: "Harry S. Truman",
        status: "dead",
        birthYear: 1884,
        birthPlace: "Lamar, Missouri",
        parents: "John Anderson Truman and Martha Ellen Young Truman",
        deathYear: 1972,
        deathPlace: "Kansas City, Missouri",
        deathReason: "Heart failure",
        presidencyStart: 1945,
        presidencyEnd: 1953,
        keyPolicies: 9,
        party: "Democratic",
        spouse: "Bess Wallace Truman",
        children: "1",
        occupationBeforePresidency: "Politician and Farmer",
      },
      {
        name: "Dwight D. Eisenhower",
        status: "dead",
        birthYear: 1890,
        birthPlace: "Denison, Texas",
        parents: "David Jacob Eisenhower and Ida Elizabeth Stover Eisenhower",
        deathYear: 1969,
        deathPlace: "Washington, D.C.",
        deathReason: "Heart failure",
        presidencyStart: 1953,
        presidencyEnd: 1961,
        keyPolicies: 12,
        party: "Republican",
        spouse: "Mamie Geneva Doud Eisenhower",
        children: "2",
        occupationBeforePresidency: "Military Leader",
      },
      {
        name: "John F. Kennedy",
        status: "dead",
        birthYear: 1917,
        birthPlace: "Brookline, Massachusetts",
        parents: "Joseph P. Kennedy Sr. and Rose Fitzgerald Kennedy",
        deathYear: 1963,
        deathPlace: "Dallas, Texas",
        deathReason: "Assassination",
        presidencyStart: 1961,
        presidencyEnd: 1963,
        keyPolicies: 10,
        party: "Democratic",
        spouse: "Jacqueline Bouvier Kennedy",
        children: "4",
        occupationBeforePresidency: "Politician and Author",
      },
      {
        name: "Lyndon B. Johnson",
        status: "dead",
        birthYear: 1908,
        birthPlace: "Stonewall, Texas",
        parents: "Samuel Ealy Johnson Jr. and Rebekah Baines Johnson",
        deathYear: 1973,
        deathPlace: "Johnson City, Texas",
        deathReason: "Heart attack",
        presidencyStart: 1963,
        presidencyEnd: 1969,
        keyPolicies: 12,
        party: "Democratic",
        spouse: "Lady Bird Johnson",
        children: "2",
        occupationBeforePresidency: "Politician and Teacher",
      },
      {
        name: "Richard Nixon",
        status: "dead",
        birthYear: 1913,
        birthPlace: "Yorba Linda, California",
        parents: "Francis A. Nixon and Hannah Milhous Nixon",
        deathYear: 1994,
        deathPlace: "New York City, New York",
        deathReason: "Stroke",
        presidencyStart: 1969,
        presidencyEnd: 1974,
        keyPolicies: 11,
        party: "Republican",
        spouse: "Pat Nixon",
        children: "2",
        occupationBeforePresidency: "Politician and Lawyer",
      },
      {
        name: "Gerald Ford",
        status: "dead",
        birthYear: 1913,
        birthPlace: "Omaha, Nebraska",
        parents: "Leslie Lynch King Sr. and Dorothy Ayer Gardner Ford",
        deathYear: 2006,
        deathPlace: "Rancho Mirage, California",
        deathReason: "Cardiovascular disease",
        presidencyStart: 1974,
        presidencyEnd: 1977,
        keyPolicies: 8,
        party: "Republican",
        spouse: "Betty Ford",
        children: "4",
        occupationBeforePresidency: "Politician and Lawyer",
      },
      {
        name: "Jimmy Carter",
        status: "dead",
        birthYear: 1924,
        birthPlace: "Plains, Georgia",
        parents: "James Earl Carter Sr. and Lillian Gordy Carter",
        deathYear: 2024,
        deathPlace: "Plains, Georgia",
        deathReason: "Metastatic melanoma",
        presidencyStart: 1977,
        presidencyEnd: 1981,
        keyPolicies: 10,
        party: "Democratic",
        spouse: "Rosalynn Carter",
        children: "4",
        occupationBeforePresidency: "Farmer and Politician",
      },
      {
        name: "Ronald Reagan",
        status: "dead",
        birthYear: 1911,
        birthPlace: "Tampico, Illinois",
        parents: "John Reagan and Nelle Wilson Reagan",
        deathYear: 2004,
        deathPlace: "Los Angeles, California",
        deathReason: "Pneumonia due to Alzheimer's disease",
        presidencyStart: 1981,
        presidencyEnd: 1989,
        keyPolicies: 15,
        party: "Republican",
        spouse: "Nancy Davis Reagan",
        children: "2",
        occupationBeforePresidency: "Actor and Politician",
      },
      {
        name: "George H. W. Bush",
        status: "dead",
        birthYear: 1924,
        birthPlace: "Milton, Massachusetts",
        parents: "Prescott Bush and Dorothy Walker Bush",
        deathYear: 2018,
        deathPlace: "Houston, Texas",
        deathReason: "Parkinson's disease",
        presidencyStart: 1989,
        presidencyEnd: 1993,
        keyPolicies: 14,
        party: "Republican",
        spouse: "Barbara Pierce Bush",
        children: "6",
        occupationBeforePresidency: "Politician and Businessman",
      },
      {
        name: "Bill Clinton",
        status: "alive",
        birthYear: 1946,
        birthPlace: "Hope, Arkansas",
        parents: "William Jefferson Blythe Jr. and Virginia Dell Cassidy",
        deathYear: "",
        deathPlace: "N/A",
        deathReason: "N/A",
        presidencyStart: 1993,
        presidencyEnd: 2001,
        keyPolicies: 15,
        party: "Democratic",
        spouse: "Hillary Clinton",
        children: "1",
        occupationBeforePresidency: "Politician and Lawyer",
      },
      {
        name: "George W. Bush",
        status: "alive",
        birthYear: 1946,
        birthPlace: "New Haven, Connecticut",
        parents: "George H. W. Bush and Barbara Bush",
        deathYear: "",
        deathPlace: "N/A",
        deathReason: "N/A",
        presidencyStart: 2001,
        presidencyEnd: 2009,
        keyPolicies: 13,
        party: "Republican",
        spouse: "Laura Welch Bush",
        children: "2",
        occupationBeforePresidency: "Governor",
      },
      {
        name: "Barack Obama",
        status: "alive",
        birthYear: 1961,
        birthPlace: "Honolulu, Hawaii",
        parents: "Barack Obama Sr. and Stanley Ann Dunham",
        deathYear: "",
        deathPlace: "N/A",
        deathReason: "N/A",
        presidencyStart: 2009,
        presidencyEnd: 2017,
        keyPolicies: 17,
        party: "Democratic",
        spouse: "Michelle Obama",
        children: "2",
        occupationBeforePresidency: "Politician and Lawyer",
      },
      {
        name: "Donald Trump",
        status: "alive",
        birthYear: 1946,
        birthPlace: "Queens, New York City, New York",
        parents: "Fred Trump and Mary MacLeod Trump",
        deathYear: "",
        deathPlace: "N/A",
        deathReason: "N/A",
        presidencyStart: 2017,
        presidencyEnd: 2021,
        keyPolicies: 12,
        party: "Republican",
        spouse: "Melania Trump",
        children: "5",
        occupationBeforePresidency: "Businessman and TV Personality",
      },
      {
        name: "Joe Biden",
        status: "alive",
        birthYear: 1942,
        birthPlace: "Scranton, Pennsylvania",
        parents: "Joseph R. Biden Sr. and Catherine Eugenia Finnegan Biden",
        deathYear: "",
        deathPlace: "N/A",
        deathReason: "N/A",
        presidencyStart: 2021,
        presidencyEnd: 2025,
        keyPolicies: 8,
        party: "Democratic",
        spouse: "Jill Biden",
        children: "4",
        occupationBeforePresidency: "Politician and Lawyer",
      },
      {
        name: "Donald Trump",
        status: "alive",
        birthYear: 1946,
        birthPlace: "Queens, New York City, New York",
        parents: "Fred Trump and Mary MacLeod Trump",
        deathYear: "",
        deathPlace: "N/A",
        deathReason: "N/A",
        presidencyStart: 2025,
        presidencyEnd: "Current President",
        keyPolicies: 12,
        party: "Republican",
        spouse: "Melania Trump",
        children: "5",
        occupationBeforePresidency: "Businessman and TV Personality",
      },
    ]);

    /* src/components/onePresidentUnit.svelte generated by Svelte v3.59.2 */
    const file$3 = "src/components/onePresidentUnit.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	child_ctx[27] = i;
    	return child_ctx;
    }

    // (37:2) {#each Array($presidents[index].keyPolicies).fill(0) as _, arcIndex}
    function create_each_block$2(ctx) {
    	let path;
    	let path_d_value;
    	let path_fill_value;
    	let mounted;
    	let dispose;

    	function mouseover_handler() {
    		return /*mouseover_handler*/ ctx[13](/*arcIndex*/ ctx[27]);
    	}

    	function focus_handler() {
    		return /*focus_handler*/ ctx[15](/*arcIndex*/ ctx[27]);
    	}

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", path_d_value = calculateArcPath(/*cx*/ ctx[2], /*cy*/ ctx[3], /*outerRadius*/ ctx[5], /*arcIndex*/ ctx[27], /*$presidents*/ ctx[12][/*index*/ ctx[9]].keyPolicies));

    			attr_dev(path, "fill", path_fill_value = /*hoveredArc*/ ctx[10] === `${/*index*/ ctx[9]}-${/*arcIndex*/ ctx[27]}`
    			? "lightblue"
    			: "transparent");

    			attr_dev(path, "stroke", "black");
    			attr_dev(path, "stroke-width", "2px");
    			add_location(path, file$3, 38, 4, 1182);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(path, "mouseover", mouseover_handler, false, false, false, false),
    					listen_dev(path, "mouseout", /*mouseout_handler*/ ctx[14], false, false, false, false),
    					listen_dev(path, "focus", focus_handler, false, false, false, false),
    					listen_dev(path, "blur", /*blur_handler*/ ctx[16], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*cx, cy, outerRadius, $presidents, index*/ 4652 && path_d_value !== (path_d_value = calculateArcPath(/*cx*/ ctx[2], /*cy*/ ctx[3], /*outerRadius*/ ctx[5], /*arcIndex*/ ctx[27], /*$presidents*/ ctx[12][/*index*/ ctx[9]].keyPolicies))) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty & /*hoveredArc, index*/ 1536 && path_fill_value !== (path_fill_value = /*hoveredArc*/ ctx[10] === `${/*index*/ ctx[9]}-${/*arcIndex*/ ctx[27]}`
    			? "lightblue"
    			: "transparent")) {
    				attr_dev(path, "fill", path_fill_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(37:2) {#each Array($presidents[index].keyPolicies).fill(0) as _, arcIndex}",
    		ctx
    	});

    	return block;
    }

    // (88:2) {#if hoveredBirthIndex === index}
    function create_if_block_3(ctx) {
    	let text_1;
    	let tspan0;
    	let t0;
    	let t1_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].parents + "";
    	let t1;
    	let tspan0_x_value;
    	let t2;
    	let tspan1;
    	let t3;
    	let t4_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthPlace + "";
    	let t4;
    	let tspan1_x_value;
    	let t5;
    	let text_1_x_value;
    	let text_1_y_value;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			tspan0 = svg_element("tspan");
    			t0 = text("Born to ");
    			t1 = text(t1_value);
    			t2 = space();
    			tspan1 = svg_element("tspan");
    			t3 = text("at ");
    			t4 = text(t4_value);
    			t5 = space();
    			attr_dev(tspan0, "x", tspan0_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5]);
    			attr_dev(tspan0, "dy", "0");
    			add_location(tspan0, file$3, 95, 6, 2574);
    			attr_dev(tspan1, "x", tspan1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5]);
    			attr_dev(tspan1, "dy", "15");
    			add_location(tspan1, file$3, 98, 6, 2676);
    			attr_dev(text_1, "x", text_1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5]);
    			attr_dev(text_1, "y", text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 25);
    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "font-size", "12px");
    			attr_dev(text_1, "fill", "black");
    			add_location(text_1, file$3, 88, 4, 2422);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, tspan0);
    			append_dev(tspan0, t0);
    			append_dev(tspan0, t1);
    			append_dev(text_1, t2);
    			append_dev(text_1, tspan1);
    			append_dev(tspan1, t3);
    			append_dev(tspan1, t4);
    			append_dev(text_1, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$presidents, index*/ 4608 && t1_value !== (t1_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].parents + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*cx, outerRadius*/ 36 && tspan0_x_value !== (tspan0_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5])) {
    				attr_dev(tspan0, "x", tspan0_x_value);
    			}

    			if (dirty & /*$presidents, index*/ 4608 && t4_value !== (t4_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthPlace + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*cx, outerRadius*/ 36 && tspan1_x_value !== (tspan1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5])) {
    				attr_dev(tspan1, "x", tspan1_x_value);
    			}

    			if (dirty & /*cx, outerRadius*/ 36 && text_1_x_value !== (text_1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5])) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && text_1_y_value !== (text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 25)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(88:2) {#if hoveredBirthIndex === index}",
    		ctx
    	});

    	return block;
    }

    // (145:2) {:else}
    function create_else_block(ctx) {
    	let line;
    	let line_x__value;
    	let line_y__value;
    	let line_x__value_1;
    	let line_y__value_1;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "x1", line_x__value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5]);
    			attr_dev(line, "y1", line_y__value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.45);
    			attr_dev(line, "x2", line_x__value_1 = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5]);
    			attr_dev(line, "y2", line_y__value_1 = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.55);
    			attr_dev(line, "stroke", "black");
    			attr_dev(line, "stroke-width", "3px");
    			add_location(line, file$3, 145, 4, 3947);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cx, outerRadius*/ 36 && line_x__value !== (line_x__value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5])) {
    				attr_dev(line, "x1", line_x__value);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && line_y__value !== (line_y__value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.45)) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*cx, outerRadius*/ 36 && line_x__value_1 !== (line_x__value_1 = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5])) {
    				attr_dev(line, "x2", line_x__value_1);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && line_y__value_1 !== (line_y__value_1 = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.55)) {
    				attr_dev(line, "y2", line_y__value_1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(145:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (106:2) {#if $presidents[index].status === "dead"}
    function create_if_block_1(ctx) {
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;
    	let text_1;
    	let t_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].deathYear + "";
    	let t;
    	let text_1_x_value;
    	let text_1_y_value;
    	let mounted;
    	let dispose;
    	let if_block = /*hoveredDeathIndex*/ ctx[1] === /*index*/ ctx[9] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			if (if_block) if_block.c();
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(circle, "cx", circle_cx_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5]);
    			attr_dev(circle, "cy", circle_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5);
    			attr_dev(circle, "r", "4");
    			attr_dev(circle, "fill", "black");
    			add_location(circle, file$3, 106, 4, 2897);
    			attr_dev(text_1, "x", text_1_x_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5] + 10);
    			attr_dev(text_1, "y", text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 5);
    			attr_dev(text_1, "text-anchor", "start");
    			attr_dev(text_1, "font-size", "0.9rem");
    			attr_dev(text_1, "fill", "black");
    			add_location(text_1, file$3, 135, 4, 3733);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(circle, "mouseover", /*mouseover_handler_2*/ ctx[21], false, false, false, false),
    					listen_dev(circle, "mouseout", /*mouseout_handler_2*/ ctx[22], false, false, false, false),
    					listen_dev(circle, "focus", /*focus_handler_2*/ ctx[23], false, false, false, false),
    					listen_dev(circle, "blur", /*blur_handler_2*/ ctx[24], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cx, outerRadius*/ 36 && circle_cx_value !== (circle_cx_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5])) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && circle_cy_value !== (circle_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5)) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (/*hoveredDeathIndex*/ ctx[1] === /*index*/ ctx[9]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(text_1.parentNode, text_1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$presidents, index*/ 4608 && t_value !== (t_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].deathYear + "")) set_data_dev(t, t_value);

    			if (dirty & /*cx, outerRadius*/ 36 && text_1_x_value !== (text_1_x_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5] + 10)) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && text_1_y_value !== (text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 5)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(text_1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(106:2) {#if $presidents[index].status === \\\"dead\\\"}",
    		ctx
    	});

    	return block;
    }

    // (119:4) {#if hoveredDeathIndex === index}
    function create_if_block_2(ctx) {
    	let text_1;
    	let tspan0;
    	let t0;
    	let t1_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].deathPlace + "";
    	let t1;
    	let tspan0_x_value;
    	let t2;
    	let tspan1;
    	let t3;
    	let t4_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].deathReason + "";
    	let t4;
    	let tspan1_x_value;
    	let t5;
    	let text_1_x_value;
    	let text_1_y_value;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			tspan0 = svg_element("tspan");
    			t0 = text("Died at ");
    			t1 = text(t1_value);
    			t2 = space();
    			tspan1 = svg_element("tspan");
    			t3 = text("for ");
    			t4 = text(t4_value);
    			t5 = space();
    			attr_dev(tspan0, "x", tspan0_x_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5]);
    			attr_dev(tspan0, "dy", "0");
    			add_location(tspan0, file$3, 126, 8, 3492);
    			attr_dev(tspan1, "x", tspan1_x_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5]);
    			attr_dev(tspan1, "dy", "15");
    			add_location(tspan1, file$3, 129, 8, 3603);
    			attr_dev(text_1, "x", text_1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5]);
    			attr_dev(text_1, "y", text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 25);
    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "font-size", "12px");
    			attr_dev(text_1, "fill", "black");
    			add_location(text_1, file$3, 119, 6, 3326);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, tspan0);
    			append_dev(tspan0, t0);
    			append_dev(tspan0, t1);
    			append_dev(text_1, t2);
    			append_dev(text_1, tspan1);
    			append_dev(tspan1, t3);
    			append_dev(tspan1, t4);
    			append_dev(text_1, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$presidents, index*/ 4608 && t1_value !== (t1_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].deathPlace + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*cx, outerRadius*/ 36 && tspan0_x_value !== (tspan0_x_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5])) {
    				attr_dev(tspan0, "x", tspan0_x_value);
    			}

    			if (dirty & /*$presidents, index*/ 4608 && t4_value !== (t4_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].deathReason + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*cx, outerRadius*/ 36 && tspan1_x_value !== (tspan1_x_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5])) {
    				attr_dev(tspan1, "x", tspan1_x_value);
    			}

    			if (dirty & /*cx, outerRadius*/ 36 && text_1_x_value !== (text_1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5])) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && text_1_y_value !== (text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 25)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(119:4) {#if hoveredDeathIndex === index}",
    		ctx
    	});

    	return block;
    }

    // (205:2) {#if $presidents[index].presidencyEnd !== "Current President"}
    function create_if_block(ctx) {
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");

    			attr_dev(circle, "cx", circle_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5] + (/*$presidents*/ ctx[12][/*index*/ ctx[9]].presidencyEnd - /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthYear) / ((/*$presidents*/ ctx[12][/*index*/ ctx[9]].deathYear === ""
    			? 2025
    			: /*$presidents*/ ctx[12][/*index*/ ctx[9]].deathYear) - /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthYear) * (2 * /*outerRadius*/ ctx[5]));

    			attr_dev(circle, "cy", circle_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5);
    			attr_dev(circle, "r", "4");
    			attr_dev(circle, "fill", "teal");
    			add_location(circle, file$3, 205, 4, 5294);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cx, outerRadius, $presidents, index*/ 4644 && circle_cx_value !== (circle_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5] + (/*$presidents*/ ctx[12][/*index*/ ctx[9]].presidencyEnd - /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthYear) / ((/*$presidents*/ ctx[12][/*index*/ ctx[9]].deathYear === ""
    			? 2025
    			: /*$presidents*/ ctx[12][/*index*/ ctx[9]].deathYear) - /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthYear) * (2 * /*outerRadius*/ ctx[5]))) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && circle_cy_value !== (circle_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5)) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(205:2) {#if $presidents[index].presidencyEnd !== \\\"Current President\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let g;
    	let circle0;
    	let line;
    	let line_x__value;
    	let line_y__value;
    	let line_x__value_1;
    	let line_y__value_1;
    	let circle1;
    	let circle1_cx_value;
    	let circle1_cy_value;
    	let if_block0_anchor;
    	let text0;
    	let t0_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].name + "";
    	let t0;
    	let text0_y_value;
    	let text1;
    	let t1_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].presidencyStart + "";
    	let t1;
    	let t2;
    	let t3_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].presidencyEnd + "";
    	let t3;
    	let text1_y_value;
    	let text2;
    	let t4_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthYear + "";
    	let t4;
    	let text2_x_value;
    	let text2_y_value;
    	let circle2;
    	let circle2_cx_value;
    	let circle2_cy_value;
    	let g_id_value;
    	let g_opacity_value;
    	let mounted;
    	let dispose;
    	let each_value = Array(/*$presidents*/ ctx[12][/*index*/ ctx[9]].keyPolicies).fill(0);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	let if_block0 = /*hoveredBirthIndex*/ ctx[0] === /*index*/ ctx[9] && create_if_block_3(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*$presidents*/ ctx[12][/*index*/ ctx[9]].status === "dead") return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);
    	let if_block2 = /*$presidents*/ ctx[12][/*index*/ ctx[9]].presidencyEnd !== "Current President" && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			circle0 = svg_element("circle");
    			line = svg_element("line");
    			circle1 = svg_element("circle");
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if_block1.c();
    			text0 = svg_element("text");
    			t0 = text(t0_value);
    			text1 = svg_element("text");
    			t1 = text(t1_value);
    			t2 = text(" - ");
    			t3 = text(t3_value);
    			text2 = svg_element("text");
    			t4 = text(t4_value);
    			circle2 = svg_element("circle");
    			if (if_block2) if_block2.c();
    			attr_dev(circle0, "cx", /*cx*/ ctx[2]);
    			attr_dev(circle0, "cy", /*cy*/ ctx[3]);
    			attr_dev(circle0, "r", /*innerRadius*/ ctx[4]);
    			attr_dev(circle0, "stroke", /*stroke*/ ctx[6]);
    			attr_dev(circle0, "stroke-width", /*strokeWidth*/ ctx[7]);
    			attr_dev(circle0, "fill", /*fill*/ ctx[8]);
    			add_location(circle0, file$3, 56, 2, 1721);
    			attr_dev(line, "x1", line_x__value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5]);
    			attr_dev(line, "y1", line_y__value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5);
    			attr_dev(line, "x2", line_x__value_1 = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5]);
    			attr_dev(line, "y2", line_y__value_1 = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5);
    			attr_dev(line, "stroke", /*stroke*/ ctx[6]);
    			attr_dev(line, "stroke-width", /*strokeWidth*/ ctx[7]);
    			add_location(line, file$3, 65, 2, 1830);
    			attr_dev(circle1, "cx", circle1_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5]);
    			attr_dev(circle1, "cy", circle1_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5);
    			attr_dev(circle1, "r", "4");
    			attr_dev(circle1, "fill", "black");
    			add_location(circle1, file$3, 75, 2, 2040);
    			attr_dev(text0, "x", /*cx*/ ctx[2]);
    			attr_dev(text0, "y", text0_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 - 20);
    			attr_dev(text0, "text-anchor", "middle");
    			attr_dev(text0, "font-size", "16px");
    			attr_dev(text0, "fill", "black");
    			add_location(text0, file$3, 156, 2, 4170);
    			attr_dev(text1, "x", /*cx*/ ctx[2]);
    			attr_dev(text1, "y", text1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 - 5);
    			attr_dev(text1, "text-anchor", "middle");
    			attr_dev(text1, "font-size", "14px");
    			attr_dev(text1, "fill", "black");
    			add_location(text1, file$3, 167, 2, 4370);
    			attr_dev(text2, "x", text2_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5] - 10);
    			attr_dev(text2, "y", text2_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 5);
    			attr_dev(text2, "text-anchor", "end");
    			attr_dev(text2, "font-size", "0.9rem");
    			attr_dev(text2, "fill", "black");
    			add_location(text2, file$3, 178, 2, 4613);

    			attr_dev(circle2, "cx", circle2_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5] + (/*$presidents*/ ctx[12][/*index*/ ctx[9]].presidencyStart - /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthYear) / ((/*$presidents*/ ctx[12][/*index*/ ctx[9]].deathYear === ""
    			? 2025
    			: /*$presidents*/ ctx[12][/*index*/ ctx[9]].deathYear) - /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthYear) * (2 * /*outerRadius*/ ctx[5]));

    			attr_dev(circle2, "cy", circle2_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5);
    			attr_dev(circle2, "r", "4");
    			attr_dev(circle2, "fill", "teal");
    			add_location(circle2, file$3, 189, 2, 4833);
    			attr_dev(g, "id", g_id_value = "circle-" + /*index*/ ctx[9]);

    			attr_dev(g, "opacity", g_opacity_value = /*$selectedCircleId*/ ctx[11] === null || /*$selectedCircleId*/ ctx[11] === "circle-" + /*index*/ ctx[9]
    			? 1
    			: 0.3);

    			add_location(g, file$3, 30, 0, 936);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(g, null);
    				}
    			}

    			append_dev(g, circle0);
    			append_dev(g, line);
    			append_dev(g, circle1);
    			if (if_block0) if_block0.m(g, null);
    			append_dev(g, if_block0_anchor);
    			if_block1.m(g, null);
    			append_dev(g, text0);
    			append_dev(text0, t0);
    			append_dev(g, text1);
    			append_dev(text1, t1);
    			append_dev(text1, t2);
    			append_dev(text1, t3);
    			append_dev(g, text2);
    			append_dev(text2, t4);
    			append_dev(g, circle2);
    			if (if_block2) if_block2.m(g, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(circle1, "mouseover", /*mouseover_handler_1*/ ctx[17], false, false, false, false),
    					listen_dev(circle1, "mouseout", /*mouseout_handler_1*/ ctx[18], false, false, false, false),
    					listen_dev(circle1, "focus", /*focus_handler_1*/ ctx[19], false, false, false, false),
    					listen_dev(circle1, "blur", /*blur_handler_1*/ ctx[20], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*calculateArcPath, cx, cy, outerRadius, $presidents, index, hoveredArc*/ 5676) {
    				each_value = Array(/*$presidents*/ ctx[12][/*index*/ ctx[9]].keyPolicies).fill(0);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, circle0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*cx*/ 4) {
    				attr_dev(circle0, "cx", /*cx*/ ctx[2]);
    			}

    			if (dirty & /*cy*/ 8) {
    				attr_dev(circle0, "cy", /*cy*/ ctx[3]);
    			}

    			if (dirty & /*innerRadius*/ 16) {
    				attr_dev(circle0, "r", /*innerRadius*/ ctx[4]);
    			}

    			if (dirty & /*stroke*/ 64) {
    				attr_dev(circle0, "stroke", /*stroke*/ ctx[6]);
    			}

    			if (dirty & /*strokeWidth*/ 128) {
    				attr_dev(circle0, "stroke-width", /*strokeWidth*/ ctx[7]);
    			}

    			if (dirty & /*fill*/ 256) {
    				attr_dev(circle0, "fill", /*fill*/ ctx[8]);
    			}

    			if (dirty & /*cx, outerRadius*/ 36 && line_x__value !== (line_x__value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5])) {
    				attr_dev(line, "x1", line_x__value);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && line_y__value !== (line_y__value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5)) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*cx, outerRadius*/ 36 && line_x__value_1 !== (line_x__value_1 = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5])) {
    				attr_dev(line, "x2", line_x__value_1);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && line_y__value_1 !== (line_y__value_1 = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5)) {
    				attr_dev(line, "y2", line_y__value_1);
    			}

    			if (dirty & /*stroke*/ 64) {
    				attr_dev(line, "stroke", /*stroke*/ ctx[6]);
    			}

    			if (dirty & /*strokeWidth*/ 128) {
    				attr_dev(line, "stroke-width", /*strokeWidth*/ ctx[7]);
    			}

    			if (dirty & /*cx, outerRadius*/ 36 && circle1_cx_value !== (circle1_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5])) {
    				attr_dev(circle1, "cx", circle1_cx_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && circle1_cy_value !== (circle1_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5)) {
    				attr_dev(circle1, "cy", circle1_cy_value);
    			}

    			if (/*hoveredBirthIndex*/ ctx[0] === /*index*/ ctx[9]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(g, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(g, text0);
    				}
    			}

    			if (dirty & /*$presidents, index*/ 4608 && t0_value !== (t0_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*cx*/ 4) {
    				attr_dev(text0, "x", /*cx*/ ctx[2]);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && text0_y_value !== (text0_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 - 20)) {
    				attr_dev(text0, "y", text0_y_value);
    			}

    			if (dirty & /*$presidents, index*/ 4608 && t1_value !== (t1_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].presidencyStart + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*$presidents, index*/ 4608 && t3_value !== (t3_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].presidencyEnd + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*cx*/ 4) {
    				attr_dev(text1, "x", /*cx*/ ctx[2]);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && text1_y_value !== (text1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 - 5)) {
    				attr_dev(text1, "y", text1_y_value);
    			}

    			if (dirty & /*$presidents, index*/ 4608 && t4_value !== (t4_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthYear + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*cx, outerRadius*/ 36 && text2_x_value !== (text2_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5] - 10)) {
    				attr_dev(text2, "x", text2_x_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && text2_y_value !== (text2_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 5)) {
    				attr_dev(text2, "y", text2_y_value);
    			}

    			if (dirty & /*cx, outerRadius, $presidents, index*/ 4644 && circle2_cx_value !== (circle2_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5] + (/*$presidents*/ ctx[12][/*index*/ ctx[9]].presidencyStart - /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthYear) / ((/*$presidents*/ ctx[12][/*index*/ ctx[9]].deathYear === ""
    			? 2025
    			: /*$presidents*/ ctx[12][/*index*/ ctx[9]].deathYear) - /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthYear) * (2 * /*outerRadius*/ ctx[5]))) {
    				attr_dev(circle2, "cx", circle2_cx_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && circle2_cy_value !== (circle2_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5)) {
    				attr_dev(circle2, "cy", circle2_cy_value);
    			}

    			if (/*$presidents*/ ctx[12][/*index*/ ctx[9]].presidencyEnd !== "Current President") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					if_block2.m(g, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*index*/ 512 && g_id_value !== (g_id_value = "circle-" + /*index*/ ctx[9])) {
    				attr_dev(g, "id", g_id_value);
    			}

    			if (dirty & /*$selectedCircleId, index*/ 2560 && g_opacity_value !== (g_opacity_value = /*$selectedCircleId*/ ctx[11] === null || /*$selectedCircleId*/ ctx[11] === "circle-" + /*index*/ ctx[9]
    			? 1
    			: 0.3)) {
    				attr_dev(g, "opacity", g_opacity_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function calculateArcPath(cx, cy, radius, arcIndex, totalArcs) {
    	const anglePerArc = 2 * Math.PI / totalArcs;
    	const startAngle = arcIndex * anglePerArc;
    	const endAngle = (arcIndex + 1) * anglePerArc;
    	const x1 = cx + radius * Math.cos(startAngle);
    	const y1 = cy + radius * Math.sin(startAngle);
    	const x2 = cx + radius * Math.cos(endAngle);
    	const y2 = cy + radius * Math.sin(endAngle);
    	return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $selectedCircleId;
    	let $presidents;
    	validate_store(selectedCircleId, 'selectedCircleId');
    	component_subscribe($$self, selectedCircleId, $$value => $$invalidate(11, $selectedCircleId = $$value));
    	validate_store(presidents, 'presidents');
    	component_subscribe($$self, presidents, $$value => $$invalidate(12, $presidents = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('OnePresidentUnit', slots, []);
    	let { cx } = $$props;
    	let { cy } = $$props;
    	let { innerRadius } = $$props;
    	let { outerRadius } = $$props;
    	let { stroke = "black" } = $$props;
    	let { strokeWidth = "3px" } = $$props;
    	let { fill = "white" } = $$props;
    	let { index } = $$props;
    	let { hoveredBirthIndex = null } = $$props;
    	let { hoveredDeathIndex = null } = $$props;
    	let hoveredArc = null;

    	$$self.$$.on_mount.push(function () {
    		if (cx === undefined && !('cx' in $$props || $$self.$$.bound[$$self.$$.props['cx']])) {
    			console.warn("<OnePresidentUnit> was created without expected prop 'cx'");
    		}

    		if (cy === undefined && !('cy' in $$props || $$self.$$.bound[$$self.$$.props['cy']])) {
    			console.warn("<OnePresidentUnit> was created without expected prop 'cy'");
    		}

    		if (innerRadius === undefined && !('innerRadius' in $$props || $$self.$$.bound[$$self.$$.props['innerRadius']])) {
    			console.warn("<OnePresidentUnit> was created without expected prop 'innerRadius'");
    		}

    		if (outerRadius === undefined && !('outerRadius' in $$props || $$self.$$.bound[$$self.$$.props['outerRadius']])) {
    			console.warn("<OnePresidentUnit> was created without expected prop 'outerRadius'");
    		}

    		if (index === undefined && !('index' in $$props || $$self.$$.bound[$$self.$$.props['index']])) {
    			console.warn("<OnePresidentUnit> was created without expected prop 'index'");
    		}
    	});

    	const writable_props = [
    		'cx',
    		'cy',
    		'innerRadius',
    		'outerRadius',
    		'stroke',
    		'strokeWidth',
    		'fill',
    		'index',
    		'hoveredBirthIndex',
    		'hoveredDeathIndex'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<OnePresidentUnit> was created with unknown prop '${key}'`);
    	});

    	const mouseover_handler = arcIndex => $$invalidate(10, hoveredArc = `${index}-${arcIndex}`);
    	const mouseout_handler = () => $$invalidate(10, hoveredArc = null);
    	const focus_handler = arcIndex => $$invalidate(10, hoveredArc = `${index}-${arcIndex}`);
    	const blur_handler = () => $$invalidate(10, hoveredArc = null);
    	const mouseover_handler_1 = () => $$invalidate(0, hoveredBirthIndex = index);
    	const mouseout_handler_1 = () => $$invalidate(0, hoveredBirthIndex = null);
    	const focus_handler_1 = () => $$invalidate(0, hoveredBirthIndex = index);
    	const blur_handler_1 = () => $$invalidate(0, hoveredBirthIndex = null);
    	const mouseover_handler_2 = () => $$invalidate(1, hoveredDeathIndex = index);
    	const mouseout_handler_2 = () => $$invalidate(1, hoveredDeathIndex = null);
    	const focus_handler_2 = () => $$invalidate(1, hoveredDeathIndex = index);
    	const blur_handler_2 = () => $$invalidate(1, hoveredDeathIndex = null);

    	$$self.$$set = $$props => {
    		if ('cx' in $$props) $$invalidate(2, cx = $$props.cx);
    		if ('cy' in $$props) $$invalidate(3, cy = $$props.cy);
    		if ('innerRadius' in $$props) $$invalidate(4, innerRadius = $$props.innerRadius);
    		if ('outerRadius' in $$props) $$invalidate(5, outerRadius = $$props.outerRadius);
    		if ('stroke' in $$props) $$invalidate(6, stroke = $$props.stroke);
    		if ('strokeWidth' in $$props) $$invalidate(7, strokeWidth = $$props.strokeWidth);
    		if ('fill' in $$props) $$invalidate(8, fill = $$props.fill);
    		if ('index' in $$props) $$invalidate(9, index = $$props.index);
    		if ('hoveredBirthIndex' in $$props) $$invalidate(0, hoveredBirthIndex = $$props.hoveredBirthIndex);
    		if ('hoveredDeathIndex' in $$props) $$invalidate(1, hoveredDeathIndex = $$props.hoveredDeathIndex);
    	};

    	$$self.$capture_state = () => ({
    		presidents,
    		selectedCircleId,
    		cx,
    		cy,
    		innerRadius,
    		outerRadius,
    		stroke,
    		strokeWidth,
    		fill,
    		index,
    		hoveredBirthIndex,
    		hoveredDeathIndex,
    		hoveredArc,
    		calculateArcPath,
    		$selectedCircleId,
    		$presidents
    	});

    	$$self.$inject_state = $$props => {
    		if ('cx' in $$props) $$invalidate(2, cx = $$props.cx);
    		if ('cy' in $$props) $$invalidate(3, cy = $$props.cy);
    		if ('innerRadius' in $$props) $$invalidate(4, innerRadius = $$props.innerRadius);
    		if ('outerRadius' in $$props) $$invalidate(5, outerRadius = $$props.outerRadius);
    		if ('stroke' in $$props) $$invalidate(6, stroke = $$props.stroke);
    		if ('strokeWidth' in $$props) $$invalidate(7, strokeWidth = $$props.strokeWidth);
    		if ('fill' in $$props) $$invalidate(8, fill = $$props.fill);
    		if ('index' in $$props) $$invalidate(9, index = $$props.index);
    		if ('hoveredBirthIndex' in $$props) $$invalidate(0, hoveredBirthIndex = $$props.hoveredBirthIndex);
    		if ('hoveredDeathIndex' in $$props) $$invalidate(1, hoveredDeathIndex = $$props.hoveredDeathIndex);
    		if ('hoveredArc' in $$props) $$invalidate(10, hoveredArc = $$props.hoveredArc);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		hoveredBirthIndex,
    		hoveredDeathIndex,
    		cx,
    		cy,
    		innerRadius,
    		outerRadius,
    		stroke,
    		strokeWidth,
    		fill,
    		index,
    		hoveredArc,
    		$selectedCircleId,
    		$presidents,
    		mouseover_handler,
    		mouseout_handler,
    		focus_handler,
    		blur_handler,
    		mouseover_handler_1,
    		mouseout_handler_1,
    		focus_handler_1,
    		blur_handler_1,
    		mouseover_handler_2,
    		mouseout_handler_2,
    		focus_handler_2,
    		blur_handler_2
    	];
    }

    class OnePresidentUnit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			cx: 2,
    			cy: 3,
    			innerRadius: 4,
    			outerRadius: 5,
    			stroke: 6,
    			strokeWidth: 7,
    			fill: 8,
    			index: 9,
    			hoveredBirthIndex: 0,
    			hoveredDeathIndex: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OnePresidentUnit",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get cx() {
    		throw new Error("<OnePresidentUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cx(value) {
    		throw new Error("<OnePresidentUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cy() {
    		throw new Error("<OnePresidentUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cy(value) {
    		throw new Error("<OnePresidentUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get innerRadius() {
    		throw new Error("<OnePresidentUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set innerRadius(value) {
    		throw new Error("<OnePresidentUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outerRadius() {
    		throw new Error("<OnePresidentUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outerRadius(value) {
    		throw new Error("<OnePresidentUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stroke() {
    		throw new Error("<OnePresidentUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stroke(value) {
    		throw new Error("<OnePresidentUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get strokeWidth() {
    		throw new Error("<OnePresidentUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set strokeWidth(value) {
    		throw new Error("<OnePresidentUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fill() {
    		throw new Error("<OnePresidentUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<OnePresidentUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<OnePresidentUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<OnePresidentUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoveredBirthIndex() {
    		throw new Error("<OnePresidentUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hoveredBirthIndex(value) {
    		throw new Error("<OnePresidentUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoveredDeathIndex() {
    		throw new Error("<OnePresidentUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hoveredDeathIndex(value) {
    		throw new Error("<OnePresidentUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Svg.svelte generated by Svelte v3.59.2 */
    const file$2 = "src/components/Svg.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (86:2) {#each positions as position, index}
    function create_each_block$1(ctx) {
    	let onepresidentunit;
    	let current;

    	onepresidentunit = new OnePresidentUnit({
    			props: {
    				cx: /*position*/ ctx[12].cx,
    				cy: /*position*/ ctx[12].cy,
    				innerRadius: /*$innerRadius*/ ctx[4],
    				outerRadius: /*$outerRadius*/ ctx[0],
    				index: /*index*/ ctx[14]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(onepresidentunit.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(onepresidentunit, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const onepresidentunit_changes = {};
    			if (dirty & /*positions*/ 4) onepresidentunit_changes.cx = /*position*/ ctx[12].cx;
    			if (dirty & /*positions*/ 4) onepresidentunit_changes.cy = /*position*/ ctx[12].cy;
    			if (dirty & /*$innerRadius*/ 16) onepresidentunit_changes.innerRadius = /*$innerRadius*/ ctx[4];
    			if (dirty & /*$outerRadius*/ 1) onepresidentunit_changes.outerRadius = /*$outerRadius*/ ctx[0];
    			onepresidentunit.$set(onepresidentunit_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(onepresidentunit.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(onepresidentunit.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(onepresidentunit, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(86:2) {#each positions as position, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let svg;
    	let rect;
    	let current;
    	let each_value = /*positions*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			rect = svg_element("rect");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(rect, "width", /*$svgWidth*/ ctx[1]);
    			attr_dev(rect, "height", /*$svgHeight*/ ctx[3]);
    			attr_dev(rect, "stroke", "black");
    			attr_dev(rect, "stroke-width", "3px");
    			attr_dev(rect, "fill", "none");
    			add_location(rect, file$2, 77, 2, 2018);
    			attr_dev(svg, "width", /*$svgWidth*/ ctx[1]);
    			attr_dev(svg, "height", /*$svgHeight*/ ctx[3]);
    			add_location(svg, file$2, 76, 0, 1972);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, rect);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(svg, null);
    				}
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$svgWidth*/ 2) {
    				attr_dev(rect, "width", /*$svgWidth*/ ctx[1]);
    			}

    			if (!current || dirty & /*$svgHeight*/ 8) {
    				attr_dev(rect, "height", /*$svgHeight*/ ctx[3]);
    			}

    			if (dirty & /*positions, $innerRadius, $outerRadius*/ 21) {
    				each_value = /*positions*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(svg, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*$svgWidth*/ 2) {
    				attr_dev(svg, "width", /*$svgWidth*/ ctx[1]);
    			}

    			if (!current || dirty & /*$svgHeight*/ 8) {
    				attr_dev(svg, "height", /*$svgHeight*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $titleSpace;
    	let $outerRadius;
    	let $rowSpacing;
    	let $circleSpacing;
    	let $svgWidth;
    	let $maxCirclesPerRow;
    	let $presidents;
    	let $svgHeight;
    	let $innerRadius;
    	validate_store(titleSpace, 'titleSpace');
    	component_subscribe($$self, titleSpace, $$value => $$invalidate(5, $titleSpace = $$value));
    	validate_store(outerRadius, 'outerRadius');
    	component_subscribe($$self, outerRadius, $$value => $$invalidate(0, $outerRadius = $$value));
    	validate_store(rowSpacing, 'rowSpacing');
    	component_subscribe($$self, rowSpacing, $$value => $$invalidate(6, $rowSpacing = $$value));
    	validate_store(circleSpacing, 'circleSpacing');
    	component_subscribe($$self, circleSpacing, $$value => $$invalidate(7, $circleSpacing = $$value));
    	validate_store(svgWidth, 'svgWidth');
    	component_subscribe($$self, svgWidth, $$value => $$invalidate(1, $svgWidth = $$value));
    	validate_store(maxCirclesPerRow, 'maxCirclesPerRow');
    	component_subscribe($$self, maxCirclesPerRow, $$value => $$invalidate(8, $maxCirclesPerRow = $$value));
    	validate_store(presidents, 'presidents');
    	component_subscribe($$self, presidents, $$value => $$invalidate(9, $presidents = $$value));
    	validate_store(svgHeight, 'svgHeight');
    	component_subscribe($$self, svgHeight, $$value => $$invalidate(3, $svgHeight = $$value));
    	validate_store(innerRadius, 'innerRadius');
    	component_subscribe($$self, innerRadius, $$value => $$invalidate(4, $innerRadius = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Svg', slots, []);
    	let positions = [];

    	function updateSvgWidth() {
    		let screenWidth = window.innerWidth;

    		if (screenWidth > 1024) {
    			maxCirclesPerRow.set(3);
    		} else if (screenWidth > 768) {
    			maxCirclesPerRow.set(2);
    		} else {
    			maxCirclesPerRow.set(1);
    		}

    		let totalCirclesWidth = $maxCirclesPerRow * (2 * $outerRadius);
    		let totalSpacing = ($maxCirclesPerRow + 1) * $circleSpacing;
    		svgWidth.set(totalCirclesWidth + totalSpacing);
    	}

    	function updateSvgHeight() {
    		let totalPresidents = get_store_value(presidents).length;
    		let rows = Math.ceil(totalPresidents / get_store_value(maxCirclesPerRow));
    		totalRows.set(rows);
    		let totalCirclesHeight = rows * (2 * $outerRadius);
    		let totalSpacing = rows * $rowSpacing;
    		svgHeight.set($titleSpace + totalCirclesHeight + totalSpacing);
    	}

    	onMount(() => {
    		updateSvgWidth();
    		updateSvgHeight();
    	});

    	window.addEventListener("resize", () => {
    		updateSvgWidth();
    		updateSvgHeight();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Svg> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		svgWidth,
    		svgHeight,
    		outerRadius,
    		innerRadius,
    		maxCirclesPerRow,
    		circleSpacing,
    		rowSpacing,
    		titleSpace,
    		totalRows,
    		OnePresidentUnit,
    		presidents,
    		onMount,
    		get: get_store_value,
    		positions,
    		updateSvgWidth,
    		updateSvgHeight,
    		$titleSpace,
    		$outerRadius,
    		$rowSpacing,
    		$circleSpacing,
    		$svgWidth,
    		$maxCirclesPerRow,
    		$presidents,
    		$svgHeight,
    		$innerRadius
    	});

    	$$self.$inject_state = $$props => {
    		if ('positions' in $$props) $$invalidate(2, positions = $$props.positions);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$presidents, $maxCirclesPerRow, $outerRadius, $circleSpacing, $svgWidth, $rowSpacing, $titleSpace*/ 995) {
    			$$invalidate(2, positions = $presidents.map((_, index) => {
    				let row = Math.floor(index / $maxCirclesPerRow);
    				let col = index % $maxCirclesPerRow;
    				let totalCirclesInRow = Math.min($maxCirclesPerRow, $presidents.length - row * $maxCirclesPerRow);
    				let rowWidth = totalCirclesInRow * ($outerRadius * 2 + $circleSpacing) - $circleSpacing;
    				let colOffset = ($svgWidth - rowWidth) / 2;

    				return {
    					cx: col * ($outerRadius * 2 + $circleSpacing) + $outerRadius + colOffset,
    					cy: row * ($outerRadius * 2 + $rowSpacing) + $outerRadius + $titleSpace
    				};
    			}));
    		}
    	};

    	return [
    		$outerRadius,
    		$svgWidth,
    		positions,
    		$svgHeight,
    		$innerRadius,
    		$titleSpace,
    		$rowSpacing,
    		$circleSpacing,
    		$maxCirclesPerRow,
    		$presidents
    	];
    }

    class Svg extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Svg",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/stickyYearsDiv.svelte generated by Svelte v3.59.2 */
    const file$1 = "src/components/stickyYearsDiv.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (41:4) {#each Array(totalDots) as _, index}
    function create_each_block_1(ctx) {
    	let circle;
    	let circle_cx_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", circle_cx_value = /*index*/ ctx[9] / (/*totalDots*/ ctx[2] - 1) * (/*svgWidth*/ ctx[0] - 2 * desktopRadius) + desktopRadius);
    			attr_dev(circle, "cy", "18");
    			attr_dev(circle, "r", desktopRadius);
    			attr_dev(circle, "fill", "white");
    			attr_dev(circle, "stroke", "black");
    			attr_dev(circle, "id", `circle-${/*index*/ ctx[9]}`);
    			add_location(circle, file$1, 41, 6, 880);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(circle, "click", /*handleCircleClick*/ ctx[3], false, false, false, false),
    					listen_dev(circle, "keydown", /*keydown_handler*/ ctx[4], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*svgWidth*/ 1 && circle_cx_value !== (circle_cx_value = /*index*/ ctx[9] / (/*totalDots*/ ctx[2] - 1) * (/*svgWidth*/ ctx[0] - 2 * desktopRadius) + desktopRadius)) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(41:4) {#each Array(totalDots) as _, index}",
    		ctx
    	});

    	return block;
    }

    // (69:4) {#each Array(totalDots) as _, index}
    function create_each_block(ctx) {
    	let circle;
    	let circle_cy_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", "10");
    			attr_dev(circle, "cy", circle_cy_value = /*index*/ ctx[9] / (/*totalDots*/ ctx[2] - 1) * (/*svgHeight*/ ctx[1] - 2 * mobieRadius) + mobieRadius);
    			attr_dev(circle, "r", mobieRadius);
    			attr_dev(circle, "fill", "white");
    			attr_dev(circle, "stroke", "black");
    			attr_dev(circle, "id", `circle-${/*index*/ ctx[9]}`);
    			add_location(circle, file$1, 69, 6, 1498);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(circle, "click", /*handleCircleClick*/ ctx[3], false, false, false, false),
    					listen_dev(circle, "keydown", /*keydown_handler_1*/ ctx[5], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*svgHeight*/ 2 && circle_cy_value !== (circle_cy_value = /*index*/ ctx[9] / (/*totalDots*/ ctx[2] - 1) * (/*svgHeight*/ ctx[1] - 2 * mobieRadius) + mobieRadius)) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(69:4) {#each Array(totalDots) as _, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div0;
    	let svg0;
    	let rect0;
    	let t;
    	let div1;
    	let svg1;
    	let rect1;
    	let each_value_1 = Array(/*totalDots*/ ctx[2]);
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = Array(/*totalDots*/ ctx[2]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			svg0 = svg_element("svg");
    			rect0 = svg_element("rect");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t = space();
    			div1 = element("div");
    			svg1 = svg_element("svg");
    			rect1 = svg_element("rect");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(rect0, "x", "0");
    			attr_dev(rect0, "y", "0");
    			attr_dev(rect0, "width", "100%");
    			attr_dev(rect0, "height", "100%");
    			attr_dev(rect0, "fill", "white");
    			attr_dev(rect0, "stroke", "black");
    			attr_dev(rect0, "stroke-width", "2");
    			add_location(rect0, file$1, 29, 4, 650);
    			attr_dev(svg0, "width", "100%");
    			attr_dev(svg0, "height", "100%");
    			add_location(svg0, file$1, 28, 2, 613);
    			attr_dev(div0, "class", "desktop-div svelte-ax0bjq");
    			add_location(div0, file$1, 27, 0, 585);
    			attr_dev(rect1, "x", "0");
    			attr_dev(rect1, "y", "0");
    			attr_dev(rect1, "width", "100%");
    			attr_dev(rect1, "height", "100%");
    			attr_dev(rect1, "fill", "none");
    			attr_dev(rect1, "stroke", "black");
    			attr_dev(rect1, "stroke-width", "2");
    			add_location(rect1, file$1, 58, 4, 1312);
    			attr_dev(svg1, "width", "100%");
    			attr_dev(svg1, "height", "100%");
    			add_location(svg1, file$1, 57, 2, 1275);
    			attr_dev(div1, "class", "mobile-div svelte-ax0bjq");
    			add_location(div1, file$1, 56, 0, 1248);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, svg0);
    			append_dev(svg0, rect0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(svg0, null);
    				}
    			}

    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, svg1);
    			append_dev(svg1, rect1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(svg1, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*totalDots, svgWidth, desktopRadius, handleCircleClick*/ 13) {
    				each_value_1 = Array(/*totalDots*/ ctx[2]);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(svg0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*totalDots, svgHeight, mobieRadius, handleCircleClick*/ 14) {
    				each_value = Array(/*totalDots*/ ctx[2]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(svg1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const desktopRadius = 6;
    const mobieRadius = 4;

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('StickyYearsDiv', slots, []);
    	let totalDots = 47;
    	let svgWidth = 0;
    	let svgHeight = 0;

    	const updateDimensions = () => {
    		$$invalidate(0, svgWidth = window.innerWidth);
    		$$invalidate(1, svgHeight = window.innerHeight);
    	};

    	onMount(() => {
    		updateDimensions();
    		window.addEventListener("resize", updateDimensions);
    	});

    	const handleCircleClick = event => {
    		selectedCircleId.set(event.target.id);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<StickyYearsDiv> was created with unknown prop '${key}'`);
    	});

    	const keydown_handler = e => e.key === "Enter" && handleCircleClick(e);
    	const keydown_handler_1 = e => e.key === "Enter" && handleCircleClick(e);

    	$$self.$capture_state = () => ({
    		presidents,
    		onMount,
    		selectedCircleId,
    		totalDots,
    		svgWidth,
    		svgHeight,
    		desktopRadius,
    		mobieRadius,
    		updateDimensions,
    		handleCircleClick
    	});

    	$$self.$inject_state = $$props => {
    		if ('totalDots' in $$props) $$invalidate(2, totalDots = $$props.totalDots);
    		if ('svgWidth' in $$props) $$invalidate(0, svgWidth = $$props.svgWidth);
    		if ('svgHeight' in $$props) $$invalidate(1, svgHeight = $$props.svgHeight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		svgWidth,
    		svgHeight,
    		totalDots,
    		handleCircleClick,
    		keydown_handler,
    		keydown_handler_1
    	];
    }

    class StickyYearsDiv extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StickyYearsDiv",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let svg;
    	let t;
    	let stickyyearsdiv;
    	let current;
    	svg = new Svg({ $$inline: true });
    	stickyyearsdiv = new StickyYearsDiv({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(svg.$$.fragment);
    			t = space();
    			create_component(stickyyearsdiv.$$.fragment);
    			attr_dev(main, "class", "svelte-177t831");
    			add_location(main, file, 5, 0, 132);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(svg, main, null);
    			append_dev(main, t);
    			mount_component(stickyyearsdiv, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svg.$$.fragment, local);
    			transition_in(stickyyearsdiv.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svg.$$.fragment, local);
    			transition_out(stickyyearsdiv.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(svg);
    			destroy_component(stickyyearsdiv);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Svg, StickyYearsDiv });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
