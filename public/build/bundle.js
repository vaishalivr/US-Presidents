
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
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
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
    const hoveredIndex = writable(null);

    const presidents = writable([
      {
        name: "George Washington",
        terms: 2,
        status: "dead",
        birthYear: 1732,
        birthPlace: "Westmoreland County, Virginia",
        parents: "Augustine Washington and Mary Ball Washington",
        deathYear: 1799,
        deathPlace: "Mount Vernon, Virginia",
        deathReason: "Epiglottitis or pneumonia",
        presidencyStart: 1789,
        presidencyEnd: 1797,
        keyPolicies: 8,
        policies: [
          "Judiciary Act of 1789 : Established the federal judiciary, including the Supreme Court, circuit courts, and district courts.",
          "First National Bank (1791) : Championed by Alexander Hamilton, Washington supported the creation of a national bank to stabilize the economy.",
          "Bill of Rights (1791) : Ratified during his presidency, ensuring fundamental liberties for citizens.",
          "Proclamation of Neutrality (1793) : Declared the U.S. neutral in the war between France and Britain, preventing early entanglement in European conflicts.",
          "Whiskey Rebellion Suppression (1794) : Sent federal troops to put down a tax protest, reinforcing the strength of the federal government.",
          "Jay Treaty (1795) : A controversial treaty with Britain that sought to resolve lingering issues from the Revolutionary War and promote trade.",
          "Pinckney’s Treaty (1795) : Agreement with Spain that granted the U.S. navigation rights on the Mississippi River and access to New Orleans.",
          "Farewell Address (1796) : Though not a law, his address warned against political parties and entangling foreign alliances, shaping U.S. policy for years.",
        ],
        party: "None",
        spouse: "Martha Custis",
        children: "None",
        occupationBeforePresidency: "Farmer and Soldier",
        quote:
          "To be prepared for war is one of the most effective means of preserving peace.",
        image: "images/GeorgeWashington.png",
        otherPresidents: [
          "John Adams",
          "Thomas Jefferson",
          "James Madison",
          "James Monroe",
          "John Quincy Adams",
        ],
        otherPresidentThings: [
          { "John Adams": "Vice President of the US" },
          {
            "Thomas Jefferson":
              "Served as Washington's first Secretary of State but resigned in 1793 due to conflicts with Washington and Alexander Hamilton",
            "James Madison":
              "Member of the U.S. House of Representatives (1789-1797) and helped form the Democratic-Republican Party with Jefferson",
          },
          { "James Monroe": "U.S. Minister to France (1794-1796), later recalled" },
          {
            "John Quincy Adams":
              "Graduated from Harvard University in 1787 and began studying law. Admitted to the bar in 1790, he started practicing law in Boston",
          },
        ],
      },
      {
        name: "John Adams",
        terms: 2,
        status: "dead",
        birthYear: 1735,
        birthPlace: "Braintree, Massachusetts",
        parents: "John Adams Sr. and Susanna Boylston",
        deathYear: 1826,
        deathPlace: "Quincy, Massachusetts",
        deathReason: "Heart failure and natural causes",
        presidencyStart: 1797,
        presidencyEnd: 1801,
        keyPolicies: 9,
        policies: [
          "Alien and Sedition Acts (1798) : A series of laws that made it harder for immigrants to become citizens, allowed the president to deport non-citizens deemed dangerous, and criminalized criticism of the government.",
          "XYZ Affair (1797-1798) : A diplomatic scandal in which French agents demanded bribes from U.S. envoys, leading to the Quasi-War with France.",
          "Quasi-War with France (1798-1800) : An undeclared naval war between the U.S. and France, leading Adams to strengthen the U.S. Navy.",
          "Creation of the Department of the Navy (1798) : Established a permanent U.S. Navy to counter threats from France and other nations.",
          "Midnight Appointments (1801) : Adams appointed numerous Federalist judges, including Chief Justice John Marshall, shaping U.S. law for decades.",
          "Naturalization Act of 1798 : Increased the residency requirement for citizenship from 5 to 14 years, making it harder for immigrants to become citizens.",
          "Treaty of Mortefontaine (1800) : Ended hostilities between the U.S. and France, preventing an all-out war.",
          "Direct Tax of 1798 : Imposed a federal property tax, which led to protests such as Fries' Rebellion in Pennsylvania.",
          "Virginia and Kentucky Resolutions response (1798-1799) : Though not his policy, these resolutions by Jefferson and Madison challenged the Alien and Sedition Acts, arguing states could nullify federal laws.",
        ],
        party: "Federalist",
        spouse: "Abigail Adams",
        children: "None",
        occupationBeforePresidency: "Lawyer",
        quote:
          "I must study politics and war that my sons may have liberty to study mathematics and philosophy.",
        image: "images/JohnAdams.png",
        otherPresidents: [
          "George Washington",
          "Thomas Jefferson",
          "James Madison",
          "James Monroe",
          "John Quincy Adams",
          "Andrew Jackson",
          "Martin Van Buren",
          "William Henry Harrison",
        ],
        otherPresidentThings: [
          {
            "George Washington":
              "returned to his Mount Vernon estate in Virginia, focusing on managing his plantation. Reappointed Commander-in-Chief during Quasi-War with France",
          },
          {
            "Thomas Jefferson":
              "Jefferson lost the 1796 presidential election to John Adams. At the time, the candidate with the second-most votes became Vice President, so he served under Adams despite being from an opposing political party. This created serious tensions in the government. In 1800 Ran against Adams, won the election",
          },
          {
            "James Madison":
              "Democratic-Republican leader, opposed Adams, co-wrote Virginia Resolution (1798)",
          },
          {
            "James Monroe":
              "U.S. Senator (1799-1802), opposed Adams, supported Jefferson's 1800 election",
          },
          {
            "John Quincy Adams":
              "U.S. Minister to Prussia (1797-1801), worked on trade agreements",
          },
          {
            "Andrew Jackson":
              "U.S. Senator (1797-1798), Tennessee Supreme Court Judge (1798-1804)",
          },
          {
            "Martin Van Buren":
              "New York State Senator (1799-1803), emerging Democratic-Republican leader",
          },
          {
            "William Henry Harrison":
              "Served in the U.S. Army, fought in Indian Wars(1791-1798), Secretary of the Northwest Territory, appointed by Adams(1798-1799), 	Delegate to U.S. Congress for Northwest Territory(1799-1801)",
          },
        ],
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
        policies: [
          "Louisiana Purchase (1803) : Doubled the size of the United States by acquiring 828,000 square miles of land from France for $15 million.",
          "Embargo Act of 1807 : Prohibited American ships from trading with foreign nations, aimed at pressuring Britain and France to respect U.S. neutrality but severely hurt the U.S. economy.",
          "Marbury v. Madison (1803) : Though not a policy, this Supreme Court decision established judicial review, strengthening the judiciary.",
          "Reduction of National Debt : Jefferson significantly cut federal spending and reduced the national debt by slashing military expenditures.",
          "Abolition of Internal Taxes : Repealed various federal taxes, such as the whiskey tax, reducing the tax burden on citizens.",
          "Lewis and Clark Expedition (1804-1806) : Commissioned an expedition to explore the newly acquired Louisiana Territory, mapping out the land and establishing relations with Native American tribes.",
          "Non-Intercourse Act (1809) : Replaced the Embargo Act, reopening trade with all nations except Britain and France to mitigate economic damage.",
          "Slave Trade Act of 1807 : Signed into law, prohibiting the importation of slaves into the U.S.",
          "Military and Naval Reductions : Reduced the standing army and navy, favoring state militias over a large federal military.",
          "Tripolitan War (1801-1805) : The first Barbary War against North African pirates, demonstrating the U.S. naval strength and asserting maritime rights.",
          "Yazoo Land Scandal Resolution (1802) : Helped resolve land disputes in Georgia by compensating claimants and transferring land to federal control.",
          "Twelfth Amendment (1804) : Changed the process of electing the president and vice president, requiring them to be elected as a ticket rather than separately.",
        ],
        party: "Democratic-Republican",
        spouse: "Martha Wayles Skelton Jefferson",
        children: "None",
        occupationBeforePresidency: "Planter and Lawyer",
        quote:
          "The man who reads nothing at all is better educated than the man who reads nothing but newspapers.",
        image: "images/ThomasJefferson.png",
        otherPresidents: [
          "John Adams",
          "James Madison",
          "James Monroe",
          "John Quincy Adams",
          "Andrew Jackson",
          "Martin Van Buren",
          "William Henry Harrison",
          "John Tyler",
        ],
        otherPresidentThings: [
          {
            "John Adams":
              "After losing election to Jefferson, Adams left DC and returned to his farm in Quincy MA largly avoiding public life. When Jefferson's presidency ended Adam and Jefferson started exchanging letters rekindling their friendship.",
          },
          {
            "James Madison":
              "	Secretary of State (1801-1809), helped oversee Louisiana Purchase,",
          },
          {
            "James Monroe":
              "	Negotiator of Louisiana Purchase (1803), Minister to Britain (1803-1806), Governor of Virginia (1807-1809)",
          },
          {
            "John Quincy Adams":
              "U.S. Senator (1803-1808), broke with Federalists, supported Louisiana Purchase, appointed Minister to Russia (1809)",
          },
          {
            "Andrew Jackson":
              "Judge in Tennessee (1804-1809), military leader, duel with Dickinson (1806)",
          },
          {
            "Martin Van Buren":
              "Practiced law (1801-1803), became Surrogate Judge (1803-1808), elected to New York Senate (1808)",
          },
          {
            "William Henry Harrison":
              "Governor of Indiana Territory (1801-1809), negotiated land treaties, expanded U.S. settlements",
          },
          {
            "John Tyler":
              "Law student (1801-1807), began law practice (1807), elected to Virginia House of Delegates (1809)",
          },
        ],
      },
      {
        name: "James Madison",
        terms: 2,
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
        policies: [
          "War of 1812 (1812-1815) : A major conflict between the U.S. and Britain over maritime rights, impressment of American sailors, and British support for Native American resistance. The war solidified U.S. sovereignty but ended in a stalemate.",
          "Treaty of Ghent (1814) : Officially ended the War of 1812, restoring pre-war borders between the U.S. and Britain but failing to resolve many of the war’s original causes.",
          "Creation of the Second Bank of the United States (1816) : Established to provide financial stability after the economic strain of the war, helping regulate currency and credit.",
          "Tariff of 1816 : The first protective tariff in U.S. history, designed to protect American manufacturing by taxing imported goods, making domestic products more competitive.",
          "Macon’s Bill No. 2 (1810) : A policy that reopened trade with Britain and France but threatened an embargo if either nation interfered with American shipping. It failed to prevent tensions leading to the War of 1812.",
          "Expansion of the U.S. Military : Strengthened the U.S. Army and Navy after recognizing weaknesses during the War of 1812, leading to improvements in national defense.",
          "Federal Internal Improvements Plan : Proposed using federal funds for infrastructure like roads and canals, though Madison vetoed the Bonus Bill, believing states should fund such projects.",
          "Rush-Bagot Agreement (1817) : A treaty with Britain that limited naval armaments on the Great Lakes, helping to ease U.S.-British tensions and laying the groundwork for peaceful U.S.-Canada relations.",
        ],

        party: "Democratic-Republican",
        spouse: "Dolley Payne Todd Madison",
        children: "None",
        occupationBeforePresidency: "Farmer and Politician",
        quote:
          "The means of defense against foreign danger have always been the instruments of tyranny at home.",
        image: "images/JamesMadison.png",
        otherPresidents: [
          "Thomas Jefferson",
          "James Monroe",
          "John Quincy Adams",
          "Andrew Jackson",
          "Martin Van Buren",
          "William Henry Harrison",
          "John Tyler",
          "James K. Polk",
        ],
        otherPresidentThings: [
          {
            "Thomas Jefferson":
              "Retired to Monticello after his presidency (1809), remained politically engaged in correspondence, founded the University of Virginia (chartered in 1819).",
          },
          {
            "James Monroe":
              "Secretary of State (1811–1817) and Secretary of War during War of 1812; key figure in foreign affairs and military strategy; succeeded Madison as president.",
          },
          {
            "John Quincy Adams":
              "Served as U.S. Minister to Russia (1809–1814), negotiated Treaty of Ghent (1814) ending the War of 1812.",
          },
          {
            "Andrew Jackson":
              "Major General in Tennessee militia; achieved national fame for victories in War of 1812, especially Battle of New Orleans (1815).",
          },
          {
            "Martin Van Buren":
              "Practiced law in New York; elected to New York State Senate (1812); gained influence in state politics.",
          },
          {
            "William Henry Harrison":
              "Army officer during War of 1812; commanded U.S. forces in Northwest, including victory at Battle of the Thames (1813).",
          },
          {
            "John Tyler":
              "Elected to U.S. House of Representatives (1816); previously served in Virginia House of Delegates and as a lawyer.",
          },
          {
            "James K. Polk":
              "Teenager during Madison’s presidency; enrolled at University of North Carolina (1816), preparing for public life.",
          },
        ],
      },
      {
        name: "James Monroe",
        terms: 2,
        status: "dead",
        birthYear: 1758,
        birthPlace: "Westmoreland County, Virginia",
        parents: "Spence Monroe and Elizabeth Jones",
        deathYear: 1831,
        deathPlace: "New York City, New York",
        deathReason: "Tuberculosis",
        presidencyStart: 1817,
        presidencyEnd: 1825,
        keyPolicies: 8,
        policies: [
          "Monroe Doctrine (1823) : Declared that European powers should not interfere in the Western Hemisphere, asserting U.S. dominance in the Americas and shaping foreign policy for decades.",
          "Missouri Compromise (1820) : Allowed Missouri to enter as a slave state and Maine as a free state, maintaining the balance of power between free and slave states in Congress.",
          "Acquisition of Florida (1819) : Secured Florida from Spain through the Adams-Onís Treaty, expanding U.S. territory.",
          "Panic of 1819 : The first major financial crisis in U.S. history, caused by land speculation and unstable banking practices, leading to widespread economic hardship.",
          "Cumberland Road Expansion : Supported federal funding for infrastructure improvements, particularly roads and canals, to enhance national transportation.",
          "Era of Good Feelings : Though not a policy, this period during Monroe’s presidency was characterized by political unity and the decline of the Federalist Party.",
          "Reduction of Military Spending : Monroe reduced military expenditures while strengthening coastal defenses and fortifications.",
          "Recognition of Latin American Independence : The U.S. formally recognized the independence of several Latin American nations from Spain, reinforcing the Monroe Doctrine.",
        ],
        party: "Democratic-Republican",
        spouse: "Elizabeth Kortright Monroe",
        children: "3",
        occupationBeforePresidency: "Lawyer and Soldier",
        quote: "National honor is the national property of the highest value.",
        image: "images/JamesMonroe.png",
        otherPresidents: [
          "Thomas Jefferson",
          "James Madison",
          "John Quincy Adams",
          "Andrew Jackson",
          "Martin Van Buren",
          "William Henry Harrison",
          "John Tyler",
          "James K. Polk",
          "William Henry Harrison",
        ],
        otherPresidentThings: [
          {
            "Thomas Jefferson":
              "In retirement at Monticello; continued prolific correspondence, helped found the University of Virginia (opened in 1825), remained a mentor to younger statesmen.",
          },
          {
            "James Madison":
              "Retired to Montpelier after presidency; served as Rector of the University of Virginia; advised Monroe privately on constitutional issues.",
          },
          {
            "John Quincy Adams":
              "Secretary of State (1817–1825); negotiated Adams–Onís Treaty (1819) acquiring Florida; key architect of the Monroe Doctrine.",
          },
          {
            "Andrew Jackson":
              "Led campaigns in First Seminole War (1817–1818); Military Governor of Florida (1821); returned to Tennessee politics after military service.",
          },
          {
            "Martin Van Buren":
              "New York State Senator (1816–1820), Attorney General of New York (1815–1819), and U.S. Senator from New York (1821–1828); rising national Democratic-Republican figure.",
          },
          {
            "John Tyler":
              "Served in the U.S. House of Representatives (1816–1821); returned to Virginia House of Delegates (1823).",
          },
          {
            "James K. Polk":
              "Attended the University of North Carolina (graduated 1818); studied law and entered legal practice (admitted to bar 1820).",
          },
          {
            "William Henry Harrison":
              "Served as U.S. Congressman from Ohio (1816–1819); ran unsuccessfully for Ohio governor (1820); continued political involvement in the Northwest.",
          },
        ],
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
        policies: [
          "Tariff of 1828 (Tariff of Abominations) : Raised import duties on imported goods, which benefited Northern industries but caused economic tensions in the South.",
          "Erie Canal Completion (1825) : Expanded trade and transportation routes, boosting economic development and connecting the Great Lakes with the Atlantic Ocean.",
          "Support for the American System : Advocated for infrastructure improvements, tariffs to protect U.S. industries, and a national bank to support economic growth.",
          "Expansion of Education : Promoted public education, federal funding for research institutions, and scientific advancements.",
          "Naval Expansion : Strengthened the U.S. Navy to protect American commerce and national security.",
          "Standardization of Weights and Measures : Pushed for a uniform system of weights and measures to facilitate trade and commerce.",
          "Diplomatic Engagement with Latin America : Sought to strengthen ties with newly independent Latin American nations through diplomatic missions.",
          "Creation of the Department of Interior Proposal : Proposed a department to manage internal improvements and land policies, though it was not established during his presidency.",
        ],
        party: "Democratic-Republican",
        spouse: "Louisa Catherine Johnson Adams",
        children: "4",
        occupationBeforePresidency: "Diplomat and Lawyer",
        quote:
          "If your actions inspire others to dream more, learn more, do more, and become more, you are a leader.",
        image: "images/JohnQuincyAdams.png",
        otherPresidents: [
          "Thomas Jefferson",
          "James Madison",
          "James Monroe",
          "Andrew Jackson",
          "Martin Van Buren",
          "William Henry Harrison",
          "John Tyler",
          "James K. Polk",
          "William Henry Harrison",
        ],
        otherPresidentThings: [
          {
            "Thomas Jefferson":
              "In retirement at Monticello; remained a public intellectual and oversaw the final years of the University of Virginia; died in 1826 on the 50th anniversary of the Declaration of Independence.",
          },
          {
            "James Madison":
              "Retired at Montpelier; served on the board of the University of Virginia and remained active in correspondence on political theory; died in 1836.",
          },
          {
            "James Monroe":
              "Lived in relative obscurity in Virginia following his presidency; faced financial difficulties; died in 1831.",
          },
          {
            "Andrew Jackson":
              "Ran against Adams in the highly contested 1824 election (lost via House decision); campaigned heavily and won the 1828 election, defeating Adams.",
          },
          {
            "Martin Van Buren":
              "Served as U.S. Senator from New York; strong organizer of the Democratic Party; opposed many Adams policies and helped Jackson's 1828 campaign.",
          },
          {
            "John Tyler":
              "Served in the Virginia House of Delegates; later became Governor of Virginia in 1825 and was elected U.S. Senator in 1827.",
          },
          {
            "James K. Polk":
              "Practicing law in Tennessee; served in the Tennessee House of Representatives (elected in 1823); began aligning with Jacksonian Democrats.",
          },
          {
            "William Henry Harrison":
              "Largely retired from public service during these years; focused on his farm in Ohio but remained a respected figure; served in the Ohio State Senate starting in 1825.",
          },
        ],
      },
      {
        name: "Andrew Jackson",
        terms: 2,
        status: "dead",
        birthYear: 1767,
        birthPlace: "Waxhaws region, South Carolina/North Carolina",
        parents: "Andrew Jackson Sr. and Elizabeth Hutchinson Jackson",
        deathYear: 1845,
        deathPlace: "Nashville, Tennessee",
        deathReason: "Tuberculosis and natural causes",
        presidencyStart: 1829,
        presidencyEnd: 1837,
        keyPolicies: 10,
        policies: [
          "Indian Removal Act (1830) : Forced Native American tribes to relocate west of the Mississippi River, leading to the Trail of Tears.",
          "Nullification Crisis (1832-1833) : Confronted South Carolina’s attempt to nullify federal tariffs, reinforcing federal authority and preventing secession.",
          "Bank War (1832) : Vetoed the renewal of the Second Bank of the United States, leading to its dissolution and shifting federal funds to state banks (pet banks).",
          "Specie Circular (1836) : Required government land purchases to be made in gold or silver instead of paper money, contributing to the Panic of 1837.",
          "Creation of the Democratic Party : Established the Democratic Party as a major political force, representing the interests of the common man.",
          "Maysville Road Veto (1830) : Vetoed a bill funding a Kentucky road project, arguing that infrastructure projects should be funded by states rather than the federal government.",
          "Peggy Eaton Affair : A social and political scandal that influenced Jackson’s cabinet reshuffling and loyalty among his advisors.",
          "Force Bill (1833) : Authorized Jackson to use military force to ensure compliance with federal tariff laws in response to the Nullification Crisis.",
          "Expansion of Executive Power : Strengthened the presidency by using the veto power more than all previous presidents combined, reshaping the balance of power in government.",
          "Panic of 1837 : Although it occurred shortly after his presidency, Jackson’s financial policies, including the Bank War and Specie Circular, contributed to the economic downturn.",
        ],
        party: "Democratic",
        spouse: "Rachel Donelson Robards Jackson",
        children: "None",
        occupationBeforePresidency: "Lawyer and Military Leader",
        quote: "One man with courage makes a majority.",
        image: "images/AndrewJackson.png",
        otherPresidents: [
          "John Quincy Adams",
          "Martin Van Buren",
          "John Tyler",
          "James K. Polk",
          "William Henry Harrison",
        ],
        otherPresidentThings: [
          {
            "John Quincy Adams":
              "Returned to public service as a U.S. Representative from Massachusetts (1831–1848); became a strong opponent of slavery and critic of Jackson’s policies, especially on internal improvements and the gag rule.",
          },
          {
            "Martin Van Buren":
              "Served as Jackson’s Secretary of State (1829–1831), then Vice President (1833–1837); became Jackson’s trusted advisor and handpicked successor.",
          },
          {
            "John Tyler":
              "Served as U.S. Senator from Virginia (until 1836); opposed many Jacksonian policies, including the national bank veto; began aligning with the Whig Party.",
          },
          {
            "James K. Polk":
              "Served in the U.S. House of Representatives (1825–1839); became a strong Jackson ally and chaired the Ways and Means Committee; Speaker of the House in 1835.",
          },
          {
            "William Henry Harrison":
              "Re-emerged in politics as a Whig presidential candidate in 1836 (unsuccessfully); campaigned on military record and opposition to Jacksonian policies.",
          },
        ],
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
        policies: [
          "Panic of 1837 : A severe economic depression that began shortly after Van Buren took office, caused by Jackson’s financial policies, land speculation, and the collapse of state banks.",
          "Independent Treasury Act (1840) : Established a system where federal funds would be stored in government vaults instead of private banks, aiming to stabilize the economy.",
          "Opposition to the Annexation of Texas : Refused to annex Texas, fearing it would lead to conflict with Mexico and intensify sectional tensions over slavery.",
          "Continuation of Indian Removal : Enforced the policies initiated under Andrew Jackson, including the forced relocation of Native American tribes such as the Cherokee.",
          "Neutrality in Canadian Rebellion (1837-1838) : Enforced strict neutrality when Canadian rebels sought U.S. support, preventing war with Britain.",
          "Enforcement of the Gag Rule : Supported a congressional rule that prevented discussions on anti-slavery petitions, reflecting his cautious stance on slavery.",
          "Amistad Case (1839) : His administration opposed granting freedom to enslaved Africans who had taken control of the Amistad ship, arguing they should be returned to Spain, though the Supreme Court later ruled in favor of their freedom.",
          "Expansion of Labor Rights : Supported the 10-hour workday for federal employees, an early step toward labor reform.",
        ],
        party: "Democratic",
        spouse: "Hannah Hoes Van Buren",
        children: "5",
        occupationBeforePresidency: "Lawyer and Politician",
        quote: "It is easier to do a job right than to explain why you didn’t.",
        image: "images/MartinVanBuren.png",
        otherPresidents: [
          "Andrew Jackson",
          "John Quincy Adams",
          "John Tyler",
          "James K. Polk",
          "William Henry Harrison",
        ],
        otherPresidentThings: [
          {
            "Andrew Jackson":
              "Retired to his plantation, The Hermitage, after leaving the presidency in 1837; remained politically active as an advisor and supporter of Van Buren’s administration.",
          },
          {
            "John Quincy Adams":
              "Continued serving in the U.S. House of Representatives; increasingly vocal against slavery and critical of Van Buren’s handling of abolitionist petitions (especially the gag rule).",
          },
          {
            "John Tyler":
              "Served as U.S. Senator from Virginia until 1836; after resigning, remained politically active as a Whig critic of Van Buren’s policies.",
          },
          {
            "James K. Polk":
              "Continued serving in the U.S. House of Representatives until 1839; strong supporter of Jacksonian Democrats and aligned with Van Buren on several policies.",
          },
          {
            "William Henry Harrison":
              "Ran as a Whig presidential candidate in 1836 (lost), but remained active; successfully ran against Van Buren in the 1840 election.",
          },
        ],
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
        keyPolicies: 5,
        policies: [
          "First Presidential Inauguration Speech (1841) : Delivered the longest inaugural address in U.S. history, emphasizing a strict interpretation of the Constitution and opposition to executive overreach.",
          "Whig Party Economic Agenda : Planned to implement the Whig Party's policies, including re-establishing a national bank and promoting infrastructure projects, though he died before enacting them.",
          "Limited Presidential Veto : Expressed opposition to excessive use of the presidential veto, aiming to restore Congressional authority over policymaking.",
          "Civil Service Reform Intentions : Planned to reduce the influence of the 'spoils system' by limiting political appointments to qualified individuals rather than party loyalists.",
          "Western Expansion Support : Supported policies favoring the settlement of western territories, continuing the expansionist vision of the U.S.",
        ],
        party: "Whig",
        spouse: "Anna Tuthill Symmes Harrison",
        children: "10",
        occupationBeforePresidency: "Military Officer and Politician",
        quote:
          "The liberties of a people depend on their own constant attention to its preservation.",
        notes: "Died only after 32 days in office.",
        image: "images/WilliamHenryHarrison.png",
        otherPresidents: [
          "Martin Van Buren",
          "Anrew Jackson",
          "John Quincy Adams",
          "John Tyler",
          "James K. Polk",
        ],
        otherPresidentThings: [
          {
            "Martin Van Buren":
              "Returned to private life after losing the 1840 election; remained politically active and began preparing for a potential comeback in 1844.",
          },
          {
            "Andrew Jackson":
              "In retirement at The Hermitage; maintained correspondence with political allies, including Van Buren; expressed concern about the rise of the Whig Party.",
          },
          {
            "John Quincy Adams":
              "Still serving in the U.S. House of Representatives; continued his anti-slavery advocacy and opposition to Southern influence in national politics.",
          },
          {
            "John Tyler":
              "Vice President under Harrison; became President after Harrison’s death on April 4, 1841 — the first time a vice president assumed the presidency due to death in office.",
          },
          {
            "James K. Polk":
              "Recently completed his term as Speaker of the House (1835–1839); served as Governor of Tennessee (1839–1841); preparing for national Democratic leadership.",
          },
        ],
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
        keyPolicies: 10,
        policies: [
          "Annexation of Texas (1845) : Signed the resolution to annex Texas into the United States, which later led to tensions with Mexico and the Mexican-American War.",
          "Veto of National Bank Bills (1841) : Vetoed two bills proposed by the Whig Party to establish a new national bank, leading to his expulsion from the Whig Party.",
          "Webster-Ashburton Treaty (1842) : Settled border disputes between the U.S. and British Canada, particularly in Maine and Minnesota.",
          "Preemption Act of 1841 : Allowed squatters on federal lands to purchase the land before it was offered for sale to the public, encouraging westward expansion.",
          "Treaty of Wanghia (1844) : The first trade treaty between the U.S. and China, granting America 'most favored nation' status in trade relations.",
          "Dorr Rebellion Response (1842) : Refused to intervene in Rhode Island’s political crisis, affirming state control over its own electoral laws.",
          "Log Cabin Bill (1841) : Provided settlers with 160 acres of public land at low prices, further supporting western expansion.",
          "Opposition to Tariff of 1842 : Initially opposed, but later signed a higher protective tariff to increase government revenue.",
          "Strengthening the U.S. Navy : Expanded and modernized the U.S. Navy, particularly for international trade and protection of American interests.",
          "Failed Impeachment Attempt (1842) : Became the first U.S. president to face an impeachment resolution, though it did not pass in Congress.",
        ],
        party: "Whig",
        spouse: "Letitia Christian Tyler",
        children: "8",
        occupationBeforePresidency: "Lawyer and Politician",
        quote:
          "Wealth can only be accumulated by the earnings of industry and the savings of frugality.",
        note: "John Tyler, often called “His Accidency”, had a presidency marked by clashes with his own party, the Whigs, and a focus on expansionist policies. ",
        image: "images/JohnTyler.png",
        otherPresidents: [
          "William Henry Harrison",
          "Martin Van Buren",
          "Andrew Jackson",
          "John Quincy Adams",
          "James K. Polk",
          "Zachary Taylor",
        ],
        otherPresidentThings: [
          {
            "William Henry Harrison":
              "Deceased — died in office on April 4, 1841, just one month into his presidency. Tyler succeeded him as president.",
          },
          {
            "Martin Van Buren":
              "Largely retired from public life after his 1840 defeat; declined to actively campaign in 1844 but was later nominated by the Free Soil Party in 1848.",
          },
          {
            "Andrew Jackson":
              "In declining health but continued to advise Democratic leaders from The Hermitage; remained critical of Whig policies and Tyler’s break with the party.",
          },
          {
            "John Quincy Adams":
              "Served actively in the U.S. House of Representatives; continued to oppose slavery and the annexation of Texas, a major initiative of Tyler's presidency.",
          },
          {
            "James K. Polk":
              "Regained political influence in Tennessee after a gubernatorial loss; positioned himself as a dark horse candidate for the 1844 Democratic nomination, which he eventually won.",
          },
          {
            "Zachary Taylor":
              "Serving as a military commander on the southwestern frontier; began gaining national attention for leadership in conflicts near the Texas-Mexico border.",
          },
        ],
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
        keyPolicies: 10,
        policies: [
          "Oregon Treaty (1846) : Established the northern boundary of the U.S. at the 49th parallel, securing Oregon Territory from Britain without conflict.",
          "Mexican-American War (1846-1848) : Led to the U.S. victory over Mexico, resulting in the acquisition of a vast territory in the Southwest.",
          "Treaty of Guadalupe Hidalgo (1848) : Ended the Mexican-American War and ceded California, Arizona, New Mexico, and other territories to the U.S.",
          "Annexation of Texas (1845) : Officially brought Texas into the Union, fulfilling Polk’s expansionist vision but increasing tensions with Mexico.",
          "Independent Treasury System (1846) : Re-established a system for managing government funds separately from private banks, ensuring financial stability.",
          "Walker Tariff (1846) : Lowered tariffs on imports, promoting free trade and benefiting Southern agricultural interests.",
          "Wilmot Proviso Debate (1846) : Though not passed, it proposed banning slavery in territories acquired from Mexico, sparking sectional tensions.",
          "Expansion of the U.S. Navy : Strengthened the U.S. Navy to support international trade and military actions.",
          "Smithsonian Institution Established (1846) : Signed into law the creation of the Smithsonian Institution, promoting education and research.",
          "California Gold Rush (1848) : Though not a direct policy, Polk’s acquisition of California set the stage for the Gold Rush and westward expansion.",
        ],
        party: "Democratic",
        spouse: "Sarah Childress Polk",
        children: "None",
        occupationBeforePresidency: "Lawyer",
        quote:
          "No president who performs his duties faithfully and conscientiously can have any leisure.",
        image: "images/JamesKPolk.png",
        otherPresidents: [
          "Martin Van Buren",
          "John Tyler",
          "Zachary Taylor",
          "Millard Fillmore",
          "Franklin Pierce",
          "James Buchanan",
          "Abraham Lincoln",
        ],
        otherPresidentThings: [
          {
            "Martin Van Buren":
              "Remained active in Democratic politics; sought the 1844 nomination but lost to Polk; later distanced himself from Polk’s expansionist policies and opposed the annexation of Texas.",
          },
          {
            "John Tyler":
              "Retired from public life after leaving office in 1845; supported the annexation of Texas, which Polk completed early in his term.",
          },
          {
            "John Quincy Adams":
              "Served in the U.S. House of Representatives until his death in 1848; opposed the Mexican-American War and slavery expansion; collapsed on the House floor and died shortly after.",
          },
          {
            "Zachary Taylor":
              "Gained national fame as a general in the Mexican-American War (1846–1848); his victories made him a popular hero and future Whig presidential candidate.",
          },
          {
            "Millard Fillmore":
              "Served in the U.S. House of Representatives (1833–1835, 1837–1843); though not holding national office during Polk’s term, he was active in New York politics and later became Taylor’s running mate in 1848.",
          },
          {
            "Franklin Pierce":
              "Served in the U.S. Senate until 1842; supported the Mexican-American War and remained active in Democratic Party politics; declined an offer to serve in Polk’s cabinet.",
          },
          {
            "James Buchanan":
              "Served as U.S. Secretary of State under Polk (1845–1849); played a major role in foreign policy including relations with Britain and negotiations over Oregon.",
          },
          {
            "Abraham Lincoln":
              "Elected to the U.S. House of Representatives in 1846; served one term (1847–1849); was a vocal Whig critic of the Mexican-American War and President Polk’s justifications for it.",
          },
        ],
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
        keyPolicies: 8,
        policies: [
          "Compromise of 1850 Opposition : Opposed the expansion of slavery into newly acquired territories, resisting efforts to pass the Compromise of 1850 during his presidency.",
          "California Statehood (1849) : Supported California’s bid for statehood as a free state, intensifying tensions between the North and South over slavery.",
          "Utah and New Mexico Territorial Governments : Advocated for the organization of Utah and New Mexico territories without immediate decisions on slavery, leaving the issue to local governance.",
          "Clayton-Bulwer Treaty (1850) : Signed a treaty with Britain that ensured neither country would colonize or control any future canal across Central America.",
          "Enforcement of Federal Authority : Threatened to use military force against Southern states considering secession over the slavery debate.",
          "Support for Infrastructure : Advocated for internal improvements such as roads and canals but took a limited federal approach to funding them.",
          "Relations with Native Americans : Continued previous policies of relocating Native American tribes to reservations to make way for westward expansion.",
          "Limited Government Spending : Promoted fiscal responsibility and opposed excessive federal expenditures.",
        ],
        party: "Whig",
        spouse: "Margaret Mackall Smith Taylor",
        children: "6",
        occupationBeforePresidency: "Military Officer",
        quote:
          "I have always done my duty. I am ready to die. My only regret is for the friends I leave behind me.",
        image: "images/ZacharyTaylor.png",
        otherPresidents: [
          "James K. Polk",
          "Martin Van Buren",
          "John Tyler",
          "Millard Fillmore",
          "Franklin Pierce",
          "James Buchanan",
          "Abraham Lincoln",
        ],
        otherPresidentThings: [
          {
            "James K. Polk":
              "Died just three months after leaving office in 1849; spent his final days in retirement in Nashville, Tennessee, following a physically exhausting presidency.",
          },
          {
            "Martin Van Buren":
              "Retired from national politics after his 1848 Free Soil Party presidential run; remained a respected elder statesman, though largely removed from public affairs.",
          },
          {
            "John Tyler":
              "In retirement at his Virginia plantation, Sherwood Forest; remained politically engaged and would later support secessionist causes in the 1850s.",
          },
          {
            "Millard Fillmore":
              "Vice President under Taylor; became President upon Taylor’s death in July 1850.",
          },
          {
            "Franklin Pierce":
              "Served as U.S. Attorney for New Hampshire; maintained low national political profile during this period but stayed active in Democratic Party affairs.",
          },
          {
            "James Buchanan":
              "Returned to private legal practice in Pennsylvania after serving as Secretary of State; preparing for a political comeback that would lead to his 1856 presidential run.",
          },
          {
            "Abraham Lincoln":
              "Returned to Illinois law practice after serving one term in the U.S. House (1847–1849); largely disengaged from national politics during Taylor's presidency.",
          },
        ],
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
        keyPolicies: 8,
        policies: [
          "Compromise of 1850 : Signed into law a series of bills that attempted to ease tensions between free and slave states, including the admission of California as a free state and the Fugitive Slave Act.",
          "Fugitive Slave Act (1850) : Enforced stricter laws requiring the return of escaped enslaved individuals, angering Northern abolitionists.",
          "Texas-New Mexico Boundary Act (1850) : Resolved the border dispute between Texas and New Mexico, giving federal government control over the disputed land.",
          "Abolition of the Slave Trade in Washington, D.C. (1850) : As part of the Compromise of 1850, ended the slave trade (but not slavery) in the nation’s capital.",
          "Expansion of Trade with Japan : Sent Commodore Matthew Perry to open trade relations with Japan, leading to the Treaty of Kanagawa in 1854.",
          "Support for the Transcontinental Railroad : Pushed for infrastructure improvements, including early efforts toward a transcontinental railroad.",
          "Enforcement of Federal Authority : Used federal power to maintain law and order, including suppressing secessionist movements.",
          "Cuba Annexation Attempt (Lopez Expeditions) : Took a neutral stance while some Americans attempted to annex Cuba, an effort that ultimately failed.",
        ],
        party: "Whig",
        spouse: "Abigail Powers Fillmore",
        children: "2",
        occupationBeforePresidency: "Lawyer",
        quote:
          "The nourishment of a nation depends on the health of its democracy.",
        image: "images/MillardFillmore.png",
        otherPresidents: [
          "Zachary Taylor",
          "Martin Van Buren",
          "John Tyler",
          "Franklin Pierce",
          "James Buchanan",
          "Abraham Lincoln",
        ],
        otherPresidentThings: [
          {
            "Zachary Taylor":
              "Deceased — died in office on July 9, 1850, after only 16 months as president. Fillmore succeeded him and completed the remainder of the term.",
          },
          {
            "Martin Van Buren":
              "In retirement in Kinderhook, New York; largely withdrawn from public life after his 1848 Free Soil Party run; occasionally corresponded with political figures.",
          },
          {
            "John Tyler":
              "Retired in Virginia but remained politically engaged; increasingly aligned with pro-slavery and Southern interests; voiced support for states' rights.",
          },
          {
            "Franklin Pierce":
              "Regained national attention as a potential Democratic presidential candidate; had returned to private life but was building party alliances behind the scenes.",
          },
          {
            "James Buchanan":
              "Active in Democratic Party politics; was a top contender for the 1852 Democratic nomination but lost to Pierce; continued promoting national unity and compromise on slavery.",
          },
          {
            "Abraham Lincoln":
              "Practicing law in Illinois; remained politically quiet during Fillmore's term, having stepped away from national office after his House term ended in 1849.",
          },
        ],
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
        keyPolicies: 8,
        policies: [
          "Kansas-Nebraska Act (1854) : Repealed the Missouri Compromise and allowed settlers in Kansas and Nebraska to determine the status of slavery, leading to violent conflicts known as 'Bleeding Kansas.'",
          "Gadsden Purchase (1854) : Acquired land from Mexico (southern Arizona and southwestern New Mexico) to facilitate the construction of a southern transcontinental railroad.",
          "Enforcement of the Fugitive Slave Act : Strictly enforced laws requiring the return of escaped enslaved individuals, increasing tensions between the North and South.",
          "Expansion of Trade with Japan : Supported the success of Commodore Matthew Perry’s expedition, leading to the Treaty of Kanagawa (1854), opening Japan to U.S. trade.",
          "Ostend Manifesto (1854) : Secretly supported an unsuccessful attempt to purchase or seize Cuba from Spain to expand slavery, leading to controversy when it was exposed.",
          "Diplomatic Relations with Latin America : Worked to expand U.S. influence in Central and South America, including attempts to acquire more territory.",
          "Economic Growth Policies : Encouraged infrastructure expansion, including railroad development, to promote westward expansion and commerce.",
          "Civil Service Appointments Based on Party Loyalty : Strengthened the 'spoils system' by rewarding government positions to loyal Democrats, leading to political corruption.",
        ],
        party: "Democratic",
        spouse: "Jane Means Appleton Pierce",
        children: "3",
        occupationBeforePresidency: "Lawyer and Politician",
        quote:
          "The storm of frenzy and faction must inevitably dash itself in vain against the unshaken rock of the Constitution.",
        image: "images/FranklinPierce.png",
        otherPresidents: [
          "Millard Fillmore",
          "John Tyler",
          "James Buchanan",
          "Abraham Lincoln",
          "James K. Polk",
          "Zachary Taylor",
          "Martin Van Buren",
        ],
        otherPresidentThings: [
          {
            "Millard Fillmore":
              "Returned to private life in New York after completing Taylor’s term; remained politically active, later ran as the Know-Nothing (American Party) candidate in the 1856 presidential election.",
          },
          {
            "John Tyler":
              "Continued his retirement in Virginia; became increasingly aligned with Southern secessionist sentiment; would eventually support the Confederacy.",
          },
          {
            "James Buchanan":
              "Served as U.S. Minister to the United Kingdom (1853–1856), where he helped negotiate the controversial Ostend Manifesto advocating for the acquisition of Cuba.",
          },
          {
            "Abraham Lincoln":
              "Practiced law in Illinois; re-entered the political scene by speaking out against the Kansas-Nebraska Act (1854), which Pierce had signed, helping to galvanize anti-slavery Whigs and form the Republican Party.",
          },
          {
            "James K. Polk":
              "Deceased — died in 1849 shortly after leaving office.",
          },
          {
            "Zachary Taylor": "Deceased — died in office in 1850.",
          },
          {
            "Martin Van Buren":
              "In retirement, remained a respected elder statesman; publicly opposed the Kansas-Nebraska Act, viewing it as destabilizing to the Union.",
          },
        ],
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
        keyPolicies: 8,
        policies: [
          "Dred Scott Decision Support (1857) : Endorsed the Supreme Court’s ruling that African Americans were not citizens and that Congress could not prohibit slavery in the territories.",
          "Lecompton Constitution (1857) : Supported a pro-slavery constitution for Kansas statehood, despite opposition from anti-slavery settlers, worsening sectional tensions.",
          "Panic of 1857 : Responded weakly to a major economic downturn caused by land speculation and banking failures, disproportionately affecting the North.",
          "Utah War (1857-1858) : Sent federal troops to Utah to suppress a rebellion by Mormon settlers, though it was resolved peacefully.",
          "Ostend Manifesto Fallout : Continued expansionist goals to acquire Cuba but faced strong opposition after earlier diplomatic efforts were exposed and condemned.",
          "Crittenden Compromise Rejection (1860) : Declined to support a last-minute compromise that sought to prevent secession by allowing the expansion of slavery.",
          "Secession Crisis Inaction (1860-1861) : Failed to prevent Southern states from seceding after Lincoln’s election, arguing that the federal government had no authority to stop them.",
          "Strengthening of Fort Sumter : Refused to surrender federal forts to the Confederacy, indirectly setting the stage for the Civil War.",
        ],
        party: "Democratic",
        spouse: "None",
        children: "None",
        occupationBeforePresidency: "Diplomat and Lawyer",
        quote: "The ballot box is the surest arbiter of disputes among free men.",
        image: "images/JamesBuchanan.png",
        otherPresidents: [
          "Franklin Pierce",
          "Millard Fillmore",
          "John Tyler",
          "Abraham Lincoln",
          "Zachary Taylor",
          "James K. Polk",
          "Martin Van Buren",
        ],
        otherPresidentThings: [
          {
            "Franklin Pierce":
              "Retired from public life but continued to support Southern Democrats; opposed abolitionism and supported Buchanan’s pro-Southern policies like the enforcement of the Dred Scott decision.",
          },
          {
            "Millard Fillmore":
              "In retirement in Buffalo, New York; occasionally voiced moderate Unionist views but did not hold public office; remained critical of sectional extremism from both North and South.",
          },
          {
            "John Tyler":
              "Still retired in Virginia; continued to support states' rights and slavery; increasingly sympathetic to secessionist views as national tensions worsened.",
          },
          {
            "Abraham Lincoln":
              "Re-entered politics through debates with Stephen A. Douglas in 1858 (Lincoln-Douglas Debates); gained national prominence as a leading Republican voice against the expansion of slavery.",
          },
          {
            "Zachary Taylor": "Deceased — died in office in 1850.",
          },
          {
            "James K. Polk":
              "Deceased — died in 1849 shortly after his presidency ended.",
          },
          {
            "Martin Van Buren":
              "Deceased — died in 1862, but during Buchanan’s term, he remained retired and opposed to slavery expansion, including the Dred Scott decision.",
          },
        ],
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
        keyPolicies: 10,
        policies: [
          "Emancipation Proclamation (1863) : Declared all enslaved people in Confederate-held territories to be free, shifting the Civil War's focus to ending slavery.",
          "Homestead Act (1862) : Provided 160 acres of free public land to settlers who agreed to cultivate it for at least five years, promoting westward expansion.",
          "Pacific Railway Act (1862) : Authorized the construction of the Transcontinental Railroad, connecting the east and west coasts and boosting economic growth.",
          "Morrill Land-Grant Act (1862) : Granted federal land to states to establish agricultural and technical colleges, improving education and innovation.",
          "National Banking Act (1863) : Established a national banking system and uniform currency, stabilizing the U.S. economy during the Civil War.",
          "Suspension of Habeas Corpus (1861) : Temporarily suspended habeas corpus to arrest and detain suspected Confederate sympathizers without trial, increasing executive power.",
          "Ten-Percent Plan (1863) : Proposed a lenient Reconstruction policy that allowed Confederate states to rejoin the Union if 10% of voters swore loyalty to the U.S.",
          "13th Amendment (1865) : Pushed for the constitutional amendment that abolished slavery in the United States, ensuring a permanent end to the institution.",
          "Revenue Act of 1862 : Established the first progressive income tax to fund the Union war effort during the Civil War.",
          "Establishment of the U.S. Secret Service (1865) : Created the Secret Service on the day of his assassination, originally to combat counterfeiting but later expanded to protect the president.",
        ],
        party: "Republican",
        spouse: "Mary Todd Lincoln",
        children: "4",
        occupationBeforePresidency: "Lawyer",
        quote:
          "Government of the people, by the people, for the people, shall not perish from the Earth.",
        image: "images/AbrahamLincoln.png",
        otherPresidents: [
          "James Buchanan",
          "Franklin Pierce",
          "Millard Fillmore",
          "John Tyler",
          "James K. Polk",
          "Zachary Taylor",
          "Martin Van Buren",
          "Andrew Johnson",
        ],
        otherPresidentThings: [
          {
            "James Buchanan":
              "Retired from public life after leaving office in 1861; defended his administration’s inaction as secession unfolded; criticized Lincoln’s war policies but avoided public office or major influence.",
          },
          {
            "Franklin Pierce":
              "Lived in retirement in New Hampshire; privately expressed sympathy for the South and criticized Lincoln’s suspension of civil liberties; his pro-Southern views damaged his reputation.",
          },
          {
            "Millard Fillmore":
              "Also in retirement; supported the Union but opposed many of Lincoln’s wartime policies; advocated for a moderate peace but had limited public influence.",
          },
          {
            "John Tyler":
              "Joined the Confederate cause in 1861 and was elected to the Confederate House of Representatives; died in 1862 while serving the Confederacy.",
          },
          {
            "James K. Polk": "Deceased — died in 1849.",
          },
          {
            "Zachary Taylor": "Deceased — died in 1850.",
          },
          {
            "Martin Van Buren":
              "Deceased — died in July 1862, during Lincoln’s first term; had opposed slavery expansion and disapproved of the Civil War’s escalation.",
          },
          {
            "Andrew Johnson":
              "Served as U.S. Senator from Tennessee; remained loyal to the Union despite being from a Southern state; appointed military governor of Tennessee in 1862; chosen as Lincoln’s running mate in 1864.",
          },
        ],
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
        keyPolicies: 10,
        policies: [
          "Emancipation Proclamation (1863) : Declared all enslaved people in Confederate-held territories to be free, shifting the Civil War's focus to ending slavery.",
          "Homestead Act (1862) : Provided 160 acres of free public land to settlers who agreed to cultivate it for at least five years, promoting westward expansion.",
          "Pacific Railway Act (1862) : Authorized the construction of the Transcontinental Railroad, connecting the east and west coasts and boosting economic growth.",
          "Morrill Land-Grant Act (1862) : Granted federal land to states to establish agricultural and technical colleges, improving education and innovation.",
          "National Banking Act (1863) : Established a national banking system and uniform currency, stabilizing the U.S. economy during the Civil War.",
          "Suspension of Habeas Corpus (1861) : Temporarily suspended habeas corpus to arrest and detain suspected Confederate sympathizers without trial, increasing executive power.",
          "Ten-Percent Plan (1863) : Proposed a lenient Reconstruction policy that allowed Confederate states to rejoin the Union if 10% of voters swore loyalty to the U.S.",
          "13th Amendment (1865) : Pushed for the constitutional amendment that abolished slavery in the United States, ensuring a permanent end to the institution.",
          "Revenue Act of 1862 : Established the first progressive income tax to fund the Union war effort during the Civil War.",
          "Establishment of the U.S. Secret Service (1865) : Created the Secret Service on the day of his assassination, originally to combat counterfeiting but later expanded to protect the president.",
        ],
        party: "National Union",
        spouse: "Eliza McCardle Johnson",
        children: "5",
        occupationBeforePresidency: "Tailor and Politician",
        quote: "Honest conviction is my courage; the Constitution is my guide.",
        image: "images/AndrewJohnson.png",
        otherPresidents: [
          "Abraham Lincoln",
          "James Buchanan",
          "Franklin Pierce",
          "Millard Fillmore",
          "John Tyler",
          "Martin Van Buren",
          "Ulysses S. Grant",
          "Rutherford B. Hayes",
        ],
        otherPresidentThings: [
          {
            "Abraham Lincoln":
              "Deceased — assassinated on April 14, 1865, just days after the end of the Civil War. Johnson, as vice president, succeeded him the following day.",
          },
          {
            "James Buchanan":
              "In retirement in Pennsylvania until his death in 1868; publicly defended his own record but largely avoided commenting on Johnson's policies or the Reconstruction struggle.",
          },
          {
            "Franklin Pierce":
              "Deceased — died in 1869, the same year Johnson left office; had remained a critic of Republican policies, including Lincoln and later Johnson’s approaches to Reconstruction.",
          },
          {
            "Millard Fillmore":
              "Lived quietly in retirement; supported the Union during the Civil War but had minimal influence during Reconstruction; avoided direct comment on Johnson’s impeachment crisis.",
          },
          {
            "John Tyler":
              "Deceased — died in 1862 after joining the Confederate Congress.",
          },
          {
            "Martin Van Buren": "Deceased — died in 1862 during the Civil War.",
          },
          {
            "Ulysses S. Grant":
              "Commanding General of the U.S. Army; oversaw military enforcement of Reconstruction policies; increasingly at odds with Johnson’s leniency toward the South; elected president in 1868.",
          },
          {
            "Rutherford B. Hayes":
              "Served as a Union general during the Civil War; elected to U.S. House of Representatives in 1865; began establishing a reputation as a moderate Republican.",
          },
        ],
      },
      {
        name: "Ulysses S. Grant",
        terms: 2,
        status: "dead",
        birthYear: 1822,
        birthPlace: "Point Pleasant, Ohio",
        parents: "Jesse Grant and Hannah Simpson",
        deathYear: 1885,
        deathPlace: "Wilton, New York",
        deathReason: "Cancer of the throat",
        presidencyStart: 1869,
        presidencyEnd: 1877,
        keyPolicies: 12,
        policies: [
          "15th Amendment (1870) : Ensured voting rights for African American men by prohibiting racial discrimination in voting.",
          "Enforcement Acts (1870-1871) : Passed laws to combat the Ku Klux Klan and protect African Americans' civil rights in the South during Reconstruction.",
          "Civil Rights Act of 1875 : Prohibited racial discrimination in public accommodations, though later struck down by the Supreme Court.",
          "Panic of 1873 : Responded to an economic depression caused by over-speculation in railroads and banking failures, leading to financial hardship across the U.S.",
          "Resumption Act of 1875 : Established the plan to return the U.S. to the gold standard, ensuring the redemption of paper currency in gold.",
          "Indian Peace Policy (1869) : Aimed to assimilate Native Americans into American society while reducing military conflicts, though it resulted in forced relocation and cultural suppression.",
          "Battle of Little Bighorn Aftermath (1876) : Oversaw federal responses to conflicts with Native American tribes, particularly after Custer’s defeat in Montana.",
          "Alabama Claims Settlement (1871) : Negotiated a treaty with Britain, securing $15.5 million in damages for British-built Confederate ships during the Civil War.",
          "Annexation of Santo Domingo Attempt (1869) : Attempted to annex Santo Domingo (now the Dominican Republic) to expand U.S. influence, though it was rejected by Congress.",
          "Reform of the Civil Service : Implemented early civil service reforms by introducing merit-based appointments and reducing the spoils system.",
          "Whiskey Ring Scandal (1875) : Exposed a major tax fraud scheme involving government officials and distillers, leading to criminal prosecutions.",
          "Transcontinental Railroad Completion (1869) : Promoted the continued expansion of railroads, linking the East and West coasts and fostering economic growth.",
        ],
        party: "Republican",
        spouse: "Julia Dent Grant",
        children: "4",
        occupationBeforePresidency: "Military Leader",
        quote: "The friend in my adversity I shall always cherish most.",
        image: "images/UlyssesGrant.png",
        otherPresidents: [
          "Andrew Johnson",
          "Abraham Lincoln",
          "James Buchanan",
          "Franklin Pierce",
          "Millard Fillmore",
          "Rutherford B. Hayes",
          "James A. Garfield",
          "Chester A. Arthur",
        ],
        otherPresidentThings: [
          {
            "Andrew Johnson":
              "Returned to Tennessee after leaving office; remained a vocal critic of Republican Reconstruction policies and Grant’s administration; briefly re-entered politics as a U.S. Senator from Tennessee in 1875 before dying in 1875.",
          },
          {
            "Abraham Lincoln":
              "Deceased — assassinated in 1865 shortly after the Civil War’s end.",
          },
          {
            "James Buchanan":
              "Deceased — died in 1868, a year before Grant took office.",
          },
          {
            "Franklin Pierce":
              "Deceased — died in 1869, the year Grant became president.",
          },
          {
            "Millard Fillmore":
              "Lived in quiet retirement in Buffalo, New York; had little public role and avoided involvement in postwar politics; died in 1874 during Grant’s second term.",
          },
          {
            "Rutherford B. Hayes":
              "Served as Governor of Ohio (1868–1872, 1876–1877); became a rising star in the Republican Party and was nominated and elected as Grant’s successor in 1876.",
          },
          {
            "James A. Garfield":
              "Served in the U.S. House of Representatives throughout Grant’s presidency; gained influence as a leading Republican legislator, especially on financial and civil service issues.",
          },
          {
            "Chester A. Arthur":
              "Practiced law and held minor political appointments in New York; became politically active in Republican machine politics, notably aligned with Senator Roscoe Conkling during the Grant era.",
          },
        ],
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
        policies: [
          "Compromise of 1877 : Agreed to withdraw federal troops from the South in exchange for winning the disputed 1876 election, effectively ending Reconstruction.",
          "End of Reconstruction (1877) : Removed federal troops from Southern states, leading to the rise of Jim Crow laws and the disenfranchisement of African Americans.",
          "Civil Service Reform : Began reforming government jobs by pushing for merit-based appointments instead of political patronage (spoils system).",
          "Great Railroad Strike of 1877 : Sent federal troops to break up the nationwide railroad strike, marking one of the first major labor conflicts in U.S. history.",
          "Bland-Allison Act (1878) : Allowed the U.S. Treasury to purchase silver and coin it into dollars, aiming to help farmers and debtors but with limited economic impact.",
          "Indian Policy Reform : Advocated for Native American assimilation policies, including English-language education and land allotment programs.",
          "Voting Rights Protection : Urged Congress to protect Black voting rights in the South, though with little success due to Democratic opposition.",
          "Expansion of Education : Promoted federal aid for universal education, particularly in the South, but failed to pass significant legislation.",
        ],
        party: "Republican",
        spouse: "Lucy Webb Hayes",
        children: "8",
        occupationBeforePresidency: "Lawyer and Politician",
        quote: "He serves his party best who serves the country best.",
        image: "images/RutherfordHayes.png",
        otherPresidents: [
          "Ulysses S. Grant",
          "Andrew Johnson",
          "Abraham Lincoln",
          "Millard Fillmore",
          "James A. Garfield",
          "Chester A. Arthur",
          "Benjamin Harrison",
          "Grover Cleveland",
        ],
        otherPresidentThings: [
          {
            "Ulysses S. Grant":
              "Retired from the presidency in 1877; traveled extensively abroad on a world tour; remained a respected national figure and contemplated a political comeback in 1880 but was not re-nominated.",
          },
          {
            "Andrew Johnson":
              "Deceased — died in 1875 after briefly returning to the U.S. Senate.",
          },
          {
            "Abraham Lincoln": "Deceased — assassinated in 1865.",
          },
          {
            "Millard Fillmore": "Deceased — died in 1874.",
          },
          {
            "James A. Garfield":
              "Served in the U.S. House of Representatives; prominent Republican legislator known for his oratory and leadership on fiscal matters; elected president in 1880, succeeding Hayes.",
          },
          {
            "Chester A. Arthur":
              "Held the post of Collector of the Port of New York until removed by Hayes in 1878 as part of civil service reform; became a symbol of party patronage politics.",
          },
          {
            "Benjamin Harrison":
              "Practiced law in Indiana and served as a political leader within the state Republican Party; gained national attention during this period but did not yet hold high federal office.",
          },
          {
            "Grover Cleveland":
              "Practicing law in Buffalo, New York; served as Assistant District Attorney of Erie County and began building a reputation for integrity in local politics.",
          },
        ],
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
        keyPolicies: 8,
        policies: [
          "Civil Service Reform Advocacy : Pushed for merit-based government jobs and opposed the spoils system, laying the groundwork for future reforms.",
          "Pendleton Civil Service Reform Act Proposal : Although passed after his assassination, his efforts led to the law, which introduced merit-based hiring for federal jobs.",
          "Strengthening Presidential Authority : Asserted executive power by resisting pressure from party leaders and refusing to grant patronage positions to political allies.",
          "Naval Expansion Plans : Advocated for modernizing and expanding the U.S. Navy to improve national defense and trade security.",
          "Support for Universal Education : Called for increased federal funding for public schools, particularly in the South, to reduce illiteracy and economic disparity.",
          "African American Civil Rights Support : Pushed for stronger federal protections for Black Americans' voting rights, though Congress did not act on his proposals.",
          "Tariff Reform : Sought to reduce tariffs that benefited industrialists at the expense of consumers, but his plans remained unfulfilled due to his short presidency.",
          "Economic Modernization : Supported industrial growth and infrastructure improvements, including railroad expansion, to boost the economy.",
        ],
        party: "Republican",
        spouse: "Lucretia Rudolph Garfield",
        children: "7",
        occupationBeforePresidency: "Military Leader and Politician",
        quote: "Ideas control the world.",
        image: "images/JamesGarfield.png",
        otherPresidents: [
          "Rutherford B. Hayes",
          "Ulysses S. Grant",
          "Chester A. Arthur",
          "Benjamin Harrison",
          "Grover Cleveland",
          "Abraham Lincoln",
          "Andrew Johnson",
          "Millard Fillmore",
        ],
        otherPresidentThings: [
          {
            "Rutherford B. Hayes":
              "In retirement after leaving office in March 1881; focused on promoting education and civil service reform from his home in Ohio; supported Garfield’s reform-minded agenda.",
          },
          {
            "Ulysses S. Grant":
              "Returned from his world tour in 1879; published his memoirs and was battling cancer; remained a revered Civil War hero until his death in 1885.",
          },
          {
            "Chester A. Arthur":
              "Vice President under Garfield; largely sidelined during Garfield’s short presidency but became president after Garfield’s death in September 1881.",
          },
          {
            "Benjamin Harrison":
              "Gaining influence in Indiana Republican politics; served as U.S. Senator (1881–1887); focused on veterans' affairs and civil service issues during Garfield’s presidency.",
          },
          {
            "Grover Cleveland":
              "Elected Mayor of Buffalo, New York in 1881; gaining attention for fighting corruption and political patronage at the local level.",
          },
          {
            "Abraham Lincoln": "Deceased — assassinated in 1865.",
          },
          {
            "Andrew Johnson": "Deceased — died in 1875.",
          },
          {
            "Millard Fillmore": "Deceased — died in 1874.",
          },
        ],
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
        keyPolicies: 8,
        policies: [
          "Pendleton Civil Service Reform Act (1883) : Established the Civil Service Commission and introduced merit-based hiring, reducing the spoils system.",
          "Chinese Exclusion Act (1882) : Signed the first significant U.S. law restricting immigration, banning Chinese laborers from entering the country for ten years.",
          "Tariff Reduction Efforts : Advocated for lowering high tariffs to reduce surplus government revenue, though Congress was reluctant to act.",
          "Modernization of the U.S. Navy : Supported the expansion and modernization of the Navy by funding the construction of steel warships.",
          "Edmunds Act (1882) : Strengthened anti-polygamy laws against the Mormon Church in Utah, restricting polygamists' rights to vote and hold office.",
          "Rebuilding the Executive Mansion (White House) : Oversaw major renovations to the White House, improving its structure and furnishings.",
          "Indian Policy and Land Reform : Enforced policies aimed at assimilating Native Americans, including the idea of private land ownership through allotment.",
          "Veto of Rivers and Harbors Act (1882) : Vetoed a bill with excessive federal spending on infrastructure, arguing against wasteful government expenditures.",
        ],
        party: "Republican",
        spouse: "Ellen Lewis Herndon Arthur",
        children: "3",
        occupationBeforePresidency: "Lawyer",
        quote:
          "Men may die, but the fabric of our free institutions remains unshaken.",
        image: "images/ChesterArthur.png",
        otherPresidents: [
          "James A. Garfield",
          "Rutherford B. Hayes",
          "Ulysses S. Grant",
          "Benjamin Harrison",
          "Grover Cleveland",
          "Abraham Lincoln",
          "Andrew Johnson",
          "Millard Fillmore",
        ],
        otherPresidentThings: [
          {
            "James A. Garfield":
              "Deceased — died on September 19, 1881, after being shot earlier that summer. Arthur succeeded him as president.",
          },
          {
            "Rutherford B. Hayes":
              "In retirement in Ohio; continued advocating for civil service reform and praised Arthur for signing the Pendleton Civil Service Reform Act in 1883.",
          },
          {
            "Ulysses S. Grant":
              "Battling terminal illness; focused on writing his memoirs to provide financial support for his family; died in 1885 shortly after Arthur’s term ended.",
          },
          {
            "Benjamin Harrison":
              "Served as U.S. Senator from Indiana (1881–1887); active voice on veterans’ pensions, tariffs, and civil rights; gaining national profile for future presidential bid.",
          },
          {
            "Grover Cleveland":
              "Served as Mayor of Buffalo (1882) and was elected Governor of New York (1883); gained national recognition for anti-corruption efforts and fiscal conservatism.",
          },
          {
            "Abraham Lincoln": "Deceased — assassinated in 1865.",
          },
          {
            "Andrew Johnson": "Deceased — died in 1875.",
          },
          {
            "Millard Fillmore": "Deceased — died in 1874.",
          },
        ],
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
        keyPolicies: 16,
        policies: [
          "Interstate Commerce Act (1887) : Established the Interstate Commerce Commission (ICC) to regulate railroad rates and prevent unfair business practices.",
          "Veto of Pension Bills : Rejected numerous Civil War veteran pension bills that he believed were fraudulent or excessive, promoting fiscal responsibility.",
          "Dawes Act (1887) : Supported legislation that aimed to assimilate Native Americans by allotting them individual landholdings, ultimately leading to the loss of tribal lands.",
          "Presidential Vetoes (Over 300 Vetoes) : Used his veto power extensively to block unnecessary federal spending, especially on private pension bills.",
          "Civil Service Reform Enforcement : Continued enforcing the Pendleton Civil Service Act by expanding merit-based government hiring and reducing political patronage.",
          "Investigation of Railroad Land Grants : Ordered the return of millions of acres of land given to railroads that failed to meet government conditions.",
          "Opposition to High Tariffs : Pushed for **lower tariffs** on imported goods, arguing that high duties benefited big businesses at the expense of consumers.",
          "Naval Expansion : Modernized and expanded the U.S. Navy, continuing the transition from wooden ships to steel warships.",
          "Pullman Strike Response (1894) : Sent federal troops to break up a nationwide railroad strike, citing the need to protect mail delivery and interstate commerce.",
          "Panic of 1893 Response : Opposed government intervention in the economy and repealed the Sherman Silver Purchase Act, worsening the Depression for farmers and workers.",
          "Gold Standard Commitment : Opposed the free coinage of silver and maintained the U.S. commitment to the gold standard to ensure financial stability.",
          "Repeal of the Sherman Silver Purchase Act (1893) : Ended the requirement for the government to purchase silver, aiming to stabilize the economy during the Panic of 1893.",
          "Wilson-Gorman Tariff Act (1894) : Attempted to reduce tariffs, but Congress added a controversial income tax provision, later ruled unconstitutional.",
          "Opposition to Imperialism : Rejected the annexation of Hawaii after American businessmen overthrew the Hawaiian monarchy, arguing that it was an unjust act.",
          "Civil Service Reform Expansion : Continued his fight against political corruption by further strengthening merit-based government hiring.",
          "Labor Rights & Anti-Union Stance : Opposed government favoritism toward labor unions and used federal power against strikes.",
        ],

        party: "Democratic",
        spouse: "Frances Folsom Cleveland",
        children: "5",
        occupationBeforePresidency: "Lawyer and Politician",
        quote:
          "A government for the people must depend for its success on the intelligence, the morality, the justice, and the interest of the people themselves.",
        image: "images/GroverCleveland.png",
        otherPresidents: [
          "Chester A. Arthur",
          "James A. Garfield",
          "Rutherford B. Hayes",
          "Ulysses S. Grant",
          "Benjamin Harrison",
          "William McKinley",
          "Theodore Roosevelt",
        ],
        otherPresidentThings: [
          {
            "Chester A. Arthur":
              "In poor health and retired from public life after leaving office in 1885; died in 1886, just a year into Cleveland’s presidency.",
          },
          {
            "James A. Garfield": "Deceased — assassinated in 1881.",
          },
          {
            "Rutherford B. Hayes":
              "In retirement in Ohio; advocated for education and civil service reform; supported temperance and moral reform movements until his death in 1893.",
          },
          {
            "Ulysses S. Grant":
              "Deceased — died in July 1885, just months after Cleveland took office; widely honored for his military and presidential legacy.",
          },
          {
            "Benjamin Harrison":
              "Returned to Indiana after serving in the U.S. Senate; campaigned for Republican candidates and was nominated for president in 1888 to run against Cleveland.",
          },
          {
            "William McKinley":
              "Served as a U.S. Congressman from Ohio; rising star in Republican Party; known for advocacy of protective tariffs and opposition to Cleveland’s tariff reduction efforts.",
          },
          {
            "Theodore Roosevelt":
              "Elected to the New York State Assembly; gained a reputation as a reformer and outspoken young Republican; later appointed to the U.S. Civil Service Commission in 1889.",
          },
        ],
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
        policies: [
          "Sherman Antitrust Act (1890) : First federal law to prevent monopolies and anti-competitive business practices, laying the foundation for future antitrust regulations.",
          "McKinley Tariff (1890) : Raised tariffs on imported goods to protect American industries, but it also increased consumer prices and was unpopular among farmers.",
          "Dependent and Disability Pension Act (1890) : Expanded pensions for Civil War veterans and their families, significantly increasing federal spending.",
          "Sherman Silver Purchase Act (1890) : Required the U.S. government to buy more silver to boost the economy, but it contributed to economic instability.",
          "Admission of Six New States (1889-1890) : Oversaw the addition of North Dakota, South Dakota, Montana, Washington, Idaho, and Wyoming to the Union.",
          "Foreign Policy Expansion : Strengthened the U.S. Navy and promoted American influence in Latin America and the Pacific.",
          "Battle for Voting Rights : Advocated for federal protection of African American voting rights in the South, though Congress failed to pass meaningful legislation.",
          "Electricity Installed in the White House (1891) : Introduced electric lighting to the White House, though Harrison and his wife were reportedly afraid of using the light switches.",
        ],
        party: "Republican",
        spouse: "Caroline Lavinia Scott Harrison",
        children: "1",
        occupationBeforePresidency: "Lawyer and Politician",
        quote: "Great lives never go out; they go on.",
        image: "images/BenjaminHarrison.png",
        otherPresidents: [
          "Grover Cleveland",
          "Chester A. Arthur",
          "James A. Garfield",
          "Rutherford B. Hayes",
          "William McKinley",
          "Theodore Roosevelt",
        ],
        otherPresidentThings: [
          {
            "Grover Cleveland":
              "In private life after losing the 1888 election; lived in New York City and remained publicly silent but politically observant; prepared for a potential comeback and was re-nominated by Democrats in 1892.",
          },
          {
            "Chester A. Arthur": "Deceased — died in 1886.",
          },
          {
            "James A. Garfield": "Deceased — assassinated in 1881.",
          },
          {
            "Rutherford B. Hayes":
              "Lived in retirement in Ohio; continued promoting civil service reform and educational initiatives; died in 1893, shortly after Harrison’s term ended.",
          },
          {
            "William McKinley":
              "Served in the U.S. House of Representatives until 1891; then elected Governor of Ohio in 1891; emerged as a leading voice for protective tariffs and Republican policy.",
          },
          {
            "Theodore Roosevelt":
              "Appointed to the U.S. Civil Service Commission by Harrison in 1889; became nationally known for advocating civil service reform and fighting political corruption.",
          },
        ],
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
        keyPolicies: 11,
        policies: [
          "Dingley Tariff Act (1897) : Raised tariffs to protect American industries, making it one of the highest tariff rates in U.S. history.",
          "Gold Standard Act (1900) : Officially put the U.S. on the gold standard, stabilizing the currency and ending the free silver debate.",
          "Annexation of Hawaii (1898) : Brought Hawaii into the U.S. as a territory, expanding American influence in the Pacific.",
          "Spanish-American War (1898) : Led the U.S. to victory against Spain, resulting in territorial acquisitions in the Caribbean and Pacific.",
          "Treaty of Paris (1898) : Ended the Spanish-American War, giving the U.S. control over Puerto Rico, Guam, and the Philippines.",
          "Platt Amendment (1901) : Established U.S. control over Cuba's foreign policy and military affairs, making Cuba a protectorate.",
          "Open Door Policy (1899-1900) : Promoted equal trade access to China for all foreign nations, protecting American economic interests.",
          "Philippine-American War (1899-1902) : Fought Filipino resistance after the U.S. took control of the Philippines, leading to prolonged conflict.",
          "Expansion of the U.S. Navy : Strengthened the Navy to support American imperialism and global trade interests.",
          "Civil Service Expansion : Continued merit-based reforms to reduce political corruption in government appointments.",
          "Industrial Growth Support : Backed policies favoring business expansion, technological advancements, and economic prosperity.",
        ],
        party: "Republican",
        spouse: "Ida Saxton McKinley",
        children: "2",
        occupationBeforePresidency: "Military Officer and Politician",
        quote:
          "The mission of the United States is one of benevolent assimilation.",
        image: "images/WilliamMcKinley.png",
        otherPresidents: [
          "Grover Cleveland",
          "Benjamin Harrison",
          "Theodore Roosevelt",
          "William Howard Taft",
          "Woodrow Wilson",
        ],
        otherPresidentThings: [
          {
            "Grover Cleveland":
              "In retirement after completing his second term in 1897; lived quietly in Princeton, New Jersey, and occasionally wrote or commented on national issues; died in 1908.",
          },
          {
            "Benjamin Harrison":
              "Lived in retirement in Indianapolis; practiced law and wrote about constitutional law and governance; died in 1901, the same year McKinley was assassinated.",
          },
          {
            "Theodore Roosevelt":
              "Served as Assistant Secretary of the Navy; led the Rough Riders during the Spanish-American War (1898); elected Governor of New York (1899); became McKinley’s vice president in 1901.",
          },
          {
            "William Howard Taft":
              "Appointed by McKinley as the first civilian Governor-General of the Philippines in 1901; previously served as a federal judge and was rising in national Republican ranks.",
          },
          {
            "Woodrow Wilson":
              "Academic and professor of political science at Princeton University; began gaining recognition as a political thinker and reform advocate.",
          },
        ],
      },
      {
        name: "Theodore Roosevelt",
        terms: 2,
        status: "dead",
        birthYear: 1858,
        birthPlace: "New York City, New York",
        parents: "Theodore Roosevelt Sr. and Martha Bulloch Roosevelt",
        deathYear: 1919,
        deathPlace: "Oyster Bay, New York",
        deathReason: "Heart attack",
        presidencyStart: 1901,
        presidencyEnd: 1909,
        keyPolicies: 13,
        policies: [
          "Square Deal (1901-1909) : Aimed at balancing the interests of business, consumers, and labor by promoting fair government intervention.",
          "Antitrust Actions (1902-1906) : Enforced the Sherman Antitrust Act aggressively, breaking up monopolies like the Northern Securities Company.",
          "Hepburn Act (1906) : Strengthened the Interstate Commerce Commission (ICC) to regulate railroad rates and prevent unfair pricing practices.",
          "Pure Food and Drug Act (1906) : Laid the foundation for the FDA by requiring accurate labeling and banning harmful substances in food and medicine.",
          "Meat Inspection Act (1906) : Mandated federal inspection of meatpacking plants, improving food safety and sanitation.",
          "Conservation Movement : Established five national parks, 18 national monuments, and over 100 million acres of protected forests.",
          "Newlands Reclamation Act (1902) : Funded irrigation projects in the western U.S. to support agriculture and settlement.",
          "Roosevelt Corollary (1904) : Expanded the Monroe Doctrine, stating that the U.S. could intervene in Latin America to maintain stability.",
          "Panama Canal Project (1903) : Negotiated control of the Panama Canal Zone, allowing the U.S. to build the canal and improve global trade routes.",
          "Great White Fleet (1907-1909) : Sent the U.S. Navy on a world tour to showcase American naval power and diplomacy.",
          "Anthracite Coal Strike Mediation (1902) : Intervened in a major coal strike, forcing negotiations between workers and mine owners, setting a precedent for government involvement in labor disputes.",
          "Gentlemen’s Agreement with Japan (1907) : Limited Japanese immigration to the U.S. while improving diplomatic relations with Japan.",
          "Employer Liability Act (1906) : Provided compensation for workers injured in hazardous jobs, an early step toward workers’ rights protection.",
        ],
        party: "Republican",
        spouse: "Edith Kermit Carow Roosevelt",
        children: "6",
        occupationBeforePresidency: "Military Leader and Politician",
        quote: "Do what you can, with what you have, where you are.",
        image: "images/TheodoreRoosevelt.png",
        otherPresidents: [
          "William McKinley",
          "Grover Cleveland",
          "Benjamin Harrison",
          "William Howard Taft",
          "Woodrow Wilson",
          "Warren G. Harding",
          "Calvin Coolidge",
          "Herbert Hoover",
        ],
        otherPresidentThings: [
          {
            "William McKinley":
              "Deceased — assassinated in September 1901, which led to Roosevelt’s unexpected succession to the presidency.",
          },
          {
            "Grover Cleveland":
              "In retirement in Princeton, New Jersey; occasionally commented on political events but was largely removed from active politics; died in 1908 during Roosevelt’s second term.",
          },
          {
            "Benjamin Harrison":
              "Deceased — died in 1901, the year Roosevelt took office.",
          },
          {
            "William Howard Taft":
              "Appointed Secretary of War by Roosevelt (1904); became Roosevelt’s close advisor and was handpicked as his successor; worked on reforms and oversaw U.S. interests in the Philippines and Panama Canal construction.",
          },
          {
            "Woodrow Wilson":
              "President of Princeton University (1902–1910); emerged as a national reform voice in education and governance; began aligning with progressive ideals.",
          },
          {
            "Warren G. Harding":
              "Served in the Ohio State Senate starting in 1899 and became Lieutenant Governor of Ohio in 1904; rising figure in Ohio Republican politics.",
          },
          {
            "Calvin Coolidge":
              "Studied law and began practicing in Massachusetts; became active in local and state Republican circles, holding early municipal offices.",
          },
          {
            "Herbert Hoover":
              "Successful international mining engineer and businessman; gained recognition for humanitarian efforts during the Boxer Rebellion and other global events.",
          },
        ],
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
        keyPolicies: 12,
        policies: [
          "Payne-Aldrich Tariff Act (1909) : Raised some tariffs instead of lowering them as promised, causing controversy and splitting the Republican Party.",
          "Mann-Elkins Act (1910) : Strengthened the Interstate Commerce Commission (ICC) by allowing it to regulate telephone, telegraph, and railroad rates.",
          "Trust-Busting Policies : Filed **more antitrust lawsuits** than Roosevelt, breaking up monopolies like Standard Oil and American Tobacco.",
          "16th Amendment (1913) : Supported the constitutional amendment allowing Congress to collect a federal income tax.",
          "17th Amendment (1913) : Advocated for the direct election of U.S. Senators, increasing democracy and reducing political corruption.",
          "Ballinger-Pinchot Controversy (1909-1910) : Fired Gifford Pinchot, Roosevelt’s conservationist ally, for criticizing his administration’s land policies, weakening conservation efforts.",
          "Arizona and New Mexico Statehood (1912) : Oversaw the admission of Arizona and New Mexico as the 47th and 48th U.S. states.",
          "Children’s Bureau Creation (1912) : Established a federal agency to investigate and improve child labor conditions, child health, and welfare.",
          "Dollar Diplomacy (1909-1913) : Used economic influence rather than military force to expand U.S. interests in Latin America and Asia.",
          "Postal Savings System (1910) : Created a federal banking system that allowed people to deposit money in post offices, promoting financial stability for small savers.",
          "Department of Labor Established (1913) : Pushed for a separate federal department to oversee labor issues, which was later created after his presidency.",
          "Expansion of U.S. Territories : Strengthened American control over the **Philippines, Puerto Rico, and Panama** through diplomatic and economic policies.",
        ],
        party: "Republican",
        spouse: "Helen Herron Taft",
        children: "3",
        occupationBeforePresidency: "Judge and Politician",
        quote: "Presidents come and go, but the Supreme Court goes on forever.",
        image: "images/WilliamHowardTaft.png",
        otherPresidents: [
          "Theodore Roosevelt",
          "Woodrow Wilson",
          "Warren G. Harding",
          "Calvin Coolidge",
          "Herbert Hoover",
        ],
        otherPresidentThings: [
          {
            "Theodore Roosevelt":
              "Initially supported Taft as his successor but soon became disillusioned with his more conservative policies; broke from Taft and ran against him in the 1912 presidential election under the Progressive (Bull Moose) Party.",
          },
          {
            "Woodrow Wilson":
              "Governor of New Jersey (1911–1913); gained national prominence for progressive reforms and anti-corruption efforts; won the 1912 Democratic nomination and defeated both Taft and Roosevelt in the general election.",
          },
          {
            "Warren G. Harding":
              "Served as Lieutenant Governor of Ohio (1904–1906); after a short break from politics, he was elected to the U.S. Senate in 1914, gaining national influence.",
          },
          {
            "Calvin Coolidge":
              "Rising in Massachusetts state politics; served in the state legislature and began building a reputation for honest, quiet leadership.",
          },
          {
            "Herbert Hoover":
              "Gaining global recognition as a successful mining engineer and humanitarian; led relief efforts during various international crises and began advising government bodies.",
          },
        ],
      },
      {
        name: "Woodrow Wilson",
        terms: 2,
        status: "dead",
        birthYear: 1856,
        birthPlace: "Staunton, Virginia",
        parents: "Joseph Ruggles Wilson and Jessie Woodrow Wilson",
        deathYear: 1924,
        deathPlace: "Washington, D.C.",
        deathReason: "Stroke",
        presidencyStart: 1913,
        presidencyEnd: 1921,
        keyPolicies: 17,
        policies: [
          "Underwood Tariff Act (1913) : Lowered tariffs to promote free trade and reduce costs for consumers, replacing lost revenue with the new income tax.",
          "Federal Reserve Act (1913) : Created the Federal Reserve System to stabilize the banking industry and regulate the U.S. economy.",
          "Clayton Antitrust Act (1914) : Strengthened antitrust laws by prohibiting monopolistic practices and protecting labor unions from being targeted under antitrust laws.",
          "Federal Trade Commission Act (1914) : Established the Federal Trade Commission (FTC) to prevent unfair business practices and protect consumers.",
          "16th Amendment (1913) : Allowed the federal government to levy an income tax, creating a new revenue stream for the U.S.",
          "17th Amendment (1913) : Established the direct election of U.S. Senators, increasing democracy and reducing political corruption.",
          "18th Amendment (1919) : Pushed for prohibition, banning the production, sale, and transport of alcohol in the U.S.",
          "19th Amendment Advocacy (1918-1919) : Supported women's suffrage, leading to the passage of the 19th Amendment, which granted women the right to vote (ratified in 1920).",
          "World War I Leadership (1917-1918) : Led the U.S. into World War I after initially trying to keep the nation neutral.",
          "Selective Service Act (1917) : Instituted the military draft to build up U.S. forces for World War I.",
          "Espionage Act (1917) : Criminalized anti-war activities, making it illegal to interfere with the draft or military operations.",
          "Sedition Act (1918) : Further restricted free speech by making it illegal to criticize the government or war effort, later repealed.",
          "Fourteen Points (1918) : Outlined a vision for world peace after World War I, including the creation of the League of Nations.",
          "Treaty of Versailles (1919) : Helped negotiate the peace treaty that ended World War I, imposing strict penalties on Germany.",
          "League of Nations Proposal (1920) : Advocated for a global peacekeeping organization, though the U.S. Senate refused to join.",
          "Railway Administration Act (1917) : Temporarily nationalized the railroad industry to improve war logistics and efficiency.",
          "19th Amendment Ratification (1920) : Ensured the final passage of the women's right to vote, a significant victory for suffrage activists.",
        ],
        party: "Democratic",
        spouse: "Ellen Louise Axson Wilson",
        children: "3",
        occupationBeforePresidency: "Politician and Academic",
        quote: "The history of liberty is a history of resistance.",
        image: "images/WoodrowWilson.png",
        otherPresidents: [
          "William Howard Taft",
          "Warren G. Harding",
          "Calvin Coolidge",
          "Herbert Hoover",
        ],
        otherPresidentThings: [
          {
            "William Howard Taft":
              "After leaving the presidency in 1913, he returned to academia and legal work; became a vocal supporter of U.S. entry into World War I and was later appointed Chief Justice of the U.S. Supreme Court in 1921.",
          },
          {
            "Theodore Roosevelt":
              "Remained a dominant political figure and vocal critic of Wilson's policies, particularly on neutrality in WWI; advocated for military preparedness and ran unsuccessfully for president again in 1916; died in 1919.",
          },
          {
            "Warren G. Harding":
              "Elected to the U.S. Senate in 1914; supported conservative policies and neutrality in WWI but later backed U.S. involvement; became the Republican nominee for president in 1920.",
          },
          {
            "Calvin Coolidge":
              "Served as President of the Massachusetts State Senate and later Lieutenant Governor; gained national recognition for his response to the 1919 Boston Police Strike.",
          },
          {
            "Herbert Hoover":
              "Rose to international prominence for leading humanitarian relief efforts during and after World War I; served as head of the U.S. Food Administration under Wilson.",
          },
        ],
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
        keyPolicies: 10,
        policies: [
          "Emergency Quota Act (1921) : Established the first immigration restrictions in U.S. history, limiting the number of immigrants from certain countries.",
          "Revenue Act of 1921 : Reduced income tax rates, especially for the wealthy, as part of Harding’s pro-business economic policies.",
          "Budget and Accounting Act (1921) : Created the Bureau of the Budget and required the president to submit an annual budget to Congress, improving government financial management.",
          "Fordney-McCumber Tariff (1922) : Raised tariffs to protect American industries, but it also made foreign goods more expensive and harmed international trade.",
          "Washington Naval Conference (1921-1922) : Led an international effort to reduce naval armaments and prevent future conflicts among major powers.",
          "Veterans Bureau Creation (1921) : Established a government agency to assist World War I veterans with healthcare and benefits.",
          "Teapot Dome Scandal (1921-1923) : A major corruption scandal involving illegal leasing of government oil reserves, damaging Harding’s legacy.",
          "Opposition to League of Nations : Continued the U.S. policy of isolationism by rejecting involvement in the League of Nations.",
          "Civil Rights Speech in Alabama (1921) : Became the first sitting president to publicly call for equal rights for African Americans in the South, though no major legislation followed.",
          "Anti-Lynching Bill Support : Pushed for anti-lynching legislation, but Congress failed to pass it due to Southern opposition.",
        ],
        party: "Republican",
        spouse: "Florence Kling Harding",
        children: "1",
        occupationBeforePresidency: "Newspaper Publisher",
        quote: "America’s present need is not heroics but healing.",
        image: "images/WarrenHarding.png",
        otherPresidents: [
          "Woodrow Wilson",
          "Calvin Coolidge",
          "Herbert Hoover",
          "William Howard Taft",
        ],
        otherPresidentThings: [
          {
            "Woodrow Wilson":
              "In retirement after leaving office in 1921; in poor health following a stroke; lived in Washington, D.C., and remained largely out of the public eye until his death in 1924.",
          },
          {
            "William Howard Taft":
              "Appointed Chief Justice of the U.S. Supreme Court by Harding in 1921; became the only person to serve as both president and chief justice; focused on court modernization and administration.",
          },
          {
            "Calvin Coolidge":
              "Served as Harding’s vice president; largely quiet during Harding’s term, but became president upon Harding’s death in August 1923.",
          },
          {
            "Herbert Hoover":
              "Appointed Secretary of Commerce under Harding; played a major role in standardizing regulations, promoting economic modernization, and coordinating relief efforts during disasters.",
          },
        ],
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
        keyPolicies: 10,
        policies: [
          "Revenue Acts of 1924 and 1926 : Lowered income tax rates, especially for the wealthy, as part of his pro-business, limited-government approach.",
          "Immigration Act of 1924 : Drastically reduced immigration, especially from Southern and Eastern Europe, and **completely banned immigration from Asia.**",
          "Kellogg-Briand Pact (1928) : Signed an international agreement renouncing war as a tool for national policy, though it had little enforcement power.",
          "Dawes Plan (1924) : Helped restructure Germany’s World War I reparations, stabilizing the European economy and preventing another crisis.",
          "Laissez-Faire Economic Policies : Advocated for minimal government intervention in the economy, allowing businesses to operate freely.",
          "Expansion of the Federal Radio Commission (1927) : Regulated airwaves to bring order to the growing radio industry.",
          "Opposition to Farm Relief Bills : Vetoed the **McNary-Haugen Farm Relief Bill** twice, refusing federal price support for struggling farmers.",
          "Great Mississippi Flood Response (1927) : Provided limited federal aid after the devastating flood but resisted direct government intervention.",
          "Civil Rights Efforts : Supported anti-lynching laws and spoke out against the Ku Klux Klan, but no major legislation was passed.",
          "Continued Isolationist Foreign Policy : Avoided military entanglements and focused on economic diplomacy instead.",
        ],
        party: "Republican",
        spouse: "Grace Anna Goodhue Coolidge",
        children: "2",
        occupationBeforePresidency: "Lawyer and Politician",
        quote: "The business of America is business.",
        image: "images/CalvinCoolidge.png",
        otherPresidents: [
          "Warren G. Harding",
          "Woodrow Wilson",
          "William Howard Taft",
          "Herbert Hoover",
          "Franklin D. Roosevelt",
          "Harry S. Truman",
        ],
        otherPresidentThings: [
          {
            "Warren G. Harding":
              "Deceased — died in office in August 1923; Coolidge, his vice president, succeeded him as president.",
          },
          {
            "Woodrow Wilson":
              "Deceased — died in 1924; spent his final years in frail health following a major stroke, largely out of public life after 1921.",
          },
          {
            "William Howard Taft":
              "Continued serving as Chief Justice of the U.S. Supreme Court; focused on administrative reform and preserving judicial independence until his death in 1930.",
          },
          {
            "Herbert Hoover":
              "Served as Secretary of Commerce under both Harding and Coolidge; promoted economic modernization and standardization; gained national prominence and was nominated for president in 1928.",
          },
          {
            "Franklin D. Roosevelt":
              "Served as Vice Presidential candidate on the losing Democratic ticket in 1920; resumed work as a private citizen and began rebuilding his political career while battling polio.",
          },
          {
            "Harry S. Truman":
              "Operated a men's clothing store in Missouri during most of Coolidge’s presidency; became active in local Democratic politics and was elected as a judge in 1922.",
          },
        ],
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
        keyPolicies: 10,
        policies: [
          "Stock Market Crash Response (1929) : Urged businesses to maintain wages and employment after the stock market collapse, but avoided direct government intervention.",
          "Smoot-Hawley Tariff Act (1930) : Raised tariffs on imported goods to protect American industries, but worsened the Great Depression by reducing international trade.",
          "Reconstruction Finance Corporation (1932) : Provided emergency loans to banks, railroads, and other businesses to stabilize the economy during the Great Depression.",
          "Federal Home Loan Bank Act (1932) : Established a system of banks to provide low-interest loans for homeowners to prevent foreclosures.",
          "Public Works Programs : Increased federal spending on infrastructure projects like the **Hoover Dam** to create jobs and stimulate the economy.",
          "Opposition to Direct Relief : Rejected direct federal aid to individuals, believing in 'rugged individualism' and local charity support instead.",
          "Bonus Army Crackdown (1932) : Ordered the removal of World War I veterans protesting in Washington for early bonus payments, leading to a violent clash with federal troops.",
          "National Credit Corporation (1931) : Encouraged large banks to lend money to smaller struggling banks to prevent widespread banking failures.",
          "Mexican Repatriation Program : Oversaw mass deportations of Mexican-Americans and Mexican immigrants during the Great Depression to free up jobs for white workers.",
          "Revenue Act of 1932 : Increased taxes on corporations and individuals, worsening the economic downturn instead of helping recovery.",
        ],
        party: "Republican",
        spouse: "Lou Henry Hoover",
        children: "2",
        occupationBeforePresidency: "Engineer and Politician",
        quote: "Blessed are the young, for they shall inherit the national debt.",
        image: "images/HerbertHoover.png",
        otherPresidents: [
          "Calvin Coolidge",
          "Warren G. Harding",
          "Woodrow Wilson",
          "William Howard Taft",
          "Franklin D. Roosevelt",
          "Harry S. Truman",
        ],

        otherPresidentThings: [
          {
            "Calvin Coolidge":
              "Retired from politics after leaving office in 1929; remained publicly silent on Hoover's presidency but privately expressed concerns about the economy and Hoover’s leadership style.",
          },
          {
            "Warren G. Harding": "Deceased — died in office in 1923.",
          },
          {
            "Woodrow Wilson":
              "Deceased — died in 1924 after several years in retirement and poor health.",
          },
          {
            "William Howard Taft":
              "Continued to serve as Chief Justice of the U.S. Supreme Court until his death in 1930; did not publicly comment on Hoover’s presidency but remained a respected national figure.",
          },
          {
            "Franklin D. Roosevelt":
              "Served as Governor of New York (1929–1932); implemented state-level relief programs during the early years of the Great Depression; emerged as Hoover's main challenger and won the 1932 presidential election.",
          },
          {
            "Harry S. Truman":
              "Served as a judge in Missouri; involved in local Democratic politics and gaining influence but had not yet reached national prominence.",
          },
        ],
      },
      {
        name: "Franklin D. Roosevelt",
        terms: 2,
        status: "dead",
        birthYear: 1882,
        birthPlace: "Hyde Park, New York",
        parents: "James Roosevelt I and Sara Delano Roosevelt",
        deathYear: 1945,
        deathPlace: "Warm Springs, Georgia",
        deathReason: "Cerebral hemorrhage",
        presidencyStart: 1933,
        presidencyEnd: 1945,
        keyPolicies: 17,
        policies: [
          "New Deal (1933-1939) : A series of programs and reforms designed to combat the Great Depression by providing economic relief, recovery, and reform.",
          "Emergency Banking Act (1933) : Closed all banks for four days to prevent panic, then reopened only those deemed financially stable.",
          "Glass-Steagall Act (1933) : Separated commercial and investment banking to prevent financial speculation, also established the Federal Deposit Insurance Corporation (FDIC).",
          "Civilian Conservation Corps (CCC) (1933) : Created jobs for young men in conservation projects like planting trees and building parks.",
          "Tennessee Valley Authority (TVA) (1933) : Built dams and hydroelectric plants in the Tennessee Valley to provide electricity and jobs.",
          "Agricultural Adjustment Act (AAA) (1933) : Paid farmers to reduce crop production to stabilize agricultural prices.",
          "National Industrial Recovery Act (NIRA) (1933) : Established industry-wide regulations to control wages, prices, and working conditions.",
          "Social Security Act (1935) : Created unemployment insurance, pensions for the elderly, and aid for the disabled, laying the foundation for the modern welfare system.",
          "Wagner Act (1935) : Strengthened workers' rights by guaranteeing unions the right to collectively bargain.",
          "Fair Labor Standards Act (1938) : Established the first federal minimum wage, maximum work hours, and restrictions on child labor.",
          "Neutrality Acts (1935-1939) : Passed a series of laws to prevent U.S. involvement in foreign wars by limiting arms sales and loans to warring nations.",
          "Lend-Lease Act (1941) : Allowed the U.S. to provide military aid to Allied nations during World War II, marking the end of strict neutrality.",
          "Pearl Harbor Response & U.S. Entry into World War II (1941) : Led the nation into World War II after the Japanese attack on Pearl Harbor.",
          "Executive Order 9066 (1942) : Authorized the internment of Japanese Americans during World War II, a highly controversial policy.",
          "Manhattan Project (1942-1945) : Secretly developed the atomic bomb, which later played a role in ending the war.",
          "G.I. Bill (1944) : Provided education and housing benefits to returning World War II veterans, helping boost the post-war economy.",
          "Yalta Conference (1945) : Negotiated post-war plans with Allied leaders, setting the stage for the Cold War.",
        ],
        party: "Democratic",
        spouse: "Eleanor Roosevelt",
        children: "6",
        occupationBeforePresidency: "Politician and Lawyer",
        quote: "The only thing we have to fear is fear itself.",
        image: "images/FranklinRoosevelt.png",
        otherPresidents: [
          "Herbert Hoover",
          "Calvin Coolidge",
          "William Howard Taft",
          "Harry S. Truman",
          "Dwight D. Eisenhower",
          "Lyndon B. Johnson",
          "John F. Kennedy",
        ],

        otherPresidentThings: [
          {
            "Herbert Hoover":
              "After losing to Roosevelt in 1932, Hoover became a vocal critic of the New Deal; remained active in Republican politics and wrote extensively on government and economics.",
          },
          {
            "Calvin Coolidge":
              "Deceased — died in 1933, shortly before Roosevelt took office.",
          },
          {
            "William Howard Taft":
              "Deceased — died in 1930; had served as Chief Justice of the Supreme Court until shortly before his death.",
          },
          {
            "Harry S. Truman":
              "Served as U.S. Senator from Missouri (elected 1934); supported many New Deal programs and gained national recognition for his work investigating wartime spending.",
          },
          {
            "Dwight D. Eisenhower":
              "Rose through military ranks during WWII; served as Supreme Allied Commander in Europe and oversaw D-Day operations; became a national hero by the end of Roosevelt’s presidency.",
          },
          {
            "Lyndon B. Johnson":
              "Elected to U.S. House of Representatives in 1937; ardent supporter of New Deal programs; built political clout through his connection to Roosevelt and ability to deliver on federal programs in Texas.",
          },
          {
            "John F. Kennedy":
              "Teenager during most of Roosevelt’s presidency; studied at Harvard and briefly worked as a journalist; served in the Navy during WWII late in Roosevelt’s final term.",
          },
        ],
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
        keyPolicies: 13,
        policies: [
          "Truman Doctrine (1947) : Established the U.S. policy of containing communism by providing military and economic aid to countries resisting Soviet influence, starting with Greece and Turkey.",
          "Marshall Plan (1948) : Provided over $13 billion in economic aid to rebuild Western Europe after World War II, preventing the spread of communism.",
          "Berlin Airlift (1948-1949) : Ordered the U.S. to supply West Berlin with food and fuel by air when the Soviet Union blockaded the city.",
          "Creation of NATO (1949) : Helped establish the North Atlantic Treaty Organization, a military alliance aimed at countering Soviet expansion.",
          "Recognition of Israel (1948) : Became the first world leader to recognize the newly established state of Israel, shaping U.S.-Middle East relations.",
          "Fair Deal (1949) : Proposed expanding New Deal programs with national health insurance, housing assistance, and civil rights protections (though Congress rejected many parts).",
          "Executive Order 9981 (1948) : Desegregated the U.S. military, making it one of the first federal institutions to end racial segregation.",
          "Korean War (1950-1953) : Sent U.S. forces to defend South Korea against a communist invasion from North Korea, marking the first military conflict of the Cold War.",
          "Employment Act of 1946 : Committed the federal government to promoting maximum employment and economic growth.",
          "Housing Act of 1949 : Funded public housing projects to address post-war housing shortages.",
          "Atomic Energy Act (1946) : Established civilian control over nuclear energy and promoted peaceful uses of atomic power.",
          "McCarran Act (1950) : Increased restrictions on suspected communist organizations during the Red Scare, though Truman opposed it.",
          "22nd Amendment Ratification (1951) : Limited U.S. presidents to two terms, a reaction to Franklin D. Roosevelt’s four-term presidency.",
        ],
        party: "Democratic",
        spouse: "Bess Wallace Truman",
        children: "1",
        occupationBeforePresidency: "Politician and Farmer",
        quote: "The buck stops here.",
        image: "images/HarryTruman.png",
        otherPresidents: [
          "Franklin D. Roosevelt",
          "Herbert Hoover",
          "Dwight D. Eisenhower",
          "John F. Kennedy",
          "Lyndon B. Johnson",
          "Richard Nixon",
          "Gerald Ford",
        ],

        otherPresidentThings: [
          {
            "Franklin D. Roosevelt":
              "Deceased — died in April 1945, shortly after beginning his fourth term; Truman succeeded him during the final months of WWII.",
          },
          {
            "Herbert Hoover":
              "Outspoken critic of New Deal policies but supported Truman's postwar European relief efforts; worked with Truman on reorganization of the executive branch and humanitarian relief.",
          },
          {
            "Dwight D. Eisenhower":
              "Served as Army Chief of Staff and later NATO Supreme Commander in Europe; maintained nonpartisan stance but became increasingly viewed as a presidential contender by both parties.",
          },
          {
            "John F. Kennedy":
              "Served in the U.S. Navy during World War II; elected to the U.S. House of Representatives from Massachusetts in 1946 during Truman’s presidency.",
          },
          {
            "Lyndon B. Johnson":
              "Elected to the U.S. House of Representatives; strongly supported Truman’s Fair Deal and anti-communist foreign policy; elected to U.S. Senate in 1948.",
          },
          {
            "Richard Nixon":
              "Elected to the U.S. House of Representatives in 1946; gained national attention for his role in the House Un-American Activities Committee, particularly in the Alger Hiss case.",
          },
          {
            "Gerald Ford":
              "Served in the U.S. Navy during World War II; returned to Michigan and became active in Republican politics, though had not yet entered Congress during Truman’s presidency.",
          },
        ],
      },
      {
        name: "Dwight D. Eisenhower",
        terms: 2,
        status: "dead",
        birthYear: 1890,
        birthPlace: "Denison, Texas",
        parents: "David Jacob Eisenhower and Ida Elizabeth Stover Eisenhower",
        deathYear: 1969,
        deathPlace: "Washington, D.C.",
        deathReason: "Heart failure",
        presidencyStart: 1953,
        presidencyEnd: 1961,
        keyPolicies: 14,
        policies: [
          "Interstate Highway System (1956) : Created a nationwide network of highways, improving transportation, boosting the economy, and strengthening national defense.",
          "Civil Rights Act of 1957 : First civil rights legislation since Reconstruction, aimed at protecting African American voting rights.",
          "Civil Rights Act of 1960 : Strengthened federal oversight of voter registration and penalties for obstructing voting rights.",
          "Brown v. Board of Education Enforcement (1954) : Sent federal troops to enforce school desegregation in Little Rock, Arkansas, after the Supreme Court ruling.",
          "NASA Establishment (1958) : Founded the National Aeronautics and Space Administration (NASA) to compete with the Soviet Union in the Space Race.",
          "Eisenhower Doctrine (1957) : Declared that the U.S. would provide military and economic assistance to Middle Eastern countries resisting communism.",
          "Korean War Armistice (1953) : Negotiated the end of active fighting in Korea, leading to a long-term ceasefire and division between North and South Korea.",
          "Massive Retaliation Policy (1954) : Shifted U.S. military strategy to emphasize nuclear deterrence against Soviet threats instead of conventional warfare.",
          "McCarthyism Opposition (1954) : Publicly condemned Senator Joseph McCarthy’s anti-communist witch hunts, leading to McCarthy’s downfall.",
          "Social Security Expansion (1954, 1956) : Increased benefits and coverage for millions of Americans, making Social Security more accessible.",
          "St. Lawrence Seaway (1959) : Opened up shipping routes between the U.S. and Canada, boosting trade and economic growth.",
          "National Defense Education Act (1958) : Provided federal funding for science, math, and technology education to counter Soviet advancements after the Sputnik launch.",
          "Balanced Budget and Fiscal Conservatism : Maintained economic stability by balancing the federal budget three times while promoting infrastructure growth.",
          "U-2 Spy Plane Incident (1960) : U.S. spy plane shot down over the Soviet Union, leading to increased Cold War tensions and a failed diplomatic summit.",
        ],
        party: "Republican",
        spouse: "Mamie Geneva Doud Eisenhower",
        children: "2",
        occupationBeforePresidency: "Military Leader",
        quote: "Plans are worthless, but planning is everything.",
        image: "images/DwightEisenhower.png",
        otherPresidents: [
          "Harry S. Truman",
          "Herbert Hoover",
          "John F. Kennedy",
          "Lyndon B. Johnson",
          "Richard Nixon",
          "Gerald Ford",
          "Jimmy Carter",
        ],

        otherPresidentThings: [
          {
            "Harry S. Truman":
              "In retirement after leaving office in 1953; wrote memoirs and established the Truman Library; occasionally commented on Eisenhower’s policies, particularly on civil rights and foreign affairs.",
          },
          {
            "Herbert Hoover":
              "In retirement but continued public service; worked on government reorganization and advised presidents on administrative reform; praised Eisenhower’s managerial style.",
          },
          {
            "John F. Kennedy":
              "Served in the U.S. Senate; became a prominent Democratic voice on foreign policy and civil rights; published *Profiles in Courage* in 1956 and began preparing for a presidential run.",
          },
          {
            "Lyndon B. Johnson":
              "Served as Senate Majority Leader; key Democratic power broker who collaborated with and challenged Eisenhower on domestic and foreign policy.",
          },
          {
            "Richard Nixon":
              "Served as Vice President under Eisenhower for both terms; represented the U.S. abroad and presided over Cabinet and National Security Council meetings; gained prominence as Eisenhower’s political heir.",
          },
          {
            "Gerald Ford":
              "Elected to the U.S. House of Representatives in 1948; served as a Republican leader in Congress during Eisenhower’s presidency and built a reputation for integrity and competence.",
          },
          {
            "Jimmy Carter":
              "Graduated from the U.S. Naval Academy and served as a naval officer; returned to Georgia in the mid-1950s to run his family’s peanut business; not yet involved in national politics.",
          },
        ],
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
        keyPolicies: 12,
        policies: [
          "New Frontier Program (1961-1963) : Proposed domestic policies focusing on civil rights, poverty reduction, education, and space exploration.",
          "Bay of Pigs Invasion (1961) : Approved a failed CIA-backed invasion of Cuba by Cuban exiles, which strengthened Fidel Castro’s rule and embarrassed the U.S.",
          "Cuban Missile Crisis (1962) : Successfully negotiated the removal of Soviet nuclear missiles from Cuba, bringing the world to the brink of nuclear war.",
          "Peace Corps Establishment (1961) : Created a volunteer program to send Americans abroad to assist with education, healthcare, and economic development in developing nations.",
          "Alliance for Progress (1961) : Provided economic aid to Latin American countries to prevent the spread of communism and promote development.",
          "Trade Expansion Act (1962) : Reduced tariffs and encouraged international trade, especially with Western Europe.",
          "Equal Pay Act (1963) : First major law addressing gender pay inequality, requiring equal wages for men and women performing the same job.",
          "Space Race Acceleration : Set the goal of landing a man on the moon by the end of the 1960s, leading to NASA’s Apollo program.",
          "Civil Rights Advocacy : Called for stronger civil rights laws, laying the groundwork for the Civil Rights Act of 1964 (signed after his assassination).",
          "Nuclear Test Ban Treaty (1963) : Negotiated a treaty with the Soviet Union and Britain banning nuclear tests in the atmosphere, outer space, and underwater.",
          "Manpower Development and Training Act (1962) : Provided job training programs for unemployed workers to reduce poverty and boost employment.",
          "Housing Act of 1961 : Expanded federal funding for urban renewal and affordable housing projects.",
        ],
        party: "Democratic",
        spouse: "Jacqueline Bouvier Kennedy",
        children: "4",
        occupationBeforePresidency: "Politician and Author",
        quote:
          "Ask not what your country can do for you—ask what you can do for your country.",
        image: "images/JohnFKennedy.png",
        otherPresidents: [
          "Dwight D. Eisenhower",
          "Harry S. Truman",
          "Lyndon B. Johnson",
          "Richard Nixon",
          "Gerald Ford",
          "Jimmy Carter",
          "Ronald Reagan",
        ],

        otherPresidentThings: [
          {
            "Dwight D. Eisenhower":
              "In retirement at his Gettysburg farm; served as an elder statesman, occasionally advising Kennedy on military and foreign affairs; supported a strong anti-communist stance.",
          },
          {
            "Harry S. Truman":
              "In retirement in Missouri; publicly supported Kennedy’s 1960 campaign and continued to speak on party unity and civil rights during Kennedy’s term.",
          },
          {
            "Lyndon B. Johnson":
              "Served as Vice President under Kennedy; chaired several commissions and was active in space policy and civil rights, though often sidelined from Kennedy’s inner circle.",
          },
          {
            "Richard Nixon":
              "Returned to private life in California after narrowly losing the 1960 election; remained active in Republican politics and prepared for a political comeback.",
          },
          {
            "Gerald Ford":
              "Continued serving in the U.S. House of Representatives; an emerging Republican voice on defense and fiscal policy during Kennedy’s presidency.",
          },
          {
            "Jimmy Carter":
              "Served in the Georgia State Senate; began aligning himself with moderate Democratic reformers; built his reputation as a detail-oriented, pragmatic politician.",
          },
          {
            "Ronald Reagan":
              "Still an actor and public spokesman for General Electric; gave his famous “A Time for Choosing” speech in 1964 shortly after Kennedy’s assassination, marking his entry into politics.",
          },
        ],
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
        keyPolicies: 14,
        policies: [
          "Civil Rights Act of 1964 : Prohibited racial discrimination in public places, employment, and education, marking a major victory for the civil rights movement.",
          "Voting Rights Act of 1965 : Outlawed literacy tests and other discriminatory practices that prevented African Americans from voting.",
          "Great Society Programs (1964-1968) : A set of domestic policies aimed at eliminating poverty and racial injustice through education, healthcare, and social welfare programs.",
          "Medicare and Medicaid (1965) : Established government-funded healthcare programs for the elderly (Medicare) and low-income individuals (Medicaid).",
          "Elementary and Secondary Education Act (1965) : Provided federal funding to improve schools, especially in low-income communities.",
          "Higher Education Act (1965) : Expanded federal funding for college students through financial aid programs like Pell Grants and student loans.",
          "War on Poverty : Launched programs like Head Start, Job Corps, and food stamps to reduce poverty in the U.S.",
          "Economic Opportunity Act (1964) : Created agencies to provide job training, adult education, and small business loans to help impoverished Americans.",
          "Immigration and Nationality Act (1965) : Abolished the immigration quota system based on nationality, opening the U.S. to immigrants from Asia, Africa, and Latin America.",
          "Fair Housing Act (1968) : Prohibited discrimination in housing based on race, religion, or national origin.",
          "Public Broadcasting Act (1967) : Established the Corporation for Public Broadcasting, leading to the creation of PBS and NPR.",
          "Gun Control Act (1968) : Introduced federal regulations on the sale and possession of firearms following the assassinations of Martin Luther King Jr. and Robert Kennedy.",
          "Vietnam War Escalation : Increased U.S. military involvement in Vietnam, leading to widespread protests and controversy.",
          "Civil Rights Act of 1968 : Expanded civil rights protections, including protections against racial discrimination in housing.",
        ],
        party: "Democratic",
        spouse: "Lady Bird Johnson",
        children: "2",
        occupationBeforePresidency: "Politician and Teacher",
        quote:
          "Yesterday is not ours to recover, but tomorrow is ours to win or lose.",
        image: "images/LyndonBJohnson.png",
        otherPresidents: [
          "John F. Kennedy",
          "Dwight D. Eisenhower",
          "Harry S. Truman",
          "Richard Nixon",
          "Gerald Ford",
          "Jimmy Carter",
          "Ronald Reagan",
          "George H. W. Bush",
        ],

        otherPresidentThings: [
          {
            "John F. Kennedy":
              "Deceased — assassinated in November 1963; Johnson assumed the presidency and pursued many of Kennedy’s legislative goals, including civil rights reform.",
          },
          {
            "Dwight D. Eisenhower":
              "In retirement; continued to offer public commentary on national issues and supported Johnson’s foreign policy in Vietnam; died in 1969.",
          },
          {
            "Harry S. Truman":
              "In retirement in Missouri; increasingly reclusive due to health issues; died in 1972, shortly after Johnson’s presidency ended.",
          },
          {
            "Richard Nixon":
              "Returned to national politics; campaigned for Republican candidates in the 1966 midterms and positioned himself for the 1968 presidential race, which he won.",
          },
          {
            "Gerald Ford":
              "Served as House Minority Leader; frequently challenged Johnson’s Great Society spending but supported aspects of civil rights and foreign policy.",
          },
          {
            "Jimmy Carter":
              "Elected Governor of Georgia in 1966; began building a reputation as a reform-minded moderate within the Democratic Party.",
          },
          {
            "Ronald Reagan":
              "Elected Governor of California in 1966; quickly became a national conservative figure and frequent critic of Johnson’s domestic and Vietnam policies.",
          },
          {
            "George H. W. Bush":
              "Ran unsuccessfully for U.S. Senate in Texas in 1964; elected to the U.S. House of Representatives in 1966 and became an emerging voice in the Republican Party.",
          },
        ],
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
        keyPolicies: 15,
        policies: [
          "Environmental Protection Agency (EPA) (1970) : Established the EPA to enforce environmental regulations and protect natural resources.",
          "Clean Air Act (1970) : Strengthened air pollution regulations and set national standards for air quality.",
          "Endangered Species Act (1973) : Provided protections for threatened and endangered species and their habitats.",
          "Detente with Soviet Union (1969-1974) : Improved U.S.-Soviet relations through arms control agreements, including the SALT I Treaty.",
          "Opening Relations with China (1972) : Became the first U.S. president to visit Communist China, leading to improved diplomatic and trade relations.",
          "Vietnamization Policy (1969) : Gradually withdrew U.S. troops from Vietnam while increasing military aid to South Vietnam.",
          "Paris Peace Accords (1973) : Negotiated a ceasefire in Vietnam, leading to the withdrawal of U.S. forces.",
          "War on Drugs (1971) : Declared drug abuse a national emergency, leading to stricter drug laws and the creation of the Drug Enforcement Administration (DEA) in 1973.",
          "Revenue Sharing Program (1972) : Shifted federal funds to state and local governments to give them more control over spending.",
          "Occupational Safety and Health Administration (OSHA) (1971) : Created OSHA to regulate workplace safety and protect workers' rights.",
          "26th Amendment (1971) : Lowered the voting age from 21 to 18, expanding political participation for young Americans.",
          "Title IX of the Education Amendments (1972) : Prohibited gender discrimination in federally funded education programs and athletics.",
          "Wage and Price Controls (1971) : Implemented temporary wage and price controls to combat inflation and stabilize the economy.",
          "End of Bretton Woods System (1971) : Took the U.S. off the gold standard, allowing the dollar to float freely in foreign exchange markets.",
          "Watergate Scandal (1972-1974) : A political scandal involving a break-in at the Democratic National Committee headquarters, leading to Nixon’s resignation.",
        ],
        party: "Republican",
        spouse: "Pat Nixon",
        children: "2",
        occupationBeforePresidency: "Politician and Lawyer",
        quote: "The greatest honor history can bestow is the title of peacemaker.",
        image: "images/RichardNixon.png",
        otherPresidents: [
          "John F. Kennedy",
          "Dwight D. Eisenhower",
          "Harry S. Truman",
          "Richard Nixon",
          "Gerald Ford",
          "Jimmy Carter",
          "Ronald Reagan",
          "George H. W. Bush",
        ],

        otherPresidentThings: [
          {
            "John F. Kennedy":
              "Deceased — assassinated in November 1963; Johnson assumed the presidency and pursued many of Kennedy’s legislative goals, including civil rights reform.",
          },
          {
            "Dwight D. Eisenhower":
              "In retirement; continued to offer public commentary on national issues and supported Johnson’s foreign policy in Vietnam; died in 1969.",
          },
          {
            "Harry S. Truman":
              "In retirement in Missouri; increasingly reclusive due to health issues; died in 1972, shortly after Johnson’s presidency ended.",
          },
          {
            "Richard Nixon":
              "Returned to national politics; campaigned for Republican candidates in the 1966 midterms and positioned himself for the 1968 presidential race, which he won.",
          },
          {
            "Gerald Ford":
              "Served as House Minority Leader; frequently challenged Johnson’s Great Society spending but supported aspects of civil rights and foreign policy.",
          },
          {
            "Jimmy Carter":
              "Elected Governor of Georgia in 1966; began building a reputation as a reform-minded moderate within the Democratic Party.",
          },
          {
            "Ronald Reagan":
              "Elected Governor of California in 1966; quickly became a national conservative figure and frequent critic of Johnson’s domestic and Vietnam policies.",
          },
          {
            "George H. W. Bush":
              "Ran unsuccessfully for U.S. Senate in Texas in 1964; elected to the U.S. House of Representatives in 1966 and became an emerging voice in the Republican Party.",
          },
        ],
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
        keyPolicies: 12,
        policies: [
          "Presidential Pardon of Richard Nixon (1974) : Granted a full pardon to former President Nixon for any crimes related to the Watergate scandal, sparking national controversy.",
          "Helsinki Accords (1975) : Signed an agreement with 34 other nations to ease Cold War tensions and promote human rights in Eastern Europe.",
          "Whip Inflation Now (WIN) Program (1974) : Launched a voluntary program to curb inflation by encouraging personal savings and reduced spending, but it had little impact.",
          "Energy Policy Initiatives : Encouraged energy conservation and the development of alternative energy sources in response to the 1973 oil crisis.",
          "Privacy Act of 1974 : Strengthened protections for personal information held by the federal government.",
          "Education for All Handicapped Children Act (1975) : Required public schools to provide equal education opportunities for children with disabilities.",
          "Expansion of Food Stamp Program : Increased funding for food assistance programs to help low-income families.",
          "Fall of Saigon & End of Vietnam War (1975) : Oversaw the evacuation of U.S. personnel and Vietnamese refugees as North Vietnam took over South Vietnam, marking the final end of the Vietnam War.",
          "Operation Babylift (1975) : Ordered the evacuation of thousands of orphaned Vietnamese children to the United States following the fall of Saigon.",
          "Tax Reduction Act of 1975 : Implemented temporary tax cuts to stimulate economic growth during a recession.",
          "New York City Bailout (1975) : Approved federal loans to prevent New York City from going bankrupt during its financial crisis.",
          "Expansion of CIA Oversight : Strengthened congressional oversight of intelligence agencies after revelations of CIA abuses in domestic surveillance.",
        ],
        party: "Republican",
        spouse: "Betty Ford",
        children: "4",
        occupationBeforePresidency: "Politician and Lawyer",
        quote:
          "A government big enough to give you everything you want is a government big enough to take from you everything you have.",
        image: "images/GeraldFord.png",
        otherPresidents: [
          "Richard Nixon",
          "Jimmy Carter",
          "Ronald Reagan",
          "George H. W. Bush",
          "Joe Biden",
          "Lyndon B. Johnson",
        ],

        otherPresidentThings: [
          {
            "Richard Nixon":
              "Resigned in August 1974 amid the Watergate scandal; lived in seclusion in California and later wrote memoirs; rarely commented publicly during Ford’s presidency.",
          },
          {
            "Jimmy Carter":
              "Began his campaign for the Democratic nomination shortly after Ford took office; ran as a Washington outsider and defeated Ford in the 1976 election.",
          },
          {
            "Ronald Reagan":
              "Finished his second term as Governor of California in 1975; challenged Ford for the Republican nomination in 1976, nearly winning it and cementing his national profile.",
          },
          {
            "George H. W. Bush":
              "Served as U.S. envoy to China and later as Director of the CIA (appointed by Ford in 1976); continued rising in national Republican politics.",
          },
          {
            "Joe Biden":
              "Served as a freshman U.S. Senator from Delaware; focused on judiciary and foreign relations issues; known for his moderate Democratic stance.",
          },
          {
            "Lyndon B. Johnson":
              "Deceased — died in January 1973, prior to Ford becoming president.",
          },
        ],
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
        keyPolicies: 13,
        policies: [
          "Camp David Accords (1978) : Negotiated a peace agreement between Egypt and Israel, leading to Egypt recognizing Israel and ending hostilities between the two nations.",
          "Department of Energy Creation (1977) : Established the Department of Energy to address the energy crisis and promote alternative energy sources.",
          "National Energy Act (1978) : Implemented policies to reduce U.S. dependence on foreign oil and encourage energy conservation.",
          "Iran Hostage Crisis (1979-1981) : Faced a diplomatic crisis when Iranian militants took 52 American hostages for 444 days, significantly weakening his presidency.",
          "Panama Canal Treaties (1977) : Signed treaties to gradually transfer control of the Panama Canal from the U.S. to Panama by 1999.",
          "Deregulation of Airlines (Airline Deregulation Act, 1978) : Ended government control over airline fares and routes, increasing competition and lowering airfares.",
          "Deregulation of Trucking and Railroads (Motor Carrier Act, 1980) : Reduced government control over the transportation industry to encourage competition and efficiency.",
          "SALT II Treaty (1979) : Negotiated a nuclear arms control treaty with the Soviet Union, but it was never ratified due to the Soviet invasion of Afghanistan.",
          "Response to Soviet Invasion of Afghanistan (1979) : Imposed economic sanctions on the Soviet Union and boycotted the 1980 Moscow Olympics.",
          "Superfund Law (Comprehensive Environmental Response, Compensation, and Liability Act, 1980) : Created a fund to clean up hazardous waste sites and protect the environment.",
          "Expansion of Human Rights Policies : Made human rights a central focus of U.S. foreign policy, pressuring authoritarian governments.",
          "Appointment of Paul Volcker as Federal Reserve Chairman (1979) : Supported high interest rate policies to combat inflation, leading to economic recession but long-term stability.",
          "Civil Service Reform Act (1978) : Overhauled the federal hiring and management system to improve government efficiency.",
        ],
        party: "Democratic",
        spouse: "Rosalynn Carter",
        children: "4",
        occupationBeforePresidency: "Farmer and Politician",
        quote:
          "We must adjust to changing times and still hold to unchanging principles.",
        image: "images/JimmyCarter.png",
        otherPresidents: [
          "Gerald Ford",
          "Richard Nixon",
          "Ronald Reagan",
          "George H. W. Bush",
          "Joe Biden",
        ],

        otherPresidentThings: [
          {
            "Gerald Ford":
              "In retirement after losing the 1976 election; maintained a moderate Republican voice and occasionally commented on Carter’s foreign and domestic policies.",
          },
          {
            "Richard Nixon":
              "Continued to rebuild his public image post-Watergate; traveled abroad and met with foreign leaders; wrote extensively on foreign policy.",
          },
          {
            "Ronald Reagan":
              "Prepared for a second presidential run; became the leading conservative voice in the Republican Party and formally announced his candidacy in 1979.",
          },
          {
            "George H. W. Bush":
              "Served as Director of the CIA until 1977; remained active in Republican politics and began campaigning for the 1980 presidential nomination.",
          },
          {
            "Joe Biden":
              "Serving in the U.S. Senate; worked on key judiciary and foreign relations issues; gained attention as a young, articulate Democratic voice.",
          },
        ],
      },
      {
        name: "Ronald Reagan",
        terms: 2,
        status: "dead",
        birthYear: 1911,
        birthPlace: "Tampico, Illinois",
        parents: "John Reagan and Nelle Wilson Reagan",
        deathYear: 2004,
        deathPlace: "Los Angeles, California",
        deathReason: "Pneumonia due to Alzheimer's disease",
        presidencyStart: 1981,
        presidencyEnd: 1989,
        keyPolicies: 16,
        policies: [
          "Reaganomics (1981-1989) : Economic policies focused on tax cuts, deregulation, and reducing government spending to encourage growth.",
          "Economic Recovery Tax Act (1981) : Cut income tax rates across all brackets, with the highest tax rate dropping from 70% to 50%.",
          "Tax Reform Act of 1986 : Simplified the tax code, lowered corporate tax rates, and eliminated many deductions.",
          "Deregulation of Industries : Reduced federal regulations on banking, telecommunications, and transportation to promote business growth.",
          "Increased Defense Spending : Expanded the U.S. military budget significantly to counter Soviet influence during the Cold War.",
          "Strategic Defense Initiative (SDI) (1983) : Proposed a missile defense system (nicknamed 'Star Wars') to protect the U.S. from nuclear attacks.",
          "Cold War Policies & Soviet Confrontation : Took a tough stance against the USSR, calling it the 'Evil Empire' and increasing military pressure.",
          "INF Treaty (1987) : Signed the Intermediate-Range Nuclear Forces Treaty with the Soviet Union to eliminate certain nuclear weapons.",
          "War on Drugs (1980s) : Expanded anti-drug policies, increasing penalties for drug offenses and launching the 'Just Say No' campaign.",
          "Iran-Contra Affair (1986) : Controversial secret arms sale to Iran, with proceeds used to fund anti-communist rebels in Nicaragua, leading to a major scandal.",
          "Social Security Reform (1983) : Increased payroll taxes and raised the retirement age to ensure long-term Social Security stability.",
          "Immigration Reform and Control Act (1986) : Granted amnesty to nearly 3 million undocumented immigrants while tightening border security.",
          "Civil Liberties and the Conservative Movement : Shifted the Supreme Court to the right by appointing conservative justices, including Sandra Day O’Connor, the first female justice.",
          "Challenger Disaster Response (1986) : Addressed the nation after the Space Shuttle Challenger explosion, reinforcing commitment to space exploration.",
          "Savings and Loan Crisis (Late 1980s) : Deregulated financial institutions, leading to a banking crisis that required a government bailout.",
          "End of Cold War Foundations : Built diplomatic relations with Soviet leader Mikhail Gorbachev, helping lay the groundwork for the collapse of the USSR.",
        ],
        party: "Republican",
        spouse: "Nancy Davis Reagan",
        children: "2",
        occupationBeforePresidency: "Actor and Politician",
        quote: "Freedom is never more than one generation away from extinction.",
        image: "images/RonaldReagan.png",
        otherPresidents: [
          "Gerald Ford",
          "Richard Nixon",
          "Ronald Reagan",
          "George H. W. Bush",
          "Joe Biden",
        ],

        otherPresidentThings: [
          {
            "Gerald Ford":
              "In retirement after losing the 1976 election; maintained a moderate Republican voice and occasionally commented on Carter’s foreign and domestic policies.",
          },
          {
            "Richard Nixon":
              "Continued to rebuild his public image post-Watergate; traveled abroad and met with foreign leaders; wrote extensively on foreign policy.",
          },
          {
            "Ronald Reagan":
              "Prepared for a second presidential run; became the leading conservative voice in the Republican Party and formally announced his candidacy in 1979.",
          },
          {
            "George H. W. Bush":
              "Served as Director of the CIA until 1977; remained active in Republican politics and began campaigning for the 1980 presidential nomination.",
          },
          {
            "Joe Biden":
              "Serving in the U.S. Senate; worked on key judiciary and foreign relations issues; gained attention as a young, articulate Democratic voice.",
          },
        ],
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
        policies: [
          "Americans with Disabilities Act (1990) : Prohibited discrimination against individuals with disabilities in employment, public accommodations, and transportation.",
          "Clean Air Act Amendments (1990) : Strengthened environmental regulations to reduce air pollution, acid rain, and ozone depletion.",
          "Strategic Arms Reduction Treaty (START I) (1991) : Signed a nuclear arms reduction treaty with the Soviet Union to decrease both countries' nuclear arsenals.",
          "End of the Cold War (1989-1991) : Oversaw the collapse of the Soviet Union and the peaceful end of the Cold War.",
          "Persian Gulf War (1991) : Led a U.S.-coalition military operation (Operation Desert Storm) to expel Iraqi forces from Kuwait.",
          "Invasion of Panama (1989) : Ordered the removal of Panamanian dictator Manuel Noriega for drug trafficking and threats to U.S. citizens.",
          "Budget Enforcement Act (1990) : Raised taxes and implemented spending controls to reduce the federal deficit, breaking his 'no new taxes' pledge.",
          "North American Free Trade Agreement (NAFTA) Negotiations : Initiated NAFTA discussions, paving the way for free trade between the U.S., Canada, and Mexico (signed under Clinton).",
          "Immigration Act of 1990 : Increased legal immigration limits and created new visa categories for skilled workers and diversity immigrants.",
          "Education Goals 2000 Initiative : Established national education goals to improve student achievement and accountability in schools.",
          "Disaster Relief Act Expansion : Improved federal response to natural disasters, including Hurricane Andrew in 1992.",
          "Civil Rights Act of 1991 : Strengthened protections against workplace discrimination based on race, gender, and disability.",
          "Energy Policy Act (1992) : Promoted energy efficiency, renewable energy, and the development of alternative fuels.",
          "Los Angeles Riots Response (1992) : Deployed federal troops to restore order after the Rodney King verdict led to civil unrest.",
        ],
        party: "Republican",
        spouse: "Barbara Pierce Bush",
        children: "6",
        occupationBeforePresidency: "Politician and Businessman",
        quote: "We are not the sum of our possessions.",
        image: "images/GeorgeHWBush.png",
        otherPresidents: [
          "Ronald Reagan",
          "Jimmy Carter",
          "Gerald Ford",
          "Richard Nixon",
          "Joe Biden",
          "Bill Clinton",
          "George W. Bush",
        ],

        otherPresidentThings: [
          {
            "Ronald Reagan":
              "In retirement after completing his two terms; largely stayed out of politics but remained an influential figure within the Republican Party; diagnosed with Alzheimer’s shortly after Bush’s term ended.",
          },
          {
            "Jimmy Carter":
              "Continued humanitarian work through the Carter Center; frequently voiced opinions on foreign policy, human rights, and criticized aspects of Bush’s Gulf War strategy.",
          },
          {
            "Gerald Ford":
              "Remained an elder statesman; offered private political advice and supported Bush’s 1988 campaign; gave occasional speeches on governance and bipartisanship.",
          },
          {
            "Richard Nixon":
              "Continued writing and advising on foreign policy; praised Bush’s diplomatic handling of the end of the Cold War and the Gulf War.",
          },
          {
            "Joe Biden":
              "Served in the U.S. Senate; played a major role in foreign policy and judicial matters; supported some aspects of Bush’s foreign policy but was a Democratic critic on domestic issues.",
          },
          {
            "Bill Clinton":
              "Governor of Arkansas; gained national attention as a rising Democratic star; launched a successful presidential campaign in 1992, defeating Bush.",
          },
          {
            "George W. Bush":
              "Involved in business and served as managing partner of the Texas Rangers baseball team; began preparing for a political career, eventually running for Governor of Texas in 1994.",
          },
        ],
      },
      {
        name: "Bill Clinton",
        terms: 2,
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
        policies: [
          "North American Free Trade Agreement (NAFTA) (1993) : Signed into law a trade agreement between the U.S., Canada, and Mexico, eliminating most tariffs and boosting trade.",
          "Welfare Reform (Personal Responsibility and Work Opportunity Reconciliation Act, 1996) : Overhauled welfare programs by setting work requirements and time limits on government assistance.",
          "Balanced Budget and Economic Growth (1993-2001) : Led to a budget surplus by cutting deficits, increasing taxes on higher incomes, and growing the economy.",
          "Crime Bill (Violent Crime Control and Law Enforcement Act, 1994) : Increased police funding, expanded the death penalty, and implemented a federal 'three strikes' law.",
          "Family and Medical Leave Act (1993) : Guaranteed employees up to 12 weeks of unpaid leave for family or medical emergencies.",
          "Children’s Health Insurance Program (CHIP) (1997) : Expanded healthcare coverage for low-income children through federal and state partnerships.",
          "Defense of Marriage Act (DOMA) (1996) : Defined marriage as between a man and a woman for federal purposes, later ruled unconstitutional.",
          "Brady Handgun Violence Prevention Act (1993) : Imposed background checks and waiting periods for handgun purchases.",
          "Repeal of Glass-Steagall Act (Gramm-Leach-Bliley Act, 1999) : Removed financial regulations separating commercial and investment banks, later blamed for contributing to the 2008 financial crisis.",
          "Digital Millennium Copyright Act (DMCA) (1998) : Strengthened intellectual property protections in the digital era.",
          "Dayton Accords (1995) : Led NATO intervention in Bosnia to end the civil war and ethnic cleansing in the region.",
          "Kosovo Intervention (1999) : Ordered NATO airstrikes to stop Serbian aggression against ethnic Albanians in Kosovo.",
          "Expansion of NATO (1999) : Brought Poland, Hungary, and the Czech Republic into NATO, strengthening U.S. influence in Eastern Europe.",
          "China Trade Relations (2000) : Signed a bill granting China Permanent Normal Trade Relations (PNTR), paving the way for its entry into the World Trade Organization.",
          "Impeachment (1998-1999) : Impeached by the House of Representatives for perjury and obstruction of justice related to the Monica Lewinsky scandal but was acquitted by the Senate.",
        ],
        party: "Democratic",
        spouse: "Hillary Clinton",
        children: "1",
        occupationBeforePresidency: "Politician and Lawyer",
        quote:
          "There is nothing wrong with America that cannot be cured by what is right with America.",
        image: "images/BillClinton.png",
        otherPresidents: [
          "George H. W. Bush",
          "Ronald Reagan",
          "Jimmy Carter",
          "Richard Nixon",
          "Joe Biden",
          "George W. Bush",
          "Barack Obama",
        ],

        otherPresidentThings: [
          {
            "George H. W. Bush":
              "In retirement after losing the 1992 election; largely stayed out of the political spotlight, though he supported Republican candidates and focused on humanitarian work.",
          },
          {
            "Ronald Reagan":
              "Publicly announced his Alzheimer’s diagnosis in 1994 and withdrew from public life; remained a symbolic figure within the Republican Party.",
          },
          {
            "Jimmy Carter":
              "Continued active global humanitarian work and election monitoring through the Carter Center; occasionally critiqued U.S. foreign policy and offered support on health and housing issues.",
          },
          {
            "Richard Nixon":
              "Deceased — died in 1994; remained active in foreign policy commentary until his passing, and had praised Clinton for diplomatic outreach to Russia.",
          },
          {
            "Joe Biden":
              "Served in the U.S. Senate; continued shaping foreign relations and judiciary policy; supported Clinton’s crime bill and elements of his domestic agenda.",
          },
          {
            "George W. Bush":
              "Elected Governor of Texas in 1994; gained national attention for bipartisan leadership and education reform; built momentum for his 2000 presidential run.",
          },
          {
            "Barack Obama":
              "Worked as a community organizer, lawyer, and professor; elected to the Illinois State Senate in 1996, beginning his rise in Democratic politics.",
          },
        ],
      },
      {
        name: "George W. Bush",
        terms: 2,
        status: "alive",
        birthYear: 1946,
        birthPlace: "New Haven, Connecticut",
        parents: "George H. W. Bush and Barbara Bush",
        deathYear: "",
        deathPlace: "N/A",
        deathReason: "N/A",
        presidencyStart: 2001,
        presidencyEnd: 2009,
        keyPolicies: 15,
        policies: [
          "No Child Left Behind Act (2002) : Increased federal oversight of education, requiring standardized testing and accountability measures for schools.",
          "USA PATRIOT Act (2001) : Expanded government surveillance powers to combat terrorism after the 9/11 attacks.",
          "Department of Homeland Security Creation (2002) : Established a new federal department to coordinate national security efforts against terrorism.",
          "War on Terror (2001-2009) : Launched military campaigns in Afghanistan and Iraq to combat terrorism and promote democracy.",
          "Invasion of Afghanistan (2001) : Led U.S. forces to overthrow the Taliban regime after the 9/11 attacks.",
          "Invasion of Iraq (2003) : Ordered the U.S. invasion of Iraq, leading to the overthrow of Saddam Hussein and a prolonged military presence.",
          "Medicare Prescription Drug, Improvement, and Modernization Act (2003) : Created Medicare Part D, providing prescription drug coverage for senior citizens.",
          "Bush Tax Cuts (2001, 2003) : Reduced federal income tax rates across all brackets, including significant cuts for high-income earners.",
          "Emergency Economic Stabilization Act (2008) : Approved a $700 billion bailout to rescue failing financial institutions during the 2008 financial crisis.",
          "Hurricane Katrina Response (2005) : Faced criticism for the slow and ineffective federal response to the disaster.",
          "Partial-Birth Abortion Ban Act (2003) : Prohibited a specific late-term abortion procedure, marking a major victory for pro-life advocates.",
          "Energy Policy Act (2005) : Promoted domestic energy production, including oil drilling, ethanol use, and alternative energy incentives.",
          "Financial Regulations and Housing Crisis Response (2008) : Introduced measures to stabilize the economy after the subprime mortgage collapse.",
          "Great Recession (2007-2009) : Presided over the start of the worst economic downturn since the Great Depression, leading to major government interventions.",
          "U.S. Withdrawal Plan from Iraq (2008) : Signed an agreement with Iraq setting a timeline for U.S. troop withdrawals.",
        ],
        party: "Republican",
        spouse: "Laura Welch Bush",
        children: "2",
        occupationBeforePresidency: "Governor",
        quote: "We will not tire, we will not falter, and we will not fail.",
        image: "images/GeorgeWBush.png",
        otherPresidents: [
          "Bill Clinton",
          "George H. W. Bush",
          "Jimmy Carter",
          "Joe Biden",
          "Barack Obama",
          "Donald Trump",
        ],

        otherPresidentThings: [
          {
            "Bill Clinton":
              "Active globally through the Clinton Foundation; partnered with George H. W. Bush on disaster relief efforts; occasionally clashed with Bush administration over policy but maintained bipartisan cooperation on humanitarian efforts.",
          },
          {
            "George H. W. Bush":
              "In retirement; frequently partnered with Clinton on philanthropic causes; supported his son’s presidency while largely staying out of policy discussions.",
          },
          {
            "Jimmy Carter":
              "Continued humanitarian and diplomatic work through the Carter Center; publicly criticized aspects of Bush’s foreign policy, particularly the Iraq War.",
          },
          {
            "Joe Biden":
              "Served as a senior U.S. Senator; chaired the Senate Foreign Relations Committee; supported the Afghanistan War but became increasingly critical of the Iraq War.",
          },
          {
            "Barack Obama":
              "Served in the Illinois State Senate until 2004; elected to the U.S. Senate in 2004; gained national attention with his DNC speech and launched his presidential campaign in 2007.",
          },
          {
            "Donald Trump":
              "Known primarily as a businessman and television personality; frequently commented on politics and national issues, but had not yet entered public office during Bush’s presidency.",
          },
        ],
      },
      {
        name: "Barack Obama",
        terms: 2,
        status: "alive",
        birthYear: 1961,
        birthPlace: "Honolulu, Hawaii",
        parents: "Barack Obama Sr. and Stanley Ann Dunham",
        deathYear: "",
        deathPlace: "N/A",
        deathReason: "N/A",
        presidencyStart: 2009,
        presidencyEnd: 2017,
        keyPolicies: 16,
        policies: [
          "Affordable Care Act (Obamacare) (2010) : Expanded healthcare coverage, required insurance companies to cover pre-existing conditions, and created health insurance marketplaces.",
          "Dodd-Frank Wall Street Reform Act (2010) : Introduced financial regulations to prevent a repeat of the 2008 financial crisis by increasing oversight of banks and Wall Street.",
          "American Recovery and Reinvestment Act (2009) : Implemented a $787 billion economic stimulus package to combat the Great Recession through tax cuts, infrastructure projects, and job programs.",
          "Ending the War in Iraq (2011) : Completed the withdrawal of U.S. troops from Iraq, fulfilling a major campaign promise.",
          "Osama bin Laden Raid (2011) : Ordered the successful U.S. Navy SEAL operation that killed al-Qaeda leader Osama bin Laden.",
          "DREAM Act and DACA (2012) : Established Deferred Action for Childhood Arrivals (DACA) to protect undocumented immigrants who arrived as children from deportation.",
          "Paris Climate Agreement (2015) : Signed an international treaty committing the U.S. to reducing greenhouse gas emissions and combating climate change.",
          "Cuba-U.S. Relations Normalization (2014-2015) : Reestablished diplomatic relations with Cuba after decades of tension and trade embargoes.",
          "Iran Nuclear Deal (2015) : Negotiated an agreement to limit Iran’s nuclear program in exchange for lifting economic sanctions.",
          "Repeal of Don’t Ask, Don’t Tell (2010) : Allowed LGBTQ+ individuals to serve openly in the U.S. military.",
          "Marriage Equality Support : Appointed Supreme Court justices who contributed to the 2015 ruling legalizing same-sex marriage nationwide.",
          "Expansion of Student Loan Relief (2010-2014) : Introduced reforms to lower student loan interest rates and expand income-based repayment plans.",
          "Lilly Ledbetter Fair Pay Act (2009) : Strengthened equal pay protections for women and employees facing wage discrimination.",
          "Automotive Industry Bailout (2009) : Provided emergency funding to rescue General Motors and Chrysler, saving jobs in the auto industry.",
          "Gun Control Efforts (2013-2016) : Pushed for universal background checks and gun safety laws after mass shootings, though faced congressional opposition.",
          "Trans-Pacific Partnership (TPP) Negotiation (2016) : Negotiated a major trade deal with Pacific nations to counter China’s influence, though it was later scrapped under Trump.",
        ],
        party: "Democratic",
        spouse: "Michelle Obama",
        children: "2",
        occupationBeforePresidency: "Politician and Lawyer",
        quote: "Yes we can.",
        image: "images/BarackObama.png",
        otherPresidents: [
          "George W. Bush",
          "Bill Clinton",
          "George H. W. Bush",
          "Jimmy Carter",
          "Joe Biden",
          "Donald Trump",
        ],

        otherPresidentThings: [
          {
            "George W. Bush":
              "Retired from politics after leaving office in 2009; focused on painting and philanthropy; avoided criticizing Obama publicly and emphasized unity.",
          },
          {
            "Bill Clinton":
              "Remained highly active in global philanthropy via the Clinton Foundation; supported Hillary Clinton’s 2008 and 2016 presidential campaigns; collaborated with the Obama administration on health and global initiatives.",
          },
          {
            "George H. W. Bush":
              "In full retirement; partnered with Bill Clinton on humanitarian efforts; praised Obama's leadership after several national tragedies; died in 2018.",
          },
          {
            "Jimmy Carter":
              "Continued global peace and health initiatives; at times publicly disagreed with Obama’s drone policy and surveillance programs, but generally supported his presidency.",
          },
          {
            "Joe Biden":
              "Served as Obama’s Vice President; key figure in foreign policy, economic recovery, and legislative negotiations; awarded the Presidential Medal of Freedom in 2017.",
          },
          {
            "Donald Trump":
              "Criticized Obama frequently in media and on Twitter; rose as a prominent “birther” figure; launched his 2016 presidential campaign and won, succeeding Obama in 2017.",
          },
        ],
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
        keyPolicies: 8,
        policies: [
          "Tax Cuts and Jobs Act (2017) : Implemented significant tax reforms, reducing corporate tax rates and altering individual income tax brackets.",
          "Deregulation Efforts : Rolled back numerous federal regulations across various sectors to promote business growth.",
          "Immigration Policies : Enforced stricter immigration laws, including the travel ban on certain countries and attempts to end DACA.",
          "Trade Policies : Imposed tariffs on imports from China and other countries to protect American industries.",
          "Criminal Justice Reform (First Step Act, 2018) : Enacted reforms aimed at reducing recidivism and improving prison conditions.",
          "Judicial Appointments : Appointed three Supreme Court justices and numerous federal judges, shifting the judiciary to a more conservative stance.",
          "COVID-19 Response : Implemented measures to address the pandemic, including travel restrictions and Operation Warp Speed to accelerate vaccine development.",
          "Middle East Policies : Recognized Jerusalem as Israel's capital and brokered normalization agreements between Israel and several Arab nations.",
        ],
        party: "Republican",
        spouse: "Melania Trump",
        children: "5",
        occupationBeforePresidency: "Businessman and TV Personality",
        quote: "The more you dream, the farther you get.",
        otherPresidents: [
          "Barack Obama",
          "George W. Bush",
          "Bill Clinton",
          "Jimmy Carter",
          "Joe Biden",
        ],

        otherPresidentThings: [
          {
            "Barack Obama":
              "Remained largely silent during the early Trump years, but later became more vocal in defending democratic norms and endorsing Democratic candidates; campaigned actively for Joe Biden in 2020.",
          },
          {
            "George W. Bush":
              "Largely stayed out of politics; spoke out against political division and extremism; emphasized national unity and democratic values in contrast to Trump’s tone.",
          },
          {
            "Bill Clinton":
              "Continued to lead the Clinton Foundation and support Democratic causes; backed Hillary Clinton’s 2016 campaign and later Joe Biden’s 2020 run; offered limited public commentary during Trump’s term.",
          },
          {
            "Jimmy Carter":
              "Remained focused on humanitarian work through the Carter Center; voiced concerns about democratic backsliding and voter suppression during Trump’s presidency.",
          },
          {
            "Joe Biden":
              "Announced his candidacy in 2019; campaigned as a unifying alternative to Trump; elected in 2020 and succeeded Trump in January 2021.",
          },
        ],
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
        keyPolicies: 15,
        policies: [
          "American Rescue Plan Act (2021) : Enacted a $1.9 trillion stimulus package to address the economic impact of the COVID-19 pandemic, providing direct payments to individuals, extending unemployment benefits, and funding vaccine distribution.",
          "Infrastructure Investment and Jobs Act (2021) : Signed into law a $1 trillion bipartisan infrastructure bill to modernize transportation, utilities, and broadband infrastructure across the United States.",
          "Inflation Reduction Act (2022) : Passed legislation focusing on deficit reduction, climate change initiatives, healthcare subsidies, and tax reforms, aiming to lower greenhouse gas emissions and reduce prescription drug costs.",
          "Paris Climate Agreement Reentry (2021) : Rejoined the international accord to combat climate change, committing the U.S. to reduce greenhouse gas emissions and promote global environmental initiatives.",
          "Afghanistan Withdrawal (2021) : Ordered the complete withdrawal of U.S. troops from Afghanistan, ending America's longest war but facing criticism over the chaotic evacuation process.",
          "COVID-19 Vaccination Campaign : Launched a nationwide effort to distribute and administer vaccines, achieving significant milestones in vaccination rates to combat the pandemic.",
          "Student Loan Relief : Extended pauses on federal student loan repayments and explored forgiveness options for borrowers, aiming to alleviate financial burdens on students.",
          "Executive Actions on Racial Equity : Issued orders to address systemic racism and promote equity across federal agencies, including reforms in housing, criminal justice, and economic opportunities.",
          "Gun Control Measures : Advocated for enhanced background checks, assault weapon bans, and community violence intervention programs to address rising gun violence.",
          "Immigration Policies : Proposed comprehensive immigration reform, including pathways to citizenship for undocumented immigrants and changes to asylum procedures.",
          "Healthcare Initiatives : Strengthened the Affordable Care Act by increasing subsidies and expanding enrollment periods to improve healthcare access.",
          "Economic Policies : Implemented measures to boost job growth, support small businesses, and increase the federal minimum wage to stimulate economic recovery.",
          "Foreign Policy Shifts : Emphasized diplomacy by reengaging with allies, addressing challenges posed by China and Russia, and promoting democratic values globally.",
          "Education Funding : Increased investments in public education, proposed universal pre-K, and supported initiatives to make community college tuition-free.",
          "Climate Change Actions : Set ambitious goals for renewable energy adoption, electric vehicle promotion, and conservation efforts to address environmental concerns.",
        ],
        party: "Democratic",
        spouse: "Jill Biden",
        children: "4",
        occupationBeforePresidency: "Politician and Lawyer",
        quote: "Our best days still lie ahead.",
        otherPresidents: [
          "Donald Trump",
          "Barack Obama",
          "George W. Bush",
          "Bill Clinton",
          "Jimmy Carter",
        ],

        otherPresidentThings: [
          {
            "Donald Trump":
              "Left office in January 2021 after refusing to concede the 2020 election; remained a dominant force in the Republican Party; impeached a second time following the January 6 Capitol attack; launched a 2024 presidential campaign.",
          },
          {
            "Barack Obama":
              "Maintained a strong public presence through speeches, writing, and the Obama Foundation; supported Biden’s agenda and campaigned with Democrats in key elections.",
          },
          {
            "George W. Bush":
              "Continued his focus on painting and veteran causes; offered limited but pointed criticism of political extremism and threats to democracy.",
          },
          {
            "Bill Clinton":
              "Largely retired from public life; remained involved in global initiatives via the Clinton Foundation and occasionally appeared at political events.",
          },
          {
            "Jimmy Carter":
              "Entered hospice care in 2023 after years of humanitarian work; widely honored for his lifelong service; holds the record as the longest-living U.S. president.",
          },
        ],
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
        keyPolicies: 3,
        policies: ["a:b", "c:d", "e:f"],
        party: "Republican",
        spouse: "Melania Trump",
        children: "5",
        occupationBeforePresidency: "Businessman and TV Personality",
        quote: "The more you dream, the farther you get.",
      },
    ]);

    /* src/components/OnePresidentUnitMainCircle.svelte generated by Svelte v3.59.2 */

    const { console: console_1$3 } = globals;
    const file$7 = "src/components/OnePresidentUnitMainCircle.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    // (46:0) {#each Array($presidents[index].policies.length).fill(0) as _, arcIndex}
    function create_each_block$3(ctx) {
    	let path;
    	let path_d_value;
    	let path_fill_value;
    	let mounted;
    	let dispose;

    	function mouseover_handler(...args) {
    		return /*mouseover_handler*/ ctx[13](/*arcIndex*/ ctx[23], ...args);
    	}

    	function focus_handler() {
    		return /*focus_handler*/ ctx[15](/*arcIndex*/ ctx[23]);
    	}

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[17](/*arcIndex*/ ctx[23], ...args);
    	}

    	function keydown_handler() {
    		return /*keydown_handler*/ ctx[18](/*arcIndex*/ ctx[23]);
    	}

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", path_d_value = calculateArcPath(/*cx*/ ctx[0], /*cy*/ ctx[1], /*outerRadius*/ ctx[3], /*arcIndex*/ ctx[23], /*$presidents*/ ctx[10][/*index*/ ctx[7]].policies.length));

    			attr_dev(path, "fill", path_fill_value = /*isActive*/ ctx[12](/*index*/ ctx[7]) && /*hoveredArc*/ ctx[8] === `${/*index*/ ctx[7]}-${/*arcIndex*/ ctx[23]}`
    			? "lightblue"
    			: "white");

    			attr_dev(path, "stroke", "black");
    			attr_dev(path, "stroke-width", "2px");
    			attr_dev(path, "class", "svelte-6b96vr");
    			add_location(path, file$7, 46, 2, 1351);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(path, "mouseover", mouseover_handler, false, false, false, false),
    					listen_dev(path, "mouseout", /*mouseout_handler*/ ctx[14], false, false, false, false),
    					listen_dev(path, "focus", focus_handler, false, false, false, false),
    					listen_dev(path, "blur", /*blur_handler*/ ctx[16], false, false, false, false),
    					listen_dev(path, "click", click_handler, false, false, false, false),
    					listen_dev(path, "keydown", keydown_handler, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*cx, cy, outerRadius, $presidents, index*/ 1163 && path_d_value !== (path_d_value = calculateArcPath(/*cx*/ ctx[0], /*cy*/ ctx[1], /*outerRadius*/ ctx[3], /*arcIndex*/ ctx[23], /*$presidents*/ ctx[10][/*index*/ ctx[7]].policies.length))) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty & /*index, hoveredArc*/ 384 && path_fill_value !== (path_fill_value = /*isActive*/ ctx[12](/*index*/ ctx[7]) && /*hoveredArc*/ ctx[8] === `${/*index*/ ctx[7]}-${/*arcIndex*/ ctx[23]}`
    			? "lightblue"
    			: "white")) {
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
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(46:0) {#each Array($presidents[index].policies.length).fill(0) as _, arcIndex}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let t0;
    	let circle;
    	let t1;
    	let image;
    	let image_x_value;
    	let image_y_value;
    	let image_width_value;
    	let image_height_value;
    	let image_href_value;
    	let mounted;
    	let dispose;
    	let each_value = Array(/*$presidents*/ ctx[10][/*index*/ ctx[7]].policies.length).fill(0);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			circle = svg_element("circle");
    			t1 = space();
    			image = svg_element("image");
    			attr_dev(circle, "cx", /*cx*/ ctx[0]);
    			attr_dev(circle, "cy", /*cy*/ ctx[1]);
    			attr_dev(circle, "r", /*innerRadius*/ ctx[2]);
    			attr_dev(circle, "stroke", /*stroke*/ ctx[4]);
    			attr_dev(circle, "stroke-width", /*strokeWidth*/ ctx[5]);
    			attr_dev(circle, "fill", /*fill*/ ctx[6]);
    			add_location(circle, file$7, 88, 0, 2585);
    			attr_dev(image, "x", image_x_value = /*cx*/ ctx[0] - /*innerRadius*/ ctx[2]);
    			attr_dev(image, "y", image_y_value = /*cy*/ ctx[1] - /*innerRadius*/ ctx[2]);
    			attr_dev(image, "width", image_width_value = /*innerRadius*/ ctx[2] * 2);
    			attr_dev(image, "height", image_height_value = /*innerRadius*/ ctx[2] * 2);
    			attr_dev(image, "data-index", /*index*/ ctx[7]);
    			attr_dev(image, "href", image_href_value = /*$presidents*/ ctx[10][/*index*/ ctx[7]].image);
    			attr_dev(image, "clip-path", "circle(50%)");
    			attr_dev(image, "tabindex", "0");
    			attr_dev(image, "role", "button");
    			attr_dev(image, "class", "svelte-6b96vr");
    			add_location(image, file$7, 90, 0, 2666);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, circle, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, image, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(image, "click", /*click_handler_1*/ ctx[19], false, false, false, false),
    					listen_dev(image, "keydown", /*keydown_handler_1*/ ctx[20], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*calculateArcPath, cx, cy, outerRadius, $presidents, index, isActive, hoveredArc, document, $selectedCircleId*/ 6027) {
    				each_value = Array(/*$presidents*/ ctx[10][/*index*/ ctx[7]].policies.length).fill(0);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t0.parentNode, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*cx*/ 1) {
    				attr_dev(circle, "cx", /*cx*/ ctx[0]);
    			}

    			if (dirty & /*cy*/ 2) {
    				attr_dev(circle, "cy", /*cy*/ ctx[1]);
    			}

    			if (dirty & /*innerRadius*/ 4) {
    				attr_dev(circle, "r", /*innerRadius*/ ctx[2]);
    			}

    			if (dirty & /*stroke*/ 16) {
    				attr_dev(circle, "stroke", /*stroke*/ ctx[4]);
    			}

    			if (dirty & /*strokeWidth*/ 32) {
    				attr_dev(circle, "stroke-width", /*strokeWidth*/ ctx[5]);
    			}

    			if (dirty & /*fill*/ 64) {
    				attr_dev(circle, "fill", /*fill*/ ctx[6]);
    			}

    			if (dirty & /*cx, innerRadius*/ 5 && image_x_value !== (image_x_value = /*cx*/ ctx[0] - /*innerRadius*/ ctx[2])) {
    				attr_dev(image, "x", image_x_value);
    			}

    			if (dirty & /*cy, innerRadius*/ 6 && image_y_value !== (image_y_value = /*cy*/ ctx[1] - /*innerRadius*/ ctx[2])) {
    				attr_dev(image, "y", image_y_value);
    			}

    			if (dirty & /*innerRadius*/ 4 && image_width_value !== (image_width_value = /*innerRadius*/ ctx[2] * 2)) {
    				attr_dev(image, "width", image_width_value);
    			}

    			if (dirty & /*innerRadius*/ 4 && image_height_value !== (image_height_value = /*innerRadius*/ ctx[2] * 2)) {
    				attr_dev(image, "height", image_height_value);
    			}

    			if (dirty & /*index*/ 128) {
    				attr_dev(image, "data-index", /*index*/ ctx[7]);
    			}

    			if (dirty & /*$presidents, index*/ 1152 && image_href_value !== (image_href_value = /*$presidents*/ ctx[10][/*index*/ ctx[7]].image)) {
    				attr_dev(image, "href", image_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(circle);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(image);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function calculateArcPath(cx, cy, radius, arcIndex, totalArcs) {
    	const anglePerArc = 2 * Math.PI / totalArcs;
    	const startAngle = -Math.PI / 2 + arcIndex * anglePerArc;
    	const endAngle = -Math.PI / 2 + (arcIndex + 1) * anglePerArc;
    	const x1 = cx + radius * Math.cos(startAngle);
    	const y1 = cy + radius * Math.sin(startAngle);
    	const x2 = cx + radius * Math.cos(endAngle);
    	const y2 = cy + radius * Math.sin(endAngle);
    	return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
    }

    function handleImageKeydown(event) {
    	console.log("key down on image");
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $selectedCircleId;
    	let $presidents;
    	validate_store(selectedCircleId, 'selectedCircleId');
    	component_subscribe($$self, selectedCircleId, $$value => $$invalidate(9, $selectedCircleId = $$value));
    	validate_store(presidents, 'presidents');
    	component_subscribe($$self, presidents, $$value => $$invalidate(10, $presidents = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('OnePresidentUnitMainCircle', slots, []);
    	let { cx } = $$props;
    	let { cy } = $$props;
    	let { innerRadius } = $$props;
    	let { outerRadius } = $$props;
    	let { stroke } = $$props;
    	let { strokeWidth } = $$props;
    	let { fill } = $$props;
    	let { index } = $$props;
    	let hoveredArc = null;

    	function handleImageClick(event) {
    		event.stopPropagation(); // otherwise svg click is registered
    		const id = event.target.dataset.index;
    		selectedCircleId.set(null);

    		setTimeout(
    			() => {
    				selectedCircleId.set(id);
    			},
    			0
    		);
    	}

    	function isActive(index) {
    		return index.toString() === $selectedCircleId;
    	}

    	$$self.$$.on_mount.push(function () {
    		if (cx === undefined && !('cx' in $$props || $$self.$$.bound[$$self.$$.props['cx']])) {
    			console_1$3.warn("<OnePresidentUnitMainCircle> was created without expected prop 'cx'");
    		}

    		if (cy === undefined && !('cy' in $$props || $$self.$$.bound[$$self.$$.props['cy']])) {
    			console_1$3.warn("<OnePresidentUnitMainCircle> was created without expected prop 'cy'");
    		}

    		if (innerRadius === undefined && !('innerRadius' in $$props || $$self.$$.bound[$$self.$$.props['innerRadius']])) {
    			console_1$3.warn("<OnePresidentUnitMainCircle> was created without expected prop 'innerRadius'");
    		}

    		if (outerRadius === undefined && !('outerRadius' in $$props || $$self.$$.bound[$$self.$$.props['outerRadius']])) {
    			console_1$3.warn("<OnePresidentUnitMainCircle> was created without expected prop 'outerRadius'");
    		}

    		if (stroke === undefined && !('stroke' in $$props || $$self.$$.bound[$$self.$$.props['stroke']])) {
    			console_1$3.warn("<OnePresidentUnitMainCircle> was created without expected prop 'stroke'");
    		}

    		if (strokeWidth === undefined && !('strokeWidth' in $$props || $$self.$$.bound[$$self.$$.props['strokeWidth']])) {
    			console_1$3.warn("<OnePresidentUnitMainCircle> was created without expected prop 'strokeWidth'");
    		}

    		if (fill === undefined && !('fill' in $$props || $$self.$$.bound[$$self.$$.props['fill']])) {
    			console_1$3.warn("<OnePresidentUnitMainCircle> was created without expected prop 'fill'");
    		}

    		if (index === undefined && !('index' in $$props || $$self.$$.bound[$$self.$$.props['index']])) {
    			console_1$3.warn("<OnePresidentUnitMainCircle> was created without expected prop 'index'");
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
    		'index'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<OnePresidentUnitMainCircle> was created with unknown prop '${key}'`);
    	});

    	const mouseover_handler = (arcIndex, event) => {
    		event.stopPropagation();
    		if (!isActive(index)) return;

    		//TO DO: how to avoid getElementById
    		$$invalidate(8, hoveredArc = `${index}-${arcIndex}`);

    		const div = document.getElementById(`president-${index}-Quote`);
    		div.innerHTML = $presidents[index].policies[arcIndex];
    	};

    	const mouseout_handler = () => {
    		$$invalidate(8, hoveredArc = null);
    	};

    	const focus_handler = arcIndex => $$invalidate(8, hoveredArc = `${index}-${arcIndex}`);
    	const blur_handler = () => $$invalidate(8, hoveredArc = null);

    	const click_handler = (arcIndex, event) => {
    		event.stopPropagation();
    		if (!isActive(index)) return;

    		if (index.toString() == $selectedCircleId) {
    			//TO DO : how to avoid getElementById
    			$$invalidate(8, hoveredArc = `${index}-${arcIndex}`);

    			const div = document.getElementById(`president-${index}-Quote`);
    			div.innerHTML = $presidents[index].policies[arcIndex];
    		}
    	};

    	const keydown_handler = arcIndex => {
    		$$invalidate(8, hoveredArc = `${index}-${arcIndex}`);
    	};

    	const click_handler_1 = event => handleImageClick(event);
    	const keydown_handler_1 = event => handleImageKeydown();

    	$$self.$$set = $$props => {
    		if ('cx' in $$props) $$invalidate(0, cx = $$props.cx);
    		if ('cy' in $$props) $$invalidate(1, cy = $$props.cy);
    		if ('innerRadius' in $$props) $$invalidate(2, innerRadius = $$props.innerRadius);
    		if ('outerRadius' in $$props) $$invalidate(3, outerRadius = $$props.outerRadius);
    		if ('stroke' in $$props) $$invalidate(4, stroke = $$props.stroke);
    		if ('strokeWidth' in $$props) $$invalidate(5, strokeWidth = $$props.strokeWidth);
    		if ('fill' in $$props) $$invalidate(6, fill = $$props.fill);
    		if ('index' in $$props) $$invalidate(7, index = $$props.index);
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
    		hoveredArc,
    		calculateArcPath,
    		handleImageClick,
    		handleImageKeydown,
    		isActive,
    		$selectedCircleId,
    		$presidents
    	});

    	$$self.$inject_state = $$props => {
    		if ('cx' in $$props) $$invalidate(0, cx = $$props.cx);
    		if ('cy' in $$props) $$invalidate(1, cy = $$props.cy);
    		if ('innerRadius' in $$props) $$invalidate(2, innerRadius = $$props.innerRadius);
    		if ('outerRadius' in $$props) $$invalidate(3, outerRadius = $$props.outerRadius);
    		if ('stroke' in $$props) $$invalidate(4, stroke = $$props.stroke);
    		if ('strokeWidth' in $$props) $$invalidate(5, strokeWidth = $$props.strokeWidth);
    		if ('fill' in $$props) $$invalidate(6, fill = $$props.fill);
    		if ('index' in $$props) $$invalidate(7, index = $$props.index);
    		if ('hoveredArc' in $$props) $$invalidate(8, hoveredArc = $$props.hoveredArc);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
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
    		handleImageClick,
    		isActive,
    		mouseover_handler,
    		mouseout_handler,
    		focus_handler,
    		blur_handler,
    		click_handler,
    		keydown_handler,
    		click_handler_1,
    		keydown_handler_1
    	];
    }

    class OnePresidentUnitMainCircle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			cx: 0,
    			cy: 1,
    			innerRadius: 2,
    			outerRadius: 3,
    			stroke: 4,
    			strokeWidth: 5,
    			fill: 6,
    			index: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OnePresidentUnitMainCircle",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get cx() {
    		throw new Error("<OnePresidentUnitMainCircle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cx(value) {
    		throw new Error("<OnePresidentUnitMainCircle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cy() {
    		throw new Error("<OnePresidentUnitMainCircle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cy(value) {
    		throw new Error("<OnePresidentUnitMainCircle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get innerRadius() {
    		throw new Error("<OnePresidentUnitMainCircle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set innerRadius(value) {
    		throw new Error("<OnePresidentUnitMainCircle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outerRadius() {
    		throw new Error("<OnePresidentUnitMainCircle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outerRadius(value) {
    		throw new Error("<OnePresidentUnitMainCircle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stroke() {
    		throw new Error("<OnePresidentUnitMainCircle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stroke(value) {
    		throw new Error("<OnePresidentUnitMainCircle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get strokeWidth() {
    		throw new Error("<OnePresidentUnitMainCircle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set strokeWidth(value) {
    		throw new Error("<OnePresidentUnitMainCircle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fill() {
    		throw new Error("<OnePresidentUnitMainCircle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<OnePresidentUnitMainCircle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<OnePresidentUnitMainCircle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<OnePresidentUnitMainCircle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/OnePresidentUnitName.svelte generated by Svelte v3.59.2 */
    const file$6 = "src/components/OnePresidentUnitName.svelte";

    function create_fragment$6(ctx) {
    	let text_1;
    	let t_value = /*$presidents*/ ctx[4][/*index*/ ctx[3]].name + "";
    	let t;
    	let text_1_y_value;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(text_1, "x", /*cx*/ ctx[0]);
    			attr_dev(text_1, "y", text_1_y_value = /*cy*/ ctx[1] + /*outerRadius*/ ctx[2] * 1.5 - 20);
    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "font-size", "16px");
    			attr_dev(text_1, "fill", "black");
    			add_location(text_1, file$6, 8, 0, 155);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$presidents, index*/ 24 && t_value !== (t_value = /*$presidents*/ ctx[4][/*index*/ ctx[3]].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*cx*/ 1) {
    				attr_dev(text_1, "x", /*cx*/ ctx[0]);
    			}

    			if (dirty & /*cy, outerRadius*/ 6 && text_1_y_value !== (text_1_y_value = /*cy*/ ctx[1] + /*outerRadius*/ ctx[2] * 1.5 - 20)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $presidents;
    	validate_store(presidents, 'presidents');
    	component_subscribe($$self, presidents, $$value => $$invalidate(4, $presidents = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('OnePresidentUnitName', slots, []);
    	let { cx } = $$props;
    	let { cy } = $$props;
    	let { outerRadius } = $$props;
    	let { index } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (cx === undefined && !('cx' in $$props || $$self.$$.bound[$$self.$$.props['cx']])) {
    			console.warn("<OnePresidentUnitName> was created without expected prop 'cx'");
    		}

    		if (cy === undefined && !('cy' in $$props || $$self.$$.bound[$$self.$$.props['cy']])) {
    			console.warn("<OnePresidentUnitName> was created without expected prop 'cy'");
    		}

    		if (outerRadius === undefined && !('outerRadius' in $$props || $$self.$$.bound[$$self.$$.props['outerRadius']])) {
    			console.warn("<OnePresidentUnitName> was created without expected prop 'outerRadius'");
    		}

    		if (index === undefined && !('index' in $$props || $$self.$$.bound[$$self.$$.props['index']])) {
    			console.warn("<OnePresidentUnitName> was created without expected prop 'index'");
    		}
    	});

    	const writable_props = ['cx', 'cy', 'outerRadius', 'index'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<OnePresidentUnitName> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('cx' in $$props) $$invalidate(0, cx = $$props.cx);
    		if ('cy' in $$props) $$invalidate(1, cy = $$props.cy);
    		if ('outerRadius' in $$props) $$invalidate(2, outerRadius = $$props.outerRadius);
    		if ('index' in $$props) $$invalidate(3, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({
    		presidents,
    		cx,
    		cy,
    		outerRadius,
    		index,
    		$presidents
    	});

    	$$self.$inject_state = $$props => {
    		if ('cx' in $$props) $$invalidate(0, cx = $$props.cx);
    		if ('cy' in $$props) $$invalidate(1, cy = $$props.cy);
    		if ('outerRadius' in $$props) $$invalidate(2, outerRadius = $$props.outerRadius);
    		if ('index' in $$props) $$invalidate(3, index = $$props.index);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cx, cy, outerRadius, index, $presidents];
    }

    class OnePresidentUnitName extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { cx: 0, cy: 1, outerRadius: 2, index: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OnePresidentUnitName",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get cx() {
    		throw new Error("<OnePresidentUnitName>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cx(value) {
    		throw new Error("<OnePresidentUnitName>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cy() {
    		throw new Error("<OnePresidentUnitName>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cy(value) {
    		throw new Error("<OnePresidentUnitName>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outerRadius() {
    		throw new Error("<OnePresidentUnitName>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outerRadius(value) {
    		throw new Error("<OnePresidentUnitName>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<OnePresidentUnitName>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<OnePresidentUnitName>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/OnePresidentUnitTimeline.svelte generated by Svelte v3.59.2 */
    const file$5 = "src/components/OnePresidentUnitTimeline.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    // (37:0) {#if hoveredBirthIndex === index}
    function create_if_block_6(ctx) {
    	let text_1;
    	let tspan0;
    	let t0;
    	let t1_value = /*$presidents*/ ctx[8][/*index*/ ctx[7]].parents + "";
    	let t1;
    	let tspan0_x_value;
    	let t2;
    	let tspan1;
    	let t3;
    	let t4_value = /*$presidents*/ ctx[8][/*index*/ ctx[7]].birthPlace + "";
    	let t4;
    	let tspan1_x_value;
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
    			attr_dev(tspan0, "x", tspan0_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4]);
    			attr_dev(tspan0, "dy", "0");
    			add_location(tspan0, file$5, 44, 4, 1047);
    			attr_dev(tspan1, "x", tspan1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4]);
    			attr_dev(tspan1, "dy", "15");
    			add_location(tspan1, file$5, 47, 4, 1143);
    			attr_dev(text_1, "x", text_1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4]);
    			attr_dev(text_1, "y", text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.5 + 25);
    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "font-size", "12px");
    			attr_dev(text_1, "fill", "black");
    			add_location(text_1, file$5, 37, 2, 909);
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
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$presidents, index*/ 384 && t1_value !== (t1_value = /*$presidents*/ ctx[8][/*index*/ ctx[7]].parents + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*cx, outerRadius*/ 20 && tspan0_x_value !== (tspan0_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4])) {
    				attr_dev(tspan0, "x", tspan0_x_value);
    			}

    			if (dirty & /*$presidents, index*/ 384 && t4_value !== (t4_value = /*$presidents*/ ctx[8][/*index*/ ctx[7]].birthPlace + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*cx, outerRadius*/ 20 && tspan1_x_value !== (tspan1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4])) {
    				attr_dev(tspan1, "x", tspan1_x_value);
    			}

    			if (dirty & /*cx, outerRadius*/ 20 && text_1_x_value !== (text_1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4])) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 24 && text_1_y_value !== (text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.5 + 25)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(37:0) {#if hoveredBirthIndex === index}",
    		ctx
    	});

    	return block;
    }

    // (55:0) {#if $presidents[index].status === "dead"}
    function create_if_block_5(ctx) {
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", circle_cx_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[4]);
    			attr_dev(circle, "cy", circle_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.5);
    			attr_dev(circle, "r", "4");
    			attr_dev(circle, "fill", "black");
    			add_location(circle, file$5, 55, 2, 1350);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(circle, "mouseover", /*mouseover_handler_1*/ ctx[14], false, false, false, false),
    					listen_dev(circle, "mouseout", /*mouseout_handler_1*/ ctx[15], false, false, false, false),
    					listen_dev(circle, "focus", /*focus_handler_1*/ ctx[16], false, false, false, false),
    					listen_dev(circle, "blur", /*blur_handler_1*/ ctx[17], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cx, outerRadius*/ 20 && circle_cx_value !== (circle_cx_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[4])) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 24 && circle_cy_value !== (circle_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.5)) {
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
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(55:0) {#if $presidents[index].status === \\\"dead\\\"}",
    		ctx
    	});

    	return block;
    }

    // (106:0) {:else}
    function create_else_block(ctx) {
    	let line;
    	let line_x__value;
    	let line_y__value;
    	let line_x__value_1;
    	let line_y__value_1;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "x1", line_x__value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[4]);
    			attr_dev(line, "y1", line_y__value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.45);
    			attr_dev(line, "x2", line_x__value_1 = /*cx*/ ctx[2] + /*outerRadius*/ ctx[4]);
    			attr_dev(line, "y2", line_y__value_1 = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.55);
    			attr_dev(line, "stroke", "black");
    			attr_dev(line, "stroke-width", "3px");
    			add_location(line, file$5, 106, 2, 2675);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cx, outerRadius*/ 20 && line_x__value !== (line_x__value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[4])) {
    				attr_dev(line, "x1", line_x__value);
    			}

    			if (dirty & /*cy, outerRadius*/ 24 && line_y__value !== (line_y__value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.45)) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*cx, outerRadius*/ 20 && line_x__value_1 !== (line_x__value_1 = /*cx*/ ctx[2] + /*outerRadius*/ ctx[4])) {
    				attr_dev(line, "x2", line_x__value_1);
    			}

    			if (dirty & /*cy, outerRadius*/ 24 && line_y__value_1 !== (line_y__value_1 = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.55)) {
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
    		source: "(106:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (68:0) {#if $presidents[index].status === "dead"}
    function create_if_block_3(ctx) {
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;
    	let t0;
    	let t1;
    	let text_1;
    	let t2_value = /*$presidents*/ ctx[8][/*index*/ ctx[7]].deathYear + "";
    	let t2;
    	let text_1_x_value;
    	let text_1_y_value;
    	let mounted;
    	let dispose;
    	let if_block = /*hoveredDeathIndex*/ ctx[1] === /*index*/ ctx[7] && create_if_block_4(ctx);

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			text_1 = svg_element("text");
    			t2 = text(t2_value);
    			attr_dev(circle, "cx", circle_cx_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[4]);
    			attr_dev(circle, "cy", circle_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.5);
    			attr_dev(circle, "r", "4");
    			attr_dev(circle, "fill", "black");
    			add_location(circle, file$5, 68, 2, 1700);
    			attr_dev(text_1, "x", text_1_x_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[4] + 10);
    			attr_dev(text_1, "y", text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.5 + 5);
    			attr_dev(text_1, "text-anchor", "start");
    			attr_dev(text_1, "font-size", "0.9rem");
    			attr_dev(text_1, "fill", "black");
    			add_location(text_1, file$5, 96, 2, 2481);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(circle, "mouseover", /*mouseover_handler_2*/ ctx[18], false, false, false, false),
    					listen_dev(circle, "mouseout", /*mouseout_handler_2*/ ctx[19], false, false, false, false),
    					listen_dev(circle, "focus", /*focus_handler_2*/ ctx[20], false, false, false, false),
    					listen_dev(circle, "blur", /*blur_handler_2*/ ctx[21], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cx, outerRadius*/ 20 && circle_cx_value !== (circle_cx_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[4])) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 24 && circle_cy_value !== (circle_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.5)) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (/*hoveredDeathIndex*/ ctx[1] === /*index*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_4(ctx);
    					if_block.c();
    					if_block.m(t1.parentNode, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$presidents, index*/ 384 && t2_value !== (t2_value = /*$presidents*/ ctx[8][/*index*/ ctx[7]].deathYear + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*cx, outerRadius*/ 20 && text_1_x_value !== (text_1_x_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[4] + 10)) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 24 && text_1_y_value !== (text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.5 + 5)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    			if (detaching) detach_dev(t0);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(text_1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(68:0) {#if $presidents[index].status === \\\"dead\\\"}",
    		ctx
    	});

    	return block;
    }

    // (81:2) {#if hoveredDeathIndex === index}
    function create_if_block_4(ctx) {
    	let text_1;
    	let tspan0;
    	let t0;
    	let t1_value = /*$presidents*/ ctx[8][/*index*/ ctx[7]].deathPlace + "";
    	let t1;
    	let tspan0_x_value;
    	let t2;
    	let tspan1;
    	let t3;
    	let t4_value = /*$presidents*/ ctx[8][/*index*/ ctx[7]].deathReason + "";
    	let t4;
    	let tspan1_x_value;
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
    			attr_dev(tspan0, "x", tspan0_x_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[4]);
    			attr_dev(tspan0, "dy", "0");
    			add_location(tspan0, file$5, 88, 6, 2257);
    			attr_dev(tspan1, "x", tspan1_x_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[4]);
    			attr_dev(tspan1, "dy", "15");
    			add_location(tspan1, file$5, 91, 6, 2362);
    			attr_dev(text_1, "x", text_1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4]);
    			attr_dev(text_1, "y", text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.5 + 25);
    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "font-size", "12px");
    			attr_dev(text_1, "fill", "black");
    			add_location(text_1, file$5, 81, 4, 2105);
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
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$presidents, index*/ 384 && t1_value !== (t1_value = /*$presidents*/ ctx[8][/*index*/ ctx[7]].deathPlace + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*cx, outerRadius*/ 20 && tspan0_x_value !== (tspan0_x_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[4])) {
    				attr_dev(tspan0, "x", tspan0_x_value);
    			}

    			if (dirty & /*$presidents, index*/ 384 && t4_value !== (t4_value = /*$presidents*/ ctx[8][/*index*/ ctx[7]].deathReason + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*cx, outerRadius*/ 20 && tspan1_x_value !== (tspan1_x_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[4])) {
    				attr_dev(tspan1, "x", tspan1_x_value);
    			}

    			if (dirty & /*cx, outerRadius*/ 20 && text_1_x_value !== (text_1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4])) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 24 && text_1_y_value !== (text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.5 + 25)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(81:2) {#if hoveredDeathIndex === index}",
    		ctx
    	});

    	return block;
    }

    // (159:0) {#if $presidents[index].presidencyEnd !== "Current President"}
    function create_if_block_2(ctx) {
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;
    	let t0;
    	let text_1;
    	let t1_value = /*$presidents*/ ctx[8][/*index*/ ctx[7]].presidencyEnd + "";
    	let t1;
    	let text_1_x_value;
    	let text_1_y_value;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			t0 = space();
    			text_1 = svg_element("text");
    			t1 = text(t1_value);

    			attr_dev(circle, "cx", circle_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4] + (/*$presidents*/ ctx[8][/*index*/ ctx[7]].presidencyEnd - /*$presidents*/ ctx[8][/*index*/ ctx[7]].birthYear) / ((/*$presidents*/ ctx[8][/*index*/ ctx[7]].deathYear === ""
    			? 2025
    			: /*$presidents*/ ctx[8][/*index*/ ctx[7]].deathYear) - /*$presidents*/ ctx[8][/*index*/ ctx[7]].birthYear) * (2 * /*outerRadius*/ ctx[4]));

    			attr_dev(circle, "cy", circle_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.5);
    			attr_dev(circle, "r", "4");
    			attr_dev(circle, "fill", "teal");
    			add_location(circle, file$5, 159, 2, 3943);

    			attr_dev(text_1, "x", text_1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4] + (/*$presidents*/ ctx[8][/*index*/ ctx[7]].presidencyEnd - /*$presidents*/ ctx[8][/*index*/ ctx[7]].birthYear) / ((/*$presidents*/ ctx[8][/*index*/ ctx[7]].deathYear === ""
    			? 2025
    			: /*$presidents*/ ctx[8][/*index*/ ctx[7]].deathYear) - /*$presidents*/ ctx[8][/*index*/ ctx[7]].birthYear) * (2 * /*outerRadius*/ ctx[4]));

    			attr_dev(text_1, "y", text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.7);
    			attr_dev(text_1, "text-anchor", "start");
    			attr_dev(text_1, "font-size", "0.9rem");
    			add_location(text_1, file$5, 172, 2, 4301);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cx, outerRadius, $presidents, index*/ 404 && circle_cx_value !== (circle_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4] + (/*$presidents*/ ctx[8][/*index*/ ctx[7]].presidencyEnd - /*$presidents*/ ctx[8][/*index*/ ctx[7]].birthYear) / ((/*$presidents*/ ctx[8][/*index*/ ctx[7]].deathYear === ""
    			? 2025
    			: /*$presidents*/ ctx[8][/*index*/ ctx[7]].deathYear) - /*$presidents*/ ctx[8][/*index*/ ctx[7]].birthYear) * (2 * /*outerRadius*/ ctx[4]))) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 24 && circle_cy_value !== (circle_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.5)) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (dirty & /*$presidents, index*/ 384 && t1_value !== (t1_value = /*$presidents*/ ctx[8][/*index*/ ctx[7]].presidencyEnd + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*cx, outerRadius, $presidents, index*/ 404 && text_1_x_value !== (text_1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4] + (/*$presidents*/ ctx[8][/*index*/ ctx[7]].presidencyEnd - /*$presidents*/ ctx[8][/*index*/ ctx[7]].birthYear) / ((/*$presidents*/ ctx[8][/*index*/ ctx[7]].deathYear === ""
    			? 2025
    			: /*$presidents*/ ctx[8][/*index*/ ctx[7]].deathYear) - /*$presidents*/ ctx[8][/*index*/ ctx[7]].birthYear) * (2 * /*outerRadius*/ ctx[4]))) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 24 && text_1_y_value !== (text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.7)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(159:0) {#if $presidents[index].presidencyEnd !== \\\"Current President\\\"}",
    		ctx
    	});

    	return block;
    }

    // (189:0) {#if $presidents[$selectedCircleId] || $presidents[$selectedCircleId]?.otherPresidents.includes($presidents[index].name)}
    function create_if_block$1(ctx) {
    	let foreignObject;
    	let div;
    	let div_id_value;
    	let foreignObject_x_value;
    	let foreignObject_y_value;
    	let foreignObject_width_value;
    	let each_value = /*$presidents*/ ctx[8][/*$selectedCircleId*/ ctx[9]]?.otherPresidentThings;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			foreignObject = svg_element("foreignObject");
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "id", div_id_value = "president-" + /*index*/ ctx[7] + "-Quote");
    			set_style(div, "text-align", "center");
    			set_style(div, "font-size", "0.75rem");
    			add_location(div, file$5, 195, 4, 5007);
    			attr_dev(foreignObject, "x", foreignObject_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4]);
    			attr_dev(foreignObject, "y", foreignObject_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.6);
    			attr_dev(foreignObject, "width", foreignObject_width_value = /*outerRadius*/ ctx[4] * 2.4);
    			attr_dev(foreignObject, "height", "90");
    			add_location(foreignObject, file$5, 189, 2, 4882);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, foreignObject, anchor);
    			append_dev(foreignObject, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$presidents, $selectedCircleId, index*/ 896) {
    				each_value = /*$presidents*/ ctx[8][/*$selectedCircleId*/ ctx[9]]?.otherPresidentThings;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*index*/ 128 && div_id_value !== (div_id_value = "president-" + /*index*/ ctx[7] + "-Quote")) {
    				attr_dev(div, "id", div_id_value);
    			}

    			if (dirty & /*cx, outerRadius*/ 20 && foreignObject_x_value !== (foreignObject_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4])) {
    				attr_dev(foreignObject, "x", foreignObject_x_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 24 && foreignObject_y_value !== (foreignObject_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.6)) {
    				attr_dev(foreignObject, "y", foreignObject_y_value);
    			}

    			if (dirty & /*outerRadius*/ 16 && foreignObject_width_value !== (foreignObject_width_value = /*outerRadius*/ ctx[4] * 2.4)) {
    				attr_dev(foreignObject, "width", foreignObject_width_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(foreignObject);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(189:0) {#if $presidents[$selectedCircleId] || $presidents[$selectedCircleId]?.otherPresidents.includes($presidents[index].name)}",
    		ctx
    	});

    	return block;
    }

    // (201:8) {#if obj[$presidents[index].name]}
    function create_if_block_1$1(ctx) {
    	let t_value = /*obj*/ ctx[22][/*$presidents*/ ctx[8][/*index*/ ctx[7]].name] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$presidents, $selectedCircleId, index*/ 896 && t_value !== (t_value = /*obj*/ ctx[22][/*$presidents*/ ctx[8][/*index*/ ctx[7]].name] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(201:8) {#if obj[$presidents[index].name]}",
    		ctx
    	});

    	return block;
    }

    // (200:6) {#each $presidents[$selectedCircleId]?.otherPresidentThings as obj}
    function create_each_block$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*obj*/ ctx[22][/*$presidents*/ ctx[8][/*index*/ ctx[7]].name] && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*obj*/ ctx[22][/*$presidents*/ ctx[8][/*index*/ ctx[7]].name]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(200:6) {#each $presidents[$selectedCircleId]?.otherPresidentThings as obj}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let line;
    	let line_x__value;
    	let line_y__value;
    	let line_x__value_1;
    	let line_y__value_1;
    	let t0;
    	let circle0;
    	let circle0_cx_value;
    	let circle0_cy_value;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let text0;
    	let t5_value = /*$presidents*/ ctx[8][/*index*/ ctx[7]].birthYear + "";
    	let t5;
    	let text0_x_value;
    	let text0_y_value;
    	let t6;
    	let circle1;
    	let circle1_cx_value;
    	let circle1_cy_value;
    	let t7;
    	let text1;
    	let t8_value = /*$presidents*/ ctx[8][/*index*/ ctx[7]].presidencyStart + "";
    	let t8;
    	let text1_x_value;
    	let text1_y_value;
    	let t9;
    	let t10;
    	let show_if = /*$presidents*/ ctx[8][/*$selectedCircleId*/ ctx[9]] || /*$presidents*/ ctx[8][/*$selectedCircleId*/ ctx[9]]?.otherPresidents.includes(/*$presidents*/ ctx[8][/*index*/ ctx[7]].name);
    	let if_block4_anchor;
    	let mounted;
    	let dispose;
    	let if_block0 = /*hoveredBirthIndex*/ ctx[0] === /*index*/ ctx[7] && create_if_block_6(ctx);
    	let if_block1 = /*$presidents*/ ctx[8][/*index*/ ctx[7]].status === "dead" && create_if_block_5(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*$presidents*/ ctx[8][/*index*/ ctx[7]].status === "dead") return create_if_block_3;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block2 = current_block_type(ctx);
    	let if_block3 = /*$presidents*/ ctx[8][/*index*/ ctx[7]].presidencyEnd !== "Current President" && create_if_block_2(ctx);
    	let if_block4 = show_if && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			t0 = space();
    			circle0 = svg_element("circle");
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if_block2.c();
    			t4 = space();
    			text0 = svg_element("text");
    			t5 = text(t5_value);
    			t6 = space();
    			circle1 = svg_element("circle");
    			t7 = space();
    			text1 = svg_element("text");
    			t8 = text(t8_value);
    			t9 = space();
    			if (if_block3) if_block3.c();
    			t10 = space();
    			if (if_block4) if_block4.c();
    			if_block4_anchor = empty();
    			attr_dev(line, "x1", line_x__value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4]);
    			attr_dev(line, "y1", line_y__value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.5);
    			attr_dev(line, "x2", line_x__value_1 = /*cx*/ ctx[2] + /*outerRadius*/ ctx[4]);
    			attr_dev(line, "y2", line_y__value_1 = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.5);
    			attr_dev(line, "stroke", /*stroke*/ ctx[5]);
    			attr_dev(line, "stroke-width", /*strokeWidth*/ ctx[6]);
    			add_location(line, file$5, 14, 0, 359);
    			attr_dev(circle0, "cx", circle0_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4]);
    			attr_dev(circle0, "cy", circle0_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.5);
    			attr_dev(circle0, "r", "4");
    			attr_dev(circle0, "fill", "black");
    			add_location(circle0, file$5, 24, 0, 551);
    			attr_dev(text0, "x", text0_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4] - 10);
    			attr_dev(text0, "y", text0_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.5 + 5);
    			attr_dev(text0, "text-anchor", "end");
    			attr_dev(text0, "font-size", "0.9rem");
    			attr_dev(text0, "fill", "black");
    			add_location(text0, file$5, 117, 0, 2884);

    			attr_dev(circle1, "cx", circle1_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4] + (/*$presidents*/ ctx[8][/*index*/ ctx[7]].presidencyStart - /*$presidents*/ ctx[8][/*index*/ ctx[7]].birthYear) / ((/*$presidents*/ ctx[8][/*index*/ ctx[7]].deathYear === ""
    			? 2025
    			: /*$presidents*/ ctx[8][/*index*/ ctx[7]].deathYear) - /*$presidents*/ ctx[8][/*index*/ ctx[7]].birthYear) * (2 * /*outerRadius*/ ctx[4]));

    			attr_dev(circle1, "cy", circle1_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.5);
    			attr_dev(circle1, "r", "4");
    			attr_dev(circle1, "fill", "teal");
    			add_location(circle1, file$5, 128, 0, 3084);

    			attr_dev(text1, "x", text1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4] + (/*$presidents*/ ctx[8][/*index*/ ctx[7]].presidencyStart - /*$presidents*/ ctx[8][/*index*/ ctx[7]].birthYear) / ((/*$presidents*/ ctx[8][/*index*/ ctx[7]].deathYear === ""
    			? 2025
    			: /*$presidents*/ ctx[8][/*index*/ ctx[7]].deathYear) - /*$presidents*/ ctx[8][/*index*/ ctx[7]].birthYear) * (2 * /*outerRadius*/ ctx[4]));

    			attr_dev(text1, "y", text1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.7);
    			attr_dev(text1, "text-anchor", "end");
    			attr_dev(text1, "font-size", "0.9rem");
    			add_location(text1, file$5, 143, 0, 3455);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, circle0, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if_block2.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, text0, anchor);
    			append_dev(text0, t5);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, circle1, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, text1, anchor);
    			append_dev(text1, t8);
    			insert_dev(target, t9, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t10, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, if_block4_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(circle0, "mouseover", /*mouseover_handler*/ ctx[10], false, false, false, false),
    					listen_dev(circle0, "mouseout", /*mouseout_handler*/ ctx[11], false, false, false, false),
    					listen_dev(circle0, "focus", /*focus_handler*/ ctx[12], false, false, false, false),
    					listen_dev(circle0, "blur", /*blur_handler*/ ctx[13], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cx, outerRadius*/ 20 && line_x__value !== (line_x__value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4])) {
    				attr_dev(line, "x1", line_x__value);
    			}

    			if (dirty & /*cy, outerRadius*/ 24 && line_y__value !== (line_y__value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.5)) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*cx, outerRadius*/ 20 && line_x__value_1 !== (line_x__value_1 = /*cx*/ ctx[2] + /*outerRadius*/ ctx[4])) {
    				attr_dev(line, "x2", line_x__value_1);
    			}

    			if (dirty & /*cy, outerRadius*/ 24 && line_y__value_1 !== (line_y__value_1 = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.5)) {
    				attr_dev(line, "y2", line_y__value_1);
    			}

    			if (dirty & /*stroke*/ 32) {
    				attr_dev(line, "stroke", /*stroke*/ ctx[5]);
    			}

    			if (dirty & /*strokeWidth*/ 64) {
    				attr_dev(line, "stroke-width", /*strokeWidth*/ ctx[6]);
    			}

    			if (dirty & /*cx, outerRadius*/ 20 && circle0_cx_value !== (circle0_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4])) {
    				attr_dev(circle0, "cx", circle0_cx_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 24 && circle0_cy_value !== (circle0_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.5)) {
    				attr_dev(circle0, "cy", circle0_cy_value);
    			}

    			if (/*hoveredBirthIndex*/ ctx[0] === /*index*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$presidents*/ ctx[8][/*index*/ ctx[7]].status === "dead") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_5(ctx);
    					if_block1.c();
    					if_block1.m(t3.parentNode, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(t4.parentNode, t4);
    				}
    			}

    			if (dirty & /*$presidents, index*/ 384 && t5_value !== (t5_value = /*$presidents*/ ctx[8][/*index*/ ctx[7]].birthYear + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*cx, outerRadius*/ 20 && text0_x_value !== (text0_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4] - 10)) {
    				attr_dev(text0, "x", text0_x_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 24 && text0_y_value !== (text0_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.5 + 5)) {
    				attr_dev(text0, "y", text0_y_value);
    			}

    			if (dirty & /*cx, outerRadius, $presidents, index*/ 404 && circle1_cx_value !== (circle1_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4] + (/*$presidents*/ ctx[8][/*index*/ ctx[7]].presidencyStart - /*$presidents*/ ctx[8][/*index*/ ctx[7]].birthYear) / ((/*$presidents*/ ctx[8][/*index*/ ctx[7]].deathYear === ""
    			? 2025
    			: /*$presidents*/ ctx[8][/*index*/ ctx[7]].deathYear) - /*$presidents*/ ctx[8][/*index*/ ctx[7]].birthYear) * (2 * /*outerRadius*/ ctx[4]))) {
    				attr_dev(circle1, "cx", circle1_cx_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 24 && circle1_cy_value !== (circle1_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.5)) {
    				attr_dev(circle1, "cy", circle1_cy_value);
    			}

    			if (dirty & /*$presidents, index*/ 384 && t8_value !== (t8_value = /*$presidents*/ ctx[8][/*index*/ ctx[7]].presidencyStart + "")) set_data_dev(t8, t8_value);

    			if (dirty & /*cx, outerRadius, $presidents, index*/ 404 && text1_x_value !== (text1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[4] + (/*$presidents*/ ctx[8][/*index*/ ctx[7]].presidencyStart - /*$presidents*/ ctx[8][/*index*/ ctx[7]].birthYear) / ((/*$presidents*/ ctx[8][/*index*/ ctx[7]].deathYear === ""
    			? 2025
    			: /*$presidents*/ ctx[8][/*index*/ ctx[7]].deathYear) - /*$presidents*/ ctx[8][/*index*/ ctx[7]].birthYear) * (2 * /*outerRadius*/ ctx[4]))) {
    				attr_dev(text1, "x", text1_x_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 24 && text1_y_value !== (text1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[4] * 1.7)) {
    				attr_dev(text1, "y", text1_y_value);
    			}

    			if (/*$presidents*/ ctx[8][/*index*/ ctx[7]].presidencyEnd !== "Current President") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_2(ctx);
    					if_block3.c();
    					if_block3.m(t10.parentNode, t10);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (dirty & /*$presidents, $selectedCircleId, index*/ 896) show_if = /*$presidents*/ ctx[8][/*$selectedCircleId*/ ctx[9]] || /*$presidents*/ ctx[8][/*$selectedCircleId*/ ctx[9]]?.otherPresidents.includes(/*$presidents*/ ctx[8][/*index*/ ctx[7]].name);

    			if (show_if) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block$1(ctx);
    					if_block4.c();
    					if_block4.m(if_block4_anchor.parentNode, if_block4_anchor);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(circle0);
    			if (detaching) detach_dev(t1);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t3);
    			if_block2.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(text0);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(circle1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(text1);
    			if (detaching) detach_dev(t9);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t10);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(if_block4_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $presidents;
    	let $selectedCircleId;
    	validate_store(presidents, 'presidents');
    	component_subscribe($$self, presidents, $$value => $$invalidate(8, $presidents = $$value));
    	validate_store(selectedCircleId, 'selectedCircleId');
    	component_subscribe($$self, selectedCircleId, $$value => $$invalidate(9, $selectedCircleId = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('OnePresidentUnitTimeline', slots, []);
    	let { cx } = $$props;
    	let { cy } = $$props;
    	let { outerRadius } = $$props;
    	let { stroke } = $$props;
    	let { strokeWidth } = $$props;
    	let { index } = $$props;
    	let { hoveredBirthIndex = null } = $$props;
    	let { hoveredDeathIndex = null } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (cx === undefined && !('cx' in $$props || $$self.$$.bound[$$self.$$.props['cx']])) {
    			console.warn("<OnePresidentUnitTimeline> was created without expected prop 'cx'");
    		}

    		if (cy === undefined && !('cy' in $$props || $$self.$$.bound[$$self.$$.props['cy']])) {
    			console.warn("<OnePresidentUnitTimeline> was created without expected prop 'cy'");
    		}

    		if (outerRadius === undefined && !('outerRadius' in $$props || $$self.$$.bound[$$self.$$.props['outerRadius']])) {
    			console.warn("<OnePresidentUnitTimeline> was created without expected prop 'outerRadius'");
    		}

    		if (stroke === undefined && !('stroke' in $$props || $$self.$$.bound[$$self.$$.props['stroke']])) {
    			console.warn("<OnePresidentUnitTimeline> was created without expected prop 'stroke'");
    		}

    		if (strokeWidth === undefined && !('strokeWidth' in $$props || $$self.$$.bound[$$self.$$.props['strokeWidth']])) {
    			console.warn("<OnePresidentUnitTimeline> was created without expected prop 'strokeWidth'");
    		}

    		if (index === undefined && !('index' in $$props || $$self.$$.bound[$$self.$$.props['index']])) {
    			console.warn("<OnePresidentUnitTimeline> was created without expected prop 'index'");
    		}
    	});

    	const writable_props = [
    		'cx',
    		'cy',
    		'outerRadius',
    		'stroke',
    		'strokeWidth',
    		'index',
    		'hoveredBirthIndex',
    		'hoveredDeathIndex'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<OnePresidentUnitTimeline> was created with unknown prop '${key}'`);
    	});

    	const mouseover_handler = () => $$invalidate(0, hoveredBirthIndex = index);
    	const mouseout_handler = () => $$invalidate(0, hoveredBirthIndex = null);
    	const focus_handler = () => $$invalidate(0, hoveredBirthIndex = index);
    	const blur_handler = () => $$invalidate(0, hoveredBirthIndex = null);
    	const mouseover_handler_1 = () => $$invalidate(1, hoveredDeathIndex = index);
    	const mouseout_handler_1 = () => $$invalidate(1, hoveredDeathIndex = null);
    	const focus_handler_1 = () => $$invalidate(1, hoveredDeathIndex = index);
    	const blur_handler_1 = () => $$invalidate(1, hoveredDeathIndex = null);
    	const mouseover_handler_2 = () => $$invalidate(1, hoveredDeathIndex = index);
    	const mouseout_handler_2 = () => $$invalidate(1, hoveredDeathIndex = null);
    	const focus_handler_2 = () => $$invalidate(1, hoveredDeathIndex = index);
    	const blur_handler_2 = () => $$invalidate(1, hoveredDeathIndex = null);

    	$$self.$$set = $$props => {
    		if ('cx' in $$props) $$invalidate(2, cx = $$props.cx);
    		if ('cy' in $$props) $$invalidate(3, cy = $$props.cy);
    		if ('outerRadius' in $$props) $$invalidate(4, outerRadius = $$props.outerRadius);
    		if ('stroke' in $$props) $$invalidate(5, stroke = $$props.stroke);
    		if ('strokeWidth' in $$props) $$invalidate(6, strokeWidth = $$props.strokeWidth);
    		if ('index' in $$props) $$invalidate(7, index = $$props.index);
    		if ('hoveredBirthIndex' in $$props) $$invalidate(0, hoveredBirthIndex = $$props.hoveredBirthIndex);
    		if ('hoveredDeathIndex' in $$props) $$invalidate(1, hoveredDeathIndex = $$props.hoveredDeathIndex);
    	};

    	$$self.$capture_state = () => ({
    		presidents,
    		selectedCircleId,
    		cx,
    		cy,
    		outerRadius,
    		stroke,
    		strokeWidth,
    		index,
    		hoveredBirthIndex,
    		hoveredDeathIndex,
    		$presidents,
    		$selectedCircleId
    	});

    	$$self.$inject_state = $$props => {
    		if ('cx' in $$props) $$invalidate(2, cx = $$props.cx);
    		if ('cy' in $$props) $$invalidate(3, cy = $$props.cy);
    		if ('outerRadius' in $$props) $$invalidate(4, outerRadius = $$props.outerRadius);
    		if ('stroke' in $$props) $$invalidate(5, stroke = $$props.stroke);
    		if ('strokeWidth' in $$props) $$invalidate(6, strokeWidth = $$props.strokeWidth);
    		if ('index' in $$props) $$invalidate(7, index = $$props.index);
    		if ('hoveredBirthIndex' in $$props) $$invalidate(0, hoveredBirthIndex = $$props.hoveredBirthIndex);
    		if ('hoveredDeathIndex' in $$props) $$invalidate(1, hoveredDeathIndex = $$props.hoveredDeathIndex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		hoveredBirthIndex,
    		hoveredDeathIndex,
    		cx,
    		cy,
    		outerRadius,
    		stroke,
    		strokeWidth,
    		index,
    		$presidents,
    		$selectedCircleId,
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

    class OnePresidentUnitTimeline extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			cx: 2,
    			cy: 3,
    			outerRadius: 4,
    			stroke: 5,
    			strokeWidth: 6,
    			index: 7,
    			hoveredBirthIndex: 0,
    			hoveredDeathIndex: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OnePresidentUnitTimeline",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get cx() {
    		throw new Error("<OnePresidentUnitTimeline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cx(value) {
    		throw new Error("<OnePresidentUnitTimeline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cy() {
    		throw new Error("<OnePresidentUnitTimeline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cy(value) {
    		throw new Error("<OnePresidentUnitTimeline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outerRadius() {
    		throw new Error("<OnePresidentUnitTimeline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outerRadius(value) {
    		throw new Error("<OnePresidentUnitTimeline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stroke() {
    		throw new Error("<OnePresidentUnitTimeline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stroke(value) {
    		throw new Error("<OnePresidentUnitTimeline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get strokeWidth() {
    		throw new Error("<OnePresidentUnitTimeline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set strokeWidth(value) {
    		throw new Error("<OnePresidentUnitTimeline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<OnePresidentUnitTimeline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<OnePresidentUnitTimeline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoveredBirthIndex() {
    		throw new Error("<OnePresidentUnitTimeline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hoveredBirthIndex(value) {
    		throw new Error("<OnePresidentUnitTimeline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoveredDeathIndex() {
    		throw new Error("<OnePresidentUnitTimeline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hoveredDeathIndex(value) {
    		throw new Error("<OnePresidentUnitTimeline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/onePresidentUnit.svelte generated by Svelte v3.59.2 */
    const file$4 = "src/components/onePresidentUnit.svelte";

    function create_fragment$4(ctx) {
    	let g;
    	let onepresidentunitmaincircle;
    	let onepresidentunittimeline;
    	let onepresidentunitname;
    	let g_class_value;
    	let g_opacity_value;
    	let current;

    	onepresidentunitmaincircle = new OnePresidentUnitMainCircle({
    			props: {
    				cx: /*cx*/ ctx[0],
    				cy: /*cy*/ ctx[1],
    				innerRadius: /*innerRadius*/ ctx[2],
    				outerRadius: /*outerRadius*/ ctx[3],
    				stroke: /*stroke*/ ctx[4],
    				strokeWidth: /*strokeWidth*/ ctx[5],
    				fill: /*fill*/ ctx[6],
    				index: /*index*/ ctx[7]
    			},
    			$$inline: true
    		});

    	onepresidentunittimeline = new OnePresidentUnitTimeline({
    			props: {
    				cx: /*cx*/ ctx[0],
    				cy: /*cy*/ ctx[1],
    				outerRadius: /*outerRadius*/ ctx[3],
    				stroke: /*stroke*/ ctx[4],
    				strokeWidth: /*strokeWidth*/ ctx[5],
    				index: /*index*/ ctx[7],
    				hoveredBirthIndex: /*hoveredBirthIndex*/ ctx[8],
    				hoveredDeathIndex: /*hoveredDeathIndex*/ ctx[9]
    			},
    			$$inline: true
    		});

    	onepresidentunitname = new OnePresidentUnitName({
    			props: {
    				cx: /*cx*/ ctx[0],
    				cy: /*cy*/ ctx[1],
    				outerRadius: /*outerRadius*/ ctx[3],
    				index: /*index*/ ctx[7]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			create_component(onepresidentunitmaincircle.$$.fragment);
    			create_component(onepresidentunittimeline.$$.fragment);
    			create_component(onepresidentunitname.$$.fragment);
    			attr_dev(g, "class", g_class_value = "circle-" + /*index*/ ctx[7]);

    			attr_dev(g, "opacity", g_opacity_value = `circle-${/*$selectedCircleId*/ ctx[10]}` === "circle-null" || `circle-${/*$selectedCircleId*/ ctx[10]}` === "circle-" + /*index*/ ctx[7] || /*$presidents*/ ctx[11][/*$selectedCircleId*/ ctx[10]]?.otherPresidents.includes(/*$presidents*/ ctx[11][/*index*/ ctx[7]].name)
    			? 1
    			: 0.4);

    			add_location(g, file$4, 19, 0, 628);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			mount_component(onepresidentunitmaincircle, g, null);
    			mount_component(onepresidentunittimeline, g, null);
    			mount_component(onepresidentunitname, g, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const onepresidentunitmaincircle_changes = {};
    			if (dirty & /*cx*/ 1) onepresidentunitmaincircle_changes.cx = /*cx*/ ctx[0];
    			if (dirty & /*cy*/ 2) onepresidentunitmaincircle_changes.cy = /*cy*/ ctx[1];
    			if (dirty & /*innerRadius*/ 4) onepresidentunitmaincircle_changes.innerRadius = /*innerRadius*/ ctx[2];
    			if (dirty & /*outerRadius*/ 8) onepresidentunitmaincircle_changes.outerRadius = /*outerRadius*/ ctx[3];
    			if (dirty & /*stroke*/ 16) onepresidentunitmaincircle_changes.stroke = /*stroke*/ ctx[4];
    			if (dirty & /*strokeWidth*/ 32) onepresidentunitmaincircle_changes.strokeWidth = /*strokeWidth*/ ctx[5];
    			if (dirty & /*fill*/ 64) onepresidentunitmaincircle_changes.fill = /*fill*/ ctx[6];
    			if (dirty & /*index*/ 128) onepresidentunitmaincircle_changes.index = /*index*/ ctx[7];
    			onepresidentunitmaincircle.$set(onepresidentunitmaincircle_changes);
    			const onepresidentunittimeline_changes = {};
    			if (dirty & /*cx*/ 1) onepresidentunittimeline_changes.cx = /*cx*/ ctx[0];
    			if (dirty & /*cy*/ 2) onepresidentunittimeline_changes.cy = /*cy*/ ctx[1];
    			if (dirty & /*outerRadius*/ 8) onepresidentunittimeline_changes.outerRadius = /*outerRadius*/ ctx[3];
    			if (dirty & /*stroke*/ 16) onepresidentunittimeline_changes.stroke = /*stroke*/ ctx[4];
    			if (dirty & /*strokeWidth*/ 32) onepresidentunittimeline_changes.strokeWidth = /*strokeWidth*/ ctx[5];
    			if (dirty & /*index*/ 128) onepresidentunittimeline_changes.index = /*index*/ ctx[7];
    			if (dirty & /*hoveredBirthIndex*/ 256) onepresidentunittimeline_changes.hoveredBirthIndex = /*hoveredBirthIndex*/ ctx[8];
    			if (dirty & /*hoveredDeathIndex*/ 512) onepresidentunittimeline_changes.hoveredDeathIndex = /*hoveredDeathIndex*/ ctx[9];
    			onepresidentunittimeline.$set(onepresidentunittimeline_changes);
    			const onepresidentunitname_changes = {};
    			if (dirty & /*cx*/ 1) onepresidentunitname_changes.cx = /*cx*/ ctx[0];
    			if (dirty & /*cy*/ 2) onepresidentunitname_changes.cy = /*cy*/ ctx[1];
    			if (dirty & /*outerRadius*/ 8) onepresidentunitname_changes.outerRadius = /*outerRadius*/ ctx[3];
    			if (dirty & /*index*/ 128) onepresidentunitname_changes.index = /*index*/ ctx[7];
    			onepresidentunitname.$set(onepresidentunitname_changes);

    			if (!current || dirty & /*index*/ 128 && g_class_value !== (g_class_value = "circle-" + /*index*/ ctx[7])) {
    				attr_dev(g, "class", g_class_value);
    			}

    			if (!current || dirty & /*$selectedCircleId, index, $presidents*/ 3200 && g_opacity_value !== (g_opacity_value = `circle-${/*$selectedCircleId*/ ctx[10]}` === "circle-null" || `circle-${/*$selectedCircleId*/ ctx[10]}` === "circle-" + /*index*/ ctx[7] || /*$presidents*/ ctx[11][/*$selectedCircleId*/ ctx[10]]?.otherPresidents.includes(/*$presidents*/ ctx[11][/*index*/ ctx[7]].name)
    			? 1
    			: 0.4)) {
    				attr_dev(g, "opacity", g_opacity_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(onepresidentunitmaincircle.$$.fragment, local);
    			transition_in(onepresidentunittimeline.$$.fragment, local);
    			transition_in(onepresidentunitname.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(onepresidentunitmaincircle.$$.fragment, local);
    			transition_out(onepresidentunittimeline.$$.fragment, local);
    			transition_out(onepresidentunitname.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_component(onepresidentunitmaincircle);
    			destroy_component(onepresidentunittimeline);
    			destroy_component(onepresidentunitname);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $selectedCircleId;
    	let $presidents;
    	validate_store(selectedCircleId, 'selectedCircleId');
    	component_subscribe($$self, selectedCircleId, $$value => $$invalidate(10, $selectedCircleId = $$value));
    	validate_store(presidents, 'presidents');
    	component_subscribe($$self, presidents, $$value => $$invalidate(11, $presidents = $$value));
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

    	$$self.$$set = $$props => {
    		if ('cx' in $$props) $$invalidate(0, cx = $$props.cx);
    		if ('cy' in $$props) $$invalidate(1, cy = $$props.cy);
    		if ('innerRadius' in $$props) $$invalidate(2, innerRadius = $$props.innerRadius);
    		if ('outerRadius' in $$props) $$invalidate(3, outerRadius = $$props.outerRadius);
    		if ('stroke' in $$props) $$invalidate(4, stroke = $$props.stroke);
    		if ('strokeWidth' in $$props) $$invalidate(5, strokeWidth = $$props.strokeWidth);
    		if ('fill' in $$props) $$invalidate(6, fill = $$props.fill);
    		if ('index' in $$props) $$invalidate(7, index = $$props.index);
    		if ('hoveredBirthIndex' in $$props) $$invalidate(8, hoveredBirthIndex = $$props.hoveredBirthIndex);
    		if ('hoveredDeathIndex' in $$props) $$invalidate(9, hoveredDeathIndex = $$props.hoveredDeathIndex);
    	};

    	$$self.$capture_state = () => ({
    		OnePresidentUnitMainCircle,
    		OnePresidentUnitName,
    		OnePresidentUnitTimeline,
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
    		$selectedCircleId,
    		$presidents
    	});

    	$$self.$inject_state = $$props => {
    		if ('cx' in $$props) $$invalidate(0, cx = $$props.cx);
    		if ('cy' in $$props) $$invalidate(1, cy = $$props.cy);
    		if ('innerRadius' in $$props) $$invalidate(2, innerRadius = $$props.innerRadius);
    		if ('outerRadius' in $$props) $$invalidate(3, outerRadius = $$props.outerRadius);
    		if ('stroke' in $$props) $$invalidate(4, stroke = $$props.stroke);
    		if ('strokeWidth' in $$props) $$invalidate(5, strokeWidth = $$props.strokeWidth);
    		if ('fill' in $$props) $$invalidate(6, fill = $$props.fill);
    		if ('index' in $$props) $$invalidate(7, index = $$props.index);
    		if ('hoveredBirthIndex' in $$props) $$invalidate(8, hoveredBirthIndex = $$props.hoveredBirthIndex);
    		if ('hoveredDeathIndex' in $$props) $$invalidate(9, hoveredDeathIndex = $$props.hoveredDeathIndex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
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
    		$selectedCircleId,
    		$presidents
    	];
    }

    class OnePresidentUnit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			cx: 0,
    			cy: 1,
    			innerRadius: 2,
    			outerRadius: 3,
    			stroke: 4,
    			strokeWidth: 5,
    			fill: 6,
    			index: 7,
    			hoveredBirthIndex: 8,
    			hoveredDeathIndex: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OnePresidentUnit",
    			options,
    			id: create_fragment$4.name
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

    const { console: console_1$2 } = globals;
    const file$3 = "src/components/Svg.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (144:6) {#each positions as position, index}
    function create_each_block$1(ctx) {
    	let onepresidentunit;
    	let current;

    	function presidentClick_handler() {
    		return /*presidentClick_handler*/ ctx[11](/*index*/ ctx[16]);
    	}

    	onepresidentunit = new OnePresidentUnit({
    			props: {
    				cx: /*position*/ ctx[14].cx,
    				cy: /*position*/ ctx[14].cy,
    				innerRadius: /*$innerRadius*/ ctx[4],
    				outerRadius: /*$outerRadius*/ ctx[0],
    				index: /*index*/ ctx[16]
    			},
    			$$inline: true
    		});

    	onepresidentunit.$on("presidentClick", presidentClick_handler);

    	const block = {
    		c: function create() {
    			create_component(onepresidentunit.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(onepresidentunit, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const onepresidentunit_changes = {};
    			if (dirty & /*positions*/ 4) onepresidentunit_changes.cx = /*position*/ ctx[14].cx;
    			if (dirty & /*positions*/ 4) onepresidentunit_changes.cy = /*position*/ ctx[14].cy;
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
    		source: "(144:6) {#each positions as position, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div2;
    	let h1;
    	let t1;
    	let h4;
    	let t3;
    	let div0;
    	let p;
    	let t5;
    	let div1;
    	let svg;
    	let rect;
    	let text_1;
    	let t6;
    	let image;
    	let current;
    	let mounted;
    	let dispose;
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
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "A Journey Through the U.S. Presidency";
    			t1 = space();
    			h4 = element("h4");
    			h4.textContent = "Vaishali Verma";
    			t3 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "This interactive timeline traces the arc of American leadership — from the\n      birth of the republic to the present day. Each circle represents a\n      president, positioned by time and shaped by history. Explore how each\n      leader shaped the nation through their key policies, personal journeys,\n      and pivotal moments. Hover or click to dive into their stories, view their\n      accomplishments, and reflect on how the presidency has evolved through\n      wars, reforms, and revolutions of thought. Whether you're revisiting the\n      founding fathers or examining modern leadership, this visualization\n      invites you to connect with the people behind the office — and the legacy\n      they leave behind.";
    			t5 = space();
    			div1 = element("div");
    			svg = svg_element("svg");
    			rect = svg_element("rect");
    			text_1 = svg_element("text");
    			t6 = text("How To Read This Timeline\n      ");
    			image = svg_element("image");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$3, 88, 2, 2275);
    			add_location(h4, file$3, 89, 2, 2324);
    			add_location(p, file$3, 93, 4, 2486);
    			set_style(div0, "width", /*$svgWidth*/ ctx[1] + "px");
    			set_style(div0, "margin", "0 auto");
    			set_style(div0, "line-height", "1.6");
    			set_style(div0, "text-align", "justify");
    			set_style(div0, "font-size", "1.1em");
    			set_style(div0, "font-weight", "400");
    			add_location(div0, file$3, 90, 2, 2350);
    			attr_dev(rect, "width", /*$svgWidth*/ ctx[1]);
    			attr_dev(rect, "height", /*$svgHeight*/ ctx[3]);
    			attr_dev(rect, "stroke", "black");
    			attr_dev(rect, "stroke-width", "3px");
    			attr_dev(rect, "fill", "none");
    			add_location(rect, file$3, 116, 6, 3475);
    			attr_dev(text_1, "x", "50%");
    			attr_dev(text_1, "y", "10");
    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "font-size", "1.2em");
    			attr_dev(text_1, "fill", "black");
    			attr_dev(text_1, "dy", "0.35em");
    			add_location(text_1, file$3, 123, 6, 3620);
    			attr_dev(image, "href", "/images/howToRead.svg");
    			attr_dev(image, "x", "50%");
    			attr_dev(image, "y", "30");
    			attr_dev(image, "width", "400");
    			attr_dev(image, "height", "400");
    			attr_dev(image, "transform", "translate(-200, 0)");
    			add_location(image, file$3, 134, 6, 3816);
    			attr_dev(svg, "width", /*$svgWidth*/ ctx[1]);
    			attr_dev(svg, "height", /*$svgHeight*/ ctx[3]);
    			attr_dev(svg, "tabindex", "0");
    			attr_dev(svg, "role", "button");
    			attr_dev(svg, "aria-label", "Presidential timeline");
    			add_location(svg, file$3, 107, 4, 3262);
    			attr_dev(div1, "id", "main-svg-div");
    			add_location(div1, file$3, 106, 2, 3234);
    			attr_dev(div2, "id", "introduction-div");
    			add_location(div2, file$3, 87, 0, 2245);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h1);
    			append_dev(div2, t1);
    			append_dev(div2, h4);
    			append_dev(div2, t3);
    			append_dev(div2, div0);
    			append_dev(div0, p);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, svg);
    			append_dev(svg, rect);
    			append_dev(svg, text_1);
    			append_dev(text_1, t6);
    			append_dev(svg, image);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(svg, null);
    				}
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*handleSvgClick*/ ctx[5], false, false, false, false),
    					listen_dev(svg, "keydown", /*handleSvgClick*/ ctx[5], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$svgWidth*/ 2) {
    				set_style(div0, "width", /*$svgWidth*/ ctx[1] + "px");
    			}

    			if (!current || dirty & /*$svgWidth*/ 2) {
    				attr_dev(rect, "width", /*$svgWidth*/ ctx[1]);
    			}

    			if (!current || dirty & /*$svgHeight*/ 8) {
    				attr_dev(rect, "height", /*$svgHeight*/ ctx[3]);
    			}

    			if (dirty & /*positions, $innerRadius, $outerRadius, handlePresidentClick*/ 21) {
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
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
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

    function handlePresidentClick(index) {
    	console.log("hello");
    }

    function instance$3($$self, $$props, $$invalidate) {
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
    	component_subscribe($$self, titleSpace, $$value => $$invalidate(6, $titleSpace = $$value));
    	validate_store(outerRadius, 'outerRadius');
    	component_subscribe($$self, outerRadius, $$value => $$invalidate(0, $outerRadius = $$value));
    	validate_store(rowSpacing, 'rowSpacing');
    	component_subscribe($$self, rowSpacing, $$value => $$invalidate(7, $rowSpacing = $$value));
    	validate_store(circleSpacing, 'circleSpacing');
    	component_subscribe($$self, circleSpacing, $$value => $$invalidate(8, $circleSpacing = $$value));
    	validate_store(svgWidth, 'svgWidth');
    	component_subscribe($$self, svgWidth, $$value => $$invalidate(1, $svgWidth = $$value));
    	validate_store(maxCirclesPerRow, 'maxCirclesPerRow');
    	component_subscribe($$self, maxCirclesPerRow, $$value => $$invalidate(9, $maxCirclesPerRow = $$value));
    	validate_store(presidents, 'presidents');
    	component_subscribe($$self, presidents, $$value => $$invalidate(10, $presidents = $$value));
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

    	function handleSvgClick() {
    		console.log("svg clicked");
    		selectedCircleId.set(null);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Svg> was created with unknown prop '${key}'`);
    	});

    	const presidentClick_handler = index => handlePresidentClick();

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
    		selectedCircleId,
    		OnePresidentUnit,
    		presidents,
    		onMount,
    		get: get_store_value,
    		OnePresidentUnitMainCircle,
    		positions,
    		updateSvgWidth,
    		updateSvgHeight,
    		handleSvgClick,
    		handlePresidentClick,
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
    		if ($$self.$$.dirty & /*$presidents, $maxCirclesPerRow, $outerRadius, $circleSpacing, $svgWidth, $rowSpacing, $titleSpace*/ 1987) {
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
    		handleSvgClick,
    		$titleSpace,
    		$rowSpacing,
    		$circleSpacing,
    		$maxCirclesPerRow,
    		$presidents,
    		presidentClick_handler
    	];
    }

    class Svg extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Svg",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/StickySvgWrapper.svelte generated by Svelte v3.59.2 */

    const { console: console_1$1 } = globals;
    const file$2 = "src/components/StickySvgWrapper.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[17] = i;
    	return child_ctx;
    }

    // (71:6) {#if president["terms"] === 2}
    function create_if_block_1(ctx) {
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;
    	let circle_stroke_width_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");

    			attr_dev(circle, "cx", circle_cx_value = /*isMobile*/ ctx[6]
    			? 10 + (/*index*/ ctx[17] % 2 !== 0 ? 26 : 6)
    			: /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4]);

    			attr_dev(circle, "cy", circle_cy_value = /*isMobile*/ ctx[6]
    			? /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4]
    			: 18 + (/*index*/ ctx[17] % 2 !== 0 ? 6 : 0));

    			attr_dev(circle, "r", /*concentricRadius*/ ctx[5]);
    			attr_dev(circle, "fill", "white");
    			attr_dev(circle, "opacity", "0.3");
    			attr_dev(circle, "stroke", "black");

    			attr_dev(circle, "stroke-width", circle_stroke_width_value = /*selectedCircleId*/ ctx[1] == /*index*/ ctx[17]
    			? "3"
    			: "1");

    			attr_dev(circle, "class", "" + (null_to_empty(`circle-${/*index*/ ctx[17]}`) + " svelte-11as5w5"));
    			attr_dev(circle, "data-index", /*index*/ ctx[17]);
    			attr_dev(circle, "pointer-events", "all");
    			add_location(circle, file$2, 71, 8, 1983);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						circle,
    						"mouseover",
    						function () {
    							if (is_function(/*handleCircleHover*/ ctx[8])) /*handleCircleHover*/ ctx[8].apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						circle,
    						"click",
    						function () {
    							if (is_function(/*handleCircleClick*/ ctx[9])) /*handleCircleClick*/ ctx[9].apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						circle,
    						"focus",
    						function () {
    							if (is_function(/*handleCircleHover*/ ctx[8])) /*handleCircleHover*/ ctx[8].apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(circle, "keydown", /*keydown_handler_1*/ ctx[14], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*isMobile, totalDots, svgSize, radius*/ 92 && circle_cx_value !== (circle_cx_value = /*isMobile*/ ctx[6]
    			? 10 + (/*index*/ ctx[17] % 2 !== 0 ? 26 : 6)
    			: /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4])) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty & /*isMobile, totalDots, svgSize, radius*/ 92 && circle_cy_value !== (circle_cy_value = /*isMobile*/ ctx[6]
    			? /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4]
    			: 18 + (/*index*/ ctx[17] % 2 !== 0 ? 6 : 0))) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (dirty & /*concentricRadius*/ 32) {
    				attr_dev(circle, "r", /*concentricRadius*/ ctx[5]);
    			}

    			if (dirty & /*selectedCircleId*/ 2 && circle_stroke_width_value !== (circle_stroke_width_value = /*selectedCircleId*/ ctx[1] == /*index*/ ctx[17]
    			? "3"
    			: "1")) {
    				attr_dev(circle, "stroke-width", circle_stroke_width_value);
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(71:6) {#if president[\\\"terms\\\"] === 2}",
    		ctx
    	});

    	return block;
    }

    // (94:6) {#if $hoveredIndex == index}
    function create_if_block(ctx) {
    	let text_1;
    	let t_value = /*president*/ ctx[15].name.toUpperCase() + "";
    	let t;
    	let text_1_x_value;
    	let text_1_y_value;
    	let text_1_font_size_value;
    	let text_1_text_anchor_value;
    	let line;
    	let line_x__value;
    	let line_y__value;
    	let line_x__value_1;
    	let line_y__value_1;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text(t_value);
    			line = svg_element("line");

    			attr_dev(text_1, "x", text_1_x_value = /*isMobile*/ ctx[6]
    			? 10 + (/*index*/ ctx[17] % 2 !== 0 ? 26 : 6) - 5
    			: /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4] + (/*index*/ ctx[17] < /*presidents*/ ctx[0].length / 2
    				? 5
    				: -5));

    			attr_dev(text_1, "y", text_1_y_value = /*isMobile*/ ctx[6]
    			? /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4]
    			: 18 + (/*index*/ ctx[17] % 2 !== 0 ? 6 : 0) + 24);

    			attr_dev(text_1, "fill", "black");
    			attr_dev(text_1, "font-size", text_1_font_size_value = /*isMobile*/ ctx[6] ? "12" : "18");
    			attr_dev(text_1, "opacity", "0.6");

    			attr_dev(text_1, "text-anchor", text_1_text_anchor_value = /*isMobile*/ ctx[6]
    			? "end"
    			: /*index*/ ctx[17] < /*presidents*/ ctx[0].length / 2
    				? "start"
    				: "end");

    			attr_dev(text_1, "z-index", "1");
    			add_location(text_1, file$2, 94, 8, 2800);

    			attr_dev(line, "x1", line_x__value = /*isMobile*/ ctx[6]
    			? 10 + (/*index*/ ctx[17] % 2 !== 0 ? 26 : 6)
    			: /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4]);

    			attr_dev(line, "y1", line_y__value = /*isMobile*/ ctx[6]
    			? /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4]
    			: 18 + (/*index*/ ctx[17] % 2 !== 0 ? 6 : 0));

    			attr_dev(line, "x2", line_x__value_1 = /*isMobile*/ ctx[6]
    			? 10 + (/*index*/ ctx[17] % 2 !== 0 ? 26 : 6) - /*mobileHorizontalLine*/ ctx[11]
    			: /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4]);

    			attr_dev(line, "y2", line_y__value_1 = /*isMobile*/ ctx[6]
    			? /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4]
    			: 18 + (/*index*/ ctx[17] % 2 !== 0 ? 6 : 0) + /*desktopHOrizontalLine*/ ctx[12]);

    			attr_dev(line, "stroke", "black");
    			attr_dev(line, "opacity", "0.3");
    			attr_dev(line, "stroke-width", "3");
    			attr_dev(line, "aria-hidden", "true");
    			add_location(line, file$2, 116, 8, 3504);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*presidents*/ 1 && t_value !== (t_value = /*president*/ ctx[15].name.toUpperCase() + "")) set_data_dev(t, t_value);

    			if (dirty & /*isMobile, totalDots, svgSize, radius, presidents*/ 93 && text_1_x_value !== (text_1_x_value = /*isMobile*/ ctx[6]
    			? 10 + (/*index*/ ctx[17] % 2 !== 0 ? 26 : 6) - 5
    			: /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4] + (/*index*/ ctx[17] < /*presidents*/ ctx[0].length / 2
    				? 5
    				: -5))) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*isMobile, totalDots, svgSize, radius*/ 92 && text_1_y_value !== (text_1_y_value = /*isMobile*/ ctx[6]
    			? /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4]
    			: 18 + (/*index*/ ctx[17] % 2 !== 0 ? 6 : 0) + 24)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}

    			if (dirty & /*isMobile*/ 64 && text_1_font_size_value !== (text_1_font_size_value = /*isMobile*/ ctx[6] ? "12" : "18")) {
    				attr_dev(text_1, "font-size", text_1_font_size_value);
    			}

    			if (dirty & /*isMobile, presidents*/ 65 && text_1_text_anchor_value !== (text_1_text_anchor_value = /*isMobile*/ ctx[6]
    			? "end"
    			: /*index*/ ctx[17] < /*presidents*/ ctx[0].length / 2
    				? "start"
    				: "end")) {
    				attr_dev(text_1, "text-anchor", text_1_text_anchor_value);
    			}

    			if (dirty & /*isMobile, totalDots, svgSize, radius*/ 92 && line_x__value !== (line_x__value = /*isMobile*/ ctx[6]
    			? 10 + (/*index*/ ctx[17] % 2 !== 0 ? 26 : 6)
    			: /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4])) {
    				attr_dev(line, "x1", line_x__value);
    			}

    			if (dirty & /*isMobile, totalDots, svgSize, radius*/ 92 && line_y__value !== (line_y__value = /*isMobile*/ ctx[6]
    			? /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4]
    			: 18 + (/*index*/ ctx[17] % 2 !== 0 ? 6 : 0))) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*isMobile, totalDots, svgSize, radius*/ 92 && line_x__value_1 !== (line_x__value_1 = /*isMobile*/ ctx[6]
    			? 10 + (/*index*/ ctx[17] % 2 !== 0 ? 26 : 6) - /*mobileHorizontalLine*/ ctx[11]
    			: /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4])) {
    				attr_dev(line, "x2", line_x__value_1);
    			}

    			if (dirty & /*isMobile, totalDots, svgSize, radius*/ 92 && line_y__value_1 !== (line_y__value_1 = /*isMobile*/ ctx[6]
    			? /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4]
    			: 18 + (/*index*/ ctx[17] % 2 !== 0 ? 6 : 0) + /*desktopHOrizontalLine*/ ctx[12])) {
    				attr_dev(line, "y2", line_y__value_1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(94:6) {#if $hoveredIndex == index}",
    		ctx
    	});

    	return block;
    }

    // (33:2) {#each presidents as president, index}
    function create_each_block(ctx) {
    	let g;
    	let text_1;
    	let t_value = /*getInitials*/ ctx[7](/*president*/ ctx[15].name) + "";
    	let t;
    	let text_1_x_value;
    	let text_1_y_value;
    	let text_1_font_size_value;
    	let text_1_dy_value;
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;
    	let circle_stroke_width_value;
    	let if_block0_anchor;
    	let mounted;
    	let dispose;
    	let if_block0 = /*president*/ ctx[15]["terms"] === 2 && create_if_block_1(ctx);
    	let if_block1 = /*$hoveredIndex*/ ctx[10] == /*index*/ ctx[17] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			text_1 = svg_element("text");
    			t = text(t_value);
    			circle = svg_element("circle");
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if (if_block1) if_block1.c();

    			attr_dev(text_1, "x", text_1_x_value = /*isMobile*/ ctx[6]
    			? 10 + (/*index*/ ctx[17] % 2 !== 0 ? 26 : 6)
    			: /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4]);

    			attr_dev(text_1, "y", text_1_y_value = /*isMobile*/ ctx[6]
    			? /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4] + 4
    			: 18 + (/*index*/ ctx[17] % 2 !== 0 ? 6 : 0));

    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "font-size", text_1_font_size_value = /*isMobile*/ ctx[6] ? "9px" : "10px");
    			attr_dev(text_1, "fill", "black");
    			attr_dev(text_1, "dy", text_1_dy_value = /*isMobile*/ ctx[6] ? undefined : "4");
    			add_location(text_1, file$2, 34, 6, 738);

    			attr_dev(circle, "cx", circle_cx_value = /*isMobile*/ ctx[6]
    			? 10 + (/*index*/ ctx[17] % 2 !== 0 ? 26 : 6)
    			: /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4]);

    			attr_dev(circle, "cy", circle_cy_value = /*isMobile*/ ctx[6]
    			? /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4]
    			: 18 + (/*index*/ ctx[17] % 2 !== 0 ? 6 : 0));

    			attr_dev(circle, "r", /*radius*/ ctx[4]);
    			attr_dev(circle, "fill", "white");
    			attr_dev(circle, "opacity", "0.3");
    			attr_dev(circle, "stroke", "black");

    			attr_dev(circle, "stroke-width", circle_stroke_width_value = /*selectedCircleId*/ ctx[1] == /*index*/ ctx[17]
    			? "3"
    			: "1");

    			attr_dev(circle, "class", "" + (null_to_empty(`circle-${/*index*/ ctx[17]}`) + " svelte-11as5w5"));
    			attr_dev(circle, "data-index", /*index*/ ctx[17]);
    			attr_dev(circle, "pointer-events", "all");
    			add_location(circle, file$2, 49, 6, 1224);
    			add_location(g, file$2, 33, 4, 728);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, text_1);
    			append_dev(text_1, t);
    			append_dev(g, circle);
    			if (if_block0) if_block0.m(g, null);
    			append_dev(g, if_block0_anchor);
    			if (if_block1) if_block1.m(g, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						circle,
    						"mouseover",
    						function () {
    							if (is_function(/*handleCircleHover*/ ctx[8])) /*handleCircleHover*/ ctx[8].apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						circle,
    						"click",
    						function () {
    							if (is_function(/*handleCircleClick*/ ctx[9])) /*handleCircleClick*/ ctx[9].apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						circle,
    						"focus",
    						function () {
    							if (is_function(/*handleCircleHover*/ ctx[8])) /*handleCircleHover*/ ctx[8].apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(circle, "keydown", /*keydown_handler*/ ctx[13], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*getInitials, presidents*/ 129 && t_value !== (t_value = /*getInitials*/ ctx[7](/*president*/ ctx[15].name) + "")) set_data_dev(t, t_value);

    			if (dirty & /*isMobile, totalDots, svgSize, radius*/ 92 && text_1_x_value !== (text_1_x_value = /*isMobile*/ ctx[6]
    			? 10 + (/*index*/ ctx[17] % 2 !== 0 ? 26 : 6)
    			: /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4])) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*isMobile, totalDots, svgSize, radius*/ 92 && text_1_y_value !== (text_1_y_value = /*isMobile*/ ctx[6]
    			? /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4] + 4
    			: 18 + (/*index*/ ctx[17] % 2 !== 0 ? 6 : 0))) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}

    			if (dirty & /*isMobile*/ 64 && text_1_font_size_value !== (text_1_font_size_value = /*isMobile*/ ctx[6] ? "9px" : "10px")) {
    				attr_dev(text_1, "font-size", text_1_font_size_value);
    			}

    			if (dirty & /*isMobile*/ 64 && text_1_dy_value !== (text_1_dy_value = /*isMobile*/ ctx[6] ? undefined : "4")) {
    				attr_dev(text_1, "dy", text_1_dy_value);
    			}

    			if (dirty & /*isMobile, totalDots, svgSize, radius*/ 92 && circle_cx_value !== (circle_cx_value = /*isMobile*/ ctx[6]
    			? 10 + (/*index*/ ctx[17] % 2 !== 0 ? 26 : 6)
    			: /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4])) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty & /*isMobile, totalDots, svgSize, radius*/ 92 && circle_cy_value !== (circle_cy_value = /*isMobile*/ ctx[6]
    			? /*index*/ ctx[17] / (/*totalDots*/ ctx[3] - 1) * (/*svgSize*/ ctx[2] - 2 * /*radius*/ ctx[4]) + /*radius*/ ctx[4]
    			: 18 + (/*index*/ ctx[17] % 2 !== 0 ? 6 : 0))) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (dirty & /*radius*/ 16) {
    				attr_dev(circle, "r", /*radius*/ ctx[4]);
    			}

    			if (dirty & /*selectedCircleId*/ 2 && circle_stroke_width_value !== (circle_stroke_width_value = /*selectedCircleId*/ ctx[1] == /*index*/ ctx[17]
    			? "3"
    			: "1")) {
    				attr_dev(circle, "stroke-width", circle_stroke_width_value);
    			}

    			if (/*president*/ ctx[15]["terms"] === 2) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(g, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$hoveredIndex*/ ctx[10] == /*index*/ ctx[17]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(g, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(33:2) {#each presidents as president, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let svg;
    	let rect;
    	let each_value = /*presidents*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			rect = svg_element("rect");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "100%");
    			attr_dev(rect, "height", "100%");
    			attr_dev(rect, "fill", "white");
    			attr_dev(rect, "stroke", "black");
    			attr_dev(rect, "stroke-width", "2");
    			attr_dev(rect, "class", "svg-rect svelte-11as5w5");
    			add_location(rect, file$2, 21, 2, 538);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			set_style(svg, "overflow", "visible");
    			add_location(svg, file$2, 20, 0, 477);
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
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*isMobile, totalDots, svgSize, radius, mobileHorizontalLine, desktopHOrizontalLine, presidents, $hoveredIndex, concentricRadius, selectedCircleId, handleCircleHover, handleCircleClick, undefined, getInitials*/ 8191) {
    				each_value = /*presidents*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(svg, null);
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
    	let $hoveredIndex;
    	validate_store(hoveredIndex, 'hoveredIndex');
    	component_subscribe($$self, hoveredIndex, $$value => $$invalidate(10, $hoveredIndex = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('StickySvgWrapper', slots, []);
    	let { presidents = [] } = $$props;
    	let { selectedCircleId } = $$props;
    	let { svgSize } = $$props;
    	let { totalDots } = $$props;
    	let { radius } = $$props;
    	let { concentricRadius } = $$props;
    	let { isMobile = false } = $$props;
    	let { getInitials } = $$props;
    	let { handleCircleHover } = $$props;
    	let { handleCircleClick } = $$props;

    	//export let hoveredIndex;
    	let mobileHorizontalLine = 20;

    	let desktopHOrizontalLine = 30;

    	$$self.$$.on_mount.push(function () {
    		if (selectedCircleId === undefined && !('selectedCircleId' in $$props || $$self.$$.bound[$$self.$$.props['selectedCircleId']])) {
    			console_1$1.warn("<StickySvgWrapper> was created without expected prop 'selectedCircleId'");
    		}

    		if (svgSize === undefined && !('svgSize' in $$props || $$self.$$.bound[$$self.$$.props['svgSize']])) {
    			console_1$1.warn("<StickySvgWrapper> was created without expected prop 'svgSize'");
    		}

    		if (totalDots === undefined && !('totalDots' in $$props || $$self.$$.bound[$$self.$$.props['totalDots']])) {
    			console_1$1.warn("<StickySvgWrapper> was created without expected prop 'totalDots'");
    		}

    		if (radius === undefined && !('radius' in $$props || $$self.$$.bound[$$self.$$.props['radius']])) {
    			console_1$1.warn("<StickySvgWrapper> was created without expected prop 'radius'");
    		}

    		if (concentricRadius === undefined && !('concentricRadius' in $$props || $$self.$$.bound[$$self.$$.props['concentricRadius']])) {
    			console_1$1.warn("<StickySvgWrapper> was created without expected prop 'concentricRadius'");
    		}

    		if (getInitials === undefined && !('getInitials' in $$props || $$self.$$.bound[$$self.$$.props['getInitials']])) {
    			console_1$1.warn("<StickySvgWrapper> was created without expected prop 'getInitials'");
    		}

    		if (handleCircleHover === undefined && !('handleCircleHover' in $$props || $$self.$$.bound[$$self.$$.props['handleCircleHover']])) {
    			console_1$1.warn("<StickySvgWrapper> was created without expected prop 'handleCircleHover'");
    		}

    		if (handleCircleClick === undefined && !('handleCircleClick' in $$props || $$self.$$.bound[$$self.$$.props['handleCircleClick']])) {
    			console_1$1.warn("<StickySvgWrapper> was created without expected prop 'handleCircleClick'");
    		}
    	});

    	const writable_props = [
    		'presidents',
    		'selectedCircleId',
    		'svgSize',
    		'totalDots',
    		'radius',
    		'concentricRadius',
    		'isMobile',
    		'getInitials',
    		'handleCircleHover',
    		'handleCircleClick'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<StickySvgWrapper> was created with unknown prop '${key}'`);
    	});

    	const keydown_handler = e => e.key === "Enter" && handleCircleClick(e);
    	const keydown_handler_1 = e => e.key === "Enter" && handleCircleClick(e);

    	$$self.$$set = $$props => {
    		if ('presidents' in $$props) $$invalidate(0, presidents = $$props.presidents);
    		if ('selectedCircleId' in $$props) $$invalidate(1, selectedCircleId = $$props.selectedCircleId);
    		if ('svgSize' in $$props) $$invalidate(2, svgSize = $$props.svgSize);
    		if ('totalDots' in $$props) $$invalidate(3, totalDots = $$props.totalDots);
    		if ('radius' in $$props) $$invalidate(4, radius = $$props.radius);
    		if ('concentricRadius' in $$props) $$invalidate(5, concentricRadius = $$props.concentricRadius);
    		if ('isMobile' in $$props) $$invalidate(6, isMobile = $$props.isMobile);
    		if ('getInitials' in $$props) $$invalidate(7, getInitials = $$props.getInitials);
    		if ('handleCircleHover' in $$props) $$invalidate(8, handleCircleHover = $$props.handleCircleHover);
    		if ('handleCircleClick' in $$props) $$invalidate(9, handleCircleClick = $$props.handleCircleClick);
    	};

    	$$self.$capture_state = () => ({
    		hoveredIndex,
    		presidents,
    		selectedCircleId,
    		svgSize,
    		totalDots,
    		radius,
    		concentricRadius,
    		isMobile,
    		getInitials,
    		handleCircleHover,
    		handleCircleClick,
    		mobileHorizontalLine,
    		desktopHOrizontalLine,
    		$hoveredIndex
    	});

    	$$self.$inject_state = $$props => {
    		if ('presidents' in $$props) $$invalidate(0, presidents = $$props.presidents);
    		if ('selectedCircleId' in $$props) $$invalidate(1, selectedCircleId = $$props.selectedCircleId);
    		if ('svgSize' in $$props) $$invalidate(2, svgSize = $$props.svgSize);
    		if ('totalDots' in $$props) $$invalidate(3, totalDots = $$props.totalDots);
    		if ('radius' in $$props) $$invalidate(4, radius = $$props.radius);
    		if ('concentricRadius' in $$props) $$invalidate(5, concentricRadius = $$props.concentricRadius);
    		if ('isMobile' in $$props) $$invalidate(6, isMobile = $$props.isMobile);
    		if ('getInitials' in $$props) $$invalidate(7, getInitials = $$props.getInitials);
    		if ('handleCircleHover' in $$props) $$invalidate(8, handleCircleHover = $$props.handleCircleHover);
    		if ('handleCircleClick' in $$props) $$invalidate(9, handleCircleClick = $$props.handleCircleClick);
    		if ('mobileHorizontalLine' in $$props) $$invalidate(11, mobileHorizontalLine = $$props.mobileHorizontalLine);
    		if ('desktopHOrizontalLine' in $$props) $$invalidate(12, desktopHOrizontalLine = $$props.desktopHOrizontalLine);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$hoveredIndex*/ 1024) {
    			console.log($hoveredIndex);
    		}
    	};

    	return [
    		presidents,
    		selectedCircleId,
    		svgSize,
    		totalDots,
    		radius,
    		concentricRadius,
    		isMobile,
    		getInitials,
    		handleCircleHover,
    		handleCircleClick,
    		$hoveredIndex,
    		mobileHorizontalLine,
    		desktopHOrizontalLine,
    		keydown_handler,
    		keydown_handler_1
    	];
    }

    class StickySvgWrapper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			presidents: 0,
    			selectedCircleId: 1,
    			svgSize: 2,
    			totalDots: 3,
    			radius: 4,
    			concentricRadius: 5,
    			isMobile: 6,
    			getInitials: 7,
    			handleCircleHover: 8,
    			handleCircleClick: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StickySvgWrapper",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get presidents() {
    		throw new Error("<StickySvgWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set presidents(value) {
    		throw new Error("<StickySvgWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedCircleId() {
    		throw new Error("<StickySvgWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedCircleId(value) {
    		throw new Error("<StickySvgWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get svgSize() {
    		throw new Error("<StickySvgWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set svgSize(value) {
    		throw new Error("<StickySvgWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get totalDots() {
    		throw new Error("<StickySvgWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set totalDots(value) {
    		throw new Error("<StickySvgWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radius() {
    		throw new Error("<StickySvgWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radius(value) {
    		throw new Error("<StickySvgWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get concentricRadius() {
    		throw new Error("<StickySvgWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set concentricRadius(value) {
    		throw new Error("<StickySvgWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isMobile() {
    		throw new Error("<StickySvgWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isMobile(value) {
    		throw new Error("<StickySvgWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getInitials() {
    		throw new Error("<StickySvgWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getInitials(value) {
    		throw new Error("<StickySvgWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleCircleHover() {
    		throw new Error("<StickySvgWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleCircleHover(value) {
    		throw new Error("<StickySvgWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleCircleClick() {
    		throw new Error("<StickySvgWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleCircleClick(value) {
    		throw new Error("<StickySvgWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/stickyYearsDiv.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file$1 = "src/components/stickyYearsDiv.svelte";

    function create_fragment$1(ctx) {
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div2;
    	let stickysvgwrapper0;
    	let t4;
    	let div3;
    	let stickysvgwrapper1;
    	let current;

    	stickysvgwrapper0 = new StickySvgWrapper({
    			props: {
    				presidents: /*$presidents*/ ctx[2],
    				selectedCircleId: /*$selectedCircleId*/ ctx[3],
    				svgSize: /*svgWidth*/ ctx[0],
    				totalDots: /*totalDots*/ ctx[4],
    				radius: desktopRadius,
    				concentricRadius: desktopConcentricRadius,
    				isMobile: false,
    				getInitials: /*getInitials*/ ctx[7],
    				handleCircleHover: /*handleCircleHover*/ ctx[5],
    				handleCircleClick: /*handleCircleClick*/ ctx[6]
    			},
    			$$inline: true
    		});

    	stickysvgwrapper1 = new StickySvgWrapper({
    			props: {
    				presidents: /*$presidents*/ ctx[2],
    				selectedCircleId: /*$selectedCircleId*/ ctx[3],
    				svgSize: /*svgHeight*/ ctx[1],
    				totalDots: /*totalDots*/ ctx[4],
    				radius: mobileRadius,
    				concentricRadius: mobileConcentricRadius,
    				isMobile: true,
    				getInitials: /*getInitials*/ ctx[7],
    				handleCircleHover: /*handleCircleHover*/ ctx[5],
    				handleCircleClick: /*handleCircleClick*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "Hover to see name, click to see President";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "Hover to see name, click to see President";
    			t3 = space();
    			div2 = element("div");
    			create_component(stickysvgwrapper0.$$.fragment);
    			t4 = space();
    			div3 = element("div");
    			create_component(stickysvgwrapper1.$$.fragment);
    			attr_dev(div0, "class", "desktop-legend-intro-text svelte-1wtp109");
    			add_location(div0, file$1, 49, 0, 1297);
    			attr_dev(div1, "class", "mobile-legend-intro-text svelte-1wtp109");
    			add_location(div1, file$1, 52, 0, 1388);
    			attr_dev(div2, "class", "desktop-sticky-div svelte-1wtp109");
    			add_location(div2, file$1, 56, 0, 1479);
    			attr_dev(div3, "class", "mobile-sticky-div svelte-1wtp109");
    			add_location(div3, file$1, 71, 0, 1815);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			mount_component(stickysvgwrapper0, div2, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div3, anchor);
    			mount_component(stickysvgwrapper1, div3, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const stickysvgwrapper0_changes = {};
    			if (dirty & /*$presidents*/ 4) stickysvgwrapper0_changes.presidents = /*$presidents*/ ctx[2];
    			if (dirty & /*$selectedCircleId*/ 8) stickysvgwrapper0_changes.selectedCircleId = /*$selectedCircleId*/ ctx[3];
    			if (dirty & /*svgWidth*/ 1) stickysvgwrapper0_changes.svgSize = /*svgWidth*/ ctx[0];
    			stickysvgwrapper0.$set(stickysvgwrapper0_changes);
    			const stickysvgwrapper1_changes = {};
    			if (dirty & /*$presidents*/ 4) stickysvgwrapper1_changes.presidents = /*$presidents*/ ctx[2];
    			if (dirty & /*$selectedCircleId*/ 8) stickysvgwrapper1_changes.selectedCircleId = /*$selectedCircleId*/ ctx[3];
    			if (dirty & /*svgHeight*/ 2) stickysvgwrapper1_changes.svgSize = /*svgHeight*/ ctx[1];
    			stickysvgwrapper1.$set(stickysvgwrapper1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(stickysvgwrapper0.$$.fragment, local);
    			transition_in(stickysvgwrapper1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(stickysvgwrapper0.$$.fragment, local);
    			transition_out(stickysvgwrapper1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			destroy_component(stickysvgwrapper0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div3);
    			destroy_component(stickysvgwrapper1);
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

    const desktopRadius = 10;
    const desktopConcentricRadius = 15;
    const mobileRadius = 8;
    const mobileConcentricRadius = 12;

    function instance$1($$self, $$props, $$invalidate) {
    	let $hoveredIndex;
    	let $presidents;
    	let $selectedCircleId;
    	validate_store(hoveredIndex, 'hoveredIndex');
    	component_subscribe($$self, hoveredIndex, $$value => $$invalidate(8, $hoveredIndex = $$value));
    	validate_store(presidents, 'presidents');
    	component_subscribe($$self, presidents, $$value => $$invalidate(2, $presidents = $$value));
    	validate_store(selectedCircleId, 'selectedCircleId');
    	component_subscribe($$self, selectedCircleId, $$value => $$invalidate(3, $selectedCircleId = $$value));
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

    	const handleCircleHover = event => {
    		hoveredIndex.set(+event.target.dataset.index);
    		console.log($hoveredIndex);
    	};

    	const handleCircleClick = event => {
    		const id = event.target.dataset.index;
    		selectedCircleId.set(id);
    		console.log(selectedCircleId);
    	};

    	const getInitials = name => {
    		const parts = name.split(" ");

    		if (parts.length === 1) {
    			return parts[0][0].toUpperCase();
    		}

    		const firstInitial = parts[0][0].toUpperCase();
    		const lastInitial = parts[parts.length - 1][0].toUpperCase();
    		return firstInitial + lastInitial;
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<StickyYearsDiv> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		StickySvgWrapper,
    		presidents,
    		onMount,
    		selectedCircleId,
    		hoveredIndex,
    		totalDots,
    		svgWidth,
    		svgHeight,
    		desktopRadius,
    		desktopConcentricRadius,
    		mobileRadius,
    		mobileConcentricRadius,
    		updateDimensions,
    		handleCircleHover,
    		handleCircleClick,
    		getInitials,
    		$hoveredIndex,
    		$presidents,
    		$selectedCircleId
    	});

    	$$self.$inject_state = $$props => {
    		if ('totalDots' in $$props) $$invalidate(4, totalDots = $$props.totalDots);
    		if ('svgWidth' in $$props) $$invalidate(0, svgWidth = $$props.svgWidth);
    		if ('svgHeight' in $$props) $$invalidate(1, svgHeight = $$props.svgHeight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		svgWidth,
    		svgHeight,
    		$presidents,
    		$selectedCircleId,
    		totalDots,
    		handleCircleHover,
    		handleCircleClick,
    		getInitials
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
